import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Video, 
  VideoOff, 
  Loader2, 
  Camera, 
  Volume2, 
  Sun, 
  Maximize, 
  ScanFace,
  MoreVertical 
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useMediaPipe } from '@/hooks/useMediaPipe';
import { useSignRecognition, RecognitionResult } from '@/hooks/useSignRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from "@/components/ui/use-toast"; 

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

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
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');

  // UI States
  const [isCameraOn, setIsCameraOn] = useState(false); 
  const [lowLightMode, setLowLightMode] = useState(false); 
  const [isZoomed, setIsZoomed] = useState(false); 

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
  
  // REFS FOR LOGIC LOOP
  const recognizingRef = useRef(false);
  const cameraActiveRef = useRef(false);
  
  const predictionsBufferRef = useRef<{ sign: string; confidence: number; t: number }[]>([]);
  const lastEmittedRef = useRef<string>('');
  const lastClassifyAtRef = useRef(0);
  const classifyBusyRef = useRef(false);

  // Sync State to Refs
  useEffect(() => {
    recognizingRef.current = isRecognizing;
  }, [isRecognizing]);

  // Safety: If camera turns off via state, stop recognizing
  useEffect(() => {
    if (!isCameraOn) {
        cameraActiveRef.current = false;
        setIsRecognizing(false);
    } else {
        cameraActiveRef.current = true;
    }
  }, [isCameraOn, setIsRecognizing]);

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
      stopStream(); 
    };
  }, []);

  const stopStream = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    
    // Force update refs immediately so loop dies
    cameraActiveRef.current = false;
    recognizingRef.current = false;
    
    setIsCameraOn(false);
    setIsRecognizing(false);
    setFps(0);
  };

  const handleCameraChange = (deviceId: string) => {
    setSelectedCamera(deviceId);
    if (isCameraOn) {
       stopStream();
       setTimeout(() => startCamera(deviceId), 100);
    }
  };

  // 📹 START CAMERA
  const startCamera = async (specificDeviceId?: string) => {
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
                    
                    // ✅ THE FIX: Manually set refs TRUE before starting loop
                    // This prevents the loop from killing itself instantly
                    cameraActiveRef.current = true; 
                    setIsCameraOn(true);
                    
                    processFrame(); 
                }
            };
        }
    } catch (e) { 
        console.error(e); 
        toast({
          title: "Camera Error",
          description: "Could not access the camera. Please check permissions.",
        });
    }
  };

  const handleStartRecognitionClick = () => {
    if (!isCameraOn) {
        toast({
            description: "Please turn on the camera first to start recognition.",
        });
        return; 
    }
    setIsRecognizing(!isRecognizing);
  };

  // 🔄 MAIN LOOP
  const processFrame = async () => {
    // 1. Exit checks
    if (!isMountedRef.current || !videoRef.current || !canvasRef.current) {
        return; 
    }
    
    // Strict check: if camera is explicitly off, STOP.
    if (!cameraActiveRef.current) {
        return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState < 2 || video.videoWidth === 0) {
       animationFrameRef.current = requestAnimationFrame(processFrame);
       return;
    }

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const now = performance.now();
    const ctx = canvas.getContext('2d');

    // 2. LOGIC BRANCHING
    if (recognizingRef.current) {
        // --- AI MODE ---
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
                    } catch (err) {
                        console.error(err);
                    } finally {
                        if (isMountedRef.current) classifyBusyRef.current = false;
                    }
                }
            } else {
                if (isMountedRef.current) setTopPredictions([]);
            }
        }
    } else {
        // --- STANDBY MODE ---
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // 3. FPS Counter
    frameCountRef.current++;
    if (now - lastFrameTimeRef.current >= 1000) {
      if (isMountedRef.current) setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastFrameTimeRef.current = now;
    }
    
    // 4. LOOP
    if (isMountedRef.current && cameraActiveRef.current) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
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

  return (
    <div className="flex flex-col h-full p-4 md:p-6 gap-4">
      {/* 📹 Main Video Container */}
      <div className="relative flex-1 rounded-xl overflow-hidden bg-card shadow-sm border border-border/50 group">
        
        {/* VIDEO ELEMENT */}
        <video 
          ref={videoRef} 
          autoPlay playsInline muted 
          className={cn(
             "w-full h-full object-cover transition-all duration-300",
             lowLightMode && "brightness-150 contrast-125 saturate-110",
             isZoomed && "scale-[1.25]" 
          )}
          style={{ transform: mirrorCamera ? (isZoomed ? 'scaleX(-1) scale(1.25)' : 'scaleX(-1)') : (isZoomed ? 'scale(1.25)' : 'none') }} 
        />
        
        {/* CANVAS */}
        <canvas 
          ref={canvasRef} 
          className={cn(
             "absolute inset-0 w-full h-full pointer-events-none object-cover transition-all duration-300",
             isZoomed && "scale-[1.25]"
          )}
          style={{ transform: mirrorCamera ? (isZoomed ? 'scaleX(-1) scale(1.25)' : 'scaleX(-1)') : (isZoomed ? 'scale(1.25)' : 'none') }} 
        />
        
        {/* OVERLAYS */}
        {isCameraOn && (
          <>
             {/* LEFT: FPS & Predictions */}
             <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
                {isRecognizing && (
                    <>
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
                        <Badge variant="secondary" className="bg-slate-700/80 text-white text-[9px] uppercase font-black tracking-widest px-2 py-0.5 border-none w-fit backdrop-blur-sm shadow-md mt-1">
                            MODE: {practiceMode}
                        </Badge>
                    </>
                )}
                {!isRecognizing && (
                     <Badge variant="outline" className="bg-yellow-500/80 text-white border-none shadow-md backdrop-blur-md animate-pulse">
                        Standby: Camera On
                     </Badge>
                )}
              </div>

              {/* 👉 RIGHT: MORE OPTIONS MENU */}
              <div className="absolute top-4 right-4 z-20">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md border-none shadow-sm">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Video Settings</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuCheckboxItem 
                            checked={lowLightMode} 
                            onCheckedChange={setLowLightMode}
                            className="cursor-pointer"
                        >
                             <div className="flex items-center gap-2">
                                <Sun className="h-4 w-4" />
                                <span>Adjust Video Lighting</span>
                             </div>
                        </DropdownMenuCheckboxItem>

                        <DropdownMenuCheckboxItem 
                            checked={isZoomed} 
                            onCheckedChange={setIsZoomed}
                            className="cursor-pointer"
                        >
                             <div className="flex items-center gap-2">
                                <Maximize className="h-4 w-4" />
                                <span>Framing (Zoom)</span>
                             </div>
                        </DropdownMenuCheckboxItem>
                        
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuCheckboxItem 
                            checked={!mirrorCamera} 
                            onCheckedChange={toggleMirrorCamera} 
                            className="cursor-pointer"
                        >
                            <div className="flex items-center gap-2">
                                <span>Flip Camera</span>
                            </div>
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
          </>
        )}

        {/* LOADING / OFF STATE */}
        {!isCameraOn && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 backdrop-blur-sm gap-4">
            {mediaPipeLoading || modelLoading ? (
                <Loader2 className="w-16 h-16 animate-spin text-primary" /> 
            ) : (
                <>
                    <div className="bg-background/50 p-6 rounded-full">
                        <VideoOff className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium">Camera is turned off</p>
                </>
            )}
          </div>
        )}
      </div>

      {/* 🎛️ CONTROLS BAR */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-3 rounded-xl border border-border shadow-sm">
        
        {/* LEFT: Device Selection */}
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
            <Select value={selectedCamera} onValueChange={handleCameraChange}>
                <SelectTrigger className="w-full md:w-[200px] h-10 border-input/50 bg-background text-xs md:text-sm">
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

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="w-full md:w-[200px] h-10 border-input/50 bg-background justify-start gap-2 font-normal text-xs md:text-sm">
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

        {/* CENTER: Main Actions */}
        <div className="flex gap-3 w-full md:w-auto justify-center md:justify-end">
            {/* 1. CAMERA TOGGLE (Small) */}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button 
                            onClick={() => isCameraOn ? stopStream() : startCamera()} 
                            size="icon" 
                            variant={isCameraOn ? "outline" : "destructive"} 
                            className={cn("h-11 w-11 rounded-lg shrink-0", !isCameraOn && "animate-pulse")}
                        >
                            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Turn Camera {isCameraOn ? 'Off' : 'On'}</TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {/* 2. RECOGNITION TOGGLE (Big/Primary) */}
            <Button 
                onClick={handleStartRecognitionClick} 
                size="lg" 
                variant={isRecognizing ? "destructive" : "default"} 
                className={cn(
                    "w-full md:w-auto gap-2 rounded-lg font-bold shadow-md transition-all active:scale-95 px-8 min-w-[180px]",
                    !isCameraOn && "opacity-70 cursor-not-allowed" 
                )}
            >
                {isRecognizing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScanFace className="w-5 h-5" />}
                {isRecognizing ? "Stop Recognition" : "Start Recognition"}
            </Button>
        </div>

      </div>
    </div>
  );
};

export default CameraView;