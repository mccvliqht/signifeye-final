import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, FlipHorizontal, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { useMediaPipe } from '@/hooks/useMediaPipe';
import { useSignRecognition, RecognitionResult } from '@/hooks/useSignRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Badge } from '@/components/ui/badge';

const CameraView = () => {
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
  
  const { toast } = useToast();
  const streamRef = useRef<MediaStream | null>(null);
  
  const { handLandmarker, isLoading: mediaPipeLoading, error: mediaPipeError, detectHands, drawLandmarks } = useMediaPipe();
  const { recognizeSign, isLoading: modelLoading, error: modelError, resetLastPrediction } = useSignRecognition(settings.language);
  const { speak, reset: resetSpeech, isSupported: speechSupported } = useSpeechSynthesis();
  
  const [currentConfidence, setCurrentConfidence] = useState<number | null>(null);
  const [fps, setFps] = useState(0);
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef(0);
  // Use a ref to avoid stale closure for the recognize loop
  const recognizingRef = useRef(false);
  // Buffer recent predictions for temporal smoothing
  const predictionsBufferRef = useRef<{ sign: string; confidence: number; t: number }[]>([]);
  const lastEmittedRef = useRef<string>('');
  // Offscreen canvas for auto-exposure (brightness) adjustments
  const exposureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const exposureFrameRef = useRef(0);

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
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Reset speech when output is cleared
    if (!outputText) {
      resetSpeech();
      resetLastPrediction();
    }
  }, [outputText, resetSpeech, resetLastPrediction]);

  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !recognizingRef.current) {
      // Keep the loop alive until recognizing becomes true after state update
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Match canvas size to video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const now = performance.now();
    const results = detectHands(video, now);

    // Draw landmarks overlay
    if (results) {
      drawLandmarks(canvas, results);

      // Perform sign recognition
      if (results.landmarks && results.landmarks.length > 0) {
        const recognition: RecognitionResult | null = await recognizeSign(results.landmarks);
        
        if (recognition) {
          setCurrentConfidence(recognition.confidence);
          
          // Update output text with new sign
          const newText = outputText ? `${outputText} ${recognition.sign}` : recognition.sign;
          setOutputText(newText);

          // Speak only the new sign if speech mode is enabled
          if (settings.outputMode === 'speech' && speechSupported) {
            speak(recognition.sign);
          }
        }
      }
    }

    // Calculate FPS
    frameCountRef.current++;
    if (now - lastFrameTimeRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastFrameTimeRef.current = now;
    }

    animationFrameRef.current = requestAnimationFrame(processFrame);
  };

  const startCamera = async () => {
    if (mediaPipeLoading || modelLoading) {
      toast({
        title: 'Loading models',
        description: 'Please wait while AI models are loading...',
      });
      return;
    }

    if (mediaPipeError || modelError) {
      toast({
        title: 'Model error',
        description: mediaPipeError || modelError || 'Failed to load AI models',
        variant: 'destructive',
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current!.play();
          } catch (e) {
            console.warn('Video play() was interrupted:', e);
          }
          lastFrameTimeRef.current = performance.now();
          setIsRecognizing(true);
          processFrame();
          
          toast({
            title: 'Camera started',
            description: 'Real-time sign language recognition is active',
          });
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: 'Camera error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      // reset visual filters
      try { videoRef.current.style.filter = ''; } catch {}
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      try { canvasRef.current.style.filter = ''; } catch {}
    }

    setIsRecognizing(false);
    setCurrentConfidence(null);
    setFps(0);
    
    toast({
      title: 'Camera stopped',
      description: 'Recognition has been paused',
    });
  };

  const isLoading = mediaPipeLoading || modelLoading;

  return (
    <div className="flex flex-col h-full p-6 gap-4">
      <div className="relative flex-1 rounded-xl overflow-hidden bg-card border-2 border-camera-border">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{
            transform: mirrorCamera ? 'scaleX(-1)' : 'none'
          }}
        />
        
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            transform: mirrorCamera ? 'scaleX(-1)' : 'none'
          }}
        />
        
        {!isRecognizing && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
            <div className="text-center">
              {isLoading ? (
                <>
                  <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
                  <p className="text-foreground font-medium">Loading AI models...</p>
                  <p className="text-sm text-muted-foreground mt-2">This may take a moment</p>
                </>
              ) : (
                <>
                  <VideoOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Camera is off</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Performance & Confidence Overlay */}
        {isRecognizing && (
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              {fps} FPS
            </Badge>
            {currentConfidence !== null && (
              <Badge 
                variant="secondary" 
                className="bg-background/80 backdrop-blur-sm"
                style={{
                  backgroundColor: currentConfidence > 0.8 ? 'hsl(142, 71%, 45%, 0.8)' : 
                                   currentConfidence > 0.6 ? 'hsl(48, 96%, 53%, 0.8)' : 
                                   'hsl(0, 72%, 51%, 0.8)'
                }}
              >
                Confidence: {(currentConfidence * 100).toFixed(0)}%
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        {!isRecognizing ? (
          <Button
            onClick={startCamera}
            size="lg"
            className="gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Video className="w-5 h-5" />
                Start Recognition
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={stopCamera}
            size="lg"
            variant="destructive"
            className="gap-2"
          >
            <VideoOff className="w-5 h-5" />
            Stop Recognition
          </Button>
        )}

        <Button
          onClick={toggleMirrorCamera}
          size="lg"
          variant="outline"
          className="gap-2"
          aria-label="Mirror camera"
        >
          <FlipHorizontal className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default CameraView;
