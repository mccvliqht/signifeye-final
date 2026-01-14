import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, FlipHorizontal, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useMediaPipe } from '@/hooks/useMediaPipe';
import { useSignRecognition, RecognitionResult } from '@/hooks/useSignRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Badge } from '@/components/ui/badge';

interface CameraViewProps {
  mode?: 'phrases' | 'alphabet';
}

const CameraView = ({ mode = 'phrases' }: CameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  
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
  const { recognizeSign, isLoading: modelLoading, resetLastPrediction } = useSignRecognition(settings.language, mode);
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
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (!outputText) resetLastPrediction();
  }, [outputText, resetLastPrediction]);

  const handleRecognition = async (recognition: RecognitionResult) => {
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
      if (avgConfidence >= 0.55 && sign !== lastEmittedRef.current) {
        lastEmittedRef.current = sign;
        setOutputText(outputText ? `${outputText}${sign}` : sign);
        predictionsBufferRef.current = [];
        setTimeout(() => { if (lastEmittedRef.current === sign) lastEmittedRef.current = ''; }, 1200);
      }
    }
  };

  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !recognizingRef.current) {
      if (recognizingRef.current) animationFrameRef.current = requestAnimationFrame(processFrame);
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
            if (recognition) await handleRecognition(recognition);
          } finally {
            classifyBusyRef.current = false;
          }
        }
      } else {
        setTopPredictions([]);
      }
    }

    frameCountRef.current++;
    if (now - lastFrameTimeRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastFrameTimeRef.current = now;
    }
    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  const startCamera = async () => {
    if (mediaPipeLoading || modelLoading) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current!.play();
          setIsRecognizing(true);
          recognizingRef.current = true;
          processFrame();
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
    <div className="flex flex-col h-full p-6 gap-4">
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
                    // 🛠️ UPDATE: Highlight changed to Green for better visual feedback
                    borderLeft: i === 0 && pred.confidence > 0.5 ? '3px solid #22c55e' : 'none',
                    opacity: i === 0 ? 1 : 0.7 
                  }}
                >
                  <span className="font-bold text-[12px]">{pred.sign}</span>
                  <span className="font-mono text-[10px] opacity-80">{(pred.confidence * 100).toFixed(0)}%</span>
                </Badge>
              ))}
            </div>

            {/* 🛠️ UPDATE: Mode color changed to a subtle Slate/Gray for a better aesthetic */}
            <Badge variant="secondary" className="bg-slate-700/80 text-white text-[9px] uppercase font-black tracking-widest px-2 py-0.5 border-none w-fit backdrop-blur-sm shadow-md">
              MODE: {mode}
            </Badge>
          </div>
        )}

        {!isRecognizing && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
            {mediaPipeLoading || modelLoading ? <Loader2 className="w-16 h-16 animate-spin text-primary" /> : <VideoOff className="w-16 h-16 text-muted-foreground" />}
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        <Button onClick={isRecognizing ? stopCamera : startCamera} size="lg" variant={isRecognizing ? "destructive" : "default"} className="gap-2 rounded-xl px-8 font-bold">
          {isRecognizing ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          {isRecognizing ? "Stop" : "Start"} Recognition
        </Button>
        <Button onClick={toggleMirrorCamera} size="lg" variant="outline" className="rounded-xl px-4">
          <FlipHorizontal className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default CameraView;