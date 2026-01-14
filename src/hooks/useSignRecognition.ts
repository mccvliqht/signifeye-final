import { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as fp from 'fingerpose'; 

import { translateToFSL } from '@/lib/fslTranslations';
import { HelloGesture, ILYGesture, WaitGesture, YesGesture, NoGesture } from '@/lib/customGestures'; 
import { loadTrainedModel, trainAndSaveModel } from '@/lib/modelTrainer';
import { ALPHABET } from '@/lib/trainingData';

export interface RecognitionResult {
  sign: string;
  confidence: number;
  timestamp: number;
  allPredictions?: Array<{ sign: string; confidence: number }>;
  type?: 'static' | 'alphabet' | 'dynamic';
}

// 🛠️ Added 'mode' parameter to switch between Words and Alphabets
export const useSignRecognition = (language: 'ASL' | 'FSL', mode: 'phrases' | 'alphabet' = 'phrases') => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastPredictionRef = useRef<string>('');
  const modelRef = useRef<tf.LayersModel | null>(null);
  const gestureEstimatorRef = useRef<fp.GestureEstimator | null>(null);
  const confidenceThreshold = 0.50; 

  const movementHistory = useRef<{x: number, y: number}[]>([]);

  useEffect(() => {
    lastPredictionRef.current = '';
    setError(null);
    
    gestureEstimatorRef.current = new fp.GestureEstimator([
        HelloGesture, 
        ILYGesture,
        WaitGesture,
        NoGesture,
        YesGesture,
    ]);

    // Only load the heavy TFJS Alphabet model if we are in alphabet mode
    if (mode === 'alphabet') {
      loadModel();
    } else {
      setIsLoading(false);
    }
  }, [language, mode]);

  const loadModel = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      try {
        await tf.setBackend('webgl');
      } catch (e) {
        console.warn('WebGL not available');
      }
      await tf.ready();

      let model: tf.LayersModel | null = null;

      if (language === 'ASL' || language === 'FSL') {
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

  const recognizeSign = async (landmarks: any[]): Promise<RecognitionResult | null> => {
    if (!landmarks || landmarks.length === 0) {
        lastPredictionRef.current = ''; 
        movementHistory.current = [];
        return { sign: '', confidence: 0, timestamp: Date.now(), allPredictions: [] };
    }

    const hand = landmarks[0]; 
    
    // --- PART A: Fingerpose Word Detection (Always Active) ---
    if (gestureEstimatorRef.current) {
        const fpLandmarks = hand.map((lm: any) => [lm.x, lm.y, lm.z]);
        const gestureEst = await gestureEstimatorRef.current.estimate(fpLandmarks, 7.5);
        
        if (gestureEst.gestures.length > 0) {
            const bestGesture = gestureEst.gestures.reduce((p, c) => (p.score > c.score ? p : c));
            
            if (bestGesture.score > 7.5) { 
                let finalSign = bestGesture.name;
                
                if (language === 'FSL') {
                    finalSign = translateToFSL(finalSign);
                }

                if (finalSign === lastPredictionRef.current) {
                  return { sign: finalSign, confidence: bestGesture.score/10, timestamp: Date.now(), allPredictions: [] };
                }
                lastPredictionRef.current = finalSign;
                setTimeout(() => { if (lastPredictionRef.current === finalSign) lastPredictionRef.current = ''; }, 2000); 
                
                return { sign: finalSign, confidence: bestGesture.score/10, timestamp: Date.now(), type: 'static' };
            }
        }
    }

    // --- PART B: Alphabet Model (TFJS) - ONLY RUNS IF MODE IS 'alphabet' ---
    if (mode !== 'alphabet' || !modelRef.current) return null;

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

      if (topPrediction.confidence < confidenceThreshold) {
          lastPredictionRef.current = '';
          return { sign: '', confidence: 0, timestamp: Date.now(), allPredictions: predictions.slice(0, 5) };
      }

      let detectedSign = topPrediction.sign;
      
      if (language === 'FSL') {
          detectedSign = translateToFSL(detectedSign);
      }

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
        type: 'alphabet'
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