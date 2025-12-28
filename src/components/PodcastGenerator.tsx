
import React, { useState } from 'react';
import BlogInput from './BlogInput';
import ProcessingSteps from './ProcessingSteps';
import AudioPlayer from './AudioPlayer';
import ScriptPreview from './ScriptPreview';
import PodcastLibrary from './PodcastLibrary';
import PodcastTemplateSelector, { type PodcastTemplate } from './PodcastTemplateSelector';
import LanguageSelector, { type SupportedLanguage } from './LanguageSelector';
import TranslatePanel from './TranslatePanel';
import SmartHighlights from './SmartHighlights';
import SpatialAudioMixer from './SpatialAudioMixer';
import SEOOptimizer from './SEOOptimizer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generatePodcastScript, estimateScriptDuration } from '../utils/scriptGenerator';
import { FreeTTSService, FREE_VOICE_OPTIONS, type SubtitleSegment } from '../services/freeTtsService';
import { useToast } from '@/hooks/use-toast';
import { Volume2, Library, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [audioQuality, setAudioQuality] = useState<'standard' | 'high'>('standard');
  const [speed, setSpeed] = useState<number>(1);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en-US');
  const [selectedTemplate, setSelectedTemplate] = useState<PodcastTemplate>('standard');
  const [activeTab, setActiveTab] = useState<'create' | 'library'>('create');
  const { toast } = useToast();

  const handleApiKeySubmit = async () => {
    setIsValidatingKey(true);
    try {
      console.log('Validating free TTS...');
      const ttsService = new FreeTTSService();
      const validation = await ttsService.validateApiKey();
      
      if (!validation.isValid) {
        console.error('TTS validation failed:', validation.error);
        toast({
          title: "Browser Not Supported",
          description: validation.error || "Please use a modern browser that supports speech synthesis.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Free TTS Ready ✅",
        description: "Your browser supports speech synthesis! You can now create podcasts for free.",
      });
      setStep('input');
    } catch (error) {
      console.error('TTS validation error:', error);
      toast({
        title: "Validation Error",
        description: "Failed to initialize speech synthesis. Please try refreshing the page.",
        variant: "destructive"
      });
    } finally {
      setIsValidatingKey(false);
    }
  };

  const handleBlogSubmit = async (content: any, options: any) => {
    setStep('processing');
    
    try {
      console.log('Starting free podcast generation...');
      
      const script = generatePodcastScript(content, {
        ...options,
        quality: audioQuality,
        speed: speed,
        template: selectedTemplate,
        language: selectedLanguage
      });
      const duration = estimateScriptDuration(script);
      
      const newPodcast: PodcastData = {
        title: content.title,
        script,
        duration,
        voice: selectedVoice || 'Chrome Default',
        music: options.music
      };
      
      setPodcastData(newPodcast);

      setIsGeneratingAudio(true);
      const ttsService = new FreeTTSService();
      
      console.log('Generating audio with free TTS, voice:', selectedVoice, 'language:', selectedLanguage);
      
      const { audioUrl, subtitles } = await ttsService.generateAudio({
        text: script,
        voice: selectedVoice,
        rate: speed,
        pitch: 1,
        volume: 1,
      });

      const completedPodcast = { ...newPodcast, audioUrl, subtitles };
      setPodcastData(completedPodcast);
      
      // Save to library
      savePodcastToLibrary(completedPodcast);
      
      setStep('complete');
      
      toast({
        title: "🎉 Free Podcast Generated!",
        description: "Your podcast with subtitles is ready!",
      });
    } catch (error) {
      console.error('Error generating podcast:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate podcast";
      
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

  const savePodcastToLibrary = async (podcast: PodcastData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('podcasts').insert({
        user_id: user.id,
        title: podcast.title,
        script: podcast.script,
        duration: podcast.duration,
        voice: podcast.voice,
        music: podcast.music,
        language: selectedLanguage,
        template: selectedTemplate,
        audio_url: podcast.audioUrl,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving podcast:', error);
    }
  };

  const loadPodcastFromLibrary = (podcast: PodcastData) => {
    setPodcastData(podcast);
    setStep('complete');
    setActiveTab('create');
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
            Free AI Podcast Creation
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform any blog post into a podcast with free browser-based speech synthesis and subtitles.
          </p>
        </div>

        <Card className="p-8 glass border-0 shadow-2xl max-w-md mx-auto">
          <div className="space-y-6">
            <div className="text-center">
              <Volume2 className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-semibold mb-2">Free TTS Setup</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure your free text-to-speech settings.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="voice">Voice Selection</Label>
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a voice (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FREE_VOICE_OPTIONS).map(([name, value]) => (
                      <SelectItem key={name} value={value}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="speed">Speech Speed: {speed}x</Label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
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
              {isValidatingKey ? 'Setting up Free TTS...' : 'Start Creating Podcasts'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
          Free AI Podcast Creation
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Transform any blog post into a professional podcast with AI-powered features, multiple languages, and creative templates.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'create' | 'library')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Create Podcast
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Library className="w-4 h-4" />
            My Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6 mt-8">
          <Card className="p-8 glass border-0 shadow-2xl">
            {step === 'input' && (
              <div className="space-y-8">
                <PodcastTemplateSelector 
                  selectedTemplate={selectedTemplate}
                  onTemplateChange={setSelectedTemplate}
                />
                <LanguageSelector 
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={setSelectedLanguage}
                />
                <BlogInput onSubmit={handleBlogSubmit} />
              </div>
            )}
            {step === 'processing' && (
              <ProcessingSteps 
                customSteps={[
                  'Parsing and analyzing content',
                  `Applying ${selectedTemplate} template`,
                  `Generating podcast in ${selectedLanguage}`,
                  'Creating subtitle timestamps',
                  isGeneratingAudio ? 'Converting to speech...' : 'Preparing audio generation'
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
                
                {/* AI Enhancement Tools */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <TranslatePanel 
                    script={podcastData.script}
                    onTranslated={(translatedScript, lang) => {
                      console.log('Translated to:', lang);
                    }}
                  />
                  <SmartHighlights 
                    script={podcastData.script}
                    title={podcastData.title}
                  />
                </div>
                
                <SpatialAudioMixer audioUrl={podcastData.audioUrl} />
                
                <SEOOptimizer 
                  script={podcastData.script}
                  title={podcastData.title}
                />
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="library" className="mt-8">
          <PodcastLibrary onLoadPodcast={loadPodcastFromLibrary} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PodcastGenerator;
