import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
// 👇 Updated Icons: Camera & Volume2
import { Video, VideoOff, FlipHorizontal, Loader2, Camera, Volume2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useMediaPipe } from '@/hooks/useMediaPipe';
import { useSignRecognition, RecognitionResult } from '@/hooks/useSignRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Badge } from '@/components/ui/badge';

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CameraViewProps {
  practiceMode?: 'alphabet' | 'numbers' | 'phrases'; 
}

const CameraView = ({ practiceMode = 'alphabet' }: CameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');

  const { 
    isRecognizing, 
    setIsRecognizing, 
    mirrorCamera, 
    toggleMirrorCamera,
    outputText,
    setOutputText,
    settings 
  } = useApp();

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);
  
  const streamRef = useRef<MediaStream | null>(null);
  const { detectHands, drawLandmarks, isLoading: mediaPipeLoading } = useMediaPipe();
  
  const { recognizeSign, isLoading: modelLoading, resetLastPrediction } = useSignRecognition(settings.language, practiceMode);
  
  const { speak, isSupported: speechSupported } = useSpeechSynthesis();
  
  const [fps, setFps] = useState(0);
  const [topPredictions, setTopPredictions] = useState<Array<{ sign: string; confidence: number }>>([]);
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  const recognizingRef = useRef(false);
  const predictionsBufferRef = useRef<{ sign: string; confidence: number; t: number }[]>([]);
  const lastEmittedRef = useRef<string>('');
  const lastClassifyAtRef = useRef(0);
  const classifyBusyRef = useRef(false);

  useEffect(() => {
    recognizingRef.current = isRecognizing;
  }, [isRecognizing]);

  useEffect(() => {
      resetLastPrediction();
      setTopPredictions([]);
  }, [practiceMode, resetLastPrediction]);

  // Fetch Devices
  useEffect(() => {
    isMountedRef.current = true;
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameras(videoDevices);
        
        if (videoDevices.length > 0 && !selectedCamera) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error("Error fetching devices:", err);
      }
    };
    getDevices();
    navigator.mediaDevices.addEventListener('devicechange', getDevices);

    return () => {
      isMountedRef.current = false;
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (!outputText) resetLastPrediction();
  }, [outputText, resetLastPrediction]);

  const handleCameraChange = (deviceId: string) => {
    setSelectedCamera(deviceId);
    if (isRecognizing) {
       stopCamera();
       setTimeout(() => startCamera(deviceId), 100);
    }
  };

  const handleRecognition = async (recognition: RecognitionResult) => {
    if (!isMountedRef.current) return;

    const now = Date.now();
    const { sign, confidence, allPredictions } = recognition;
    if (allPredictions) setTopPredictions(allPredictions);
    if (!sign) return;

    if (settingsRef.current.outputMode === 'speech' && speechSupported && confidence >= 0.5) {
      speak(sign, settingsRef.current.language);
    }

    predictionsBufferRef.current.push({ sign, confidence, t: now });
    predictionsBufferRef.current = predictionsBufferRef.current.filter(p => now - p.t < 2000);
    
    const recentSigns = predictionsBufferRef.current.filter(p => p.sign === sign);
    if (recentSigns.length >= 1) {
      const avgConfidence = recentSigns.reduce((sum, p) => sum + p.confidence, 0) / recentSigns.length;
      
      if (avgConfidence >= 0.55 && sign !== lastEmittedRef.current && isMountedRef.current) {
        lastEmittedRef.current = sign;
        setOutputText(outputText ? `${outputText}${sign}` : sign);
        predictionsBufferRef.current = [];
        setTimeout(() => { if (lastEmittedRef.current === sign) lastEmittedRef.current = ''; }, 1200);
      }
    }
  };

  const processFrame = async () => {
    if (!isMountedRef.current || !videoRef.current || !canvasRef.current || !recognizingRef.current) {
      if (recognizingRef.current && isMountedRef.current) {
         animationFrameRef.current = requestAnimationFrame(processFrame);
      }
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.videoWidth === 0) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const now = performance.now();
    const results = detectHands(video, now);

    if (results) {
      drawLandmarks(canvas, results);
      if (results.landmarks && results.landmarks.length > 0) {
        const nowTs = Date.now();
        if (!classifyBusyRef.current && nowTs - lastClassifyAtRef.current > 100) {
          classifyBusyRef.current = true;
          lastClassifyAtRef.current = nowTs;
          try {
            const recognition = await recognizeSign(results.landmarks);
            if (recognition && isMountedRef.current) await handleRecognition(recognition);
          } finally {
            if (isMountedRef.current) classifyBusyRef.current = false;
          }
        }
      } else {
        if (isMountedRef.current) setTopPredictions([]);
      }
    }

    frameCountRef.current++;
    if (now - lastFrameTimeRef.current >= 1000) {
      if (isMountedRef.current) setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastFrameTimeRef.current = now;
    }
    
    if (isMountedRef.current) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  };

  const startCamera = async (specificDeviceId?: string) => {
    if (mediaPipeLoading || modelLoading) return;
    const targetCamera = specificDeviceId || selectedCamera;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
            deviceId: targetCamera ? { exact: targetCamera } : undefined,
            width: { ideal: 1280 }, 
            height: { ideal: 720 } 
        }
      });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      setCameras(devices.filter(d => d.kind === 'videoinput'));

      if (videoRef.current && isMountedRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.onloadedmetadata = () => {
          if (isMountedRef.current) { 
            videoRef.current!.play();
            setIsRecognizing(true);
            recognizingRef.current = true;
            processFrame();
          }
        };
      }
    } catch (e) { console.error(e); }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    setIsRecognizing(false);
    recognizingRef.current = false;
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-6 gap-4">
      {/* 📹 Main Video Container */}
      <div className="relative flex-1 rounded-xl overflow-hidden bg-card shadow-sm border border-border/50">
        <video 
          ref={videoRef} 
          autoPlay playsInline muted 
          className="w-full h-full object-cover" 
          style={{ transform: mirrorCamera ? 'scaleX(-1)' : 'none' }} 
        />
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full pointer-events-none object-cover" 
          style={{ transform: mirrorCamera ? 'scaleX(-1)' : 'none' }} 
        />
        
        {isRecognizing && (
          <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
            <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm w-fit py-0.5 h-6 border-none">
              <span className="text-[11px] font-bold">{fps} FPS</span>
            </Badge>
             <div className="flex flex-col gap-1">
              {topPredictions.slice(0, 3).map((pred, i) => (
                <Badge 
                  key={pred.sign} 
                  variant="secondary" 
                  className="bg-black/60 text-white backdrop-blur-sm flex justify-between gap-3 w-fit min-w-[85px] border-none py-0.5"
                  style={{ 
                    borderLeft: i === 0 && pred.confidence > 0.5 ? '3px solid #22c55e' : 'none',
                    opacity: i === 0 ? 1 : 0.7 
                  }}
                >
                  <span className="font-bold text-[12px]">{pred.sign}</span>
                  <span className="font-mono text-[10px] opacity-80">{(pred.confidence * 100).toFixed(0)}%</span>
                </Badge>
              ))}
            </div>
            <Badge variant="secondary" className="bg-slate-700/80 text-white text-[9px] uppercase font-black tracking-widest px-2 py-0.5 border-none w-fit backdrop-blur-sm shadow-md">
              MODE: {practiceMode}
            </Badge>
          </div>
        )}

        {!isRecognizing && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
            {mediaPipeLoading || modelLoading ? <Loader2 className="w-16 h-16 animate-spin text-primary" /> : <VideoOff className="w-16 h-16 text-muted-foreground" />}
          </div>
        )}
      </div>

      {/* 🎛️ CONTROLS BAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-3 rounded-xl border border-border shadow-sm">
        
        {/* Left: Device Selection (Twin Buttons) */}
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
            
            {/* 🎥 CAMERA SELECTOR */}
            <Select value={selectedCamera} onValueChange={handleCameraChange}>
                {/* Fixed Width & Truncate Text */}
                <SelectTrigger className="w-full md:w-[170px] h-10 border-input/50 bg-background text-xs md:text-sm">
                    <div className="flex items-center gap-2 w-full overflow-hidden">
                        <Camera className="w-4 h-4 shrink-0" />
                        <span className="truncate text-left flex-1">
                             <SelectValue placeholder="Select Camera" />
                        </span>
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {cameras.length === 0 && <SelectItem value="placeholder" disabled>No cameras found</SelectItem>}
                    {cameras.map((cam) => (
                        <SelectItem key={cam.deviceId} value={cam.deviceId}>
                            {cam.label || `Camera ${cam.deviceId.slice(0, 5)}...`}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* 🔊 SPEAKER INFO (Matches Camera Size) */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* Styled like the Select Trigger for uniformity */}
                  <Button variant="outline" className="w-full md:w-[170px] h-10 border-input/50 bg-background justify-start gap-2 font-normal text-xs md:text-sm">
                    <Volume2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">System Speaker</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Audio output follows your System Default settings.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
        </div>

        {/* Center: Main Action */}
        <div className="flex gap-2 w-full md:w-auto">
            <Button 
                onClick={() => isRecognizing ? stopCamera() : startCamera()} 
                size="lg" 
                variant={isRecognizing ? "destructive" : "default"} 
                className="w-full md:w-auto gap-2 rounded-lg font-bold shadow-md transition-all active:scale-95 px-6"
            >
                {isRecognizing ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                {isRecognizing ? "Stop" : "Start Recognition"}
            </Button>
            
            <Button onClick={toggleMirrorCamera} size="icon" variant="outline" className="h-11 w-11 rounded-lg shrink-0">
                <FlipHorizontal className="w-5 h-5 text-muted-foreground" />
            </Button>
        </div>

      </div>
    </div>
  );
};

export default CameraView;