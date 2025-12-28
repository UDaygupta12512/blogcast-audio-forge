import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { FileText, Copy, Loader2, Mail, Twitter, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SummaryGeneratorProps {
  podcastId: string;
  script: string;
  title: string;
}

type SummaryType = 'blog' | 'newsletter' | 'twitter';

const SummaryGenerator: React.FC<SummaryGeneratorProps> = ({
  podcastId,
  script,
  title
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaries, setSummaries] = useState<Record<SummaryType, string>>({
    blog: '',
    newsletter: '',
    twitter: ''
  });

  const generateSummary = async (type: SummaryType) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { script, title, type }
      });

      if (error) throw error;

      setSummaries(prev => ({
        ...prev,
        [type]: data.summary
      }));

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} summary generated!`);
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary');
    } finally {
      setIsGenerating(false);
    }
  };

  const copySummary = (type: SummaryType) => {
    if (!summaries[type]) return;
    
    navigator.clipboard.writeText(summaries[type]);
    toast.success('Copied to clipboard!');
  };

  const summaryTypes = [
    { 
      key: 'blog' as SummaryType, 
      label: 'Blog Post', 
      icon: BookOpen,
      description: 'Long-form article with sections'
    },
    { 
      key: 'newsletter' as SummaryType, 
      label: 'Newsletter', 
      icon: Mail,
      description: 'Email-friendly format'
    },
    { 
      key: 'twitter' as SummaryType, 
      label: 'Tweet Thread', 
      icon: Twitter,
      description: 'Thread of connected tweets'
    }
  ];

  return (
    <Card className="p-6 glass border-white/10">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Podcast Summaries</h3>
        </div>

        <Tabs defaultValue="blog" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            {summaryTypes.map(({ key, label, icon: Icon }) => (
              <TabsTrigger key={key} value={key} className="gap-2">
                <Icon className="w-4 h-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {summaryTypes.map(({ key, label, description }) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{description}</p>
                  <Button
                    onClick={() => generateSummary(key)}
                    disabled={isGenerating}
                    size="sm"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate'
                    )}
                  </Button>
                </div>

                {summaries[key] && (
                  <div className="space-y-3">
                    <div className="p-4 bg-background/50 rounded-lg border border-white/10 max-h-96 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">{summaries[key]}</p>
                    </div>
                    <Button 
                      onClick={() => copySummary(key)} 
                      variant="outline" 
                      className="w-full"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy {label}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-xs text-muted-foreground">
            🤖 AI-powered summaries automatically extract key points and format them 
            for different platforms. Perfect for cross-platform content distribution!
          </p>
        </div>
      </div>
    </Card>
  );
};

export default SummaryGenerator;
