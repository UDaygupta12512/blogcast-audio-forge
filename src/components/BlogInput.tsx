import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { parseUrlContent, cleanContent, ParsedContent } from '../utils/contentParser';
import ContentVisual from './ContentVisual';

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
  const { toast } = useToast();

  const handleUrlSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const content = await parseUrlContent(url);
      setParsedContent(content);
    } catch (error) {
      console.error('Error parsing URL:', error);
      toast({
        title: "Parsing Failed",
        description: "Failed to parse content from the URL. Please check the URL and try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [url, toast]);

  const handleContentSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const cleanedContent = cleanContent(rawContent);
      // Simulate content parsing
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
    } catch (error) {
      console.error('Error cleaning content:', error);
      toast({
        title: "Content Processing Failed",
        description: "Failed to process the content. Please check the content and try again.",
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

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold">Transform Your Blog into a Podcast</h3>
        <p className="text-muted-foreground">
          Enter a blog URL or paste content directly. Our AI will analyze the content and create a personalized podcast experience.
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
                <h4 className="font-semibold text-lg">Content Analysis</h4>
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
                  <div className="font-semibold text-blue-400">{parsedContent.contentType}</div>
                  <div className="text-xs text-muted-foreground">Category</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div className="font-semibold text-green-400">{parsedContent.suggestedVoice}</div>
                  <div className="text-xs text-muted-foreground">Suggested Voice</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-white/5">
                  <div className="font-semibold text-orange-400">~5 min</div>
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
          <h4 className="text-lg font-semibold">Generate from URL</h4>
          <p className="text-sm text-muted-foreground">
            Enter the URL of a blog post to automatically extract and analyze its content.
          </p>
          <form onSubmit={handleUrlSubmit} className="flex space-x-2">
            <Input
              type="url"
              placeholder="Enter blog URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Parse URL'}
            </Button>
          </form>
        </div>
      </Card>

      {/* Direct Content Input */}
      <Card className="p-6 glass border-white/10">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold">Paste Content Directly</h4>
          <p className="text-sm text-muted-foreground">
            Alternatively, paste the content of your blog post directly into the text area below.
          </p>
          <form onSubmit={handleContentSubmit} className="space-y-2">
            <Input.TextArea
              placeholder="Paste blog content here..."
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Process Content'}
            </Button>
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
                    <SelectItem value="aria">Aria</SelectItem>
                    <SelectItem value="sarah">Sarah</SelectItem>
                    <SelectItem value="charlie">Charlie</SelectItem>
                    <SelectItem value="laura">Laura</SelectItem>
                    <SelectItem value="george">George</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tone</Label>
                <RadioGroup defaultValue={tone} className="flex space-x-2" onValueChange={setTone}>
                  <RadioGroupItem value="professional" id="tone-professional" className="peer h-5 w-5 rounded-full border-2 border-muted ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
                  <Label htmlFor="tone-professional" className="cursor-pointer">Professional</Label>
                  <RadioGroupItem value="casual" id="tone-casual" className="peer h-5 w-5 rounded-full border-2 border-muted ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground" />
                  <Label htmlFor="tone-casual" className="cursor-pointer">Casual</Label>
                </RadioGroup>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="includeIntro">Include Intro</Label>
                <Input
                  type="checkbox"
                  id="includeIntro"
                  checked={includeIntro}
                  onChange={(e) => setIncludeIntro(e.target.checked)}
                />
              </div>

              <div>
                <Label htmlFor="includeOutro">Include Outro</Label>
                <Input
                  type="checkbox"
                  id="includeOutro"
                  checked={includeOutro}
                  onChange={(e) => setIncludeOutro(e.target.checked)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="maxDuration">Max Duration (minutes)</Label>
              <Input
                type="number"
                id="maxDuration"
                value={maxDuration}
                onChange={(e) => setMaxDuration(parseInt(e.target.value))}
              />
            </div>

            <Button onClick={handleGeneratePodcast} className="w-full">
              Generate Podcast
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BlogInput;
