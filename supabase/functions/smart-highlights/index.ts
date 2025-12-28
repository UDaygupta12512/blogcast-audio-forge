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
    const { script, title } = await req.json();
    
    if (!script) {
      return new Response(
        JSON.stringify({ error: 'Script is required' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Detecting highlights for: ${title}`);

    const systemPrompt = `You are a social media content expert specializing in podcast clips. Analyze podcast scripts to identify the most engaging, shareable moments.

Return a JSON array of highlight objects with this exact structure:
{
  "highlights": [
    {
      "id": "unique_id",
      "title": "Short catchy title for the clip",
      "excerpt": "The exact quote or section (30-60 words)",
      "reason": "Why this moment is engaging",
      "platform": "Best platform for this clip (TikTok, Instagram, Twitter, YouTube Shorts)",
      "emoji": "Single relevant emoji",
      "hookScore": 1-10 (virality potential)
    }
  ]
}`;

    const userPrompt = `Analyze this podcast script titled "${title || 'Untitled'}" and identify 3-5 best moments for social media clips:

${script}

Focus on:
- Surprising facts or statistics
- Emotional moments
- Controversial or thought-provoking statements
- Funny or relatable quotes
- Key insights or takeaways

Return ONLY valid JSON.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to detect highlights");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '{}';
    
    // Parse JSON from response
    let highlights;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        highlights = JSON.parse(jsonMatch[0]);
      } else {
        highlights = { highlights: [] };
      }
    } catch (e) {
      console.error("Failed to parse highlights JSON:", e);
      highlights = { highlights: [] };
    }

    console.log(`Found ${highlights.highlights?.length || 0} highlights`);

    return new Response(
      JSON.stringify(highlights),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in smart-highlights:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
