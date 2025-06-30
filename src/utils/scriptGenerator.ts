
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
  const { title, content: articleContent, metadata } = content;
  
  // Create different intros based on voice selection
  const getIntro = (): string => {
    const intros = {
      aria: `Hello and welcome! I'm excited to share some fascinating insights with you today in our episode: "${title}".`,
      sarah: `Good day, I'm Sarah, and this is your news briefing. Today we're covering "${title}".`,
      charlie: `Hey everyone! Charlie here with another exciting episode. Today we're diving into "${title}".`,
      laura: `Welcome to this peaceful exploration of "${title}". I'm Laura, and I'm here to guide you through these insights.`,
      george: `Greetings. I'm George, and today we'll be examining "${title}" in detail.`
    };
    
    return intros[options.voice as keyof typeof intros] || intros.aria;
  };

  const getOutro = (): string => {
    const outros = {
      aria: `That brings us to the end of today's discussion. Thank you for listening, and I hope you found these insights valuable. Until next time!`,
      sarah: `That concludes today's briefing. Stay informed, and we'll see you next time.`,
      charlie: `And that's a wrap! Thanks for tuning in everyone. Don't forget to subscribe for more great content!`,
      laura: `Thank you for taking this journey with me today. May these insights serve you well. Take care.`,
      george: `This concludes our examination of the topic. Thank you for your attention.`
    };
    
    return outros[options.voice as keyof typeof outros] || outros.aria;
  };

  // Extract key sections from content
  const sections = articleContent.split('\n\n').filter(section => section.trim().length > 50);
  const maxSections = Math.min(sections.length, 4); // Limit to prevent overly long scripts

  let script = '';
  
  if (options.includeIntro) {
    script += getIntro() + '\n\n';
  }

  // Add main content with transitions
  script += `Let's dive into the key insights from this ${metadata.readingTime} article.\n\n`;

  sections.slice(0, maxSections).forEach((section, index) => {
    if (index > 0) {
      const transitions = [
        'Moving on to our next point...',
        'This brings us to another important aspect...',
        'Now, let\'s explore...',
        'Building on that idea...',
        'Another key consideration is...'
      ];
      script += transitions[index % transitions.length] + '\n\n';
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
