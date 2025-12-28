import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, Loader2, Copy, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Highlight {
  id: string;
  title: string;
  excerpt: string;
  reason: string;
  platform: string;
  emoji: string;
  hookScore: number;
}

interface SmartHighlightsProps {
  script: string;
  title: string;
}

const SmartHighlights: React.FC<SmartHighlightsProps> = ({ script, title }) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeScript = async () => {
    if (!script) {
      toast.error('No script to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-highlights', {
        body: { script, title }
      });

      if (error) throw error;

      setHighlights(data.highlights || []);
      toast.success(`Found ${data.highlights?.length || 0} shareable moments!`);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyHighlight = (excerpt: string) => {
    navigator.clipboard.writeText(excerpt);
    toast.success('Copied to clipboard!');
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'tiktok': return 'bg-pink-500/20 text-pink-300';
      case 'instagram': return 'bg-purple-500/20 text-purple-300';
      case 'twitter': return 'bg-blue-500/20 text-blue-300';
      case 'youtube shorts': return 'bg-red-500/20 text-red-300';
      default: return 'bg-primary/20 text-primary';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <Card className="p-4 glass border-white/10">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Smart Highlights</h3>
          </div>
          <Button 
            onClick={analyzeScript} 
            disabled={isAnalyzing}
            size="sm"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Find Clips
              </>
            )}
          </Button>
        </div>

        {highlights.length === 0 && !isAnalyzing && (
          <p className="text-sm text-muted-foreground text-center py-4">
            AI will detect the best moments for social media clips
          </p>
        )}

        {highlights.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {highlights.map((highlight, index) => (
              <Card key={highlight.id || index} className="p-3 bg-background/50 border-white/5">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{highlight.emoji}</span>
                      <h4 className="font-medium text-sm">{highlight.title}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-bold ${getScoreColor(highlight.hookScore)}`}>
                        {highlight.hookScore}/10
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground italic">
                    "{highlight.excerpt}"
                  </p>

                  <div className="flex items-center justify-between">
                    <Badge className={getPlatformColor(highlight.platform)}>
                      {highlight.platform}
                    </Badge>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyHighlight(highlight.excerpt)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toast.success('Share feature coming soon!')}
                      >
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    💡 {highlight.reason}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default SmartHighlights;
