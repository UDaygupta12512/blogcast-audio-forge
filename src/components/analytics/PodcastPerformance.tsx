import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PodcastStats {
  id: string;
  title: string;
  plays: number;
  completes: number;
  shares: number;
  downloads: number;
  completionRate: number;
}

const PodcastPerformance = () => {
  const [podcastStats, setPodcastStats] = useState<PodcastStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPodcastPerformance();
  }, []);

  const fetchPodcastPerformance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: podcasts } = await supabase
        .from('podcasts')
        .select('id, title')
        .eq('user_id', user.id);

      if (!podcasts) {
        setLoading(false);
        return;
      }

      const stats: PodcastStats[] = [];

      for (const podcast of podcasts) {
        const { data: analytics } = await supabase
          .from('podcast_analytics')
          .select('event_type')
          .eq('podcast_id', podcast.id);

        if (analytics) {
          const plays = analytics.filter(a => a.event_type === 'play').length;
          const completes = analytics.filter(a => a.event_type === 'complete').length;
          const shares = analytics.filter(a => a.event_type === 'share').length;
          const downloads = analytics.filter(a => a.event_type === 'download').length;
          const completionRate = plays > 0 ? (completes / plays) * 100 : 0;

          stats.push({
            id: podcast.id,
            title: podcast.title,
            plays,
            completes,
            shares,
            downloads,
            completionRate: Math.round(completionRate),
          });
        }
      }

      stats.sort((a, b) => b.plays - a.plays);
      setPodcastStats(stats);
    } catch (error) {
      console.error('Error fetching podcast performance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-purple-500/20 bg-black/40 backdrop-blur">
      <CardHeader>
        <CardTitle>Podcast Performance</CardTitle>
        <CardDescription>Detailed metrics for each podcast</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : podcastStats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No analytics data available yet. Create and share your podcasts to see insights!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Podcast</TableHead>
                <TableHead className="text-right">Plays</TableHead>
                <TableHead className="text-right">Completes</TableHead>
                <TableHead className="text-right">Completion Rate</TableHead>
                <TableHead className="text-right">Shares</TableHead>
                <TableHead className="text-right">Downloads</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {podcastStats.map((stat) => (
                <TableRow key={stat.id}>
                  <TableCell className="font-medium">{stat.title}</TableCell>
                  <TableCell className="text-right">{stat.plays}</TableCell>
                  <TableCell className="text-right">{stat.completes}</TableCell>
                  <TableCell className="text-right">
                    <span className={stat.completionRate >= 50 ? 'text-green-400' : 'text-yellow-400'}>
                      {stat.completionRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{stat.shares}</TableCell>
                  <TableCell className="text-right">{stat.downloads}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default PodcastPerformance;
