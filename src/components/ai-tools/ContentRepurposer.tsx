import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Copy, FileText, Mail, Share2, Newspaper, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Podcast {
  id: string;
  title: string;
  script: string;
}

const ContentRepurposer = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [selectedPodcast, setSelectedPodcast] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [outputFormats, setOutputFormats] = useState<string[]>(['blog', 'newsletter']);
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const formats = [
    { id: 'blog', label: 'Blog Post', icon: FileText, description: 'SEO-optimized article' },
    { id: 'newsletter', label: 'Newsletter', icon: Mail, description: 'Email newsletter' },
    { id: 'social', label: 'Social Thread', icon: Share2, description: 'Twitter/X thread' },
    { id: 'linkedin', label: 'LinkedIn Article', icon: Newspaper, description: 'Professional article' },
    { id: 'summary', label: 'Executive Summary', icon: BookOpen, description: 'Key takeaways' },
  ];

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('podcasts')
        .select('id, title, script')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPodcasts(data || []);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
    }
  };

  const toggleFormat = (formatId: string) => {
    setOutputFormats(prev =>
      prev.includes(formatId)
        ? prev.filter(f => f !== formatId)
        : [...prev, formatId]
    );
  };

  const getSourceContent = () => {
    if (selectedPodcast) {
      const podcast = podcasts.find(p => p.id === selectedPodcast);
      return podcast?.script || '';
    }
    return customContent;
  };

  const handleRepurpose = async () => {
    const content = getSourceContent();
    if (!content.trim()) {
      toast({ title: "Content required", description: "Please select a podcast or enter content", variant: "destructive" });
      return;
    }

    if (outputFormats.length === 0) {
      toast({ title: "Select formats", description: "Please select at least one output format", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-writing', {
        body: { 
          type: 'repurpose',
          content,
          formats: outputFormats,
          title: selectedPodcast ? podcasts.find(p => p.id === selectedPodcast)?.title : 'Custom Content'
        }
      });

      if (error) throw error;
      setGeneratedContent(data.outputs);
      toast({ title: "Content repurposed!", description: `Created ${Object.keys(data.outputs).length} formats` });
    } catch (error) {
      console.error('Error repurposing content:', error);
      toast({ title: "Repurposing failed", description: "Failed to repurpose content", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied!", description: "Content copied to clipboard" });
  };

  return (
    <div className="space-y-6">
      <Card className="glass border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Content Repurposer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select from Your Podcasts</Label>
              <Select value={selectedPodcast} onValueChange={(v) => { setSelectedPodcast(v); setCustomContent(''); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a podcast..." />
                </SelectTrigger>
                <SelectContent>
                  {podcasts.map((podcast) => (
                    <SelectItem key={podcast.id} value={podcast.id}>
                      {podcast.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Or Paste Custom Content</Label>
              <Textarea
                placeholder="Paste your content here..."
                value={customContent}
                onChange={(e) => { setCustomContent(e.target.value); setSelectedPodcast(''); }}
                className="min-h-[80px]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Output Formats</Label>
            <div className="flex flex-wrap gap-2">
              {formats.map((format) => (
                <Badge
                  key={format.id}
                  variant={outputFormats.includes(format.id) ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    outputFormats.includes(format.id) ? 'bg-primary' : 'hover:bg-primary/20'
                  }`}
                  onClick={() => toggleFormat(format.id)}
                >
                  <format.icon className="w-3 h-3 mr-1" />
                  {format.label}
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={handleRepurpose} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Repurposing Content...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Repurpose Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {Object.keys(generatedContent).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(generatedContent).map(([formatId, content]) => {
            const format = formats.find(f => f.id === formatId);
            return (
              <Card key={formatId} className="glass border-0 shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      {format && <format.icon className="w-4 h-4 text-purple-400" />}
                      {format?.label}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => copyContent(content)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={content}
                    readOnly
                    className="min-h-[200px] text-sm"
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContentRepurposer;
