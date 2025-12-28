import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, PenTool, FileText, Share2, Mail, Sparkles, ArrowLeft, Library } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlogGenerator from '@/components/ai-tools/BlogGenerator';
import SocialCaptionGenerator from '@/components/ai-tools/SocialCaptionGenerator';
import EmailWriter from '@/components/ai-tools/EmailWriter';
import ContentRepurposer from '@/components/ai-tools/ContentRepurposer';
import TemplateLibrary from '@/components/ai-tools/TemplateLibrary';

const AIWritingTools = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('templates');

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!user) return null;

  const tools = [
    { id: 'templates', label: 'Templates', icon: Library, description: 'Pre-made templates for quick starts' },
    { id: 'blog', label: 'Blog Generator', icon: FileText, description: 'Generate SEO-optimized blog posts' },
    { id: 'social', label: 'Social Captions', icon: Share2, description: 'Create viral social media content' },
    { id: 'email', label: 'Email Writer', icon: Mail, description: 'Craft professional emails' },
    { id: 'repurpose', label: 'Repurposer', icon: Sparkles, description: 'Transform podcasts into blogs & more' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-3">
                <PenTool className="w-10 h-10 text-purple-400" />
                AI Writing Tools
              </h1>
              <p className="text-muted-foreground mt-2">
                Powerful AI tools to create, repurpose, and enhance your content
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 max-w-3xl">
              {tools.map((tool) => (
                <TabsTrigger key={tool.id} value={tool.id} className="flex items-center gap-2">
                  <tool.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tool.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="mt-8">
              <TabsContent value="templates">
                <TemplateLibrary />
              </TabsContent>
              <TabsContent value="blog">
                <BlogGenerator />
              </TabsContent>
              <TabsContent value="social">
                <SocialCaptionGenerator />
              </TabsContent>
              <TabsContent value="email">
                <EmailWriter />
              </TabsContent>
              <TabsContent value="repurpose">
                <ContentRepurposer />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AIWritingTools;
