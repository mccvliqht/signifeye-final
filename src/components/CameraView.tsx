import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, FlipHorizontal } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';

const CameraView = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isRecognizing, setIsRecognizing, mirrorCamera, toggleMirrorCamera } = useApp();
  const { toast } = useToast();
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
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
      }

      setIsRecognizing(true);
      toast({
        title: 'Camera started',
        description: 'Sign language recognition is now active',
      });
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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsRecognizing(false);
    toast({
      title: 'Camera stopped',
      description: 'Recognition has been paused',
    });
  };

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
        
        {!isRecognizing && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
            <div className="text-center">
              <VideoOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Camera is off</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-center">
        {!isRecognizing ? (
          <Button
            onClick={startCamera}
            size="lg"
            className="gap-2"
          >
            <Video className="w-5 h-5" />
            Start Recognition
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
