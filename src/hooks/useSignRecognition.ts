import { useEffect, useState, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as fp from 'fingerpose'; 

import { translateToFSL } from '@/lib/fslTranslations';

import { 
  HelloGesture, ILYGesture, WaitGesture, YesGesture, NoGesture, 
  GoodGesture, WaterGesture, PeaceGesture, OpenHandGesture, 
  CallGesture, DrinkGesture, PointGesture, FlatHandGesture, FistGesture 
} from '@/lib/customGestures'; 

import { AllNumberGestures } from '@/lib/numberGestures';

import { loadTrainedModel, trainAndSaveModel } from '@/lib/modelTrainer';
import { ALPHABET } from '@/lib/trainingData';

export interface RecognitionResult {
  sign: string;
  confidence: number;
  timestamp: number;
  allPredictions?: Array<{ sign: string; confidence: number }>;
  type?: 'static' | 'alphabet' | 'dynamic';
}

export const useSignRecognition = (language: 'ASL' | 'FSL', mode: 'phrases' | 'alphabet' | 'numbers' = 'phrases') => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastPredictionRef = useRef<string>('');
  const modelRef = useRef<tf.LayersModel | null>(null);
  const gestureEstimatorRef = useRef<fp.GestureEstimator | null>(null);
  
  // 📉 LOWERED THRESHOLD: 6.0 para mas madaling madetect ang Water/Think
  // Dati 7.5, masyadong mahigpit kaya hindi lumalabas yung iba.
  const confidenceThreshold = 0.60; 

  const movementHistory = useRef<{x: number, y: number}[]>([]);

  useEffect(() => {
    lastPredictionRef.current = '';
    setError(null);
    setIsLoading(true);

    if (mode === 'phrases') {
        gestureEstimatorRef.current = new fp.GestureEstimator([
            HelloGesture, ILYGesture, WaitGesture, NoGesture, YesGesture,
            GoodGesture, WaterGesture, PeaceGesture, OpenHandGesture,
            CallGesture, DrinkGesture, PointGesture, FlatHandGesture, FistGesture
        ]);
        setIsLoading(false);
    }
    else if (mode === 'numbers') {
        gestureEstimatorRef.current = new fp.GestureEstimator(AllNumberGestures);
        setIsLoading(false);
    }
    else if (mode === 'alphabet') {
        gestureEstimatorRef.current = null;
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
    
    // --- STATIC MODE (Phrases & Numbers) ---
    if ((mode === 'phrases' || mode === 'numbers') && gestureEstimatorRef.current) {
        const fpLandmarks = hand.map((lm: any) => [lm.x, lm.y, lm.z]);
        
        // Use lowered threshold (7.0) for better detection
        const gestureEst = await gestureEstimatorRef.current.estimate(fpLandmarks, 7.0); 
        
        if (gestureEst.gestures.length > 0) {
            const bestGesture = gestureEst.gestures.reduce((p, c) => (p.score > c.score ? p : c));
            
            // Allow slightly lower confidence for specific hard signs like Water
            const minScore = bestGesture.name === 'Water' ? 6.5 : 7.0;

            if (bestGesture.score > minScore) { 
                let finalSign = bestGesture.name;
                
                // WRIST POSITION: 0 (Top/Head) -> 1 (Bottom/Chest)
                const wristY = hand[0].y; 

                if (mode === 'phrases') {
                    // 1. OPEN HAND / HELLO / FLAT HAND Logic
                    // Covers: Hello, Father, Mother, Fine, Please
                    if (finalSign === 'OpenHand' || finalSign === 'Hello' || finalSign === 'FlatHand') {
                        
                        // 🟢 ZONE A: HEAD / FOREHEAD (Father / Hello)
                        // Adjusted: Need to be really high up (< 0.3)
                        if (wristY < 0.30) { 
                            // If it's explicitly detected as Hello (Palm Forward), use Hello
                            if (finalSign === 'Hello') finalSign = 'Hello';
                            else finalSign = 'Father';
                        } 
                        
                        // 🟢 ZONE B: CHIN / MOUTH (Mother)
                        // Adjusted: 0.3 to 0.65
                        else if (wristY < 0.65) {
                            // Hello can sometimes be detected near the face, so prioritize Hello if confidence is high
                            if (finalSign === 'Hello' && bestGesture.score > 8.5) finalSign = 'Hello';
                            else finalSign = 'Mother';
                        }
                        
                        // 🟢 ZONE C: CHEST / BODY (Fine / Please)
                        // Adjusted: Must be strictly low (> 0.65)
                        else {
                            // STRICTER 'PLEASE' CHECK:
                            // Only becomes "Please" if the gesture is strictly 'FlatHand' 
                            // AND 'OpenHand' score is much lower.
                            // Otherwise, default to "Fine" (safer default).
                            if (finalSign === 'FlatHand') {
                                 finalSign = 'Please'; 
                            } else {
                                 finalSign = 'Fine'; 
                            }
                        }
                    }

                    // 2. POINTING Logic
                    // Covers: Think, You, Me
                    if (finalSign === 'Point') {
                        // HEAD -> Think (Strict < 0.3)
                        if (wristY < 0.30) {
                            finalSign = 'Think';
                        }
                        // CHEST -> Me (Strict > 0.65)
                        else if (wristY > 0.65) {
                            finalSign = 'Me'; 
                        }
                        // MIDDLE -> You (Pointing Forward usually at neck/chin level)
                        else {
                            finalSign = 'You';
                        }
                    }

                    // 3. FIST Logic
                    if (finalSign === 'Fist' || finalSign === 'Yes') {
                        // Chest -> Sorry
                        if (wristY > 0.65) {
                            finalSign = 'Sorry';
                        } else {
                            finalSign = 'Yes';
                        }
                    }

                    // 4. Position Checks
                    if (finalSign === 'Call Me' && wristY > 0.60) return null; // Ignore low call me
                    
                    // Relaxed Drink Logic
                    if (finalSign === 'Drink') {
                        if (wristY > 0.70) finalSign = 'C'; // Only becomes C if super low
                    }
                }

                if (language === 'FSL') finalSign = translateToFSL(finalSign);

                if (finalSign === lastPredictionRef.current) {
                  return { sign: finalSign, confidence: bestGesture.score/10, timestamp: Date.now(), type: 'static' };
                }
                lastPredictionRef.current = finalSign;
                setTimeout(() => { if (lastPredictionRef.current === finalSign) lastPredictionRef.current = ''; }, 1500); // Faster reset
                
                return { sign: finalSign, confidence: bestGesture.score/10, timestamp: Date.now(), type: 'static' };
            }
        }
        return null;
    }

    // --- ALPHABET MODE ---
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
          setTimeout(() => { if (lastPredictionRef.current === detectedSign) lastPredictionRef.current = ''; }, 1000); // Fast Alphabet reset
          
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

  const resetLastPrediction = useCallback(() => {
    lastPredictionRef.current = '';
    movementHistory.current = [];
  }, []);

  return { isLoading, error, recognizeSign, resetLastPrediction, confidenceThreshold };
};