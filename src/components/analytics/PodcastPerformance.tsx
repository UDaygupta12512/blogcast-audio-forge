import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Play, Headphones } from 'lucide-react';

interface PodcastStats {
  id: string;
  title: string;
  plays: number;
  completes: number;
  shares: number;
  downloads: number;
  completionRate: number;
  avgListenTime: number;
  trend: 'up' | 'down' | 'stable';
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
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      for (const podcast of podcasts) {
        const { data: analytics } = await supabase
          .from('podcast_analytics')
          .select('event_type, listen_duration, timestamp')
          .eq('podcast_id', podcast.id);

        if (analytics) {
          const plays = analytics.filter(a => a.event_type === 'play').length;
          const completes = analytics.filter(a => a.event_type === 'complete').length;
          const shares = analytics.filter(a => a.event_type === 'share').length;
          const downloads = analytics.filter(a => a.event_type === 'download').length;
          const completionRate = plays > 0 ? (completes / plays) * 100 : 0;
          const totalListenTime = analytics.reduce((sum, a) => sum + (a.listen_duration || 0), 0);
          const avgListenTime = plays > 0 ? totalListenTime / plays : 0;

          // Calculate trend
          const thisWeekPlays = analytics.filter(a => 
            a.event_type === 'play' && new Date(a.timestamp) >= oneWeekAgo
          ).length;
          const lastWeekPlays = analytics.filter(a => 
            a.event_type === 'play' && 
            new Date(a.timestamp) >= twoWeeksAgo && 
            new Date(a.timestamp) < oneWeekAgo
          ).length;

          let trend: 'up' | 'down' | 'stable' = 'stable';
          if (thisWeekPlays > lastWeekPlays) trend = 'up';
          else if (thisWeekPlays < lastWeekPlays) trend = 'down';

          stats.push({
            id: podcast.id,
            title: podcast.title,
            plays,
            completes,
            shares,
            downloads,
            completionRate: Math.round(completionRate),
            avgListenTime: Math.round(avgListenTime),
            trend,
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

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const colors = ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const chartData = podcastStats.slice(0, 6).map((stat, index) => ({
    name: stat.title.length > 15 ? stat.title.substring(0, 15) + '...' : stat.title,
    plays: stat.plays,
    fill: colors[index % colors.length],
  }));

  return (
    <div className="space-y-6">
      {/* Top Podcasts Chart */}
      {podcastStats.length > 0 && (
        <Card className="border-purple-500/20 bg-black/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-purple-400" />
              Top Performing Podcasts
            </CardTitle>
            <CardDescription>Plays by podcast</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                  <XAxis type="number" stroke="#888" fontSize={12} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#888" 
                    fontSize={12}
                    width={120}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.9)', 
                      border: '1px solid rgba(168,85,247,0.3)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="plays" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Table */}
      <Card className="border-purple-500/20 bg-black/40 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-pink-400" />
            Detailed Performance
          </CardTitle>
          <CardDescription>Comprehensive metrics for each podcast</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : podcastStats.length === 0 ? (
            <div className="text-center py-12">
              <Headphones className="w-12 h-12 text-pink-400/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Podcasts Yet</h3>
              <p className="text-muted-foreground">
                Create and share your podcasts to see performance metrics here!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-purple-500/20">
                    <TableHead>Podcast</TableHead>
                    <TableHead className="text-center">Trend</TableHead>
                    <TableHead className="text-right">Plays</TableHead>
                    <TableHead className="text-right">Completion Rate</TableHead>
                    <TableHead className="text-right">Avg. Listen</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead className="text-right">Downloads</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {podcastStats.map((stat, index) => (
                    <TableRow key={stat.id} className="hover:bg-purple-500/5 border-purple-500/10">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className="w-6 h-6 rounded-full flex items-center justify-center p-0 text-xs"
                            style={{ borderColor: colors[index % colors.length], color: colors[index % colors.length] }}
                          >
                            {index + 1}
                          </Badge>
                          <span className="truncate max-w-[200px]">{stat.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getTrendIcon(stat.trend)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">{stat.plays}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Progress 
                            value={stat.completionRate} 
                            className="w-16 h-2"
                          />
                          <span className={`text-sm font-medium ${
                            stat.completionRate >= 70 ? 'text-green-400' : 
                            stat.completionRate >= 40 ? 'text-yellow-400' : 
                            'text-red-400'
                          }`}>
                            {stat.completionRate}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {Math.floor(stat.avgListenTime / 60)}m {stat.avgListenTime % 60}s
                      </TableCell>
                      <TableCell className="text-right">{stat.shares}</TableCell>
                      <TableCell className="text-right">{stat.downloads}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PodcastPerformance;