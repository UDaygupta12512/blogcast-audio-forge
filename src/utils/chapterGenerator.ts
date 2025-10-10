import type { Chapter } from '@/components/ChapterMarkers';

export const generateChapters = (script: string, totalDuration: number): Chapter[] => {
  // Split script into sections based on natural breaks
  const sections = script.split(/\n\n+/).filter(s => s.trim().length > 50);
  
  if (sections.length === 0) return [];

  const chapters: Chapter[] = [];
  let currentTime = 0;
  const avgWordsPerMinute = 150;

  sections.forEach((section, index) => {
    const wordCount = section.split(/\s+/).length;
    const sectionDuration = (wordCount / avgWordsPerMinute) * 60;

    // Generate chapter title from first sentence or section
    let title = section.split(/[.!?]/)[0].trim();
    
    // Clean up and truncate title
    title = title.replace(/^(Welcome|Hello|Today|In this|This is).*?[,:]?\s*/i, '');
    title = title.slice(0, 60);
    
    if (!title || title.length < 10) {
      title = `Chapter ${index + 1}`;
    }

    chapters.push({
      title,
      timestamp: currentTime,
      duration: sectionDuration
    });

    currentTime += sectionDuration;
  });

  // Adjust durations to match total duration
  if (chapters.length > 0) {
    const totalCalculated = chapters.reduce((sum, ch) => sum + ch.duration, 0);
    const adjustmentFactor = totalDuration / totalCalculated;

    chapters.forEach(chapter => {
      chapter.duration *= adjustmentFactor;
    });
  }

  return chapters;
};