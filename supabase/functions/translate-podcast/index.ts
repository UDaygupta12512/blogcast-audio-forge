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
    const { script, targetLanguage, targetLanguageName } = await req.json();
    
    if (!script || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Script and target language are required' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Translating to ${targetLanguageName} (${targetLanguage})`);

    const systemPrompt = `You are a professional podcast translator. Translate the podcast script while:
- Maintaining the natural conversational tone
- Preserving speaker markers like [Host], [Guest], etc.
- Keeping proper names unchanged unless they have standard translations
- Adapting idioms and cultural references appropriately
- Ensuring the translation sounds natural when spoken aloud`;

    const userPrompt = `Translate this podcast script to ${targetLanguageName}:

${script}

Provide only the translated script, maintaining all formatting and speaker markers.`;

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
      throw new Error("Failed to translate script");
    }

    const aiData = await response.json();
    const translatedScript = aiData.choices?.[0]?.message?.content || '';

    console.log("Translation completed successfully");

    return new Response(
      JSON.stringify({ translatedScript, targetLanguage, targetLanguageName }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in translate-podcast:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
