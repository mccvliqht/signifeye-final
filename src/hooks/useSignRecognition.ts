import { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as fp from 'fingerpose'; // <--- NEW: Import Fingerpose
// Import your custom gestures here. Make sure the path is correct based on your file structure.
import { HelloGesture, ILYGesture } from '@/lib/customGestures'; 
import { loadTrainedModel, trainAndSaveModel } from '@/lib/modelTrainer';
import { ALPHABET } from '@/lib/trainingData';

export interface RecognitionResult {
  sign: string;
  confidence: number;
  timestamp: number;
  allPredictions?: Array<{ sign: string; confidence: number }>;
  type?: 'static' | 'alphabet'; // <--- OPTIONAL: Para alam mo kung word or letter
}

export const useSignRecognition = (language: 'ASL' | 'FSL') => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastPredictionRef = useRef<string>('');
  const modelRef = useRef<tf.LayersModel | null>(null);
  const gestureEstimatorRef = useRef<fp.GestureEstimator | null>(null); // <--- NEW: Ref for Fingerpose
  const confidenceThreshold = 0.50; 

  // --- 1. Initialize Fingerpose and Models ---
  useEffect(() => {
    lastPredictionRef.current = '';
    setError(null);
    
    // Initialize Fingerpose with your custom gestures
    // Pwede mo dagdagan dito ng fp.Gestures.ThumbsUpGesture kung gusto mo
    gestureEstimatorRef.current = new fp.GestureEstimator([
        HelloGesture, 
        ILYGesture
    ]);

    loadModel();
  }, [language]);

  const loadModel = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`[SignRecognition] Starting model load for ${language}...`);

      try {
        await tf.setBackend('webgl');
      } catch (e) {
        console.warn('WebGL not available');
      }
      await tf.ready();

      let model: tf.LayersModel | null = null;

      // ... (Existing Model Loading Logic - No Changes Here) ...
      if (language === 'ASL') {
        try {
            const loadPromise = tf.loadLayersModel('/models/asl/model.json');
            const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000));
            model = await Promise.race([loadPromise, timeoutPromise]);
        } catch (e) { console.log('Fallback needed'); }
      }

      if (!model) { model = await loadTrainedModel(language); }
      if (!model) { 
          await trainAndSaveModel(language); 
          model = await loadTrainedModel(language);
      }
      if (!model) throw new Error('Failed to load model');

      // Warmup
      const warmup = model.predict(tf.zeros([1, 63])) as tf.Tensor;
      warmup.dispose();

      modelRef.current = model;
      setIsLoading(false);
      console.log(`[SignRecognition] Model Ready!`);
    } catch (err) {
      console.error(err);
      setError('Failed to load recognition model');
      setIsLoading(false);
    }
  };

  const preprocessLandmarks = (landmarks: any[]): number[] => {
    if (!landmarks || landmarks.length === 0) return [];
    const handLandmarks = landmarks[0];
    if (!handLandmarks || handLandmarks.length < 21) return [];

    const wrist = handLandmarks[0];
    const raw: number[] = [];
    for (let i = 0; i < 21; i++) {
      const lm = handLandmarks[i];
      raw.push(lm.x - wrist.x);
      raw.push(lm.y - wrist.y);
      raw.push(lm.z - wrist.z);
    }

    let maxAbs = 0.0001;
    for (let i = 0; i < raw.length; i++) {
      const v = Math.abs(raw[i]);
      if (v > maxAbs) maxAbs = v;
    }
    return raw.map(v => v / maxAbs);
  };

  // ... (Keep your applyManualCorrections exactly as is - it's good!) ...
  const applyManualCorrections = (prediction: string, handLandmarks: any[]): string => {
    if (!handLandmarks || handLandmarks.length < 21) return prediction;
    const wrist = handLandmarks[0];
    const thumbTip = handLandmarks[4];
    const indexTip = handLandmarks[8];
    const middleTip = handLandmarks[12];

    const isPointingDown = indexTip.y > wrist.y; 
    const xDist = Math.abs(indexTip.x - wrist.x);
    const yDist = Math.abs(indexTip.y - wrist.y);
    const isHorizontal = xDist > yDist;

    if (['N', 'S', 'Z', 'D', 'H'].includes(prediction)) { 
      if (isPointingDown) return 'P'; 
    }

    if (['G', 'H', 'Z', 'D', 'L', 'P'].includes(prediction)) {
      if (isHorizontal && !isPointingDown) {
        const indexLen = Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y);
        const middleLen = Math.hypot(middleTip.x - wrist.x, middleTip.y - wrist.y);
        if (middleLen < (indexLen * 0.85)) {
            return 'G';
        } 
        const minY = Math.min(indexTip.y, middleTip.y);
        const maxY = Math.max(indexTip.y, middleTip.y);
        const isThumbBetween = (thumbTip.y > minY) && (thumbTip.y < maxY);
        if (isThumbBetween) return 'P'; 
        else return 'H'; 
      }
    }

    if (['A', 'S', 'M', 'N'].includes(prediction)) {
       const indexMCP = handLandmarks[5];
       const thumbIsTucked = (thumbTip.x > Math.min(indexMCP.x, indexTip.x)) && 
                             (thumbTip.x < Math.max(indexMCP.x, indexTip.x));
       if (thumbIsTucked) return 'T';
    }
    return prediction;
  };

  // --- UPDATED RECOGNIZE FUNCTION ---
  const recognizeSign = async (landmarks: any[]): Promise<RecognitionResult | null> => {
    if (!landmarks || landmarks.length === 0) return null;

    // A. Check for FINGERPOSE Gestures (Words) First
    if (gestureEstimatorRef.current) {
        const hand = landmarks[0]; // Assuming landmarks[0] is the hand
        
        // Convert MediaPipe object landmarks to Fingerpose array format: [[x,y,z], ...]
        const fpLandmarks = hand.map((lm: any) => [lm.x, lm.y, lm.z]);
        
        // Estimate with high confidence (e.g., 8.5 out of 10)
        const gestureEst = await gestureEstimatorRef.current.estimate(fpLandmarks, 8.5);

        if (gestureEst.gestures.length > 0) {
            // Get the gesture with the highest confidence
            const bestGesture = gestureEst.gestures.reduce((p, c) => (p.score > c.score ? p : c));
            
            // Return immediately if confidence is high, bypassing the alphabet model
            if (bestGesture.score > 9.0) { // Strict score for words to avoid false positives
                
                // Debounce logic specific to words if needed, or share existing
                if (bestGesture.name === lastPredictionRef.current) return null;
                lastPredictionRef.current = bestGesture.name;

                console.log('Fingerpose Word Detected:', bestGesture.name);
                
                 // Reset after delay
                setTimeout(() => {
                    if (lastPredictionRef.current === bestGesture.name) lastPredictionRef.current = '';
                }, 2000); // Longer delay for words

                return {
                    sign: bestGesture.name, // "Hello" or "I love you"
                    confidence: bestGesture.score / 10, // Normalize to 0-1 ish
                    timestamp: Date.now(),
                    type: 'static'
                };
            }
        }
    }

    // B. If no word gesture detected, run ALPHABET Model (TFJS)
    if (!modelRef.current) return null;

    try {
      const features = preprocessLandmarks(landmarks);
      if (features.length !== 63) return null;

      const inputTensor = tf.tensor2d([features], [1, 63]);
      const prediction = modelRef.current.predict(inputTensor) as tf.Tensor;
      const probabilities = await prediction.data();
      inputTensor.dispose();
      prediction.dispose();

      const probsArr = Array.from(probabilities);
      const predictions = probsArr
        .map((prob, idx) => ({ sign: ALPHABET[idx], confidence: prob }))
        .sort((a, b) => b.confidence - a.confidence);

      const topPrediction = predictions[0];

      if (topPrediction.confidence >= confidenceThreshold) {
        let detectedSign = topPrediction.sign;
        
        // Apply your existing heuristics
        detectedSign = applyManualCorrections(detectedSign, landmarks[0]);
        
        if (detectedSign === lastPredictionRef.current) return null;

        lastPredictionRef.current = detectedSign;
        
        console.log('Alphabet Sign detected:', detectedSign);
        
        setTimeout(() => {
          if (lastPredictionRef.current === detectedSign) lastPredictionRef.current = '';
        }, 1500);
        
        return {
          sign: detectedSign,
          confidence: topPrediction.confidence,
          timestamp: Date.now(),
          allPredictions: predictions.slice(0, 5),
          type: 'alphabet'
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
    isLoading,
    error,
    recognizeSign,
    resetLastPrediction,
    confidenceThreshold
  };
};