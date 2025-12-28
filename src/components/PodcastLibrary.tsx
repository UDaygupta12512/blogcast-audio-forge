import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Play, Download, Share2, Clock, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PodcastData } from './PodcastGenerator';
import { supabase } from '@/integrations/supabase/client';

interface SavedPodcast extends PodcastData {
  id: string;
  createdAt: string;
  language?: string;
  template?: string;
}

interface PodcastLibraryProps {
  onLoadPodcast: (podcast: PodcastData) => void;
}

const PodcastLibrary: React.FC<PodcastLibraryProps> = ({ onLoadPodcast }) => {
  const [savedPodcasts, setSavedPodcasts] = useState<SavedPodcast[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadPodcasts();
  }, []);

  const loadPodcasts = async () => {
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = data.map(p => ({
        id: p.id,
        title: p.title,
        script: p.script,
        duration: p.duration || '5:00',
        voice: p.voice,
        music: p.music,
        audioUrl: p.audio_url || undefined,
        createdAt: p.created_at,
        language: p.language || 'en-US',
        template: p.template || 'standard',
      }));

      setSavedPodcasts(formatted);
    } catch (error) {
      console.error('Error loading podcasts:', error);
      toast({
        title: "Error loading podcasts",
        description: "Failed to load your podcast library",
        variant: "destructive",
      });
    }
  };

  const deletePodcast = async (id: string) => {
    try {
      const { error } = await supabase
        .from('podcasts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSavedPodcasts(prev => prev.filter(p => p.id !== id));
      
      toast({
        title: "Podcast deleted",
        description: "Successfully removed from your library",
      });
    } catch (error) {
      console.error('Error deleting podcast:', error);
      toast({
        title: "Error",
        description: "Failed to delete podcast",
        variant: "destructive",
      });
    }
  };

  const sharePodcast = async (podcast: SavedPodcast) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: podcast.title,
          text: `Listen to my podcast: ${podcast.title}`,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(podcast.title);
      toast({
        title: "Copied to Clipboard",
        description: "Podcast title copied!",
      });
    }
  };

  const downloadPodcast = (podcast: SavedPodcast) => {
    if (podcast.audioUrl) {
      const a = document.createElement('a');
      a.href = podcast.audioUrl;
      a.download = `${podcast.title.replace(/[^a-z0-9]/gi, '_')}.wav`;
      a.click();
      toast({
        title: "Downloading",
        description: "Your podcast is being downloaded.",
      });
    }
  };

  if (savedPodcasts.length === 0) {
    return (
      <Card className="p-8 glass border-white/10 text-center">
        <p className="text-muted-foreground">No saved podcasts yet. Create your first podcast!</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold">Your Podcast Library</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedPodcasts.map((podcast) => (
          <Card key={podcast.id} className="p-6 glass border-white/10 hover:border-purple-400/30 transition-all">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg line-clamp-2">{podcast.title}</h4>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {podcast.duration}
                  </Badge>
                  {podcast.language && (
                    <Badge variant="outline" className="text-xs bg-blue-500/10">
                      {podcast.language}
                    </Badge>
                  )}
                  {podcast.template && (
                    <Badge variant="outline" className="text-xs bg-purple-500/10">
                      {podcast.template}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(podcast.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onLoadPodcast(podcast)}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Play
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadPodcast(podcast)}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => sharePodcast(podcast)}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deletePodcast(podcast.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PodcastLibrary;