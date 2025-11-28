import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user from JWT
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { collaborationId } = await req.json();
    
    // Validate collaborationId
    if (!collaborationId || typeof collaborationId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid collaboration ID' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Use service role key for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get collaboration details
    const { data: collab, error: collabError } = await supabaseAdmin
      .from('podcast_collaborations')
      .select(`
        *,
        podcast_one:podcasts!podcast_collaborations_podcast_one_id_fkey(title, script, voice),
        podcast_two:podcasts!podcast_collaborations_podcast_two_id_fkey(title, script, voice)
      `)
      .eq('id', collaborationId)
      .single();

    if (collabError) throw collabError;

    // Verify user is part of collaboration
    if (collab.creator_one_id !== user.id && collab.creator_two_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Not authorized for this collaboration' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Merge scripts using AI
    const systemPrompt = `You are a podcast producer. Merge these two podcast scripts into a co-hosted conversation.
    
Guidelines:
- Alternate between Host 1 and Host 2
- Create natural dialogue and banter
- Keep the best insights from both podcasts
- Add transitions like "That's a great point!" or "Building on that..."
- Mark which host speaks with [Host 1] and [Host 2]
- Keep it engaging and conversational
- Target length: 500-800 words`;

    const userPrompt = `Podcast 1: "${collab.podcast_one.title}"
Script: ${collab.podcast_one.script}

Podcast 2: "${collab.podcast_two.title}"
Script: ${collab.podcast_two.script}

Create a merged co-hosted episode combining both topics.`;

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
      throw new Error("Failed to merge scripts");
    }

    const aiData = await response.json();
    const mergedScript = aiData.choices?.[0]?.message?.content || '';

    // Create merged podcast
    const { data: newPodcast, error: podcastError } = await supabaseAdmin
      .from('podcasts')
      .insert({
        title: `${collab.podcast_one.title} × ${collab.podcast_two.title}`,
        script: mergedScript,
        user_id: collab.creator_one_id,
        voice: collab.podcast_one.voice,
        is_public: true,
        template: 'standard'
      })
      .select()
      .single();

    if (podcastError) throw podcastError;

    // Update collaboration
    const { error: updateError } = await supabaseAdmin
      .from('podcast_collaborations')
      .update({
        status: 'completed',
        collab_podcast_id: newPodcast.id
      })
      .eq('id', collaborationId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ success: true, podcastId: newPodcast.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in merge-podcasts:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
