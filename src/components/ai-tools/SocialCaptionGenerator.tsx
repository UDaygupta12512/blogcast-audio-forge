import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Share2, Loader2, Copy, Instagram, Twitter, Linkedin, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedCaption {
  platform: string;
  caption: string;
  hashtags: string[];
}

const SocialCaptionGenerator = () => {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['instagram', 'twitter']);
  const [generatedCaptions, setGeneratedCaptions] = useState<GeneratedCaption[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const platforms = [
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-400' },
    { id: 'twitter', label: 'X/Twitter', icon: Twitter, color: 'text-blue-400' },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-600' },
    { id: 'tiktok', label: 'TikTok', icon: Video, color: 'text-purple-400' },
  ];

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Please enter a topic for your captions", variant: "destructive" });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({ title: "Select platforms", description: "Please select at least one platform", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-writing', {
        body: { 
          type: 'social',
          topic,
          context,
          platforms: selectedPlatforms
        }
      });

      if (error) throw error;
      setGeneratedCaptions(data.captions);
      toast({ title: "Captions generated!", description: `Created captions for ${selectedPlatforms.length} platforms` });
    } catch (error) {
      console.error('Error generating captions:', error);
      toast({ title: "Generation failed", description: "Failed to generate captions", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCaption = (caption: string, hashtags: string[]) => {
    const fullText = `${caption}\n\n${hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    toast({ title: "Copied!", description: "Caption copied to clipboard" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-pink-400" />
            Social Caption Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Topic / Subject</Label>
            <Input
              placeholder="e.g., New product launch, Behind the scenes"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Additional Context (optional)</Label>
            <Textarea
              placeholder="Add any additional details, brand voice guidelines, or specific messaging..."
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Select Platforms</Label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <Badge
                  key={platform.id}
                  variant={selectedPlatforms.includes(platform.id) ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    selectedPlatforms.includes(platform.id) ? 'bg-primary' : 'hover:bg-primary/20'
                  }`}
                  onClick={() => togglePlatform(platform.id)}
                >
                  <platform.icon className={`w-3 h-3 mr-1 ${platform.color}`} />
                  {platform.label}
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                Generate Captions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="glass border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Generated Captions</CardTitle>
        </CardHeader>
        <CardContent>
          {generatedCaptions.length > 0 ? (
            <div className="space-y-4">
              {generatedCaptions.map((item, index) => {
                const platform = platforms.find(p => p.id === item.platform);
                return (
                  <div key={index} className="p-4 rounded-lg bg-background/50 border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {platform && <platform.icon className={`w-3 h-3 ${platform.color}`} />}
                        {platform?.label}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => copyCaption(item.caption, item.hashtags)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-sm mb-2">{item.caption}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.hashtags.map((tag, i) => (
                        <span key={i} className="text-xs text-primary">{tag}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <p>Your generated captions will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialCaptionGenerator;
