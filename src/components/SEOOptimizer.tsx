import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  FileText, 
  Clock, 
  ScrollText, 
  Loader2, 
  Copy, 
  Download,
  Search,
  Hash,
  Quote
} from 'lucide-react';

interface SEOOptimizerProps {
  script: string;
  title: string;
}

const SEOOptimizer: React.FC<SEOOptimizerProps> = ({ script, title }) => {
  const [showNotes, setShowNotes] = useState<string>('');
  const [transcript, setTranscript] = useState<string>('');
  const [timestamps, setTimestamps] = useState<string>('');
  const [loading, setLoading] = useState<{
    showNotes: boolean;
    transcript: boolean;
    timestamps: boolean;
  }>({
    showNotes: false,
    transcript: false,
    timestamps: false,
  });

  const generateContent = async (type: 'show-notes' | 'transcript' | 'timestamps') => {
    setLoading(prev => ({ ...prev, [type === 'show-notes' ? 'showNotes' : type]: true }));

    try {
      const { data, error } = await supabase.functions.invoke('seo-optimizer', {
        body: { script, title, type }
      });

      if (error) throw error;

      switch (type) {
        case 'show-notes':
          setShowNotes(data.content);
          break;
        case 'transcript':
          setTranscript(data.content);
          break;
        case 'timestamps':
          setTimestamps(data.content);
          break;
      }

      toast.success(`${type.replace('-', ' ')} generated successfully!`);
    } catch (error: any) {
      console.error(`Error generating ${type}:`, error);
      toast.error(error.message || `Failed to generate ${type}`);
    } finally {
      setLoading(prev => ({ ...prev, [type === 'show-notes' ? 'showNotes' : type]: false }));
    }
  };

  const generateAll = async () => {
    await Promise.all([
      generateContent('show-notes'),
      generateContent('transcript'),
      generateContent('timestamps'),
    ]);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  const isAnyLoading = loading.showNotes || loading.transcript || loading.timestamps;

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">SEO Optimizer</CardTitle>
              <p className="text-sm text-muted-foreground">
                Boost discoverability with show notes, transcripts & timestamps
              </p>
            </div>
          </div>
          <Button 
            onClick={generateAll} 
            disabled={isAnyLoading}
            className="gap-2"
          >
            {isAnyLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Generate All
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="show-notes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="show-notes" className="gap-2">
              <FileText className="w-4 h-4" />
              Show Notes
            </TabsTrigger>
            <TabsTrigger value="transcript" className="gap-2">
              <ScrollText className="w-4 h-4" />
              Transcript
            </TabsTrigger>
            <TabsTrigger value="timestamps" className="gap-2">
              <Clock className="w-4 h-4" />
              Timestamps
            </TabsTrigger>
          </TabsList>

          <TabsContent value="show-notes" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Hash className="w-3 h-3" />
                  SEO Keywords
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Quote className="w-3 h-3" />
                  Quotes
                </Badge>
              </div>
              {!showNotes && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => generateContent('show-notes')}
                  disabled={loading.showNotes}
                >
                  {loading.showNotes ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Generate Show Notes
                </Button>
              )}
            </div>
            
            {showNotes ? (
              <div className="space-y-3">
                <ScrollArea className="h-64 rounded-lg border bg-muted/30 p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {showNotes}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(showNotes, 'Show notes')}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadAsFile(showNotes, `${title || 'podcast'}-show-notes.txt`)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-32 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
                Click "Generate Show Notes" to create SEO-optimized show notes
              </div>
            )}
          </TabsContent>

          <TabsContent value="transcript" className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">Full episode transcript with timestamps</Badge>
              {!transcript && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => generateContent('transcript')}
                  disabled={loading.transcript}
                >
                  {loading.transcript ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Generate Transcript
                </Button>
              )}
            </div>
            
            {transcript ? (
              <div className="space-y-3">
                <ScrollArea className="h-64 rounded-lg border bg-muted/30 p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-xs">
                    {transcript}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(transcript, 'Transcript')}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadAsFile(transcript, `${title || 'podcast'}-transcript.txt`)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-32 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
                Click "Generate Transcript" to create a searchable transcript
              </div>
            )}
          </TabsContent>

          <TabsContent value="timestamps" className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">Chapter markers for easy navigation</Badge>
              {!timestamps && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => generateContent('timestamps')}
                  disabled={loading.timestamps}
                >
                  {loading.timestamps ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Generate Timestamps
                </Button>
              )}
            </div>
            
            {timestamps ? (
              <div className="space-y-3">
                <ScrollArea className="h-64 rounded-lg border bg-muted/30 p-4">
                  <div className="space-y-2">
                    {timestamps.split('\n').filter(line => line.trim()).map((line, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{line}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyToClipboard(timestamps, 'Timestamps')}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => downloadAsFile(timestamps, `${title || 'podcast'}-timestamps.txt`)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-32 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
                Click "Generate Timestamps" to create chapter markers
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SEOOptimizer;
