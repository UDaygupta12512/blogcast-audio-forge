import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Trophy, Calendar, Users, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface Challenge {
  id: string;
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

interface Submission {
  id: string;
  challenge_id: string;
  podcast_id: string;
  user_id: string;
  created_at: string;
  podcasts: {
    title: string;
  };
}

const CommunityChallenges: React.FC = () => {
  const { session } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [myPodcasts, setMyPodcasts] = useState<any[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<string>('');
  const [selectedPodcast, setSelectedPodcast] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadChallenges();
    if (session?.user) {
      loadMyPodcasts();
    }
  }, [session]);

  useEffect(() => {
    if (selectedChallenge) {
      loadSubmissions(selectedChallenge);
    }
  }, [selectedChallenge]);

  const loadChallenges = async () => {
    const { data, error } = await supabase
      .from('community_challenges')
      .select('*')
      .eq('is_active', true)
      .order('start_date', { ascending: false });

    if (!error && data) {
      setChallenges(data);
      if (data.length > 0) {
        setSelectedChallenge(data[0].id);
      }
    }
  };

  const loadMyPodcasts = async () => {
    const { data, error } = await supabase
      .from('podcasts')
      .select('id, title')
      .eq('user_id', session?.user.id)
      .eq('is_public', true);

    if (!error && data) {
      setMyPodcasts(data);
    }
  };

  const loadSubmissions = async (challengeId: string) => {
    const { data, error } = await supabase
      .from('challenge_submissions')
      .select(`
        *,
        podcasts (
          title
        )
      `)
      .eq('challenge_id', challengeId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSubmissions(data as any);
    }
  };

  const submitToChallenge = async () => {
    if (!selectedPodcast || !selectedChallenge) {
      toast.error('Please select a podcast');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('challenge_submissions')
        .insert({
          challenge_id: selectedChallenge,
          podcast_id: selectedPodcast,
          user_id: session?.user.id
        });

      if (error) throw error;

      toast.success('Podcast submitted to challenge!');
      loadSubmissions(selectedChallenge);
      setSelectedPodcast('');
    } catch (error: any) {
      console.error('Error submitting:', error);
      if (error.code === '23505') {
        toast.error('You already submitted this podcast to this challenge');
      } else {
        toast.error('Failed to submit podcast');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedChallengeData = challenges.find(c => c.id === selectedChallenge);

  return (
    <Card className="p-6 glass border-white/10">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Community Challenges</h3>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active Challenges</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {challenges.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <Trophy className="w-12 h-12 mx-auto text-muted-foreground opacity-50" />
                <div>
                  <p className="text-sm font-medium">No active challenges at the moment</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Check back soon for new weekly themed challenges!
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Select value={selectedChallenge} onValueChange={setSelectedChallenge}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {challenges.map((challenge) => (
                      <SelectItem key={challenge.id} value={challenge.id}>
                        {challenge.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedChallengeData && (
                  <Card className="p-4 bg-background/50 border-white/10">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{selectedChallengeData.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedChallengeData.description}
                          </p>
                        </div>
                        <Badge className="ml-2">
                          {selectedChallengeData.theme}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(selectedChallengeData.start_date), 'MMM d')} - {format(new Date(selectedChallengeData.end_date), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {submissions.length} submissions
                        </div>
                      </div>

                      {session?.user && (
                        <div className="space-y-3 pt-3 border-t border-white/10">
                          <Select value={selectedPodcast} onValueChange={setSelectedPodcast}>
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

                          <Button 
                            onClick={submitToChallenge} 
                            disabled={isLoading || !selectedPodcast}
                            className="w-full"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Submit to Challenge
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">🎯 About Challenges:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Weekly themed challenges to inspire your content</li>
                      <li>• Submit your best AI-generated podcast episodes</li>
                      <li>• Compete with other creators in the community</li>
                      <li>• Get discovered and grow your audience</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="submissions" className="space-y-3">
            {submissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No submissions yet for this challenge
              </p>
            ) : (
              submissions.map((submission) => (
                <Card key={submission.id} className="p-4 bg-background/50 border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">{submission.podcasts.title}</h5>
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted {format(new Date(submission.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Trophy className="w-4 h-4 text-primary" />
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

export default CommunityChallenges;
