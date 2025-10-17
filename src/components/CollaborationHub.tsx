import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Users, Send, Check, X, Loader2, Podcast } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';

interface Collaboration {
  id: string;
  creator_one_id: string;
  creator_two_id: string;
  podcast_one_id: string;
  podcast_two_id: string;
  collab_podcast_id: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
}

interface UserPodcast {
  id: string;
  title: string;
  user_id: string;
}

const CollaborationHub: React.FC = () => {
  const { session } = useAuth();
  const [myPodcasts, setMyPodcasts] = useState<UserPodcast[]>([]);
  const [publicPodcasts, setPublicPodcasts] = useState<UserPodcast[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMyPodcast, setSelectedMyPodcast] = useState<string>('');
  const [selectedPublicPodcast, setSelectedPublicPodcast] = useState<string>('');

  useEffect(() => {
    if (session?.user) {
      loadMyPodcasts();
      loadPublicPodcasts();
      loadCollaborations();
    }
  }, [session]);

  const loadMyPodcasts = async () => {
    const { data, error } = await supabase
      .from('podcasts')
      .select('id, title, user_id')
      .eq('user_id', session?.user.id)
      .eq('is_public', true);

    if (!error && data) {
      setMyPodcasts(data);
    }
  };

  const loadPublicPodcasts = async () => {
    const { data, error } = await supabase
      .from('podcasts')
      .select('id, title, user_id')
      .eq('is_public', true)
      .neq('user_id', session?.user.id)
      .limit(20);

    if (!error && data) {
      setPublicPodcasts(data);
    }
  };

  const loadCollaborations = async () => {
    const { data, error } = await supabase
      .from('podcast_collaborations')
      .select('*')
      .or(`creator_one_id.eq.${session?.user.id},creator_two_id.eq.${session?.user.id}`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCollaborations(data as Collaboration[]);
    }
  };

  const sendCollabRequest = async () => {
    if (!selectedMyPodcast || !selectedPublicPodcast) {
      toast.error('Please select both podcasts');
      return;
    }

    setIsLoading(true);
    try {
      const publicPodcast = publicPodcasts.find(p => p.id === selectedPublicPodcast);
      
      const { error } = await supabase
        .from('podcast_collaborations')
        .insert({
          creator_one_id: session?.user.id,
          creator_two_id: publicPodcast?.user_id,
          podcast_one_id: selectedMyPodcast,
          podcast_two_id: selectedPublicPodcast,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Collaboration request sent!');
      loadCollaborations();
      setSelectedMyPodcast('');
      setSelectedPublicPodcast('');
    } catch (error) {
      console.error('Error sending request:', error);
      toast.error('Failed to send collaboration request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCollabResponse = async (collabId: string, accept: boolean) => {
    setIsLoading(true);
    try {
      if (accept) {
        // Call edge function to merge podcasts
        const { data, error } = await supabase.functions.invoke('merge-podcasts', {
          body: { collaborationId: collabId }
        });

        if (error) throw error;

        toast.success('Collaboration accepted! Generating merged episode...');
      } else {
        const { error } = await supabase
          .from('podcast_collaborations')
          .update({ status: 'rejected' })
          .eq('id', collabId);

        if (error) throw error;
        toast.success('Collaboration request declined');
      }

      loadCollaborations();
    } catch (error) {
      console.error('Error handling response:', error);
      toast.error('Failed to process collaboration');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      accepted: 'default',
      rejected: 'destructive',
      completed: 'default'
    };
    return <Badge variant={variants[status as keyof typeof variants] as any}>{status}</Badge>;
  };

  return (
    <Card className="p-6 glass border-white/10">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">AI Collaboration Hub</h3>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Collab</TabsTrigger>
            <TabsTrigger value="requests">My Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            {myPodcasts.length === 0 || publicPodcasts.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <Users className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
                <div>
                  <p className="text-sm font-medium">No podcasts available for collaboration</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {myPodcasts.length === 0 
                      ? "Create and publish a podcast first to start collaborating"
                      : "Waiting for other creators to publish public podcasts"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Podcast</label>
                  <Select value={selectedMyPodcast} onValueChange={setSelectedMyPodcast}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your podcast" />
                    </SelectTrigger>
                    <SelectContent>
                      {myPodcasts.map((podcast) => (
                        <SelectItem key={podcast.id} value={podcast.id}>
                          {podcast.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose one of your public podcasts ({myPodcasts.length} available)
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Collaborate With</label>
                  <Select value={selectedPublicPodcast} onValueChange={setSelectedPublicPodcast}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a podcast to collaborate" />
                    </SelectTrigger>
                    <SelectContent>
                      {publicPodcasts.map((podcast) => (
                        <SelectItem key={podcast.id} value={podcast.id}>
                          {podcast.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {publicPodcasts.length} public podcasts from other creators
                  </p>
                </div>

                <Button 
                  onClick={sendCollabRequest} 
                  disabled={isLoading || !selectedMyPodcast || !selectedPublicPodcast}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Collaboration Request
                    </>
                  )}
                </Button>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">✨ How it works:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Select your podcast and a collaborator's podcast</li>
                      <li>• Send a collaboration request to the creator</li>
                      <li>• When accepted, AI merges both into a co-hosted episode</li>
                      <li>• Both voices are used to create a natural conversation</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-3">
            {collaborations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No collaboration requests yet
              </p>
            ) : (
              collaborations.map((collab) => (
                <Card key={collab.id} className="p-4 bg-background/50 border-white/10">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Podcast className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Collaboration</span>
                      </div>
                      {getStatusBadge(collab.status)}
                    </div>
                    
                    {collab.status === 'pending' && collab.creator_two_id === session?.user.id && (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleCollabResponse(collab.id, true)}
                          disabled={isLoading}
                          size="sm"
                          className="flex-1"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button 
                          onClick={() => handleCollabResponse(collab.id, false)}
                          disabled={isLoading}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};

export default CollaborationHub;
