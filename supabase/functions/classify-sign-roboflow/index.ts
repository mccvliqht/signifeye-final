import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, language } = await req.json();
    
    if (!imageBase64) {
      throw new Error('No image data provided');
    }

    const ROBOFLOW_API_KEY = Deno.env.get('ROBOFLOW_API_KEY');
    if (!ROBOFLOW_API_KEY) {
      throw new Error('ROBOFLOW_API_KEY not configured');
    }

    // Select model based on language
    const modelEndpoint = language === 'ASL' 
      ? 'https://detect.roboflow.com/asldetect/10'
      : 'https://detect.roboflow.com/fsl-final/1';

    console.log(`Classifying ${language} sign with Roboflow...`);

    // Call Roboflow API
    const response = await fetch(`${modelEndpoint}?api_key=${ROBOFLOW_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: imageBase64,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Roboflow API error:', response.status, errorText);
      throw new Error(`Roboflow API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Roboflow response:', data);

    // Extract best prediction
    if (data.predictions && data.predictions.length > 0) {
      // Sort by confidence
      const sortedPredictions = data.predictions.sort((a: any, b: any) => b.confidence - a.confidence);
      const bestPrediction = sortedPredictions[0];

      // Only return if confidence is high enough (>0.6 or 60%)
      if (bestPrediction.confidence >= 0.6) {
        return new Response(
          JSON.stringify({
            sign: bestPrediction.class,
            confidence: bestPrediction.confidence,
            allPredictions: sortedPredictions.slice(0, 3).map((p: any) => ({
              sign: p.class,
              confidence: p.confidence
            }))
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // No confident prediction
    return new Response(
      JSON.stringify({ sign: null, confidence: 0 }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Classification error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
