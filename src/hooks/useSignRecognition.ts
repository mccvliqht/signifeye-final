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
  const confidenceThreshold = 0.65; // Lowered for better detection rate

  useEffect(() => {
    lastPredictionRef.current = '';
    setError(null);
    loadModel();
  }, [language]);

  const loadModel = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`[SignRecognition] Starting model load for ${language}...`);

      // Ensure TFJS backend is ready (prefer WebGL for speed)
      try {
        await tf.setBackend('webgl');
        console.log('[SignRecognition] WebGL backend set');
      } catch (e) {
        console.warn('[SignRecognition] WebGL not available, using default backend');
      }
      await tf.ready();
      console.log('[SignRecognition] TensorFlow.js ready');

      let model: tf.LayersModel | null = null;

      // Prefer public pre-trained model for ASL if available
      if (language === 'ASL') {
        try {
          console.log('[SignRecognition] Loading ASL model from /models/asl/model.json...');
          
          // Add timeout for model loading
          const loadPromise = tf.loadLayersModel('/models/asl/model.json');
          const timeoutPromise = new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Model loading timeout after 30s')), 30000)
          );
          
          model = await Promise.race([loadPromise, timeoutPromise]);
          console.log('[SignRecognition] Successfully loaded ASL model!');
        } catch (e) {
          console.error('[SignRecognition] Failed to load public ASL model:', e);
          console.log('[SignRecognition] Will try fallback options...');
        }
      }

      // Fallback to localStorage-trained model
      if (!model) {
        console.log('[SignRecognition] Trying localStorage model...');
        model = await loadTrainedModel(language);
        if (model) {
          console.log('[SignRecognition] Loaded model from localStorage');
        }
      }

      // If still no model, train a new one (synthetic) as last resort
      if (!model) {
        console.log(`[SignRecognition] No pre-trained ${language} model found. Training new model...`);
        await trainAndSaveModel(language);
        model = await loadTrainedModel(language);
        if (model) {
          console.log('[SignRecognition] Trained and loaded new model');
        }
      }

      if (!model) {
        throw new Error('Failed to load or train model');
      }

      // Warm up model for faster first inference
      console.log('[SignRecognition] Warming up model...');
      const warmup = model.predict(tf.zeros([1, 63])) as tf.Tensor;
      warmup.dispose();

      modelRef.current = model;
      setIsLoading(false);
      console.log(`[SignRecognition] ${language} model loaded and ready!`);
    } catch (err) {
      console.error('[SignRecognition] Error loading model:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recognition model');
      setIsLoading(false);
    }
  };

  const preprocessLandmarks = (landmarks: any[]): number[] => {
    if (!landmarks || landmarks.length === 0) return [];
    
    // Use first detected hand
    const handLandmarks = landmarks[0];
    if (!handLandmarks || handLandmarks.length < 21) return [];

    // Flatten relative to wrist
    const wrist = handLandmarks[0];
    const raw: number[] = [];
    for (let i = 0; i < 21; i++) {
      const lm = handLandmarks[i];
      raw.push(lm.x - wrist.x);
      raw.push(lm.y - wrist.y);
      raw.push(lm.z - wrist.z);
    }

    // Normalize by max absolute value to be scale-invariant
    let maxAbs = 0.0001;
    for (let i = 0; i < raw.length; i++) {
      const v = Math.abs(raw[i]);
      if (v > maxAbs) maxAbs = v;
    }
    const features = raw.map(v => v / maxAbs);

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

      // Get top predictions (limit to A-Z if model has extra classes)
      const probsArr = Array.from(probabilities);
      const classCount = Math.min(26, probsArr.length);
      const considered = probsArr.slice(0, classCount);

      const predictions = considered
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
