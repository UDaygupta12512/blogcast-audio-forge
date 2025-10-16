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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = '';
    
    switch (type) {
      case 'blog':
        systemPrompt = `You are a professional content writer. Create a comprehensive blog post from this podcast transcript. 
Include:
- An engaging introduction
- 3-5 main sections with headers
- Key takeaways
- A conclusion
Keep it between 500-800 words.`;
        break;
      
      case 'newsletter':
        systemPrompt = `You are a newsletter editor. Create an email-friendly summary of this podcast.
Include:
- A catchy subject line
- Brief intro (2-3 sentences)
- 3-5 bullet points of key highlights
- A call-to-action to listen
Keep it concise and scannable, around 200-300 words.`;
        break;
      
      case 'twitter':
        systemPrompt = `You are a social media expert. Create a Twitter/X thread from this podcast.
Requirements:
- First tweet: Hook (under 280 chars)
- 4-6 follow-up tweets with key points
- Final tweet: Call-to-action
- Use emojis strategically
- Each tweet must be under 280 characters
Format: Number each tweet (1/7, 2/7, etc.)`;
        break;
    }

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
          { role: "user", content: `Podcast Title: ${title}\n\nTranscript:\n${script}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || '';

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-summary:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
