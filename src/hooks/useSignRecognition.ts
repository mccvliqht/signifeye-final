import { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as fp from 'fingerpose'; 

// --- 1. Static Gesture Imports ---
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
  const confidenceThreshold = 0.50; // Balanced for speed/accuracy

  // --- MOTION TRACKER (Added for J & Z) ---
  const movementHistory = useRef<{x: number, y: number}[]>([]);

  // --- 2. Initialize Fingerpose Estimator ---
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
      // Note: If you want to fix Left-Hand accuracy, change (lm.x - wrist.x) to a flipped value here
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

  // --- MOTION HELPERS ---
  const getDirection = (start: {x: number, y: number}, end: {x: number, y: number}) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    if (Math.abs(dx) < 0.02 && Math.abs(dy) < 0.04) return null;

    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;

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

  const detectDynamicGesture = (currentStaticSign: string): string => {
    const history = movementHistory.current;
    if (history.length < 5) return currentStaticSign;

    const directions: string[] = [];
    for (let i = 0; i < history.length - 3; i += 2) {
        const dir = getDirection(history[i], history[i + 2]);
        if (dir && directions[directions.length - 1] !== dir) directions.push(dir);
    }

    // Z Pattern logic
    if (['D', '1', 'P', 'X'].includes(currentStaticSign) || directions.length > 3) {
        const hasRightStart = directions.slice(0, 3).some(d => d === 'RIGHT' || d === 'DOWN-RIGHT');
        const hasDiagMid = directions.some(d => d === 'DOWN-LEFT' || d === 'LEFT');
        const hasRightEnd = directions.slice(-3).some(d => d === 'RIGHT');

        if (hasRightStart && hasDiagMid && hasRightEnd) {
             const fRIdx = directions.findIndex(d => d === 'RIGHT' || d === 'DOWN-RIGHT');
             const dIdx = directions.findIndex((d, i) => i > fRIdx && (d === 'DOWN-LEFT' || d === 'LEFT'));
             const lRIdx = directions.findIndex((d, i) => i > dIdx && d === 'RIGHT');
             if (fRIdx !== -1 && dIdx !== -1 && lRIdx !== -1) return 'Z';
        }
    }

    // J Pattern logic
    if (['I', 'Y', 'A', 'S'].includes(currentStaticSign)) {
        const hasDown = directions.some(d => d === 'DOWN' || d === 'DOWN-RIGHT');
        const hasLeft = directions.some(d => d === 'LEFT' || d === 'DOWN-LEFT');
        if (hasDown && hasLeft) {
            const dIdx = directions.findIndex(d => d === 'DOWN' || d === 'DOWN-RIGHT');
            const lIdx = directions.findIndex((d, i) => i > dIdx && (d === 'LEFT' || d === 'DOWN-LEFT'));
            if (dIdx !== -1 && lIdx !== -1) return 'J';
        }
    }
    return currentStaticSign;
  };

  const applyManualCorrections = (prediction: string, handLandmarks: any[]): string => {
    if (!handLandmarks || handLandmarks.length < 21) return prediction;
    const wrist = handLandmarks[0];
    const thumbTip = handLandmarks[4];
    const indexTip = handLandmarks[8];
    const indexBase = handLandmarks[5];
    const middleTip = handLandmarks[12];

    const isPointingDown = indexTip.y > wrist.y; 
    const xDist = Math.abs(indexTip.x - wrist.x);
    const yDist = Math.abs(indexTip.y - wrist.y);
    const isHorizontal = xDist > yDist;

    // --- KEEPING OUR PROGRESS: 'L' vs 'Wait a Minute' ---
    if (prediction === 'L') {
        const thumbExtension = Math.abs(thumbTip.x - indexBase.x);
        if (thumbExtension < 0.05) { 
            return lastPredictionRef.current === 'Wait a Minute' ? 'Wait a Minute' : prediction;
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
    // 1. If hand leaves camera, clear the text and history
    if (!landmarks || landmarks.length === 0) {
        lastPredictionRef.current = ''; 
        movementHistory.current = [];
        return { sign: '', confidence: 0, timestamp: Date.now(), allPredictions: [] }; // Keep UI active
    }

    const hand = landmarks[0]; 
    const indexTip = hand[8]; 
    movementHistory.current.push({ x: indexTip.x, y: indexTip.y });
    if (movementHistory.current.length > 30) movementHistory.current.shift();

    // A. Fingerpose Word Detection (Hello, ILY, Wait a Minute)
    if (gestureEstimatorRef.current) {
        const fpLandmarks = hand.map((lm: any) => [lm.x, lm.y, lm.z]);
        const gestureEst = await gestureEstimatorRef.current.estimate(fpLandmarks, 7.5);
        if (gestureEst.gestures.length > 0) {
            const bestGesture = gestureEst.gestures.reduce((p, c) => (p.score > c.score ? p : c));
            if (bestGesture.score > 8.5) { 
                if (bestGesture.name === lastPredictionRef.current) {
                  return { sign: bestGesture.name, confidence: bestGesture.score/10, timestamp: Date.now(), allPredictions: [] };
                }
                lastPredictionRef.current = bestGesture.name;
                setTimeout(() => { if (lastPredictionRef.current === bestGesture.name) lastPredictionRef.current = ''; }, 2000); 
                return { sign: bestGesture.name, confidence: bestGesture.score/10, timestamp: Date.now(), type: 'static' };
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
      inputTensor.dispose(); prediction.dispose();

      const probsArr = Array.from(probabilities);
      const predictions = probsArr.map((prob, idx) => ({ sign: ALPHABET[idx], confidence: prob })).sort((a, b) => b.confidence - a.confidence);
      const topPrediction = predictions[0];

      // Keep UI predictions even on low confidence
      if (topPrediction.confidence < confidenceThreshold) {
          lastPredictionRef.current = '';
          return { sign: '', confidence: 0, timestamp: Date.now(), allPredictions: predictions.slice(0, 5) };
      }

      let detectedSign = topPrediction.sign;
      detectedSign = applyManualCorrections(detectedSign, landmarks[0]);
      
      // APPLY MOTION TRACKING FOR J & Z
      detectedSign = detectDynamicGesture(detectedSign);

      if (detectedSign === lastPredictionRef.current) {
        return { sign: detectedSign, confidence: topPrediction.confidence, timestamp: Date.now(), allPredictions: predictions.slice(0, 5) };
      }
      
      lastPredictionRef.current = detectedSign;
      setTimeout(() => { if (lastPredictionRef.current === detectedSign) lastPredictionRef.current = ''; }, 1500);
      
      return {
        sign: detectedSign,
        confidence: topPrediction.confidence,
        timestamp: Date.now(),
        allPredictions: predictions.slice(0, 5),
        type: (detectedSign === 'J' || detectedSign === 'Z') ? 'dynamic' : 'alphabet'
      };
    } catch (err) {
      console.error('Error:', err);
      return null;
    }
  };

  const resetLastPrediction = () => {
    lastPredictionRef.current = '';
    movementHistory.current = [];
  };

  return { isLoading, error, recognizeSign, resetLastPrediction, confidenceThreshold };
};