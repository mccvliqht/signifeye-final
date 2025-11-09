import { useEffect, useRef, useState } from 'react';
import { HandLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

export interface HandLandmarks {
  landmarks: any[];
  handedness: string;
}

export const useMediaPipe = () => {
  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeHandLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        if (isMounted) {
          setHandLandmarker(landmarker);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error initializing MediaPipe:', err);
        if (isMounted) {
          setError('Failed to initialize hand detection');
          setIsLoading(false);
        }
      }
    };

    initializeHandLandmarker();

    return () => {
      isMounted = false;
    };
  }, []);

  const detectHands = (video: HTMLVideoElement, timestamp: number) => {
    if (!handLandmarker || !video) return null;

    try {
      const results = handLandmarker.detectForVideo(video, timestamp);
      return results;
    } catch (err) {
      console.error('Error detecting hands:', err);
      return null;
    }
  };

  const drawLandmarks = (
    canvas: HTMLCanvasElement,
    results: any
  ) => {
    if (!results || !results.landmarks) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawingUtils = new DrawingUtils(ctx);

    for (let i = 0; i < results.landmarks.length; i++) {
      const landmarks = results.landmarks[i];
      
      // Draw connections
      drawingUtils.drawConnectors(
        landmarks,
        HandLandmarker.HAND_CONNECTIONS,
        { color: '#5B7C99', lineWidth: 3 }
      );
      
      // Draw landmarks
      drawingUtils.drawLandmarks(
        landmarks,
        { color: '#00FF00', lineWidth: 1, radius: 4 }
      );
    }
  };

  return {
    handLandmarker,
    isLoading,
    error,
    detectHands,
    drawLandmarks
  };
};
