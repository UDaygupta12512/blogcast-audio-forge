
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

  const generateMockContent = (url: string): string => {
    // Generate different content based on URL patterns
    const domain = url.toLowerCase();
    
    if (domain.includes('tech') || domain.includes('ai') || domain.includes('artificial')) {
      return `# The Future of Artificial Intelligence in Modern Technology

Artificial Intelligence is rapidly transforming our world in ways we never imagined. From healthcare to transportation, AI is revolutionizing industries and changing how we live and work.

## Breakthrough Developments

Recent breakthroughs in machine learning have made AI more accessible and powerful than ever before. Natural language processing has reached new heights, enabling more human-like interactions between machines and humans.

The integration of AI into everyday applications has accelerated dramatically, with new tools emerging that can write code, create art, and even compose music.

## Looking Forward

As we move forward, the integration of AI into our daily lives will only continue to grow. The possibilities are endless, and we're just beginning to scratch the surface of what's possible.

This transformation brings both opportunities and challenges that we must navigate carefully as a society. The key is to harness AI's power while maintaining human oversight and ethical standards.`;
    }
    
    if (domain.includes('health') || domain.includes('medical') || domain.includes('wellness')) {
      return `# Revolutionary Approaches to Modern Healthcare

Healthcare is undergoing a digital transformation that promises to improve patient outcomes and reduce costs. From telemedicine to AI-powered diagnostics, technology is reshaping how we approach medical care.

## Digital Health Solutions

Wearable devices and mobile health apps are empowering patients to take control of their health like never before. These tools provide real-time monitoring and personalized insights that help prevent illness before it starts.

## Personalized Medicine

The future of healthcare lies in personalized treatment plans based on individual genetic profiles and lifestyle factors. This approach ensures that each patient receives the most effective care tailored to their unique needs.

## Accessibility and Innovation

Telemedicine has broken down geographical barriers, making quality healthcare accessible to remote and underserved communities. This democratization of healthcare is one of the most significant advances in modern medicine.`;
    }
    
    if (domain.includes('business') || domain.includes('startup') || domain.includes('entrepreneur')) {
      return `# Building Successful Startups in the Digital Age

The entrepreneurial landscape has evolved dramatically in recent years. Today's successful startups leverage technology, data, and innovative business models to create value and scale rapidly.

## Key Success Factors

Modern startups must focus on customer validation, lean operations, and rapid iteration. The days of building in isolation are over – today's entrepreneurs must engage with their market from day one.

## Technology as an Enabler

Cloud computing, artificial intelligence, and mobile technology have lowered the barriers to entry for new businesses. Small teams can now build and scale applications that reach millions of users.

## The Importance of Culture

Building a strong company culture from the beginning is crucial for long-term success. Teams that share common values and vision are more likely to overcome challenges and achieve their goals.

## Funding and Growth

Access to funding has never been more diverse, with traditional VCs, angel investors, crowdfunding, and government grants all providing pathways for startup financing.`;
    }
    
    // Default content for other URLs
    return `# Exploring New Horizons in Digital Innovation

The digital landscape continues to evolve at an unprecedented pace, bringing new opportunities and challenges for individuals and organizations alike.

## Innovation Drivers

Technology advancement is accelerating across multiple domains, creating new possibilities for solving complex problems and improving quality of life.

## Industry Transformation

Traditional industries are being disrupted by digital-first approaches that prioritize user experience, efficiency, and sustainability.

## Future Outlook

The next decade promises even more dramatic changes as emerging technologies mature and converge to create entirely new categories of products and services.

## Adaptation Strategies

Success in this rapidly changing environment requires continuous learning, flexibility, and a willingness to embrace new approaches to traditional challenges.`;
  };

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
    
    // Simulate content extraction with different content based on URL
    setTimeout(() => {
      const mockContent = generateMockContent(blogUrl);
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
