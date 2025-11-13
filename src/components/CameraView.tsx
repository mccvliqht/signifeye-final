import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, FlipHorizontal, Loader2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { useMediaPipe } from '@/hooks/useMediaPipe';
import { useSignRecognition, RecognitionResult } from '@/hooks/useSignRecognition';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { Badge } from '@/components/ui/badge';
import { fslToFilipino } from '@/lib/fslTranslations';
import { supabase } from '@/integrations/supabase/client';
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

  // Apply auto-exposure adjustment every 10 frames
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
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      totalBrightness += avg;
    }
    const avgBrightness = totalBrightness / (data.length / 4);
    
    // Target brightness is 128 (mid-gray)
    const targetBrightness = 128;
    const diff = targetBrightness - avgBrightness;
    
    if (Math.abs(diff) > 20) {
      const adjustment = diff / targetBrightness;
      const brightness = 1 + (adjustment * 0.3);
      const contrast = 1 + (adjustment * 0.1);
      video.style.filter = `brightness(${brightness}) contrast(${contrast})`;
      if (canvasRef.current) {
        canvasRef.current.style.filter = `brightness(${brightness}) contrast(${contrast})`;
      }
    }
  };

  const handleRecognition = async (recognition: RecognitionResult) => {
    const now = Date.now();
    const { sign, confidence, allPredictions } = recognition;
    
    // Update top predictions display
    if (allPredictions) {
      setTopPredictions(allPredictions);
    }
    
    // Add to buffer
    predictionsBufferRef.current.push({ sign, confidence, t: now });
    
    // Keep only last 2 seconds of predictions
    predictionsBufferRef.current = predictionsBufferRef.current.filter(p => now - p.t < 2000);
    
    // Temporal smoothing: require 3+ consistent predictions
    const recentSigns = predictionsBufferRef.current.filter(p => p.sign === sign);
    const minCount = 3;
    const minAvgConfidence = 0.85;
    
    if (recentSigns.length >= minCount) {
      const avgConfidence = recentSigns.reduce((sum, p) => sum + p.confidence, 0) / recentSigns.length;
      
      if (avgConfidence >= minAvgConfidence && sign !== lastEmittedRef.current) {
        lastEmittedRef.current = sign;
        
        // Translate if FSL
        const displaySign = settings.language === 'FSL' ? (fslToFilipino[sign] || sign) : sign;
        
        // Append to output
        const newText = outputText ? `${outputText} ${displaySign}` : displaySign;
        setOutputText(newText);
        setCurrentConfidence(avgConfidence);
        
        // Speak with appropriate language
        if (settings.outputMode === 'speech' && speechSupported) {
          const lang = settings.language === 'FSL' ? 'fil-PH' : 'en-US';
          speak(displaySign, { lang });
        }
        
        // Clear buffer after emission
        predictionsBufferRef.current = [];
        
        // Reset after delay
        setTimeout(() => {
          if (lastEmittedRef.current === sign) {
            lastEmittedRef.current = '';
          }
        }, 1500);
      }
    }
  };

  // Capture frame as base64 for Roboflow
  const captureFrame = (video: HTMLVideoElement): string | null => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640; // Resize for API efficiency
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (err) {
      console.error('Error capturing frame:', err);
      return null;
    }
  };

  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current) {
      if (recognizingRef.current) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
      return;
    }

    if (!recognizingRef.current) {
      return; // Stop processing
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Ensure video has valid dimensions before processing to avoid MediaPipe ROI errors
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    // Match canvas size to video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const now = performance.now();
    
    // Auto-adjust exposure
    adjustExposure(video);
    
    const results = detectHands(video, now);

    // Draw landmarks overlay
    if (results) {
      drawLandmarks(canvas, results);

      // Classify sign every 300ms if hand detected
      if (results.landmarks && results.landmarks.length > 0) {
        const nowTs = Date.now();
        
        // Throttle API calls to 2-3 per second
        if (!classifyBusyRef.current && nowTs - lastClassifyAtRef.current > 300) {
          classifyBusyRef.current = true;
          lastClassifyAtRef.current = nowTs;
          
          // Capture frame for Roboflow
          const imageBase64 = captureFrame(video);
          
          if (imageBase64) {
            try {
              const recognition = await recognizeSign(imageBase64);
              
              if (recognition) {
                await handleRecognition(recognition);
              }
            } catch (e) {
              console.error('Classification exception:', e);
            } finally {
              classifyBusyRef.current = false;
            }
          } else {
            classifyBusyRef.current = false;
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
          // Ensure the processing loop sees the updated flag immediately
          recognizingRef.current = true;
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

    recognizingRef.current = false;
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
                  backgroundColor: currentConfidence > 0.85 ? 'hsl(142, 71%, 45%, 0.8)' : 
                                   currentConfidence > 0.7 ? 'hsl(48, 96%, 53%, 0.8)' : 
                                   'hsl(0, 72%, 51%, 0.8)'
                }}
              >
                {(currentConfidence * 100).toFixed(0)}%
              </Badge>
            )}
            {topPredictions.length > 0 && (
              <div className="bg-background/90 backdrop-blur-sm p-2 rounded-md text-xs">
                <div className="font-semibold mb-1">Top Predictions:</div>
                {topPredictions.slice(0, 3).map((pred, idx) => (
                  <div key={idx} className="flex justify-between gap-2">
                    <span>{pred.sign}</span>
                    <span className="text-muted-foreground">{(pred.confidence * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
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
