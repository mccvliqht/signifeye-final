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
    const { landmarks, language, recentPredictions } = await req.json();
    
    if (!landmarks || !Array.isArray(landmarks)) {
      throw new Error('Invalid landmarks data');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Prepare context for the AI
    const systemPrompt = `You are an expert in ${language === 'ASL' ? 'American' : 'Filipino'} Sign Language recognition.
Given hand landmark data (21 points per hand with x, y, z coordinates), analyze the hand shape and identify the most likely sign.

Rules:
- Be conservative: only return a sign name when you are at least 95% certain, otherwise return "uncertain".
- Consider finger curl patterns, directions, thumb position, and overall hand shape.
- If language is FSL, respond with the Tagalog (Filipino) word for the sign whenever applicable (e.g., Yes → "Oo", Thank you → "Salamat").

Target vocabulary to recognize accurately:
- Alphabet: A–Z
- Numbers: 0–10
- Common words: Hello, Thank you, Yes, No, Please, Sorry, Help, Goodbye, I love you
- Daily needs: Stop, Water, Bathroom, Eat, Drink, Internet, Computer, Phone, Book, Home, School, Teacher, Student
- Questions: What, Where, Who, When, Why, How
- Time: Today, Tomorrow, Yesterday, Morning, Night

Respond with ONLY the sign name (single short phrase).`;

    const userPrompt = `Analyze these hand landmarks and identify the ${language} sign:
Landmarks: ${JSON.stringify(landmarks[0].slice(0, 21))}

Recent predictions (for context): ${recentPredictions ? recentPredictions.join(', ') : 'None'}

What sign is this? Respond with ONLY the sign name, or "uncertain" if not confident.`;

    console.log('Calling Lovable AI for sign classification...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const prediction = data.choices[0]?.message?.content?.trim();
    
    console.log('AI prediction:', prediction);

    if (!prediction || prediction.toLowerCase() === 'uncertain') {
      return new Response(JSON.stringify({ sign: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      sign: prediction,
      confidence: 0.95 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in classify-sign:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
