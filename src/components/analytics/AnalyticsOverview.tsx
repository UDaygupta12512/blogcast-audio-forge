import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Users, Clock, TrendingUp, Share2, Download, Headphones, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  totalPlays: number;
  totalListeners: number;
  avgListenTime: number;
  weeklyGrowth: number;
  totalShares: number;
  totalDownloads: number;
  completionRate: number;
}

interface ChartData {
  date: string;
  plays: number;
  listeners: number;
}

const AnalyticsOverview = () => {
  const [stats, setStats] = useState<Stats>({
    totalPlays: 0,
    totalListeners: 0,
    avgListenTime: 0,
    weeklyGrowth: 0,
    totalShares: 0,
    totalDownloads: 0,
    completionRate: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewStats();
  }, [timeRange]);

  const getDateRange = () => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return { startDate, days };
  };

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
      const { startDate, days } = getDateRange();

      // Get analytics data
      const { data: analytics } = await supabase
        .from('podcast_analytics')
        .select('*')
        .in('podcast_id', podcastIds)
        .gte('timestamp', startDate.toISOString());

      // Get all-time analytics for comparison
      const { data: allAnalytics } = await supabase
        .from('podcast_analytics')
        .select('*')
        .in('podcast_id', podcastIds);

      if (analytics && allAnalytics) {
        const playEvents = analytics.filter(a => a.event_type === 'play');
        const completeEvents = analytics.filter(a => a.event_type === 'complete');
        const shareEvents = analytics.filter(a => a.event_type === 'share');
        const downloadEvents = analytics.filter(a => a.event_type === 'download');
        const uniqueListeners = new Set(analytics.map(a => a.session_id)).size;
        const totalDuration = analytics.reduce((sum, a) => sum + (a.listen_duration || 0), 0);
        const avgDuration = playEvents.length > 0 ? totalDuration / playEvents.length : 0;
        const completionRate = playEvents.length > 0 ? (completeEvents.length / playEvents.length) * 100 : 0;

        // Calculate weekly growth
        const halfPeriod = Math.floor(days / 2);
        const midDate = new Date(startDate.getTime() + halfPeriod * 24 * 60 * 60 * 1000);
        const firstHalfPlays = analytics.filter(a => 
          a.event_type === 'play' && new Date(a.timestamp) < midDate
        ).length;
        const secondHalfPlays = analytics.filter(a => 
          a.event_type === 'play' && new Date(a.timestamp) >= midDate
        ).length;
        const growth = firstHalfPlays > 0 ? ((secondHalfPlays - firstHalfPlays) / firstHalfPlays) * 100 : 0;

        setStats({
          totalPlays: playEvents.length,
          totalListeners: uniqueListeners,
          avgListenTime: Math.round(avgDuration),
          weeklyGrowth: Math.round(growth),
          totalShares: shareEvents.length,
          totalDownloads: downloadEvents.length,
          completionRate: Math.round(completionRate),
        });

        // Build chart data
        const chartDataMap: { [key: string]: { plays: number; listeners: Set<string> } } = {};
        for (let i = 0; i < days; i++) {
          const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
          const dateStr = date.toISOString().split('T')[0];
          chartDataMap[dateStr] = { plays: 0, listeners: new Set() };
        }

        analytics.forEach(event => {
          const dateStr = new Date(event.timestamp).toISOString().split('T')[0];
          if (chartDataMap[dateStr]) {
            if (event.event_type === 'play') {
              chartDataMap[dateStr].plays++;
            }
            chartDataMap[dateStr].listeners.add(event.session_id);
          }
        });

        const chartArray = Object.entries(chartDataMap).map(([date, data]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          plays: data.plays,
          listeners: data.listeners.size,
        }));

        setChartData(chartArray);
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
      description: `Last ${timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : '90 days'}`,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Unique Listeners',
      value: stats.totalListeners,
      icon: Headphones,
      description: 'By session',
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
    },
    {
      title: 'Avg. Listen Time',
      value: `${Math.floor(stats.avgListenTime / 60)}m ${stats.avgListenTime % 60}s`,
      icon: Clock,
      description: 'Per session',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Growth',
      value: `${stats.weeklyGrowth > 0 ? '+' : ''}${stats.weeklyGrowth}%`,
      icon: TrendingUp,
      description: 'vs previous period',
      color: stats.weeklyGrowth >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: stats.weeklyGrowth >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: Users,
      description: 'Finished listening',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Shares',
      value: stats.totalShares,
      icon: Share2,
      description: 'Social shares',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Downloads',
      value: stats.totalDownloads,
      icon: Download,
      description: 'Total downloads',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {statCards.slice(0, 7).map((stat) => (
            <Card key={stat.title} className="border-purple-500/20 bg-black/40 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-muted-foreground">...</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const hasAnyData = stats.totalPlays > 0 || stats.totalListeners > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Performance Overview</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-purple-500/20 bg-black/40 backdrop-blur hover:border-purple-500/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasAnyData && chartData.length > 0 && (
        <Card className="border-purple-500/20 bg-black/40 backdrop-blur">
          <CardHeader>
            <CardTitle>Plays Over Time</CardTitle>
            <CardDescription>Daily plays and unique listeners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorListeners" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#888" 
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#888" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.9)', 
                      border: '1px solid rgba(168,85,247,0.3)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="plays" 
                    stroke="#a855f7" 
                    fillOpacity={1} 
                    fill="url(#colorPlays)"
                    name="Plays"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="listeners" 
                    stroke="#ec4899" 
                    fillOpacity={1} 
                    fill="url(#colorListeners)"
                    name="Listeners"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
};

export default AnalyticsOverview;