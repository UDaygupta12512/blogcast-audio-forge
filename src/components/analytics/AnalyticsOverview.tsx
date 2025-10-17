import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Users, Clock, TrendingUp } from 'lucide-react';

interface Stats {
  totalPlays: number;
  totalListeners: number;
  avgListenTime: number;
  weeklyGrowth: number;
}

const AnalyticsOverview = () => {
  const [stats, setStats] = useState<Stats>({
    totalPlays: 0,
    totalListeners: 0,
    avgListenTime: 0,
    weeklyGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  const fetchOverviewStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's podcasts
      const { data: podcasts } = await supabase
        .from('podcasts')
        .select('id')
        .eq('user_id', user.id);

      if (!podcasts || podcasts.length === 0) {
        setLoading(false);
        return;
      }

      const podcastIds = podcasts.map(p => p.id);

      // Get analytics data
      const { data: analytics } = await supabase
        .from('podcast_analytics')
        .select('*')
        .in('podcast_id', podcastIds);

      if (analytics) {
        const playEvents = analytics.filter(a => a.event_type === 'play');
        const uniqueListeners = new Set(analytics.map(a => a.user_id).filter(Boolean)).size;
        const totalDuration = analytics.reduce((sum, a) => sum + (a.listen_duration || 0), 0);
        const avgDuration = playEvents.length > 0 ? totalDuration / playEvents.length : 0;

        // Calculate weekly growth
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const thisWeekPlays = analytics.filter(a => 
          a.event_type === 'play' && new Date(a.timestamp) >= oneWeekAgo
        ).length;
        const lastWeekPlays = playEvents.length - thisWeekPlays;
        const growth = lastWeekPlays > 0 ? ((thisWeekPlays - lastWeekPlays) / lastWeekPlays) * 100 : 0;

        setStats({
          totalPlays: playEvents.length,
          totalListeners: uniqueListeners,
          avgListenTime: Math.round(avgDuration),
          weeklyGrowth: Math.round(growth),
        });
      }
    } catch (error) {
      console.error('Error fetching overview stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Plays',
      value: stats.totalPlays,
      icon: Play,
      description: 'All-time plays',
      color: 'text-purple-400',
    },
    {
      title: 'Unique Listeners',
      value: stats.totalListeners,
      icon: Users,
      description: 'Total audience',
      color: 'text-pink-400',
    },
    {
      title: 'Avg. Listen Time',
      value: `${stats.avgListenTime}s`,
      icon: Clock,
      description: 'Per session',
      color: 'text-blue-400',
    },
    {
      title: 'Weekly Growth',
      value: `${stats.weeklyGrowth > 0 ? '+' : ''}${stats.weeklyGrowth}%`,
      icon: TrendingUp,
      description: 'Last 7 days',
      color: stats.weeklyGrowth >= 0 ? 'text-green-400' : 'text-red-400',
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-purple-500/20 bg-black/40 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">...</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const hasAnyData = stats.totalPlays > 0 || stats.totalListeners > 0;

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-purple-500/20 bg-black/40 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!hasAnyData && (
        <Card className="border-purple-500/20 bg-black/40 backdrop-blur mt-6">
          <CardContent className="text-center py-12">
            <Play className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Analytics Data Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your audience by:
            </p>
            <div className="text-left max-w-md mx-auto space-y-2 text-sm text-muted-foreground">
              <p>• Creating and publishing your podcasts</p>
              <p>• Sharing your podcasts publicly</p>
              <p>• Promoting them on social media</p>
              <p>• Engaging with the community</p>
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              Analytics will automatically track when people listen to your podcasts
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default AnalyticsOverview;
