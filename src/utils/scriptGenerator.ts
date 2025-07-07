
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
      aria: `Hello everyone, and welcome back to our podcast! I'm Aria, your host for today's deep dive into "${title}". This ${metadata.readingTime} piece has some absolutely fascinating insights that I think will really change how you think about this topic. So grab your favorite beverage, get comfortable, and let's explore this together. Today's discussion is going to be particularly engaging because we're covering some cutting-edge ideas that are shaping our understanding of this field.`,
      sarah: `Good day, listeners. I'm Sarah, and this is our detailed briefing on "${title}". Today we'll be conducting a thorough analysis of this ${contentType} content, breaking down the key concepts and examining their broader implications. This isn't just surface-level coverage - we're going deep into the subject matter to understand what makes this topic so significant and why it deserves our attention right now.`,
      charlie: `Hey there, amazing listeners! Charlie here, and I am absolutely pumped to share "${title}" with you today! This is going to be one of those episodes where we really dig into the nitty-gritty details and explore some game-changing concepts. I've been looking forward to discussing this ${contentType} because it touches on so many important themes that I know resonate with our community. So let's jump right in and unpack everything together!`,
      laura: `Welcome, dear friends. I'm Laura, and today we're taking a mindful, thoughtful journey through "${title}". In our fast-paced world, it's so important to slow down and really absorb the wisdom contained in quality content like this. This ${metadata.readingTime} exploration offers us an opportunity to reflect deeply on ideas that can genuinely transform our perspective. Let's approach this with curiosity and openness, allowing these insights to settle in naturally.`,
      george: `Greetings, valued listeners. George here with today's comprehensive analysis of "${title}". We'll be examining this ${contentType} content through a strategic lens, methodically breaking down each component to understand its full significance. This systematic approach will help us extract maximum value from the material and apply these insights practically in our own contexts.`
    };

    return personalizedIntros[options.voice as keyof typeof personalizedIntros] || personalizedIntros.aria;
  };

  const getOutro = (): string => {
    const personalizedOutros = {
      aria: `And that brings us to the end of our exploration of "${title}". I hope you found this journey as enlightening as I did! These insights really showcase how much depth there is in quality content when we take the time to properly digest it. Thank you so much for joining me today, and I'd love to hear your thoughts on this topic. Don't forget to share this episode if you found it valuable, and I'll see you in the next one where we'll continue exploring fascinating ideas together!`,
      sarah: `That concludes our comprehensive briefing on "${title}". We've covered significant ground today, examining multiple facets of this important topic. The analysis we've conducted should provide you with a solid foundation for further exploration. Stay informed, keep questioning, and continue seeking out quality content. This is Sarah, signing off until our next detailed discussion.`,
      charlie: `And that's a fantastic wrap on "${title}"! Wow, what a journey we've been on together! I hope you're as excited about these ideas as I am. The innovations and insights we've discussed today really highlight how dynamic and evolving this field is. Keep that curiosity burning bright, keep pushing boundaries, and remember - the best discoveries often come from the most unexpected places. Catch you in the next episode, where we'll continue our adventure into amazing ideas!`,
      laura: `Thank you for walking this path of discovery with me as we explored "${title}". These moments of deep reflection and learning are such gifts in our lives. May the insights we've shared today serve you well on your own journey of growth and understanding. Take time to let these ideas percolate, and remember that wisdom often reveals itself gradually. Take care of yourselves, and until we meet again for our next mindful exploration.`,
      george: `This concludes our systematic examination of "${title}". The strategic insights we've analyzed today provide a comprehensive framework for understanding this topic's significance. I recommend taking time to consider how these concepts might be applied within your own operational context. Thank you for your focused attention during today's session. Apply these insights judiciously and systematically.`
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
