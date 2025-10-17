import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, MessageSquare, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PodcastData } from '@/components/PodcastGenerator';

interface PublicPodcast extends PodcastData {
  id: string;
  createdAt: string;
  language?: string;
  template?: string;
  user_email?: string;
}

const Discover = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [podcasts, setPodcasts] = useState<PublicPodcast[]>([]);
  const [loadingPodcasts, setLoadingPodcasts] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadPublicPodcasts();
    }
  }, [user]);

  const loadPublicPodcasts = async () => {
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data) {
        const formattedPodcasts: PublicPodcast[] = data.map((podcast) => ({
          id: podcast.id,
          title: podcast.title,
          script: podcast.script,
          duration: podcast.duration || '0:00',
          voice: podcast.voice || 'default',
          music: podcast.music || undefined,
          audioUrl: podcast.audio_url || 'browser-speech-synthesis',
          language: podcast.language,
          template: podcast.template,
          createdAt: podcast.created_at,
        }));

        setPodcasts(formattedPodcasts);
      }
    } catch (error) {
      console.error('Error loading public podcasts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load public podcasts',
        variant: 'destructive',
      });
    } finally {
      setLoadingPodcasts(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Discover Podcasts
          </h1>
          <p className="text-muted-foreground">
            Explore podcasts shared by the community
          </p>
        </div>

        {loadingPodcasts ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
            <p className="text-muted-foreground mt-4">Loading podcasts...</p>
          </div>
        ) : podcasts.length === 0 ? (
          <Card className="border-purple-500/20 bg-black/40 backdrop-blur">
            <CardContent className="text-center py-16">
              <Play className="w-16 h-16 text-purple-400 mx-auto mb-6 opacity-50" />
              <h3 className="text-2xl font-bold mb-3">No Public Podcasts Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                The community hasn't shared any podcasts yet. Be the first to create and share your podcast!
              </p>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6 max-w-lg mx-auto">
                <h4 className="font-semibold mb-3 text-purple-400">How to Share Your Podcast:</h4>
                <div className="text-left space-y-2 text-sm text-muted-foreground">
                  <p>1. Create a podcast from the home page</p>
                  <p>2. Go to your Podcast Library</p>
                  <p>3. Toggle "Make Public" on your podcast</p>
                  <p>4. Your podcast will appear here for everyone to discover!</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/')} 
                className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Create Your First Podcast
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {podcasts.map((podcast) => (
              <Card
                key={podcast.id}
                className="border-purple-500/20 bg-black/40 backdrop-blur hover:border-purple-400/40 transition-all"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{podcast.title}</CardTitle>
                    <Badge variant="secondary" className="shrink-0">
                      {podcast.language || 'en-US'}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-3">
                    {podcast.script.substring(0, 150)}...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{podcast.duration}</span>
                    </div>
                    <Badge variant="outline">{podcast.template || 'standard'}</Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    onClick={() => {
                      // In a real implementation, this would open a player modal or navigate to a podcast page
                      toast({
                        title: 'Coming Soon',
                        description: 'Podcast player will be available soon!',
                      });
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Listen Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Discover;
