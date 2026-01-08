import { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as fp from 'fingerpose'; 

// --- 1. Added NoGesture to imports ---
import { HelloGesture, ILYGesture, NoGesture } from '@/lib/customGestures'; 
import { loadTrainedModel, trainAndSaveModel } from '@/lib/modelTrainer';
import { ALPHABET } from '@/lib/trainingData';

export interface RecognitionResult {
  sign: string;
  confidence: number;
  timestamp: number;
  allPredictions?: Array<{ sign: string; confidence: number }>;
  type?: 'static' | 'alphabet';
}

export const useSignRecognition = (language: 'ASL' | 'FSL') => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastPredictionRef = useRef<string>('');
  const modelRef = useRef<tf.LayersModel | null>(null);
  const gestureEstimatorRef = useRef<fp.GestureEstimator | null>(null);
  const confidenceThreshold = 0.50; 

  // --- 2. Initialize Fingerpose with the new "No" gesture ---
  useEffect(() => {
    lastPredictionRef.current = '';
    setError(null);
    
    gestureEstimatorRef.current = new fp.GestureEstimator([
        HelloGesture, 
        ILYGesture,
        NoGesture // <--- "No" is now active
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

    if (['S', 'Z', 'D', 'H'].includes(prediction)) { 
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
    return prediction;
  };

  const recognizeSign = async (landmarks: any[]): Promise<RecognitionResult | null> => {
    if (!landmarks || landmarks.length === 0) return null;

    if (gestureEstimatorRef.current) {
        const hand = landmarks[0]; 
        const fpLandmarks = hand.map((lm: any) => [lm.x, lm.y, lm.z]);
        
        // Estimate with high confidence threshold
        const gestureEst = await gestureEstimatorRef.current.estimate(fpLandmarks, 8.5);

        if (gestureEst.gestures.length > 0) {
            const bestGesture = gestureEst.gestures.reduce((p, c) => (p.score > c.score ? p : c));
            
            // Score check to prevent alphabet letters from being misidentified as words
            if (bestGesture.score > 8.0) { 
                if (bestGesture.name === lastPredictionRef.current) return null;
                lastPredictionRef.current = bestGesture.name;

                console.log('Word Detected:', bestGesture.name);
                
                setTimeout(() => {
                    if (lastPredictionRef.current === bestGesture.name) lastPredictionRef.current = '';
                }, 2000); 

                return {
                    sign: bestGesture.name,
                    confidence: bestGesture.score / 10,
                    timestamp: Date.now(),
                    type: 'static'
                };
            }
        }
    }

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