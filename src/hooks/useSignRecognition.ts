import { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import { loadTrainedModel, trainAndSaveModel } from '@/lib/modelTrainer';
import { ALPHABET } from '@/lib/trainingData';

export interface RecognitionResult {
  sign: string;
  confidence: number;
  timestamp: number;
  allPredictions?: Array<{ sign: string; confidence: number }>;
}


export const useSignRecognition = (language: 'ASL' | 'FSL') => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastPredictionRef = useRef<string>('');
  const modelRef = useRef<tf.LayersModel | null>(null);
  const confidenceThreshold = 0.75;

  useEffect(() => {
    lastPredictionRef.current = '';
    setError(null);
    loadModel();
  }, [language]);

  const loadModel = async () => {
    try {
      setIsLoading(true);

      // Ensure TFJS backend is ready (prefer WebGL for speed)
      try {
        await tf.setBackend('webgl');
      } catch {}
      await tf.ready();

      // Try to load pre-trained model from localStorage first
      let model = await loadTrainedModel(language);
      
      if (!model) {
        console.log(`No pre-trained ${language} model found. Training new model...`);
        // Train a new model with synthetic data
        await trainAndSaveModel(language);
        model = await loadTrainedModel(language);
      }
      
      if (!model) {
        throw new Error('Failed to load or train model');
      }

      modelRef.current = model;
      setIsLoading(false);
      console.log(`${language} model loaded successfully`);
    } catch (err) {
      console.error('Error loading model:', err);
      setError('Failed to load recognition model');
      setIsLoading(false);
    }
  };

  const preprocessLandmarks = (landmarks: any[]): number[] => {
    if (!landmarks || landmarks.length === 0) return [];
    
    // Flatten landmarks and normalize
    const handLandmarks = landmarks[0];
    const features: number[] = [];
    
    // Get wrist position as reference
    const wrist = handLandmarks[0];
    
    // Calculate relative positions and angles
    for (let i = 0; i < 21; i++) {
      const landmark = handLandmarks[i];
      // Relative to wrist
      features.push(landmark.x - wrist.x);
      features.push(landmark.y - wrist.y);
      features.push(landmark.z - wrist.z);
    }
    
    return features;
  };

  const recognizeSign = async (landmarks: any[]): Promise<RecognitionResult | null> => {
    if (!landmarks || landmarks.length === 0 || !modelRef.current) {
      return null;
    }

    try {
      const features = preprocessLandmarks(landmarks);
      if (features.length !== 63) return null;

      // Make prediction
      const inputTensor = tf.tensor2d([features], [1, 63]);
      const prediction = modelRef.current.predict(inputTensor) as tf.Tensor;
      const probabilities = await prediction.data();
      inputTensor.dispose();
      prediction.dispose();

      // Get top predictions
      const predictions = Array.from(probabilities)
        .map((prob, idx) => ({
          sign: ALPHABET[idx],
          confidence: prob
        }))
        .sort((a, b) => b.confidence - a.confidence);

      const topPrediction = predictions[0];

      if (topPrediction.confidence >= confidenceThreshold) {
        const detectedSign = topPrediction.sign;
        
        // Prevent duplicate detections
        if (detectedSign === lastPredictionRef.current) {
          return null;
        }

        lastPredictionRef.current = detectedSign;
        
        console.log('Sign detected:', detectedSign, 'Confidence:', topPrediction.confidence);
        
        // Reset after delay
        setTimeout(() => {
          if (lastPredictionRef.current === detectedSign) {
            lastPredictionRef.current = '';
          }
        }, 1500);
        
        return {
          sign: detectedSign,
          confidence: topPrediction.confidence,
          timestamp: Date.now(),
          allPredictions: predictions.slice(0, 5)
        };
      }

      return null;
    } catch (err) {
      console.error('Error recognizing sign:', err);
      setError(err instanceof Error ? err.message : 'Recognition failed');
      return null;
    }
  };

  const resetLastPrediction = () => {
    lastPredictionRef.current = '';
  };

  return {
    isLoading,
    error,
    recognizeSign,
    resetLastPrediction,
    confidenceThreshold
  };
};
