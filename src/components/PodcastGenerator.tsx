import React, { useState } from 'react';
import BlogInput from './BlogInput';
import ProcessingSteps from './ProcessingSteps';
import AudioPlayer from './AudioPlayer';
import ScriptPreview from './ScriptPreview';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generatePodcastScript, estimateScriptDuration } from '../utils/scriptGenerator';
import { TTSService, VOICE_IDS, type SubtitleSegment } from '../services/ttsService';
import { useToast } from '@/hooks/use-toast';

export interface PodcastData {
  title: string;
  script: string;
  audioUrl?: string;
  duration?: string;
  voice: string;
  music: string;
  subtitles?: SubtitleSegment[];
}

const PodcastGenerator = () => {
  const [step, setStep] = useState<'input' | 'processing' | 'complete' | 'setup'>('setup');
  const [podcastData, setPodcastData] = useState<PodcastData | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [audioQuality, setAudioQuality] = useState<'standard' | 'high'>('high');
  const [speed, setSpeed] = useState<number>(1);
  const { toast } = useToast();

  const handleApiKeySubmit = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your ElevenLabs API key to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsValidatingKey(true);
    try {
      console.log('Validating API key...');
      const ttsService = new TTSService(apiKey);
      const validation = await ttsService.validateApiKey();
      
      if (!validation.isValid) {
        toast({
          title: "API Key Issue",
          description: validation.error || "Please check your ElevenLabs API key and try again.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "API Key Validated ✅",
        description: "Your API key is working! You can now create podcasts with enhanced features.",
      });
      setStep('input');
    } catch (error) {
      console.error('API key validation error:', error);
      toast({
        title: "Validation Failed",
        description: "Failed to validate API key. Please check your internet connection and API key.",
        variant: "destructive"
      });
    } finally {
      setIsValidatingKey(false);
    }
  };

  const handleBlogSubmit = async (content: any, options: any) => {
    setStep('processing');
    
    try {
      console.log('Starting enhanced podcast generation...');
      
      // Generate enhanced script
      const script = generatePodcastScript(content, {
        ...options,
        quality: audioQuality,
        speed: speed
      });
      const duration = estimateScriptDuration(script);
      
      setPodcastData({
        title: content.title,
        script,
        duration,
        voice: options.voice,
        music: options.music
      });

      // Generate audio with enhanced settings
      setIsGeneratingAudio(true);
      const ttsService = new TTSService(apiKey);
      const voiceId = VOICE_IDS[options.voice as keyof typeof VOICE_IDS] || VOICE_IDS.aria;
      
      console.log('Generating audio with voice:', options.voice, 'ID:', voiceId);
      
      const { audioUrl, subtitles } = await ttsService.generateAudio({
        text: script,
        voiceId,
        model: audioQuality === 'high' ? 'eleven_multilingual_v2' : 'eleven_turbo_v2_5',
        speed: speed,
        stability: 0.6,
        similarity: 0.8,
      });

      setPodcastData(prev => prev ? { ...prev, audioUrl, subtitles } : null);
      setStep('complete');
      
      toast({
        title: "🎉 Podcast Generated Successfully!",
        description: "Your enhanced podcast with subtitles and controls is ready!",
      });
    } catch (error) {
      console.error('Error generating podcast:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to generate audio. Please check your API key and try again.";
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
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
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Enhanced Setup</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure your ElevenLabs API key and audio preferences for high-quality podcast generation.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">ElevenLabs API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
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
                  <p className="text-amber-500">
                    ⚠️ Ensure your API key has text-to-speech and voices permissions
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quality">Audio Quality</Label>
                <Select value={audioQuality} onValueChange={(value: 'standard' | 'high') => setAudioQuality(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (Faster)</SelectItem>
                    <SelectItem value="high">High Quality (Recommended)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="speed">Speech Speed: {speed}x</Label>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleApiKeySubmit} 
              className="w-full"
              disabled={isValidatingKey}
            >
              {isValidatingKey ? 'Validating API Key...' : 'Continue with Enhanced Setup'}
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
              'Parsing and analyzing content',
              'Generating enhanced podcast script',
              'Optimizing for selected voice',
              isGeneratingAudio ? 'Converting to high-quality speech...' : 'Preparing audio generation'
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
