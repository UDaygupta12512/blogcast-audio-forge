import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LinkIcon, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseUrlContent, cleanContent } from '../utils/contentParser';
import ContentCleaner from './ContentCleaner';
import VoiceSelector from './VoiceSelector';
import MusicSelector from './MusicSelector';

interface BlogInputProps {
  onSubmit: (content: any, options: any) => void;
}

const BlogInput: React.FC<BlogInputProps> = ({ onSubmit }) => {
  const [blogUrl, setBlogUrl] = useState('');
  const [blogText, setBlogText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedContent, setParsedContent] = useState<any>(null);
  const [selectedVoice, setSelectedVoice] = useState('aria');
  const [selectedMusic, setSelectedMusic] = useState('ambient-tech');
  const { toast } = useToast();

  const handleUrlSubmit = async () => {
    if (!blogUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid blog URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Parse content from URL
      const content = await parseUrlContent(blogUrl);
      const cleanedContent = cleanContent(content.content);
      
      setParsedContent({
        ...content,
        content: cleanedContent,
        source: blogUrl
      });
      
      // Set the suggested voice based on content type
      setSelectedVoice(content.suggestedVoice);
      
      // Set music based on content type
      const musicMap = {
        tech: 'ambient-tech',
        health: 'nature-calm',
        business: 'corporate-upbeat',
        general: 'cinematic-inspiring'
      };
      setSelectedMusic(musicMap[content.contentType] || 'ambient-tech');
      
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to extract content from URL",
        variant: "destructive",
      });
    }
  };

  const handleTextSubmit = () => {
    if (!blogText.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter some blog content",
        variant: "destructive",
      });
      return;
    }

    const lines = blogText.split('\n').filter(line => line.trim());
    const title = lines[0]?.replace(/^#+\s*/, '') || 'Generated Podcast';
    const wordCount = blogText.split(' ').length;
    
    // Detect content type from text
    const text = blogText.toLowerCase();
    let contentType: 'tech' | 'health' | 'business' | 'general' = 'general';
    let suggestedVoice = 'aria';
    
    if (text.includes('ai') || text.includes('technology') || text.includes('programming')) {
      contentType = 'tech';
      suggestedVoice = 'charlie';
    } else if (text.includes('health') || text.includes('medical') || text.includes('wellness')) {
      contentType = 'health';
      suggestedVoice = 'laura';
    } else if (text.includes('business') || text.includes('startup') || text.includes('entrepreneur')) {
      contentType = 'business';
      suggestedVoice = 'george';
    }
    
    setParsedContent({
      title,
      content: blogText,
      contentType,
      suggestedVoice,
      metadata: {
        wordCount,
        readingTime: `${Math.ceil(wordCount / 200)} min read`,
      },
      source: 'Direct input'
    });
    
    setSelectedVoice(suggestedVoice);
  };

  const handleGeneratePodcast = () => {
    const options = {
      voice: selectedVoice,
      music: selectedMusic,
      tone: 'professional',
      includeIntro: true,
      includeOutro: true,
      maxDuration: 10
    };
    
    onSubmit(parsedContent, options);
  };

  if (parsedContent) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-2">Configure Your Podcast</h3>
          <p className="text-muted-foreground">
            Customize voice and music settings for your episode
          </p>
        </div>

        <ContentCleaner
          originalContent={parsedContent.content}
          cleanedContent={parsedContent.content}
          metadata={parsedContent.metadata}
        />

        <VoiceSelector
          selectedVoice={selectedVoice}
          onVoiceChange={setSelectedVoice}
        />

        <MusicSelector
          selectedTrack={selectedMusic}
          onTrackChange={setSelectedMusic}
        />

        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => setParsedContent(null)}
            variant="outline"
          >
            Back to Input
          </Button>
          <Button
            onClick={handleGeneratePodcast}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Generate Podcast
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-semibold mb-2">Import Your Blog Content</h3>
        <p className="text-muted-foreground">
          Start by providing your blog content through URL or direct input
        </p>
      </div>

      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/20">
          <TabsTrigger value="url" className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            From URL
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Paste Text
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blog-url">Blog Post URL</Label>
            <Input
              id="blog-url"
              type="url"
              placeholder="https://example.com/blog-post (try URLs with 'tech', 'health', or 'business')"
              value={blogUrl}
              onChange={(e) => setBlogUrl(e.target.value)}
              className="bg-background/50"
            />
          </div>
          <Button 
            onClick={handleUrlSubmit} 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Extracting Content...
              </>
            ) : (
              'Extract Content'
            )}
          </Button>
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="blog-text">Blog Content</Label>
            <Textarea
              id="blog-text"
              placeholder="Paste your blog post content here..."
              value={blogText}
              onChange={(e) => setBlogText(e.target.value)}
              rows={10}
              className="bg-background/50 resize-none"
            />
          </div>
          <Button 
            onClick={handleTextSubmit}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Process Content
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogInput;
