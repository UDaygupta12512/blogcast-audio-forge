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
    console.log('Attempting to parse URL:', url);
    
    // Enhanced list of CORS proxy services with better reliability
    const proxyServices = [
      // Public CORS proxies with better uptime
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      `https://corsproxy.org/?${encodeURIComponent(url)}`,
      `https://proxy.cors.sh/${url}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      // Backup proxies
      `https://yacdn.org/proxy/${url}`,
      `https://cors-proxy.htmldriven.com/?url=${encodeURIComponent(url)}`,
      // Alternative approach - try to parse from different endpoints
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}/feed`,
    ];
    
    let response: Response | null = null;
    let htmlContent = '';
    let successfulProxy = '';
    
    // Try each proxy service with timeout and better error handling
    for (let i = 0; i < proxyServices.length; i++) {
      try {
        console.log(`Trying proxy service ${i + 1}:`, proxyServices[i]);
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        response = await fetch(proxyServices[i], {
          method: 'GET',
          headers: {
            'Accept': 'application/json, text/html, text/plain, */*',
            'User-Agent': 'Mozilla/5.0 (compatible; PodcastBot/1.0)',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          
          if (contentType.includes('application/json')) {
            const data = await response.json();
            htmlContent = data.contents || data.content || data.data || data;
            if (typeof htmlContent === 'object') {
              htmlContent = JSON.stringify(htmlContent);
            }
          } else {
            htmlContent = await response.text();
          }
          
          if (htmlContent && htmlContent.length > 100) {
            successfulProxy = `proxy ${i + 1}`;
            console.log(`Successfully fetched content with ${successfulProxy}`);
            break;
          }
        }
      } catch (error) {
        console.log(`Proxy service ${i + 1} failed:`, error);
        continue;
      }
    }
    
    // If proxies fail, try alternative methods
    if (!htmlContent) {
      console.log('All proxies failed, trying alternative methods...');
      
      // Try to extract content from URL patterns (for common blog platforms)
      const alternativeContent = await tryAlternativeExtraction(url);
      if (alternativeContent) {
        return alternativeContent;
      }
      
      // Try direct fetch as absolute last resort
      try {
        console.log('Trying direct fetch as last resort...');
        response = await fetch(url, {
          method: 'GET',
          mode: 'no-cors', // This won't give us content but might trigger some success
        });
        
        if (!response.ok) {
          throw new Error('Direct fetch failed');
        }
      } catch (error) {
        console.log('Direct fetch failed:', error);
      }
    }
    
    if (!htmlContent) {
      // Provide a helpful error with suggestions
      throw new Error(`Unable to fetch content from "${url}". This could be due to:
• The website blocking automated requests
• CORS restrictions
• The URL requiring authentication
• Temporary server issues

Please try:
1. A different URL from the same site
2. Copy and paste the content directly
3. Try a blog from Medium, Dev.to, or similar platforms`);
    }
    
    // Parse HTML content with improved extraction
    const parsedData = await parseHtmlContent(htmlContent, url);
    
    if (!parsedData.content || parsedData.content.length < 100) {
      throw new Error(`The content extracted from "${url}" is too short or empty. The page might:
• Require JavaScript to load content
• Be behind a paywall or login
• Have content loaded dynamically

Please try copying the article content directly.`);
    }
    
    console.log('Successfully parsed content:', { 
      title: parsedData.title, 
      wordCount: parsedData.metadata.wordCount, 
      contentType: parsedData.contentType,
      proxy: successfulProxy 
    });
    
    return parsedData;
    
  } catch (error) {
    console.error('Error parsing URL content:', error);
    throw error instanceof Error ? error : new Error('Failed to parse content from URL. Please try pasting the content directly.');
  }
};

const tryAlternativeExtraction = async (url: string): Promise<ParsedContent | null> => {
  try {
    // For common blog platforms, try their API endpoints
    if (url.includes('medium.com')) {
      return await tryMediumExtraction(url);
    }
    
    if (url.includes('dev.to')) {
      return await tryDevToExtraction(url);
    }
    
    if (url.includes('hashnode.')) {
      return await tryHashnodeExtraction(url);
    }
    
    // Try RSS feed extraction for blogs
    const rssUrls = [
      `${new URL(url).origin}/feed`,
      `${new URL(url).origin}/rss`,
      `${new URL(url).origin}/feed.xml`,
      `${new URL(url).origin}/rss.xml`,
    ];
    
    for (const rssUrl of rssUrls) {
      try {
        const rssContent = await tryRssExtraction(rssUrl, url);
        if (rssContent) return rssContent;
      } catch (e) {
        continue;
      }
    }
    
  } catch (error) {
    console.log('Alternative extraction failed:', error);
  }
  
  return null;
};

const tryMediumExtraction = async (url: string): Promise<ParsedContent | null> => {
  try {
    // Medium has a special format URL that sometimes works
    const mediumUrl = url.replace('medium.com', 'medium.com') + '?format=json';
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(mediumUrl)}`);
    
    if (response.ok) {
      const data = await response.json();
      // Process Medium's JSON format
      // This is a simplified version - Medium's actual API is more complex
      return await parseHtmlContent(data.contents, url);
    }
  } catch (error) {
    console.log('Medium extraction failed:', error);
  }
  return null;
};

