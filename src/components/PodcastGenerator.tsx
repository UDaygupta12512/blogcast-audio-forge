
import React, { useState } from 'react';
import BlogInput from './BlogInput';
import ProcessingSteps from './ProcessingSteps';
import AudioPlayer from './AudioPlayer';
import ScriptPreview from './ScriptPreview';
import { Card } from '@/components/ui/card';
import { generatePodcastScript, estimateScriptDuration } from '../utils/scriptGenerator';

export interface PodcastData {
  title: string;
  script: string;
  audioUrl?: string;
  duration?: string;
  voice: string;
  music: string;
}

const PodcastGenerator = () => {
  const [step, setStep] = useState<'input' | 'processing' | 'complete'>('input');
  const [podcastData, setPodcastData] = useState<PodcastData | null>(null);

  const handleBlogSubmit = async (content: any, options: any) => {
    setStep('processing');
    
    // Generate enhanced script with user options
    setTimeout(() => {
      const script = generatePodcastScript(content, options);
      const duration = estimateScriptDuration(script);
      
      setPodcastData({
        title: content.title,
        script,
        audioUrl: '/api/placeholder-audio.mp3',
        duration,
        voice: options.voice,
        music: options.music
      });
      setStep('complete');
    }, 5000);
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
          <div className="space-y-6">
            <ScriptPreview 
              script={podcastData.script} 
              estimatedDuration={podcastData.duration || '5:00'} 
            />
            <AudioPlayer podcastData={podcastData} onReset={resetGenerator} />
          </div>
        )}
      </Card>
    </div>
  );
};

export default PodcastGenerator;
