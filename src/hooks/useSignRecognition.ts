import { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as fp from 'fingerpose'; 

import { translateToFSL } from '@/lib/fslTranslations';
import { 
  HelloGesture, ILYGesture, WaitGesture, YesGesture, NoGesture, 
  GoodGesture, WaterGesture, PeaceGesture, //OpenHandGesture,
  CallGesture, DrinkGesture, //PointGesture, FlatHandGesture, FistGesture 
} from '@/lib/customGestures'; 

import { loadTrainedModel, trainAndSaveModel } from '@/lib/modelTrainer';
import { ALPHABET } from '@/lib/trainingData';

export interface RecognitionResult {
  sign: string;
  confidence: number;
  timestamp: number;
  allPredictions?: Array<{ sign: string; confidence: number }>;
  type?: 'static' | 'alphabet' | 'dynamic';
}

export const useSignRecognition = (language: 'ASL' | 'FSL', mode: 'phrases' | 'alphabet' = 'phrases') => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastPredictionRef = useRef<string>('');
  const modelRef = useRef<tf.LayersModel | null>(null);
  const gestureEstimatorRef = useRef<fp.GestureEstimator | null>(null);
  const confidenceThreshold = 0.40; 

  const movementHistory = useRef<{x: number, y: number}[]>([]);

  useEffect(() => {
    lastPredictionRef.current = '';
    setError(null);
    
    // 1. SETUP FINGERPOSE (PHRASES MODE)
    // Dito nilalagay lahat ng "Static Signs" na gusto mong madetect
    if (mode === 'phrases') {
        gestureEstimatorRef.current = new fp.GestureEstimator([
            HelloGesture, 
            ILYGesture,
            WaitGesture,
            NoGesture,
            YesGesture,
            GoodGesture,
            WaterGesture,
            PeaceGesture, 
           // OpenHandGesture,   // Base for Father/Mother
            CallGesture,       // Call Me
            DrinkGesture,      // Drink
           // PointGesture,      // Base for You/Me/Think
          //  FlatHandGesture,   // Base for Please
           // FistGesture        // Base for Sorry
        ]);
        setIsLoading(false);
    }

    // 2. SETUP TENSORFLOW (ALPHABET MODE)
    if (mode === 'alphabet') {
      loadModel();
    } 
  }, [language, mode]);

  const loadModel = async () => {
    try {
      setIsLoading(true);
      setError(null);
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
      setError('Failed to load recognition model');
      setIsLoading(false);
    }
  };

  const preprocessLandmarks = (landmarks: any[]): number[] => {
    if (!landmarks || landmarks.length === 0) return [];
    const handLandmarks = landmarks[0];
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
        return { sign: '', confidence: 0, timestamp: Date.now(), allPredictions: [] };
    }

    const hand = landmarks[0]; 
    
    // --- PART A: PHRASES MODE (Call Me, Drink, Father, Mother, etc.) ---
    if (mode === 'phrases' && gestureEstimatorRef.current) {
        const fpLandmarks = hand.map((lm: any) => [lm.x, lm.y, lm.z]);
        const gestureEst = await gestureEstimatorRef.current.estimate(fpLandmarks, 7.0); 
        
        if (gestureEst.gestures.length > 0) {
            const bestGesture = gestureEst.gestures.reduce((p, c) => (p.score > c.score ? p : c));
            
            if (bestGesture.score > 7.0) { 
                let finalSign = bestGesture.name;
                const wristY = hand[0].y; // 0 = Taas (Noo), 1 = Baba (Dibdib)
/*
                // --- 🚀 COMPLETE LOGIC MAPPING 🚀 ---

                // 1. OPEN HAND / HELLO / FLAT HAND Logic
                // Covers: Father, Mother, Fine, Please
                if (finalSign === 'OpenHand' || finalSign === 'Hello' || finalSign === 'FlatHand') {
                    // TAAS (Noo) -> Father
                    if (wristY < 0.35) { 
                        finalSign = 'Father';
                    } 
                    // GITNA (Bibig/Chin) -> Mother
                    else if (wristY < 0.60) {
                        finalSign = 'Mother';
                    }
                    // BABA (Dibdib) -> Please vs Fine
                    else {
                        if (finalSign === 'FlatHand') {
                             finalSign = 'Please'; // Flat hand on chest implies rubbing/please
                        } else {
                             finalSign = 'Fine'; // Thumb out/Open hand on chest
                        }
                    }
                }

                // 2. POINTING Logic
                // Covers: Think, You, Me/I
                if (finalSign === 'Point') {
                    // TAAS (Noo) -> Think
                    if (wristY < 0.35) {
                        finalSign = 'Think';
                    }
                    // BABA (Dibdib) -> Me / I
                    else if (wristY > 0.60) {
                        finalSign = 'Me'; // or 'I'
                    }
                    // GITNA (Nakaturo sa Camera) -> You
                    else {
                        finalSign = 'You';
                    }
                }

                // 3. FIST Logic
                // Covers: Sorry vs Yes
                if (finalSign === 'Fist' || finalSign === 'Yes') {
                    // BABA (Dibdib) -> Sorry (Rubbing motion implied)
                    if (wristY > 0.60) {
                        finalSign = 'Sorry';
                    } else {
                        // Default to Yes otherwise
                        finalSign = 'Yes';
                    }
                }

*/
                // 4. CALL ME Logic
                if (finalSign === 'Call Me') {
                    // Dapat nasa taas (Tenga)
                    if (wristY > 0.60) return null; // Ignore if too low
                }

                // 5. DRINK Logic
                if (finalSign === 'Drink') {
                    // Dapat nasa gitna (Bibig)
                    // Kung nasa baba masyado, baka letter C lang
                    if (wristY < 0.20 || wristY > 0.65) finalSign = 'C'; 
                }

                // --- END LOGIC ---

                if (language === 'FSL') finalSign = translateToFSL(finalSign);

                if (finalSign === lastPredictionRef.current) {
                  return { sign: finalSign, confidence: bestGesture.score/10, timestamp: Date.now(), type: 'static' };
                }
                lastPredictionRef.current = finalSign;
                setTimeout(() => { if (lastPredictionRef.current === finalSign) lastPredictionRef.current = ''; }, 2000); 
                
                return { sign: finalSign, confidence: bestGesture.score/10, timestamp: Date.now(), type: 'static' };
            }
        }
        return null;
    }

    // --- PART B: ALPHABET MODE (Standard TensorFlow) ---
    if (mode === 'alphabet' && modelRef.current) {
        try {
          const features = preprocessLandmarks(landmarks);
          const inputTensor = tf.tensor2d([features], [1, 63]);
          const prediction = modelRef.current.predict(inputTensor) as tf.Tensor;
          const probabilities = await prediction.data();
          inputTensor.dispose(); prediction.dispose();

          const probsArr = Array.from(probabilities);
          const predictions = probsArr.map((prob, idx) => ({ 
            sign: ALPHABET[idx], 
            confidence: prob 
          })).sort((a, b) => b.confidence - a.confidence);

          const topPrediction = predictions[0];

          if (topPrediction.confidence < confidenceThreshold) {
              return { sign: '', confidence: 0, timestamp: Date.now(), allPredictions: predictions.slice(0, 5) };
          }

          let detectedSign = topPrediction.sign;
          if (language === 'FSL') detectedSign = translateToFSL(detectedSign);

          if (detectedSign === lastPredictionRef.current) {
            return { sign: detectedSign, confidence: topPrediction.confidence, timestamp: Date.now(), allPredictions: predictions.slice(0, 5) };
          }
          
          lastPredictionRef.current = detectedSign;
          setTimeout(() => { if (lastPredictionRef.current === detectedSign) lastPredictionRef.current = ''; }, 1500);
          
          return {
            sign: detectedSign,
            confidence: topPrediction.confidence,
            timestamp: Date.now(),
            allPredictions: predictions, 
            type: 'alphabet'
          };
        } catch (err) {
          return null;
        }
    }

    return null;
  };

  const resetLastPrediction = () => {
    lastPredictionRef.current = '';
    movementHistory.current = [];
  };

  return { isLoading, error, recognizeSign, resetLastPrediction, confidenceThreshold };
};