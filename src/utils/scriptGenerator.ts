
import type { ParsedContent } from './contentParser';
import type { PodcastTemplate } from '@/components/PodcastTemplateSelector';

export interface ScriptGenerationOptions {
  voice: string;
  tone: 'professional' | 'casual' | 'energetic' | 'calm';
  includeIntro: boolean;
  includeOutro: boolean;
  maxDuration: number; // in minutes
  template?: PodcastTemplate;
  language?: string;
}

const TEMPLATE_STYLES: Record<PodcastTemplate, { intro: string; style: string; outro: string }> = {
  standard: {
    intro: "Welcome to today's podcast.",
    style: "professional and engaging",
    outro: "Thank you for listening. Until next time!"
  },
  interview: {
    intro: "Welcome! Today we have a fascinating discussion.",
    style: "conversational Q&A format",
    outro: "Great conversation today. Thanks for joining!"
  },
  news: {
    intro: "Breaking news on today's most important story.",
    style: "urgent and informative",
    outro: "Stay informed. That's all for now!"
  },
  storytelling: {
    intro: "Settle in for today's captivating story.",
    style: "narrative and dramatic",
    outro: "And that concludes our story."
  },
  educational: {
    intro: "Let's learn something new today.",
    style: "clear explanations with examples",
    outro: "Hope you learned something valuable!"
  },
  conversational: {
    intro: "Hey! Let's chat about something cool.",
    style: "casual and friendly",
    outro: "Great chat! Catch you later!"
  }
};

