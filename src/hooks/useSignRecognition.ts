import { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

export interface RecognitionResult {
  sign: string;
  confidence: number;
  timestamp: number;
}

// ASL Alphabet mapping (mock data for demonstration)
const ASL_ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

// FSL common phrases
const FSL_PHRASES = [
  'Hello', 'Thank you', 'Please', 'Sorry', 'Yes', 'No',
  'Good morning', 'Good afternoon', 'Good evening', 'Goodbye',
  'How are you?', 'I am fine', 'What is your name?', 'Nice to meet you'
];

export const useSignRecognition = (language: 'ASL' | 'FSL') => {
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastPredictionRef = useRef<string>('');
  const confidenceThreshold = 0.7;

  useEffect(() => {
    let isMounted = true;

    const initializeTensorFlow = async () => {
      try {
        // Set WebGL backend for optimal performance
        await tf.setBackend('webgl');
        await tf.ready();

        // For production, load your actual trained model
        // For now, we'll create a simple mock model structure
        // In production, replace this with:
        // const loadedModel = await tf.loadLayersModel('path/to/your/model.json');
        
        console.log('TensorFlow.js initialized with WebGL backend');
        console.log(`Language set to: ${language}`);

        if (isMounted) {
          // In production, set the actual loaded model here
          setModel(null); // We'll use rule-based recognition for demo
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error initializing TensorFlow:', err);
        if (isMounted) {
          setError('Failed to initialize recognition model');
          setIsLoading(false);
        }
      }
    };

    initializeTensorFlow();

    return () => {
      isMounted = false;
    };
  }, [language]);

  const preprocessLandmarks = (landmarks: any[]): number[] => {
    // Flatten and normalize landmark coordinates
    const flattened: number[] = [];
    
    if (!landmarks || landmarks.length === 0) return [];

    landmarks.forEach((hand: any) => {
      hand.forEach((landmark: any) => {
        flattened.push(landmark.x, landmark.y, landmark.z);
      });
    });

    return flattened;
  };

  const recognizeSign = async (landmarks: any[]): Promise<RecognitionResult | null> => {
    if (!landmarks || landmarks.length === 0) return null;

    try {
      // Preprocess landmarks
      const features = preprocessLandmarks(landmarks);
      
      if (features.length === 0) return null;

      // Demo: Simple rule-based recognition
      // In production, use: const predictions = model.predict(tf.tensor2d([features]));
      
      // For demo purposes, we'll simulate recognition with random results
      const vocabulary = language === 'ASL' ? ASL_ALPHABET : FSL_PHRASES;
      const randomIndex = Math.floor(Math.random() * vocabulary.length);
      const confidence = 0.75 + Math.random() * 0.2; // 0.75 to 0.95

      // Simulate occasional low confidence (no detection)
      if (Math.random() < 0.3) {
        return null;
      }

      const detectedSign = vocabulary[randomIndex];

      // Only return if confidence is above threshold and different from last prediction
      if (confidence >= confidenceThreshold && detectedSign !== lastPredictionRef.current) {
        lastPredictionRef.current = detectedSign;
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
    model,
    isLoading,
    error,
    recognizeSign,
    resetLastPrediction,
    confidenceThreshold
  };
};
