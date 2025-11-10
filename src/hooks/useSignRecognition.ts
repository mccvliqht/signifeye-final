import { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import { GestureEstimator } from 'fingerpose';
import { aslGestures } from '@/lib/aslGestures';
import { fslGestures } from '@/lib/fslGestures';
import { aslPhrases } from '@/lib/aslPhrases';
import { fslPhrases } from '@/lib/fslPhrases';

export interface RecognitionResult {
  sign: string;
  confidence: number;
  timestamp: number;
}

export const useSignRecognition = (language: 'ASL' | 'FSL') => {
  const [gestureEstimator, setGestureEstimator] = useState<GestureEstimator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastPredictionRef = useRef<string>('');
  const confidenceThreshold = 8.2; // Slightly relaxed to improve recall while avoiding false positives

  useEffect(() => {
    let isMounted = true;

    const initializeGestureRecognition = async () => {
      try {
        // Set WebGL backend for optimal performance
        await tf.setBackend('webgl');
        await tf.ready();

        // Warm up TFJS backend to avoid first-frame jank
        tf.tidy(() => {
          const x = tf.tensor([0, 1, 2, 3]);
          const y = x.square();
          y.dataSync();
        });

        // Select gestures based on language (alphabet + phrases)
        const gestures = language === 'ASL' ? [...aslGestures, ...aslPhrases] : [...fslGestures, ...fslPhrases];
        
        // Initialize GestureEstimator with pre-trained gesture templates
        const estimator = new GestureEstimator(gestures);
        
        console.log(`${language} gesture recognition initialized`);
        console.log(`Loaded ${gestures.length} ${language} gestures`);

        if (isMounted) {
          setGestureEstimator(estimator);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error initializing gesture recognition:', err);
        if (isMounted) {
          setError('Failed to initialize gesture recognition');
          setIsLoading(false);
        }
      }
    };

    initializeGestureRecognition();

    return () => {
      isMounted = false;
    };
  }, [language]);

  const recognizeSign = async (landmarks: any[]): Promise<RecognitionResult | null> => {
    if (!landmarks || landmarks.length === 0 || !gestureEstimator) {
      console.log('No landmarks or estimator not ready');
      return null;
    }

    try {
      // Use the first hand for recognition
      const handLandmarks = landmarks[0];
      
      console.log('Processing landmarks, count:', handLandmarks.length);
      
      // Convert MediaPipe landmarks to fingerpose format
      // MediaPipe gives us landmarks as objects with x, y, z
      // Fingerpose expects array of [x, y, z] arrays
      const landmarkArray = handLandmarks.map((landmark: any) => [
        landmark.x,
        landmark.y,
        landmark.z || 0
      ]);

      console.log('Landmark array prepared, estimating gestures...');

      // Estimate gestures using fingerpose with lower threshold
      const estimations = await gestureEstimator.estimate(landmarkArray, 8.0);
      
      console.log('Estimations:', estimations);
      
      if (!estimations.gestures || estimations.gestures.length === 0) {
        console.log('No gestures detected');
        return null;
      }

      // Get the best match
      const bestGesture = estimations.gestures.reduce((prev: any, current: any) => 
        (current.score > prev.score) ? current : prev
      );

      const confidence = bestGesture.score;
      const detectedSign = bestGesture.name;

      console.log('Best gesture:', detectedSign, 'Confidence:', confidence);

      // Only return if confidence is above threshold and different from last prediction
      if (confidence >= confidenceThreshold && detectedSign !== lastPredictionRef.current) {
        lastPredictionRef.current = detectedSign;
        
        console.log('Sign detected:', detectedSign, 'Confidence:', confidence);
        
        // Add a small delay to prevent rapid repeated detections
        setTimeout(() => {
          if (lastPredictionRef.current === detectedSign) {
            lastPredictionRef.current = '';
          }
        }, 1500);
        
        return {
          sign: detectedSign,
          confidence,
          timestamp: Date.now()
        };
      }

      return null;
    } catch (err) {
      console.error('Error recognizing sign:', err);
      return null;
    }
  };

  const resetLastPrediction = () => {
    lastPredictionRef.current = '';
  };

  return {
    gestureEstimator,
    isLoading,
    error,
    recognizeSign,
    resetLastPrediction,
    confidenceThreshold
  };
};
