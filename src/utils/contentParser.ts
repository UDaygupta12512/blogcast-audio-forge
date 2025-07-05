
export interface ParsedContent {
  title: string;
  content: string;
  contentType: 'tech' | 'health' | 'business' | 'general';
  suggestedVoice: string;
  metadata: {
    wordCount: number;
    readingTime: string;
    author?: string;
    publishDate?: string;
  };
}

export const parseUrlContent = async (url: string): Promise<ParsedContent> => {
  try {
    // For demo purposes, we'll use a CORS proxy to fetch content
    // In production, you'd want to use a proper backend service
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch content');
    }
    
    const data = await response.json();
    const htmlContent = data.contents;
    
    // Parse HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Extract title
    let title = doc.querySelector('title')?.textContent || 
                doc.querySelector('h1')?.textContent || 
                'Untitled Article';
    
    // Clean title
    title = title.trim().replace(/\s+/g, ' ');
    
    // Extract main content
    let content = '';
    const contentSelectors = [
      'article',
      '.post-content',
      '.entry-content',
      '.content',
      'main',
      '.article-body',
      '.post-body'
    ];
    
    let contentElement = null;
    for (const selector of contentSelectors) {
      contentElement = doc.querySelector(selector);
      if (contentElement) break;
    }
    
    if (!contentElement) {
      // Fallback to body content
      contentElement = doc.querySelector('body');
    }
    
    if (contentElement) {
      // Remove unwanted elements
      const unwantedSelectors = [
        'script', 'style', 'nav', 'header', 'footer', 
        '.advertisement', '.ads', '.sidebar', '.menu',
        '.social-share', '.comments', '.related-posts'
      ];
      
      unwantedSelectors.forEach(selector => {
        contentElement!.querySelectorAll(selector).forEach(el => el.remove());
      });
      
      content = contentElement.textContent || '';
    }
    
    // Clean and process content
    content = cleanContent(content);
    
    // Determine content type based on content analysis
    const contentType = analyzeContentType(title, content, url);
    
    // Suggest voice based on content type
    const suggestedVoice = getSuggestedVoice(contentType);
    
    const wordCount = content.split(' ').filter(word => word.length > 0).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    // Extract author and date if possible
    const author = extractAuthor(doc) || 'Unknown Author';
    const publishDate = extractDate(doc) || new Date().toLocaleDateString();
    
    return {
      title,
      content,
      contentType,
      suggestedVoice,
      metadata: {
        wordCount,
        readingTime: `${readingTime} min read`,
        author,
        publishDate
      }
    };
    
  } catch (error) {
    console.error('Error parsing URL content:', error);
    throw new Error('Failed to parse content from URL. Please try a different URL or paste the content directly.');
  }
};

const analyzeContentType = (title: string, content: string, url: string): 'tech' | 'health' | 'business' | 'general' => {
  const text = (title + ' ' + content + ' ' + url).toLowerCase();
  
  const techKeywords = ['technology', 'ai', 'artificial intelligence', 'software', 'programming', 'code', 'developer', 'tech', 'digital', 'computer', 'algorithm', 'machine learning', 'blockchain', 'cryptocurrency'];
  const healthKeywords = ['health', 'medical', 'wellness', 'fitness', 'nutrition', 'doctor', 'medicine', 'healthcare', 'mental health', 'therapy', 'disease', 'treatment'];
  const businessKeywords = ['business', 'startup', 'entrepreneur', 'marketing', 'finance', 'investment', 'company', 'corporate', 'management', 'strategy', 'leadership', 'economy'];
  
  const techScore = techKeywords.reduce((score, keyword) => score + (text.includes(keyword) ? 1 : 0), 0);
  const healthScore = healthKeywords.reduce((score, keyword) => score + (text.includes(keyword) ? 1 : 0), 0);
  const businessScore = businessKeywords.reduce((score, keyword) => score + (text.includes(keyword) ? 1 : 0), 0);
  
  if (techScore >= healthScore && techScore >= businessScore && techScore > 0) return 'tech';
  if (healthScore >= businessScore && healthScore > 0) return 'health';
  if (businessScore > 0) return 'business';
  
  return 'general';
};

const getSuggestedVoice = (contentType: 'tech' | 'health' | 'business' | 'general'): string => {
  const voiceMap = {
    tech: 'charlie',
    health: 'laura',
    business: 'george',
    general: 'aria'
  };
  
  return voiceMap[contentType];
};

const extractAuthor = (doc: Document): string | undefined => {
  const authorSelectors = [
    '[rel="author"]',
    '.author',
    '.by-author',
    '.post-author',
    '[name="author"]',
    '.article-author'
  ];
  
  for (const selector of authorSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      return element.textContent?.trim() || element.getAttribute('content')?.trim();
    }
  }
  
  return undefined;
};

const extractDate = (doc: Document): string | undefined => {
  const dateSelectors = [
    'time[datetime]',
    '.published-date',
    '.post-date',
    '.article-date',
    '[name="publication_date"]'
  ];
  
  for (const selector of dateSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const dateStr = element.getAttribute('datetime') || element.textContent?.trim();
      if (dateStr) {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      }
    }
  }
  
  return undefined;
};

export const cleanContent = (rawContent: string): string => {
  return rawContent
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[a-zA-Z0-9#]+;/g, '') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n\s*\n/g, '\n\n') // Clean up line breaks
    .trim();
};
