
import type { ParsedContent } from './contentParser';

export interface ScriptGenerationOptions {
  voice: string;
  tone: 'professional' | 'casual' | 'energetic' | 'calm';
  includeIntro: boolean;
  includeOutro: boolean;
  maxDuration: number; // in minutes
}

export const generatePodcastScript = (
  content: ParsedContent,
  options: ScriptGenerationOptions
): string => {
  const { title, content: articleContent, metadata, contentType } = content;
  
  // Create different intros based on content type and voice selection
  const getIntro = (): string => {
    const baseIntros = {
      aria: `Hello and welcome! I'm excited to share some fascinating insights with you today in our episode: "${title}".`,
      sarah: `Good day, I'm Sarah, and this is your briefing. Today we're covering "${title}".`,
      charlie: `Hey everyone! Charlie here with another exciting episode. Today we're diving into "${title}".`,
      laura: `Welcome to this peaceful exploration of "${title}". I'm Laura, and I'm here to guide you through these insights.`,
      george: `Greetings. I'm George, and today we'll be examining "${title}" in detail.`
    };

    // Customize intro based on content type
    const typeCustomizations = {
      tech: {
        aria: `Hello tech enthusiasts! Welcome to another exciting episode where we explore the cutting-edge world of technology. Today's topic: "${title}".`,
        charlie: `What's up tech lovers! Charlie here, and boy do I have some mind-blowing tech insights for you today! We're diving deep into "${title}".`,
        george: `Welcome to our technology briefing. I'm George, and today we'll dissect the fascinating developments in "${title}".`
      },
      health: {
        laura: `Welcome to your wellness journey. I'm Laura, and today we'll explore the important topic of "${title}" together.`,
        aria: `Hello and welcome to our health and wellness discussion. Today's episode focuses on "${title}".`,
        sarah: `Good day, this is Sarah with your health briefing. Today we're discussing "${title}".`
      },
      business: {
        george: `Welcome entrepreneurs and business leaders. I'm George, and today's strategic discussion covers "${title}".`,
        sarah: `This is Sarah with your business update. Today's focus: "${title}".`,
        aria: `Hello business innovators! Today we're exploring the entrepreneurial insights in "${title}".`
      }
    };

    const customIntro = typeCustomizations[contentType]?.[options.voice as keyof typeof typeCustomizations[typeof contentType]];
    return customIntro || baseIntros[options.voice as keyof typeof baseIntros] || baseIntros.aria;
  };

  const getOutro = (): string => {
    const baseOutros = {
      aria: `That brings us to the end of today's discussion. Thank you for listening, and I hope you found these insights valuable. Until next time!`,
      sarah: `That concludes today's briefing. Stay informed, and we'll see you next time.`,
      charlie: `And that's a wrap! Thanks for tuning in everyone. Don't forget to subscribe for more great content!`,
      laura: `Thank you for taking this journey with me today. May these insights serve you well. Take care.`,
      george: `This concludes our examination of the topic. Thank you for your attention.`
    };

    // Customize outro based on content type
    const typeCustomizations = {
      tech: {
        charlie: `That's all for today's tech deep dive! Keep innovating, and I'll catch you in the next episode!`,
        george: `This concludes our technical analysis. Continue exploring these technological frontiers. Until next time.`
      },
      health: {
        laura: `Thank you for prioritizing your wellness journey with me today. Take care of yourself, and see you next time.`,
        sarah: `That concludes today's health briefing. Stay healthy, stay informed.`
      },
      business: {
        george: `This concludes our business analysis. Apply these insights strategically. Thank you for your attention.`,
        sarah: `That wraps up today's business briefing. Keep innovating, and we'll see you next time.`
      }
    };

    const customOutro = typeCustomizations[contentType]?.[options.voice as keyof typeof typeCustomizations[typeof contentType]];
    return customOutro || baseOutros[options.voice as keyof typeof baseOutros] || baseOutros.aria;
  };

  // Extract key sections from content
  const sections = articleContent.split('\n\n').filter(section => section.trim().length > 50);
  const maxSections = Math.min(sections.length, 4); // Limit to prevent overly long scripts

  let script = '';
  
  if (options.includeIntro) {
    script += getIntro() + '\n\n';
  }

  // Add content-type specific context
  const contextIntros = {
    tech: `Let's explore these technological innovations that are shaping our digital future.\n\n`,
    health: `Let's dive into these important health insights that can improve our well-being.\n\n`,
    business: `Let's examine these business strategies and entrepreneurial insights.\n\n`,
    general: `Let's explore these fascinating insights from this ${metadata.readingTime} article.\n\n`
  };

  script += contextIntros[contentType] || contextIntros.general;

  sections.slice(0, maxSections).forEach((section, index) => {
    if (index > 0) {
      const transitions = {
        tech: [
          'Now, let\'s explore another technological breakthrough...',
          'Moving to our next innovation...',
          'This brings us to another fascinating development...',
          'Let\'s examine another key advancement...'
        ],
        health: [
          'Another important aspect of our health journey...',
          'Moving to our next wellness insight...',
          'This leads us to another vital consideration...',
          'Let\'s explore another health benefit...'
        ],
        business: [
          'From a strategic perspective, let\'s examine...',
          'Moving to our next business insight...',
          'This brings us to another key opportunity...',
          'Let\'s analyze another important factor...'
        ],
        general: [
          'Moving on to our next point...',
          'This brings us to another important aspect...',
          'Now, let\'s explore...',
          'Building on that idea...'
        ]
      };
      
      const contentTransitions = transitions[contentType] || transitions.general;
      script += contentTransitions[index % contentTransitions.length] + '\n\n';
    }
    
    // Process section content to be more conversational
    const conversationalSection = section
      .replace(/\. /g, '. \n') // Add pauses
      .replace(/([!?])/g, '$1 ') // Add emphasis pauses
      .replace(/\n+/g, ' '); // Clean up line breaks
    
    script += conversationalSection + '\n\n';
  });

  if (options.includeOutro) {
    script += getOutro();
  }

  return script;
};

export const estimateScriptDuration = (script: string): string => {
  // Average speaking rate is about 150-160 words per minute for podcasts
  const wordCount = script.split(' ').length;
  const minutes = Math.ceil(wordCount / 155);
  const seconds = Math.floor((wordCount % 155) / 2.6);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