export const generatePodcastScript = (
  content: ParsedContent,
  options: ScriptGenerationOptions
): string => {
  const template = options.template || 'standard';
  const templateStyle = TEMPLATE_STYLES[template];
  const { title, content: articleContent, metadata, contentType } = content;
  
  // Create personalized intros based on actual content
  const getIntro = (): string => {
    const baseIntro = templateStyle.intro;
    const personalizedIntros = {
      aria: `${baseIntro} I'm Aria, and we're exploring "${title}" in a ${templateStyle.style} way. This ${metadata.readingTime} piece has fascinating insights!`,
      sarah: `${baseIntro} I'm Sarah with "${title}". We'll analyze this ${contentType} content ${templateStyle.style}.`,
      charlie: `${baseIntro} Charlie here! "${title}" is going to be amazing. We're doing this ${templateStyle.style}!`,
      laura: `${baseIntro} I'm Laura. Today's journey through "${title}" will be ${templateStyle.style}.`,
      george: `${baseIntro} George here. "${title}" - examined ${templateStyle.style}.`
    };

    return personalizedIntros[options.voice as keyof typeof personalizedIntros] || personalizedIntros.aria;
  };

  const getOutro = (): string => {
    const baseOutro = templateStyle.outro;
    const personalizedOutros = {
      aria: `${baseOutro} Thanks for exploring "${title}" with me! Share if you found it valuable!`,
      sarah: `${baseOutro} We've covered "${title}" comprehensively. This is Sarah, signing off.`,
      charlie: `${baseOutro} What a journey through "${title}"! Keep that curiosity alive!`,
      laura: `${baseOutro} Thank you for this mindful journey through "${title}".`,
      george: `${baseOutro} "${title}" examined systematically. Apply these insights wisely.`
    };

    return personalizedOutros[options.voice as keyof typeof personalizedOutros] || personalizedOutros.aria;
  };

  // Enhanced content extraction with better analysis
  const extractAndAnalyzeContent = (content: string): { mainPoints: string[], analysis: string[], transitions: string[] } => {
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 50);
    const mainPoints: string[] = [];
    const analysis: string[] = [];
    const transitions: string[] = [
      "Now, let's dive deeper into this next concept...",
      "This brings us to another fascinating aspect...",
      "Building on that foundation, we should also consider...",
      "Here's where things get really interesting...",
      "Moving forward, let's explore how this connects to...",
      "This leads us naturally to the next important point...",
      "What's particularly noteworthy here is that...",
      "This perspective opens up some intriguing questions about..."
    ];
    
    // Take more substantial paragraphs and enhance them
    const selectedParagraphs = paragraphs
      .sort((a, b) => b.length - a.length)
      .slice(0, Math.min(8, paragraphs.length));
    
    selectedParagraphs.forEach((paragraph, index) => {
      // Make content more conversational and detailed
      const enhanced = paragraph
        .replace(/\. ([A-Z])/g, '. You know, $1')
        .replace(/However,/g, 'But here\'s what\'s really interesting -')
        .replace(/Furthermore,/g, 'And here\'s another crucial point -')
        .replace(/In conclusion,/g, 'When we step back and look at the big picture,')
        .replace(/Additionally,/g, 'What\'s more,')
        .replace(/Therefore,/g, 'This means that')
        .replace(/Moreover,/g, 'And get this -');
      
      mainPoints.push(enhanced);
      
      // Add analytical commentary
      const analyticalComments = [
        "This point really highlights the complexity of the subject and shows us why it's so important to approach it from multiple angles.",
        "What I find particularly compelling about this perspective is how it challenges conventional thinking in the field.",
        "This insight has significant implications that extend far beyond what we might initially consider.",
        "The nuanced approach taken here demonstrates a deep understanding of the underlying principles.",
        "This observation connects to broader themes that we see emerging across related disciplines.",
        "The practical applications of this concept are quite extensive when you really think about it.",
        "This represents a shift in how we might traditionally approach similar problems or questions.",
        "The evidence supporting this viewpoint is particularly robust and well-documented."
      ];
      
      if (index % 2 === 0 && index < analyticalComments.length) {
        analysis.push(analyticalComments[index]);
      }
    });
    
    return { mainPoints, analysis, transitions };
  };

  let script = '';
  
  if (options.includeIntro) {
    script += getIntro() + '\n\n';
  }

  // Add content overview
  script += `Before we dive into the details, let me give you a roadmap of what we'll be covering today. "${title}" presents several key themes that are particularly relevant to current discussions in this space. We'll be examining each of these themes carefully, understanding not just what they mean, but why they matter and how they might impact our thinking going forward.\n\n`;

  // Enhanced content processing
  const { mainPoints, analysis, transitions } = extractAndAnalyzeContent(articleContent);
  
  if (mainPoints.length === 0) {
    script += `Let me share the core insights from this ${contentType} that really caught my attention.\n\n`;
    script += `The central theme of "${title}" revolves around some fascinating concepts that deserve our careful consideration. `;
    script += articleContent.substring(0, 800) + (articleContent.length > 800 ? '...' : '') + '\n\n';
    script += `What strikes me most about this perspective is how it challenges us to think differently about familiar concepts. It's this kind of thought-provoking content that really makes our discussions worthwhile.\n\n`;
  } else {
    script += `Now, let's work through the key insights from this ${metadata.readingTime} piece, and I'll share my thoughts on why each point is particularly significant.\n\n`;
    
    mainPoints.forEach((point, index) => {
      if (index > 0 && index < transitions.length) {
        script += transitions[index] + '\n\n';
      }
      
      script += point + '\n\n';
      
      // Add analytical commentary
      if (index < analysis.length) {
        script += analysis[index] + '\n\n';
      }
      
      // Add thoughtful pauses and emphasis
      if (index < mainPoints.length - 1) {
        script += 'Let me pause here for a moment because this really is worth reflecting on. These kinds of insights don\'t come along every day, and I think it\'s important we give them the attention they deserve.\n\n';
      }
    });
  }

  // Add comprehensive summary and implications
  script += `So, as we wrap up our deep dive into "${title}", let's take a step back and consider the bigger picture. What we've explored today represents more than just interesting ideas - these are concepts that have the potential to influence how we approach related challenges and opportunities.\n\n`;

  script += `The insights we've discussed today demonstrate the value of taking time to really engage with thoughtful ${contentType}. In our information-saturated world, it's easy to skim the surface, but when we dig deeper like we've done today, we discover layers of meaning and application that we might otherwise miss.\n\n`;

  script += `I encourage you to take these ideas and sit with them for a while. Consider how they might apply to your own experiences and challenges. Some of the most valuable insights come not just from understanding new concepts, but from connecting them to our existing knowledge and real-world situations.\n\n`;

  if (options.includeOutro) {
    script += getOutro();
  }

  return script;
};

export const estimateScriptDuration = (script: string): string => {
  // More accurate duration estimation for longer content
  const wordCount = script.split(' ').filter(word => word.length > 0).length;
  const pauseCount = (script.match(/\.\s/g) || []).length;
  const questionCount = (script.match(/\?\s/g) || []).length;
  const totalSeconds = Math.ceil((wordCount / 2.2) + (pauseCount * 0.8) + (questionCount * 0.5)); // Slower pace + more pauses
  
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
