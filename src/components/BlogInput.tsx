
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LinkIcon, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BlogInputProps {
  onSubmit: (content: string, source: string) => void;
}

const BlogInput: React.FC<BlogInputProps> = ({ onSubmit }) => {
  const [blogUrl, setBlogUrl] = useState('');
  const [blogText, setBlogText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    
    // Simulate content extraction
    setTimeout(() => {
      const mockContent = `# Sample Blog Post: The Future of AI

Artificial Intelligence is rapidly transforming our world in ways we never imagined. From healthcare to transportation, AI is revolutionizing industries and changing how we live and work.

## Key Developments

Recent breakthroughs in machine learning have made AI more accessible and powerful than ever before. Natural language processing has reached new heights, enabling more human-like interactions.

## Looking Forward

As we move forward, the integration of AI into our daily lives will only continue to grow. The possibilities are endless, and we're just beginning to scratch the surface of what's possible.

This transformation brings both opportunities and challenges that we must navigate carefully as a society.`;
      
      setIsLoading(false);
      onSubmit(mockContent, blogUrl);
    }, 2000);
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

    onSubmit(blogText, 'Direct input');
  };

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
              placeholder="https://example.com/blog-post"
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
              'Extract & Generate Podcast'
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
            Generate Podcast
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BlogInput;
