
import React, { useState } from 'react';
import BlogInput from './BlogInput';
import ProcessingSteps from './ProcessingSteps';
import AudioPlayer from './AudioPlayer';
import { Card } from '@/components/ui/card';

export interface PodcastData {
  title: string;
  script: string;
  audioUrl?: string;
  duration?: string;
}

const PodcastGenerator = () => {
  const [step, setStep] = useState<'input' | 'processing' | 'complete'>('input');
  const [podcastData, setPodcastData] = useState<PodcastData | null>(null);

  const handleBlogSubmit = async (blogContent: string, blogUrl: string) => {
    setStep('processing');
    
    // Extract title from blog content
    const lines = blogContent.split('\n').filter(line => line.trim());
    const title = lines[0]?.replace(/^#+\s*/, '') || 'Generated Podcast';
    
    // Generate more dynamic script based on content
    setTimeout(() => {
      const script = generateEnhancedScript(blogContent, title);
      setPodcastData({
        title,
        script,
        audioUrl: '/api/placeholder-audio.mp3',
        duration: calculateDuration(script)
      });
      setStep('complete');
    }, 5000);
  };

  const generateEnhancedScript = (content: string, title: string): string => {
    // Extract key sections and create a more engaging script
    const sections = content.split('##').filter(section => section.trim());
    const mainContent = sections[0]?.replace(/^#+\s*.*\n/, '').trim() || content.substring(0, 500);
    
    // Create introduction based on title
    const intro = `Welcome to today's podcast episode: "${title}". I'm excited to share some fascinating insights with you today.`;
    
    // Extract key points
    const keyPoints = sections.slice(1).map(section => {
      const sectionTitle = section.split('\n')[0]?.trim();
      const sectionContent = section.split('\n').slice(1).join(' ').substring(0, 200);
      return { title: sectionTitle, content: sectionContent };
    });
    
    // Build script with transitions
    let script = intro + '\n\n';
    
    if (keyPoints.length > 0) {
      script += "Let's dive into the main topics we'll be covering today.\n\n";
      
      keyPoints.forEach((point, index) => {
        if (point.title) {
          script += `First, let's talk about ${point.title.toLowerCase()}. `;
        }
        script += point.content.trim() + '\n\n';
        
        if (index < keyPoints.length - 1) {
          script += "Moving on to our next point... ";
        }
      });
    } else {
      // Fallback for content without clear sections
      const words = mainContent.split(' ').slice(0, 150);
      script += words.join(' ') + '...\n\n';
    }
    
    script += "That brings us to the end of today's discussion. Thank you for listening, and I hope you found these insights valuable. Until next time!";
    
    return script;
  };

  const calculateDuration = (script: string): string => {
    // Estimate duration based on script length (average 150 words per minute)
    const wordCount = script.split(' ').length;
    const minutes = Math.ceil(wordCount / 150);
    const seconds = Math.floor((wordCount % 150) / 2.5);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const resetGenerator = () => {
    setStep('input');
    setPodcastData(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          AI-Powered Podcast Creation
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Transform any blog post into a professional podcast episode with AI narration, 
          background music, and sound effects.
        </p>
      </div>

      <Card className="p-8 glass border-0 shadow-2xl">
        {step === 'input' && <BlogInput onSubmit={handleBlogSubmit} />}
        {step === 'processing' && <ProcessingSteps />}
        {step === 'complete' && podcastData && (
          <AudioPlayer podcastData={podcastData} onReset={resetGenerator} />
        )}
      </Card>
    </div>
  );
};

export default PodcastGenerator;
