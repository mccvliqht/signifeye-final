import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, FlipHorizontal, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { useMediaPipe } from '@/hooks/useMediaPipe';
import { useSignRecognition, RecognitionResult } from '@/hooks/useSignRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Badge } from '@/components/ui/badge';

// 🛠️ Added interface for the new prop
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
  
  const { toast } = useToast();
  const streamRef = useRef<MediaStream | null>(null);
  
  const { detectHands, drawLandmarks, isLoading: mediaPipeLoading, error: mediaPipeError } = useMediaPipe();
  
  // 🛠️ Updated: Now passing 'mode' to the sign recognition hook
  const { recognizeSign, isLoading: modelLoading, error: modelError, resetLastPrediction } = useSignRecognition(settings.language, mode);
  
  const { speak, reset: resetSpeech, isSupported: speechSupported } = useSpeechSynthesis();
  
  const [currentConfidence, setCurrentConfidence] = useState<number | null>(null);
  const [fps, setFps] = useState(0);
  const [topPredictions, setTopPredictions] = useState<Array<{ sign: string; confidence: number }>>([]);
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  const recognizingRef = useRef(false);
  const predictionsBufferRef = useRef<{ sign: string; confidence: number; t: number }[]>([]);
  const lastEmittedRef = useRef<string>('');
  const exposureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const exposureFrameRef = useRef(0);
  const lastClassifyAtRef = useRef(0);
  const classifyBusyRef = useRef(false);

  useEffect(() => {
    recognizingRef.current = isRecognizing;
  }, [isRecognizing]);

  useEffect(() => {
    exposureCanvasRef.current = document.createElement('canvas');
    return () => {
      exposureCanvasRef.current = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!outputText) {
      resetSpeech();
      resetLastPrediction();
    }
  }, [outputText, resetSpeech, resetLastPrediction]);

  const adjustExposure = (video: HTMLVideoElement) => {
    exposureFrameRef.current++;
    if (exposureFrameRef.current % 10 !== 0 || !exposureCanvasRef.current) return;

    const canvas = exposureCanvasRef.current;
    canvas.width = 160;
    canvas.height = 120;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    const avgBrightness = totalBrightness / (data.length / 4);
    const diff = 128 - avgBrightness;
    
    if (Math.abs(diff) > 20) {
      const adjustment = diff / 128;
      video.style.filter = `brightness(${1 + (adjustment * 0.3)}) contrast(${1 + (adjustment * 0.1)})`;
    }
  };

  const handleRecognition = async (recognition: RecognitionResult) => {
    const now = Date.now();
    const { sign, confidence, allPredictions } = recognition;
    
    if (allPredictions) setTopPredictions(allPredictions);
    if (!sign || sign === '') return;

    if (settingsRef.current.outputMode === 'speech' && speechSupported && confidence >= 0.6) {
      speak(sign, settingsRef.current.language);
    }

    predictionsBufferRef.current.push({ sign, confidence, t: now });
    predictionsBufferRef.current = predictionsBufferRef.current.filter(p => now - p.t < 2000);
    
    const recentSigns = predictionsBufferRef.current.filter(p => p.sign === sign);
    const minCount = 1; 
    const minAvgConfidence = 0.7;
    
    if (recentSigns.length >= minCount) {
      const avgConfidence = recentSigns.reduce((sum, p) => sum + p.confidence, 0) / recentSigns.length;
      
      if (avgConfidence >= minAvgConfidence && sign !== lastEmittedRef.current) {
        lastEmittedRef.current = sign;
        const newText = outputText ? `${outputText}${sign}` : sign;
        setOutputText(newText);
        setCurrentConfidence(avgConfidence);
        
        predictionsBufferRef.current = [];
        
        setTimeout(() => {
          if (lastEmittedRef.current === sign) lastEmittedRef.current = '';
        }, 1200);
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

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const now = performance.now();
    adjustExposure(video);
    const results = detectHands(video, now);

    if (results) {
      drawLandmarks(canvas, results);

      if (results.landmarks && results.landmarks.length > 0) {
        const nowTs = Date.now();
        if (!classifyBusyRef.current && nowTs - lastClassifyAtRef.current > 333) {
          classifyBusyRef.current = true;
          lastClassifyAtRef.current = nowTs;
          try {
            const recognition = await recognizeSign(results.landmarks);
            if (recognition) await handleRecognition(recognition);
          } catch (e) {
            console.error('Classification exception:', e);
          } finally {
            classifyBusyRef.current = false;
          }
        }
      } else {
        setCurrentConfidence(null);
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
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current!.play();
          setIsRecognizing(true);
          recognizingRef.current = true;
          processFrame();
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    recognizingRef.current = false;
    setIsRecognizing(false);
  };

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      <div className="relative flex-1 rounded-xl overflow-hidden bg-card border-2 border-camera-border">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: mirrorCamera ? 'scaleX(-1)' : 'none' }} />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: mirrorCamera ? 'scaleX(-1)' : 'none' }} />
        
        {!isRecognizing && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
            {mediaPipeLoading || modelLoading ? <Loader2 className="w-16 h-16 text-primary animate-spin" /> : <VideoOff className="w-16 h-16 text-muted-foreground" />}
          </div>
        )}

        {isRecognizing && (
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">{fps} FPS</Badge>
            {currentConfidence !== null && (
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm" style={{ backgroundColor: currentConfidence > 0.85 ? '#22c55e' : currentConfidence > 0.7 ? '#eab308' : '#ef4444' }}>
                {(currentConfidence * 100).toFixed(0)}%
              </Badge>
            )}
            {/* 🛠️ Added Mode indicator */}
            <Badge variant="outline" className="bg-primary/10 text-[10px] uppercase font-bold text-primary border-primary/20">
              Mode: {mode}
            </Badge>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        <Button onClick={isRecognizing ? stopCamera : startCamera} size="lg" variant={isRecognizing ? "destructive" : "default"} className="gap-2">
          {isRecognizing ? <VideoOff /> : <Video />} {isRecognizing ? "Stop" : "Start"} Recognition
        </Button>
        <Button onClick={toggleMirrorCamera} size="lg" variant="outline"><FlipHorizontal /></Button>
      </div>
    </div>
  );
};

export default CameraView;