const tryDevToExtraction = async (url: string): Promise<ParsedContent | null> => {
  try {
    // Dev.to has a public API
    const articleId = url.split('/').pop()?.split('-').pop();
    if (articleId) {
      const apiUrl = `https://dev.to/api/articles/${articleId}`;
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`);
      
      if (response.ok) {
        const data = await response.json();
        const article = JSON.parse(data.contents);
        
        return {
          title: article.title,
          content: cleanContent(article.body_markdown || article.description),
          contentType: analyzeContentType(article.title, article.description, url),
          suggestedVoice: getSuggestedVoice(analyzeContentType(article.title, article.description, url)),
          metadata: {
            wordCount: (article.body_markdown || article.description).split(' ').length,
            readingTime: `${article.reading_time_minutes || 5} min read`,
            author: article.user?.name || 'Unknown Author',
            publishDate: new Date(article.published_at).toLocaleDateString()
          }
        };
      }
    }
  } catch (error) {
    console.log('Dev.to extraction failed:', error);
  }
  return null;
};

const tryHashnodeExtraction = async (url: string): Promise<ParsedContent | null> => {
  // Hashnode extraction logic would go here
  return null;
};

const tryRssExtraction = async (rssUrl: string, originalUrl: string): Promise<ParsedContent | null> => {
  try {
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
    if (response.ok) {
      const data = await response.json();
      const item = data.items?.find((item: any) => item.link === originalUrl) || data.items?.[0];
      
      if (item) {
        return {
          title: item.title,
          content: cleanContent(item.content || item.description),
          contentType: analyzeContentType(item.title, item.content || item.description, originalUrl),
          suggestedVoice: getSuggestedVoice(analyzeContentType(item.title, item.content || item.description, originalUrl)),
          metadata: {
            wordCount: (item.content || item.description).split(' ').length,
            readingTime: `${Math.ceil((item.content || item.description).split(' ').length / 200)} min read`,
            author: item.author || 'Unknown Author',
            publishDate: new Date(item.pubDate).toLocaleDateString()
          }
        };
      }
    }
  } catch (error) {
    console.log('RSS extraction failed:', error);
  }
  return null;
};

const parseHtmlContent = async (htmlContent: string, url: string): Promise<ParsedContent> => {
  // Parse HTML content
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  
  // Extract title with better fallbacks
  let title = doc.querySelector('title')?.textContent || 
              doc.querySelector('h1')?.textContent || 
              doc.querySelector('[property="og:title"]')?.getAttribute('content') ||
              doc.querySelector('[name="twitter:title"]')?.getAttribute('content') ||
              doc.querySelector('.entry-title')?.textContent ||
              doc.querySelector('.post-title')?.textContent ||
              'Untitled Article';
  
  // Clean title
  title = title.trim().replace(/\s+/g, ' ').substring(0, 100);
  
  // Extract main content with improved selectors
  let content = '';
  const contentSelectors = [
    'article',
    '[role="main"]',
    'main',
    '.post-content',
    '.entry-content',
    '.article-content',
    '.content',
    '.article-body',
    '.post-body',
    '.blog-content',
    '.story-content', // Medium
    '.crayons-article__body', // Dev.to
    '[property="articleBody"]',
    '.prose', // Common markdown class
    '.markdown-body' // GitHub/similar
  ];
  
  let contentElement = null;
  for (const selector of contentSelectors) {
    contentElement = doc.querySelector(selector);
    if (contentElement && contentElement.textContent && contentElement.textContent.length > 100) {
      break;
    }
  }
  
  if (!contentElement || !contentElement.textContent || contentElement.textContent.length < 100) {
    // Fallback to paragraphs if main content not found
    const paragraphs = Array.from(doc.querySelectorAll('p'));
    const longParagraphs = paragraphs.filter(p => p.textContent && p.textContent.length > 50);
    
    if (longParagraphs.length > 0) {
      content = longParagraphs.map(p => p.textContent).join('\n\n');
    } else {
      // Last resort - use body but filter out common noise
      contentElement = doc.querySelector('body');
    }
  }
  
  if (contentElement && !content) {
    // Remove unwanted elements
    const unwantedSelectors = [
      'script', 'style', 'nav', 'header', 'footer', 
      '.advertisement', '.ads', '.sidebar', '.menu',
      '.social-share', '.comments', '.related-posts',
      '.cookie-notice', '.popup', '.modal', '.navigation',
      '.breadcrumb', '.tags', '.categories'
    ];
    
    const clonedElement = contentElement.cloneNode(true) as Element;
    unwantedSelectors.forEach(selector => {
      clonedElement.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    content = clonedElement.textContent || '';
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
    '.article-author',
    '[property="article:author"]',
    '[name="twitter:creator"]'
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
    '[name="publication_date"]',
    '[property="article:published_time"]',
    '[name="twitter:data1"]'
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
    .replace(/&[a-zA-Z0-9#]+;/g, ' ') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n\s*\n/g, '\n\n') // Clean up line breaks
    .replace(/[^\w\s.,!?;:()\-'"]/g, ' ') // Remove special characters except basic punctuation
    .replace(/\b(advertisement|ads|cookie|privacy policy|terms of service)\b/gi, '') // Remove common noise words
    .trim();
};
