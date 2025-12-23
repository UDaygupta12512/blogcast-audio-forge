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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { type, ...params } = await req.json();
    console.log('AI Writing request:', type, params);

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'blog':
        systemPrompt = `You are an expert SEO content writer. Generate engaging, well-structured blog posts with proper headings (H2, H3), paragraphs, and natural keyword integration. Include a compelling intro, body sections, and conclusion.`;
        userPrompt = `Write a ${params.length === 'short' ? '500' : params.length === 'medium' ? '1000' : '2000'} word blog post about: "${params.topic}"
        
Tone: ${params.tone}
Keywords to include naturally: ${params.keywords?.join(', ') || 'none specified'}

Format with markdown headings and make it engaging and informative.`;
        break;

      case 'social':
        systemPrompt = `You are a viral social media content creator. Create platform-specific captions that are engaging, authentic, and optimized for each platform's algorithm and culture.`;
        userPrompt = `Create social media captions for the following platforms: ${params.platforms.join(', ')}

Topic: "${params.topic}"
${params.context ? `Additional context: ${params.context}` : ''}

For each platform, provide:
1. A caption optimized for that platform's style and character limits
2. Relevant hashtags (5-10 per platform)

Return as JSON array with format: [{"platform": "instagram", "caption": "...", "hashtags": ["#tag1", "#tag2"]}]`;
        break;

      case 'email':
        systemPrompt = `You are a professional email writer who crafts clear, effective emails that achieve their intended purpose while maintaining appropriate tone and professionalism.`;
        userPrompt = `Write a ${params.emailType} email for the following purpose:

Purpose: ${params.purpose}
${params.recipient ? `Recipient type: ${params.recipient}` : ''}
${params.keyPoints ? `Key points to include: ${params.keyPoints}` : ''}

Provide:
1. A clear, compelling subject line
2. The email body with proper greeting and sign-off

Return as JSON: {"subject": "...", "body": "..."}`;
        break;

      case 'repurpose':
        systemPrompt = `You are a content repurposing expert who transforms content into different formats while preserving the key messages and adapting the style for each format.`;
        userPrompt = `Repurpose the following content into these formats: ${params.formats.join(', ')}

Original content title: "${params.title}"
Content:
${params.content}

For each format, create appropriate content:
- blog: Full article with headings and SEO optimization
- newsletter: Email-friendly with intro, bullet points, and CTA
- social: Twitter/X thread format (numbered tweets)
- linkedin: Professional article with insights
- summary: Bullet-point executive summary

Return as JSON: {"blog": "...", "newsletter": "...", etc.}`;
        break;

      default:
        throw new Error(`Unknown type: ${type}`);
    }

    console.log('Calling Lovable AI...');
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
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'API credits exhausted. Please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const text = await response.text();
      console.error('AI gateway error:', response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log('AI response received');

    let result: Record<string, unknown>;
    
    // Parse response based on type
    if (type === 'blog') {
      result = { content };
    } else if (type === 'social') {
      // Extract JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        result = { captions: JSON.parse(jsonMatch[0]) };
      } else {
        throw new Error('Failed to parse social captions');
      }
    } else if (type === 'email') {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse email');
      }
    } else if (type === 'repurpose') {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = { outputs: JSON.parse(jsonMatch[0]) };
      } else {
        throw new Error('Failed to parse repurposed content');
      }
    } else {
      result = { content };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI writing error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
