
import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { parseUrlContent, cleanContent, ParsedContent } from '../utils/contentParser';
import ContentVisual from './ContentVisual';
import { ExternalLink, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BlogInputProps {
  onSubmit: (content: any, options: any) => void;
}

const BlogInput: React.FC<BlogInputProps> = ({ onSubmit }) => {
  const [url, setUrl] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [parsedContent, setParsedContent] = useState<ParsedContent | null>(null);
  const [voice, setVoice] = useState('aria');
  const [tone, setTone] = useState('professional');
  const [includeIntro, setIncludeIntro] = useState(true);
  const [includeOutro, setIncludeOutro] = useState(true);
  const [maxDuration, setMaxDuration] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUrlSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setUrlError(null);
    
    try {
      // Validate URL format
      new URL(url);
      
      console.log('Starting URL parsing for:', url);
      const content = await parseUrlContent(url);
      setParsedContent(content);
      
      toast({
        title: "✅ Content Extracted Successfully!",
        description: `Found ${content.metadata.wordCount} words from the article.`,
      });
    } catch (error) {
      console.error('Error parsing URL:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to parse content from the URL.";
      setUrlError(errorMessage);
      
      toast({
        title: "URL Parsing Failed",
        description: "The content couldn't be extracted. Try copying the text directly instead.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [url, toast]);

  const handleContentSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawContent.trim()) return;

    setIsLoading(true);
    try {
      const cleanedContent = cleanContent(rawContent);
      
      if (cleanedContent.length < 100) {
        throw new Error("Content is too short. Please provide at least 100 characters of content.");
      }
      
      const simulatedParsedContent = {
        title: 'Custom Content',
        content: cleanedContent,
        contentType: 'general',
        suggestedVoice: 'aria',
        metadata: {
          wordCount: cleanedContent.split(' ').length,
          readingTime: `${Math.ceil(cleanedContent.split(' ').length / 200)} min read`,
          author: 'Custom Input',
          publishDate: new Date().toLocaleDateString()
        }
      };
      setParsedContent(simulatedParsedContent as ParsedContent);
      
      toast({
        title: "✅ Content Processed!",
        description: `Ready to generate podcast from ${simulatedParsedContent.metadata.wordCount} words.`,
      });
    } catch (error) {
      console.error('Error cleaning content:', error);
      toast({
        title: "Content Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process the content.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [rawContent, toast]);

  const handleGeneratePodcast = () => {
    if (!parsedContent) {
      toast({
        title: "Content Required",
        description: "Please enter a URL or content to generate a podcast.",
        variant: "destructive"
      });
      return;
    }

    onSubmit(parsedContent, {
      voice,
      tone,
      includeIntro,
      includeOutro,
      maxDuration,
    });
  };

  const suggestedUrls = [
    { name: "Medium", url: "https://medium.com/@username/article-title" },
    { name: "Dev.to", url: "https://dev.to/username/article-title" },
    { name: "Personal Blog", url: "https://yourblog.com/article" },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold">Transform Your Blog into a Podcast</h3>
        <p className="text-muted-foreground">
          Enter a blog URL or paste content directly. Our enhanced system works with most websites including Medium, Dev.to, and personal blogs.
        </p>
      </div>

      {/* Content Preview with Enhanced Visual */}
      {parsedContent && (
        <div className="space-y-6 animate-fade-in">
          <ContentVisual 
            contentType={parsedContent.contentType} 
            title={parsedContent.title} 
          />
          
          <Card className="p-6 glass border-white/10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Content Analysis
                </h4>
                <Badge variant="outline" className="text-xs">
                  {parsedContent.metadata.readingTime}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div className="font-semibold text-purple-400">{parsedContent.metadata.wordCount}</div>
                  <div className="text-xs text-muted-foreground">Words</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div className="font-semibold text-blue-400 capitalize">{parsedContent.contentType}</div>
                  <div className="text-xs text-muted-foreground">Category</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div className="font-semibold text-green-400 capitalize">{parsedContent.suggestedVoice}</div>
                  <div className="text-xs text-muted-foreground">Suggested Voice</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div className="font-semibold text-orange-400">~{Math.ceil(parsedContent.metadata.wordCount / 150)} min</div>
                  <div className="text-xs text-muted-foreground">Est. Duration</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* URL Input Section */}
      <Card className="p-6 glass border-white/10">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            <h4 className="text-lg font-semibold">Generate from URL</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter the URL of a blog post. Our enhanced system works with most websites and includes multiple fallback methods.
          </p>
          
          {urlError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm whitespace-pre-line">
                {urlError}
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleUrlSubmit} className="space-y-3">
            <div className="flex space-x-2">
              <Input
                type="url"
                placeholder="https://example.com/blog-post"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setUrlError(null);
                }}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !url.trim()}>
                {isLoading ? 'Extracting...' : 'Extract Content'}
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <strong>Works best with:</strong> Medium, Dev.to, personal blogs, news sites, and most content websites
            </div>
          </form>
        </div>
      </Card>

      {/* Direct Content Input */}
      <Card className="p-6 glass border-white/10">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Paste Content Directly</h4>
          <p className="text-sm text-muted-foreground">
            If URL extraction doesn't work, copy and paste the article content here.
          </p>
          <form onSubmit={handleContentSubmit} className="space-y-3">
            <Textarea
              placeholder="Paste your blog content here... (minimum 100 characters)"
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              rows={6}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {rawContent.length} characters {rawContent.length < 100 && rawContent.length > 0 && '(minimum 100 required)'}
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || rawContent.trim().length < 100}
              >
                {isLoading ? 'Processing...' : 'Process Content'}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Customization Options */}
      {parsedContent && (
        <Card className="p-6 glass border-white/10 animate-fade-in">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Podcast Options</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="voice">Voice</Label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aria">Aria (Recommended)</SelectItem>
                    <SelectItem value="sarah">Sarah</SelectItem>
                    <SelectItem value="charlie">Charlie</SelectItem>
                    <SelectItem value="laura">Laura</SelectItem>
                    <SelectItem value="george">George</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tone</Label>
                <RadioGroup defaultValue={tone} className="flex space-x-4 mt-2" onValueChange={setTone}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="professional" id="tone-professional" />
                    <Label htmlFor="tone-professional" className="cursor-pointer">Professional</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="casual" id="tone-casual" />
                    <Label htmlFor="tone-casual" className="cursor-pointer">Casual</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeIntro"
                  checked={includeIntro}
                  onChange={(e) => setIncludeIntro(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="includeIntro" className="cursor-pointer">Include Intro</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeOutro"
                  checked={includeOutro}
                  onChange={(e) => setIncludeOutro(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="includeOutro" className="cursor-pointer">Include Outro</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="maxDuration">Target Duration (minutes): {maxDuration}</Label>
              <input
                type="range"
                id="maxDuration"
                min="3"
                max="15"
                value={maxDuration}
                onChange={(e) => setMaxDuration(parseInt(e.target.value))}
                className="w-full mt-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Longer durations include more detailed analysis and commentary
              </div>
            </div>

            <Button onClick={handleGeneratePodcast} className="w-full" size="lg">
              Generate Podcast
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BlogInput;
