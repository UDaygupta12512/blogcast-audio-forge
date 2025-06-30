
import React, { useState } from 'react';
import BlogInput from './BlogInput';
import ProcessingSteps from './ProcessingSteps';
import AudioPlayer from './AudioPlayer';
import ScriptPreview from './ScriptPreview';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generatePodcastScript, estimateScriptDuration } from '../utils/scriptGenerator';
import { TTSService, VOICE_IDS } from '../services/ttsService';
import { useToast } from '@/hooks/use-toast';

export interface PodcastData {
  title: string;
  script: string;
  audioUrl?: string;
  duration?: string;
  voice: string;
  music: string;
}

const PodcastGenerator = () => {
  const [step, setStep] = useState<'input' | 'processing' | 'complete' | 'setup'>('setup');
  const [podcastData, setPodcastData] = useState<PodcastData | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const { toast } = useToast();

  const handleApiKeySubmit = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your ElevenLabs API key to continue.",
        variant: "destructive"
      });
      return;
    }
    setStep('input');
  };

  const handleBlogSubmit = async (content: any, options: any) => {
    setStep('processing');
    
    try {
      // Generate enhanced script with user options
      const script = generatePodcastScript(content, options);
      const duration = estimateScriptDuration(script);
      
      // Update to show script generation complete
      setPodcastData({
        title: content.title,
        script,
        duration,
        voice: options.voice,
        music: options.music
      });

      // Generate actual audio using ElevenLabs
      setIsGeneratingAudio(true);
      const ttsService = new TTSService(apiKey);
      const voiceId = VOICE_IDS[options.voice as keyof typeof VOICE_IDS] || VOICE_IDS.aria;
      
      const audioUrl = await ttsService.generateAudio({
        text: script,
        voiceId,
      });

      setPodcastData(prev => prev ? { ...prev, audioUrl } : null);
      setStep('complete');
      
      toast({
        title: "Podcast Generated!",
        description: "Your podcast episode is ready to listen.",
      });
    } catch (error) {
      console.error('Error generating podcast:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate audio. Please check your API key and try again.",
        variant: "destructive"
      });
      setStep('input');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const resetGenerator = () => {
    setStep('input');
    setPodcastData(null);
    setIsGeneratingAudio(false);
  };

  if (step === 'setup') {
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

        <Card className="p-8 glass border-0 shadow-2xl max-w-md mx-auto">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Setup Required</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter your ElevenLabs API key to enable real text-to-speech generation.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">ElevenLabs API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Get your API key from{' '}
                <a 
                  href="https://elevenlabs.io/api" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:underline"
                >
                  ElevenLabs
                </a>
              </p>
            </div>
            
            <Button onClick={handleApiKeySubmit} className="w-full">
              Continue
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
        {step === 'processing' && (
          <ProcessingSteps 
            customSteps={[
              'Parsing blog content',
              'Generating podcast script',
              'Converting text to speech',
              isGeneratingAudio ? 'Generating audio...' : 'Processing audio'
            ]}
          />
        )}
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
