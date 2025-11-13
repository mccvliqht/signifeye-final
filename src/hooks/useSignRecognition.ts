import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RecognitionResult {
  sign: string;
  confidence: number;
  timestamp: number;
  allPredictions?: Array<{ sign: string; confidence: number }>;
}

export const useSignRecognition = (language: 'ASL' | 'FSL') => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastPredictionRef = useRef<string>('');
  const confidenceThreshold = 0.85; // 85% confidence for Roboflow predictions

  useEffect(() => {
    // Reset when language changes
    lastPredictionRef.current = '';
    setError(null);
  }, [language]);

  const recognizeSign = async (imageBase64: string): Promise<RecognitionResult | null> => {
    if (!imageBase64) {
      return null;
    }

    try {
      setIsLoading(true);
      
      console.log(`Classifying ${language} sign with Roboflow...`);

      // Call Roboflow edge function
      const { data, error: apiError } = await supabase.functions.invoke('classify-sign-roboflow', {
        body: {
          imageBase64,
          language,
        },
      });

      if (apiError) {
        console.error('Roboflow API error:', apiError);
        setError(apiError.message);
        return null;
      }

      if (data && data.sign && data.confidence >= confidenceThreshold) {
        const detectedSign = data.sign;
        
        // Prevent duplicate detections
        if (detectedSign === lastPredictionRef.current) {
          return null;
        }

        lastPredictionRef.current = detectedSign;
        
        console.log('Sign detected:', detectedSign, 'Confidence:', data.confidence);
        console.log('Top predictions:', data.allPredictions);
        
        // Reset after delay
        setTimeout(() => {
          if (lastPredictionRef.current === detectedSign) {
            lastPredictionRef.current = '';
          }
        }, 1500);
        
        return {
          sign: detectedSign,
          confidence: data.confidence,
          timestamp: Date.now(),
          allPredictions: data.allPredictions
        };
      }

      return null;
    } catch (err) {
      console.error('Error recognizing sign:', err);
      setError(err instanceof Error ? err.message : 'Recognition failed');
      return null;
    } finally {
      setIsLoading(false);
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
