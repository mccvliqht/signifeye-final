import { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as fp from 'fingerpose'; 

// Import your custom gestures
import { HelloGesture, ILYGesture, WaitGesture } from '@/lib/customGestures'; 
import { loadTrainedModel, trainAndSaveModel } from '@/lib/modelTrainer';
import { ALPHABET } from '@/lib/trainingData';

export interface RecognitionResult {
  sign: string;
  confidence: number;
  timestamp: number;
  allPredictions?: Array<{ sign: string; confidence: number }>;
  type?: 'static' | 'alphabet' | 'dynamic';
}

export const useSignRecognition = (language: 'ASL' | 'FSL') => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastPredictionRef = useRef<string>('');
  const modelRef = useRef<tf.LayersModel | null>(null);
  const gestureEstimatorRef = useRef<fp.GestureEstimator | null>(null);
  const confidenceThreshold = 0.60; // TInaasan ko onti para bawas noise

  // --- HISTORY TRACKER ---
  // Stores x,y coordinates of the Index Finger Tip
  const movementHistory = useRef<{x: number, y: number}[]>([]);

  useEffect(() => {
    lastPredictionRef.current = '';
    setError(null);
    
    gestureEstimatorRef.current = new fp.GestureEstimator([
        HelloGesture, 
        ILYGesture,
        WaitGesture
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

      if (language === 'ASL') {
        try {
            const loadPromise = tf.loadLayersModel('/models/asl/model.json');
            const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000));
            model = await Promise.race([loadPromise, timeoutPromise]) as tf.LayersModel;
        } catch (e) { console.log('Fallback needed'); }
      }

      if (!model) { model = await loadTrainedModel(language); }
      if (!model) { 
          await trainAndSaveModel(language); 
          model = await loadTrainedModel(language);
      }
      if (!model) throw new Error('Failed to load model');

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

  // --- NEW: COMPASS DIRECTION HELPER ---
  // Converts movement between two points into a generic direction
  const getDirection = (start: {x: number, y: number}, end: {x: number, y: number}) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // Deadzone: Ignore movements smaller than 0.04 (reduces jitter)
    if (Math.abs(dx) < 0.02 && Math.abs(dy) < 0.04) return null;

    // Calculate angle in degrees
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    // Map angle to Compass Directions
    // Screen coordinates: Y increases downwards.
    // 0 = Right, 90 = Down, 180 = Left, 270 = Up
    if (angle >= 337.5 || angle < 22.5) return 'RIGHT';
    if (angle >= 22.5 && angle < 67.5) return 'DOWN-RIGHT';
    if (angle >= 67.5 && angle < 112.5) return 'DOWN';
    if (angle >= 112.5 && angle < 157.5) return 'DOWN-LEFT';
    if (angle >= 157.5 && angle < 202.5) return 'LEFT';
    if (angle >= 202.5 && angle < 247.5) return 'UP-LEFT';
    if (angle >= 247.5 && angle < 292.5) return 'UP';
    if (angle >= 292.5 && angle < 337.5) return 'UP-RIGHT';
    
    return null;
  };

  // --- NEW: PATTERN MATCHER LOGIC ---
  const detectDynamicGesture = (currentStaticSign: string): string => {
    const history = movementHistory.current;
    
    // We need enough frames to detect a pattern
    if (history.length < 5) return currentStaticSign;

    // 1. Convert History -> Sequence of Directions
    const directions: string[] = [];
    
    // Check every 3rd frame (sampling) to smooth out the path
    for (let i = 0; i < history.length - 3; i += 2) {
        const dir = getDirection(history[i], history[i + 2]);
        // Only add if it's a new direction (remove duplicates)
        if (dir && directions[directions.length - 1] !== dir) {
            directions.push(dir);
        }
    }

    // Uncomment this to see the path in your browser console!
    // if (directions.length > 0) console.log("Path:", directions.join(" -> "));

    // 2. CHECK FOR 'Z' (Zigzag)
    // Valid starts: 'D' (Index Up), '1', 'P', or 'X'
    if (['D', '1', 'P', 'X'].includes(currentStaticSign) || directions.length > 3) {
        // Z Pattern: RIGHT -> DIAGONAL (Down-Left) -> RIGHT
        const hasRightStart = directions.slice(0, 3).some(d => d === 'RIGHT' || d === 'DOWN-RIGHT');
        const hasDiagMid = directions.some(d => d === 'DOWN-LEFT' || d === 'LEFT');
        const hasRightEnd = directions.slice(-3).some(d => d === 'RIGHT');

        // Check sequence order
        if (hasRightStart && hasDiagMid && hasRightEnd) {
             // Validate order indices
             const firstRightIdx = directions.findIndex(d => d === 'RIGHT' || d === 'DOWN-RIGHT');
             const diagIdx = directions.findIndex((d, i) => i > firstRightIdx && (d === 'DOWN-LEFT' || d === 'LEFT'));
             const lastRightIdx = directions.findIndex((d, i) => i > diagIdx && d === 'RIGHT');

             if (firstRightIdx !== -1 && diagIdx !== -1 && lastRightIdx !== -1) {
                 return 'Z';
             }
        }
    }

    // 3. CHECK FOR 'J' (Hook)
    // Valid starts: 'I', 'Y' (Pinky Up), or sometimes 'A'/'S' (Fist) if transitioning
    if (['I', 'Y', 'A', 'S'].includes(currentStaticSign)) {
        // J Pattern: DOWN -> LEFT (Curve) -> UP (Optional)
        const hasDown = directions.some(d => d === 'DOWN' || d === 'DOWN-RIGHT');
        const hasLeft = directions.some(d => d === 'LEFT' || d === 'DOWN-LEFT');
        
        if (hasDown && hasLeft) {
            const downIdx = directions.findIndex(d => d === 'DOWN' || d === 'DOWN-RIGHT');
            const leftIdx = directions.findIndex((d, i) => i > downIdx && (d === 'LEFT' || d === 'DOWN-LEFT'));
            
            // If we went down, then curved left immediately
            if (downIdx !== -1 && leftIdx !== -1) {
                return 'J';
            }
        }
    }

    return currentStaticSign;
  };

  const applyManualCorrections = (prediction: string, handLandmarks: any[]): string => {
    // ... (This function remains exactly the same as your original code)
    // For brevity, I'm assuming you still have this logic.
    // Copy the contents of your applyManualCorrections here if you deleted it.
    if (!handLandmarks || handLandmarks.length < 21) return prediction;
    const wrist = handLandmarks[0];
    const thumbTip = handLandmarks[4];
    const indexTip = handLandmarks[8];
    const middleTip = handLandmarks[12];
    const indexBase = handLandmarks[5];

    const isPointingDown = indexTip.y > wrist.y; 
    const xDist = Math.abs(indexTip.x - wrist.x);
    const yDist = Math.abs(indexTip.y - wrist.y);
    const isHorizontal = xDist > yDist;

    if (prediction === 'L') {
        const thumbExtension = Math.abs(thumbTip.x - indexBase.x);
        if (thumbExtension < 0.05) { 
            return lastPredictionRef.current === 'Wait' ? 'Wait' : prediction;
        }
    }

    if (['S', 'Z', 'D', 'H'].includes(prediction)) { 
      if (isPointingDown) return 'P'; 
    }

    if (['G', 'H', 'Z', 'D', 'L', 'P'].includes(prediction)) {
      if (isHorizontal && !isPointingDown) {
        const indexLen = Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y);
        const middleLen = Math.hypot(middleTip.x - wrist.x, middleTip.y - wrist.y);
        if (middleLen < (indexLen * 0.85)) return 'G';
        const minY = Math.min(indexTip.y, middleTip.y);
        const maxY = Math.max(indexTip.y, middleTip.y);
        const isThumbBetween = (thumbTip.y > minY) && (thumbTip.y < maxY);
        return isThumbBetween ? 'P' : 'H';
      }
    }
    return prediction;
  };

  const recognizeSign = async (landmarks: any[]): Promise<RecognitionResult | null> => {
    // 1. Handle No Hands
    if (!landmarks || landmarks.length === 0) {
        lastPredictionRef.current = ''; 
        movementHistory.current = []; // Reset history
        return null;
    }

    // 2. Track Index Finger (Tip)
    const hand = landmarks[0]; 
    const indexTip = hand[8]; 
    
    // Add to history
    movementHistory.current.push({ x: indexTip.x, y: indexTip.y });
    
    // Keep last 30 frames (Increased from 20 to capture longer Z/J movements)
    if (movementHistory.current.length > 30) {
        movementHistory.current.shift();
    }

    // A. Fingerpose (Static Words)
    if (gestureEstimatorRef.current) {
        const fpLandmarks = hand.map((lm: any) => [lm.x, lm.y, lm.z]);
        const gestureEst = await gestureEstimatorRef.current.estimate(fpLandmarks, 7.5);

        if (gestureEst.gestures.length > 0) {
            const bestGesture = gestureEst.gestures.reduce((p, c) => (p.score > c.score ? p : c));
            
            if (bestGesture.score > 8.5) { 
                if (bestGesture.name === lastPredictionRef.current) return null;
                lastPredictionRef.current = bestGesture.name;

                setTimeout(() => {
                    if (lastPredictionRef.current === bestGesture.name) lastPredictionRef.current = '';
                }, 2000); 

                const confidence = bestGesture.score / 10;
                return {
                    sign: bestGesture.name,
                    confidence: confidence,
                    timestamp: Date.now(),
                    type: 'static',
                    allPredictions: [{ sign: bestGesture.name, confidence: confidence }]
                };
            }
        }
    }

    // B. Alphabet Model (TFJS)
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

      // Auto-clear low confidence
      if (topPrediction.confidence < confidenceThreshold) {
          lastPredictionRef.current = '';
          return {
              sign: '',
              confidence: 0,
              timestamp: Date.now(),
              allPredictions: [],
              type: 'alphabet'
          };
      }

      if (topPrediction.sign === lastPredictionRef.current) return null;

      let detectedSign = topPrediction.sign;
      
      // 1. Apply Static Corrections
      detectedSign = applyManualCorrections(detectedSign, landmarks[0]);
      
      // 2. Apply Dynamic Corrections (Pattern Matching)
      // Dito na pumapasok ang "Compass" logic natin
      detectedSign = detectDynamicGesture(detectedSign);
      
      lastPredictionRef.current = detectedSign;
      
      setTimeout(() => {
        if (lastPredictionRef.current === detectedSign) lastPredictionRef.current = '';
      }, 1500);
      
      return {
        sign: detectedSign,
        confidence: topPrediction.confidence,
        timestamp: Date.now(),
        allPredictions: predictions.slice(0, 5),
        type: (detectedSign === 'J' || detectedSign === 'Z') ? 'dynamic' : 'alphabet'
      };

    } catch (err) {
      console.error('Error recognizing sign:', err);
      return null;
    }
  };

  const resetLastPrediction = () => {
    lastPredictionRef.current = '';
    movementHistory.current = [];
  };

  return {
    isLoading,
    error,
    recognizeSign,
    resetLastPrediction,
    confidenceThreshold
  };
};