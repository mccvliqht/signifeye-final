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
  const confidenceThreshold = 0.50; // Kept lowered threshold

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

// --- UPDATED: Smart Correction Logic (Fixes G, H, P) ---
  const applyManualCorrections = (prediction: string, handLandmarks: any[]): string => {
    if (!handLandmarks || handLandmarks.length < 21) return prediction;

    // MediaPipe Landmarks: 0=Wrist, 8=IndexTip, 12=MiddleTip, 4=ThumbTip
    const wrist = handLandmarks[0];
    const thumbTip = handLandmarks[4];
    const indexTip = handLandmarks[8];
    const middleTip = handLandmarks[12];

    // 1. Calculate Directions
    // Y increases downwards in screen coordinates.
    const isPointingDown = indexTip.y > wrist.y; 
    
    // Check if hand is Horizontal (X distance > Y distance)
    const xDist = Math.abs(indexTip.x - wrist.x);
    const yDist = Math.abs(indexTip.y - wrist.y);
    const isHorizontal = xDist > yDist;

    // ----------------------------------------------------------------------
    // FIX 1: "P" (Standard Downward P)
    // ----------------------------------------------------------------------
    // If AI thinks it's N, Z, D, S but we are clearly pointing DOWN, it's P.
    if (['N', 'S', 'Z', 'D', 'H'].includes(prediction)) { 
      // Added 'H' here because sometimes H gets confused with P down
      if (isPointingDown) {
        return 'P'; 
      }
    }

    // ----------------------------------------------------------------------
    // FIX 2: The "Sideways" Conflict (G vs H vs P)
    // ----------------------------------------------------------------------
    // If the hand is sideways, it could be G, H, or a sideways P.
    if (['G', 'H', 'Z', 'D', 'L', 'P'].includes(prediction)) {
      if (isHorizontal && !isPointingDown) {
        
        // Step A: Check Middle Finger Length (Distinguishes G from H/P)
        const indexLen = Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y);
        const middleLen = Math.hypot(middleTip.x - wrist.x, middleTip.y - wrist.y);

        // If Middle finger is short (curled), it is G.
        if (middleLen < (indexLen * 0.85)) {
            return 'G';
        } 
        
        // Step B: It's NOT G. So it is either H or P.
        // Distinguish H vs P using the THUMB.
        // In "H", fingers are together. 
        // In "P", thumb is wedged BETWEEN Index and Middle.
        
        // Check if Thumb Y is between Index Y and Middle Y
        const minY = Math.min(indexTip.y, middleTip.y);
        const maxY = Math.max(indexTip.y, middleTip.y);
        
        // If thumb is clearly between the two fingers vertically
        const isThumbBetween = (thumbTip.y > minY) && (thumbTip.y < maxY);
        
        if (isThumbBetween) {
            return 'P'; // Thumb splitting fingers = P
        } else {
            return 'H'; // Thumb outside/tucked = H
        }
      }
    }

    // ----------------------------------------------------------------------
    // FIX 3: "T" (Thumb Tucked)
    // ----------------------------------------------------------------------
    if (['A', 'S', 'M', 'N'].includes(prediction)) {
       const indexMCP = handLandmarks[5];
       const thumbIsTucked = (thumbTip.x > Math.min(indexMCP.x, indexTip.x)) && 
                             (thumbTip.x < Math.max(indexMCP.x, indexTip.x));
       if (thumbIsTucked) return 'T';
    }

    return prediction;
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
      const probsArr = Array.from(probabilities);
      // ALLOW MORE THAN 26! Change 26 to 50 (or just remove the limit)
      const classCount = probsArr.length; 
      const considered = probsArr.slice(0, classCount);

      const predictions = considered
        .map((prob, idx) => ({
          sign: ALPHABET[idx],
          confidence: prob
        }))
        .sort((a, b) => b.confidence - a.confidence);

      const topPrediction = predictions[0];

      if (topPrediction.confidence >= confidenceThreshold) {
        let detectedSign = topPrediction.sign;
        
        // --- APPLY MANUAL FIXES HERE ---
        // Pass the raw landmarks (not the processed features)
        if (landmarks && landmarks.length > 0) {
           detectedSign = applyManualCorrections(detectedSign, landmarks[0]);
        }
        
        // Prevent duplicate detections
        if (detectedSign === lastPredictionRef.current) {
          return null;
        }

        lastPredictionRef.current = detectedSign;
        
        console.log('Sign detected:', detectedSign, 'Original:', topPrediction.sign);
        
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