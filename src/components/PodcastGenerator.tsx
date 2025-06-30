
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
    
    // Extract title from blog content (simple approach)
    const lines = blogContent.split('\n').filter(line => line.trim());
    const title = lines[0]?.replace(/^#+\s*/, '') || 'Generated Podcast';
    
    // Simulate script generation (in real app, this would call AI API)
    setTimeout(() => {
      const script = generateScript(blogContent);
      setPodcastData({
        title,
        script,
        audioUrl: '/api/placeholder-audio.mp3', // Placeholder
        duration: '5:32'
      });
      setStep('complete');
    }, 5000);
  };

  const generateScript = (content: string): string => {
    // Simple script generation for demo
    const words = content.split(' ').slice(0, 100);
    return `Welcome to today's podcast episode. ${words.join(' ')}... And that wraps up today's discussion. Thank you for listening!`;
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
