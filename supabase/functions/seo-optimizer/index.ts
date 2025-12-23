import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { script, title, type } = await req.json();

    if (!script) {
      return new Response(
        JSON.stringify({ error: 'Script is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'show-notes':
        systemPrompt = `You are an expert podcast SEO specialist. Generate comprehensive show notes that are optimized for search engines and podcast directories.`;
        userPrompt = `Generate SEO-optimized show notes for this podcast titled "${title || 'Untitled'}".

Include:
1. A compelling episode description (2-3 paragraphs)
2. Key topics covered (bullet points)
3. Notable quotes from the episode
4. Resources mentioned
5. SEO keywords and tags (comma-separated)
6. A call-to-action for listeners

Script:
${script}

Format the output as clean, readable markdown.`;
        break;

      case 'transcript':
        systemPrompt = `You are a professional transcription specialist. Create a clean, readable transcript with proper formatting and speaker labels.`;
        userPrompt = `Convert this podcast script into a professional transcript format.

Include:
1. Proper paragraph breaks
2. Speaker labels where appropriate
3. Timestamps every 2-3 minutes (estimated based on ~150 words per minute)
4. Section headers for major topic changes

Script:
${script}

Format as a clean transcript with timestamps in [MM:SS] format.`;
        break;

      case 'timestamps':
        systemPrompt = `You are a podcast editor who creates chapter markers and timestamps for easy navigation.`;
        userPrompt = `Generate chapter timestamps for this podcast titled "${title || 'Untitled'}".

Create timestamps in this format:
[MM:SS] - Chapter Title

Estimate timing based on ~150 words per minute of speech.
Identify 5-10 key moments/chapters in the content.
Include an intro and outro marker.

Script:
${script}

Return only the timestamps list, one per line.`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid type. Use: show-notes, transcript, or timestamps' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`Generating ${type} for podcast: ${title}`);

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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'API credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated');
    }

    console.log(`Successfully generated ${type}`);

    return new Response(
      JSON.stringify({ content, type }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('SEO optimizer error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate SEO content' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
