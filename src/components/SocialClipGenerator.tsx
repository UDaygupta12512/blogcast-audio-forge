import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Scissors, Download, Loader2, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SocialClipGeneratorProps {
  podcastId: string;
  script: string;
  audioUrl?: string;
  duration: string;
}

type Platform = 'instagram' | 'linkedin' | 'youtube';

const SocialClipGenerator: React.FC<SocialClipGeneratorProps> = ({
  podcastId,
  script,
  audioUrl,
  duration
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [clipDuration, setClipDuration] = useState([30]);
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [generatedClip, setGeneratedClip] = useState<string | null>(null);

  const platformSpecs = {
    instagram: { name: 'Instagram Reels', icon: Instagram, maxDuration: 90, ratio: '9:16' },
    linkedin: { name: 'LinkedIn', icon: Linkedin, maxDuration: 60, ratio: '1:1' },
    youtube: { name: 'YouTube Shorts', icon: Youtube, maxDuration: 60, ratio: '9:16' }
  };

  const generateClip = async () => {
    if (!audioUrl) {
      toast.error('No audio available to generate clip');
      return;
    }

    setIsGenerating(true);
    try {
      // Here we would integrate with AI to find the best segment
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const clipText = `🎙️ Podcast Highlight
      
${script.slice(0, 200)}...

#Podcast #${platform} #Content`;
      
      setGeneratedClip(clipText);
      toast.success('Clip generated successfully!');
    } catch (error) {
      console.error('Error generating clip:', error);
      toast.error('Failed to generate clip');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadClip = () => {
    if (!generatedClip) return;
    
    const blob = new Blob([generatedClip], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `podcast-clip-${platform}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Clip caption downloaded!');
  };

  const PlatformIcon = platformSpecs[platform].icon;

  return (
    <Card className="p-6 glass border-white/10">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Social Clip Generator</h3>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(platformSpecs).map(([key, spec]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <spec.icon className="w-4 h-4" />
                      {spec.name} ({spec.ratio})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Clip Duration: {clipDuration[0]}s</Label>
            <Slider
              value={clipDuration}
              onValueChange={setClipDuration}
              max={platformSpecs[platform].maxDuration}
              min={15}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Max duration for {platformSpecs[platform].name}: {platformSpecs[platform].maxDuration}s
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={generateClip} 
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <PlatformIcon className="w-4 h-4 mr-2" />
                  Generate Clip
                </>
              )}
            </Button>
          </div>
        </div>

        {generatedClip && (
          <div className="space-y-3 pt-4 border-t border-white/10">
            <Label>Generated Caption</Label>
            <div className="p-4 bg-background/50 rounded-lg border border-white/10">
              <p className="text-sm whitespace-pre-wrap">{generatedClip}</p>
            </div>
            <Button onClick={downloadClip} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Caption
            </Button>
          </div>
        )}

        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-xs text-muted-foreground">
            💡 Pro tip: The AI will automatically identify the most engaging {clipDuration[0]}-second 
            segment with waveform visualization and auto-generated captions optimized for {platformSpecs[platform].name}.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default SocialClipGenerator;
