
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
  
  // Create personalized intros based on actual content
  const getIntro = (): string => {
    const personalizedIntros = {
      aria: `Hello everyone! I'm Aria, and welcome to today's episode. We're exploring "${title}" - a ${metadata.readingTime} piece that caught my attention. Let's dive in!`,
      sarah: `Good day, I'm Sarah. Today's briefing covers "${title}". This ${contentType} content offers some fascinating insights worth discussing.`,
      charlie: `Hey tech enthusiasts! Charlie here, and I'm excited to break down "${title}" for you. This is going to be an engaging discussion!`,
      laura: `Welcome, I'm Laura. Today we'll take a mindful journey through "${title}". Let's explore these insights together in a calm, thoughtful way.`,
      george: `Greetings. George here with today's analysis of "${title}". We'll examine this ${contentType} content methodically and thoroughly.`
    };

    return personalizedIntros[options.voice as keyof typeof personalizedIntros] || personalizedIntros.aria;
  };

  const getOutro = (): string => {
    const personalizedOutros = {
      aria: `That wraps up our exploration of "${title}". I hope you found these insights as fascinating as I did. Thanks for listening, and see you next time!`,
      sarah: `That concludes today's briefing on "${title}". Stay informed and keep learning. This is Sarah, signing off.`,
      charlie: `And that's a wrap on "${title}"! Hope you enjoyed this deep dive as much as I did. Keep innovating, and catch you in the next episode!`,
      laura: `Thank you for joining me in exploring "${title}". May these insights serve you well on your journey. Take care until we meet again.`,
      george: `This concludes our examination of "${title}". Apply these insights strategically. Thank you for your attention.`
    };

    return personalizedOutros[options.voice as keyof typeof personalizedOutros] || personalizedOutros.aria;
  };

  // Extract meaningful sections from the actual content
  const extractKeyPoints = (content: string): string[] => {
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 100);
    const keyPoints: string[] = [];
    
    // Take the most substantial paragraphs
    const sortedParagraphs = paragraphs
      .sort((a, b) => b.length - a.length)
      .slice(0, Math.min(5, paragraphs.length));
    
    sortedParagraphs.forEach(paragraph => {
      // Make content more conversational
      const conversational = paragraph
        .replace(/\. ([A-Z])/g, '. Now, $1')
        .replace(/However,/g, 'But here\'s the thing,')
        .replace(/Furthermore,/g, 'What\'s more,')
        .replace(/In conclusion,/g, 'To wrap this up,')
        .replace(/Additionally,/g, 'Also,');
      
      keyPoints.push(conversational);
    });
    
    return keyPoints;
  };

  let script = '';
  
  if (options.includeIntro) {
    script += getIntro() + '\n\n';
  }

  // Add content-specific context
  const keyPoints = extractKeyPoints(articleContent);
  
  if (keyPoints.length === 0) {
    script += `Let me share some insights from this ${contentType} content that I found particularly interesting.\n\n`;
    script += `The main theme revolves around the ideas presented in "${title}". `;
    script += articleContent.substring(0, 500) + (articleContent.length > 500 ? '...' : '') + '\n\n';
  } else {
    script += `Let me walk you through the key insights from this ${metadata.readingTime} article.\n\n`;
    
    keyPoints.forEach((point, index) => {
      if (index > 0) {
        const transitions = [
          'Moving on to another important point...',
          'Here\'s another fascinating aspect...',
          'This brings me to the next key insight...',
          'Now, let\'s explore this further...',
          'Building on that idea...'
        ];
        script += transitions[index % transitions.length] + '\n\n';
      }
      
      script += point + '\n\n';
      
      // Add natural pauses and emphasis
      if (index < keyPoints.length - 1) {
        script += 'Let me pause here for a moment to let that sink in.\n\n';
      }
    });
  }

  // Add a summary section
  script += `So, to summarize what we've covered in "${title}" - `;
  script += `we've explored some really important ${contentType} insights that I think you'll find valuable in your own journey.\n\n`;

  if (options.includeOutro) {
    script += getOutro();
  }

  return script;
};

export const estimateScriptDuration = (script: string): string => {
  // More accurate duration estimation
  const wordCount = script.split(' ').filter(word => word.length > 0).length;
  const pauseCount = (script.match(/\.\s/g) || []).length;
  const totalSeconds = Math.ceil((wordCount / 2.5) + (pauseCount * 0.5)); // 150 WPM + pause time
  
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
