import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Globe, Smartphone, Monitor, Tablet, Clock, Users } from 'lucide-react';

interface AudienceData {
  countries: { name: string; value: number }[];
  devices: { name: string; value: number }[];
  hourlyActivity: { hour: string; plays: number }[];
  engagementSegments: { name: string; value: number }[];
}

const AudienceInsights = () => {
  const [audience, setAudience] = useState<AudienceData>({
    countries: [],
    devices: [],
    hourlyActivity: [],
    engagementSegments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAudienceData();
  }, []);

  const fetchAudienceData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: podcasts } = await supabase
        .from('podcasts')
        .select('id')
        .eq('user_id', user.id);

      if (!podcasts || podcasts.length === 0) {
        setLoading(false);
        return;
      }

      const podcastIds = podcasts.map(p => p.id);

      const { data: analytics } = await supabase
        .from('podcast_analytics')
        .select('country, device_type, timestamp, listen_duration, event_type, session_id')
        .in('podcast_id', podcastIds);

      if (analytics) {
        // Process countries
        const countryCounts: { [key: string]: number } = {};
        analytics.forEach((item) => {
          const country = item.country || 'Unknown';
          countryCounts[country] = (countryCounts[country] || 0) + 1;
        });
        const countries = Object.entries(countryCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 6);

        // Process devices
        const deviceCounts: { [key: string]: number } = {};
        analytics.forEach((item) => {
          const device = item.device_type || 'Unknown';
          deviceCounts[device] = (deviceCounts[device] || 0) + 1;
        });
        const devices = Object.entries(deviceCounts)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);

        // Process hourly activity
        const hourlyCounts: { [key: number]: number } = {};
        for (let i = 0; i < 24; i++) hourlyCounts[i] = 0;
        analytics.filter(a => a.event_type === 'play').forEach((item) => {
          const hour = new Date(item.timestamp).getHours();
          hourlyCounts[hour]++;
        });
        const hourlyActivity = Object.entries(hourlyCounts).map(([hour, plays]) => ({
          hour: `${hour.padStart(2, '0')}:00`,
          plays,
        }));

        // Process engagement segments
        const sessionDurations: { [key: string]: number } = {};
        analytics.forEach((item) => {
          if (item.listen_duration) {
            sessionDurations[item.session_id] = (sessionDurations[item.session_id] || 0) + item.listen_duration;
          }
        });
        const durations = Object.values(sessionDurations);
        const segments = {
          'Quick (<1m)': durations.filter(d => d < 60).length,
          'Short (1-5m)': durations.filter(d => d >= 60 && d < 300).length,
          'Medium (5-15m)': durations.filter(d => d >= 300 && d < 900).length,
          'Long (15m+)': durations.filter(d => d >= 900).length,
        };
        const engagementSegments = Object.entries(segments)
          .map(([name, value]) => ({ name, value }))
          .filter(s => s.value > 0);

        setAudience({ countries, devices, hourlyActivity, engagementSegments });
      }
    } catch (error) {
      console.error('Error fetching audience data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deviceColors = ['#a855f7', '#ec4899', '#3b82f6', '#10b981'];
  const engagementColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const hasData = audience.countries.length > 0 || audience.devices.length > 0;

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-purple-500/20 bg-black/40 backdrop-blur">
            <CardHeader>
              <div className="h-6 bg-gray-700/50 rounded w-32 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Device Distribution */}
        <Card className="border-purple-500/20 bg-black/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-400" />
              Device Distribution
            </CardTitle>
            <CardDescription>How your audience listens</CardDescription>
          </CardHeader>
          <CardContent>
            {audience.devices.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center">
                <Smartphone className="w-10 h-10 text-purple-400/30 mb-3" />
                <p className="text-sm text-muted-foreground">No device data yet</p>
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={audience.devices}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {audience.devices.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={deviceColors[index % deviceColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.9)', 
                        border: '1px solid rgba(168,85,247,0.3)',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend 
                      formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Engagement Segments */}
        <Card className="border-purple-500/20 bg-black/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-400" />
              Listener Engagement
            </CardTitle>
            <CardDescription>Session duration distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {audience.engagementSegments.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center">
                <Users className="w-10 h-10 text-pink-400/30 mb-3" />
                <p className="text-sm text-muted-foreground">No engagement data yet</p>
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={audience.engagementSegments}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {audience.engagementSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={engagementColors[index % engagementColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.9)', 
                        border: '1px solid rgba(168,85,247,0.3)',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend 
                      formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Peak Listening Hours */}
        <Card className="border-purple-500/20 bg-black/40 backdrop-blur md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              Peak Listening Hours
            </CardTitle>
            <CardDescription>When your audience tunes in (24-hour format)</CardDescription>
          </CardHeader>
          <CardContent>
            {audience.hourlyActivity.every(h => h.plays === 0) ? (
              <div className="h-[200px] flex flex-col items-center justify-center">
                <Clock className="w-10 h-10 text-blue-400/30 mb-3" />
                <p className="text-sm text-muted-foreground">No activity data yet</p>
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={audience.hourlyActivity} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="hour" 
                      stroke="#888" 
                      fontSize={10}
                      interval={2}
                    />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.9)', 
                        border: '1px solid rgba(59,130,246,0.3)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="plays" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card className="border-purple-500/20 bg-black/40 backdrop-blur md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              Geographic Distribution
            </CardTitle>
            <CardDescription>Where your listeners are located</CardDescription>
          </CardHeader>
          <CardContent>
            {audience.countries.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center">
                <Globe className="w-10 h-10 text-emerald-400/30 mb-3" />
                <p className="text-sm text-muted-foreground">No geographic data yet</p>
                <p className="text-xs text-muted-foreground mt-1">Location data will appear as listeners engage</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {audience.countries.map((country, index) => {
                  const total = audience.countries.reduce((sum, c) => sum + c.value, 0);
                  const percentage = Math.round((country.value / total) * 100);
                  return (
                    <div key={country.name} className="p-4 rounded-lg bg-black/30 border border-purple-500/10">
                      <div className="text-2xl font-bold text-emerald-400">{percentage}%</div>
                      <div className="text-sm text-muted-foreground truncate">{country.name}</div>
                      <div className="text-xs text-muted-foreground">{country.value} plays</div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {!hasData && (
        <Card className="border-purple-500/20 bg-black/40 backdrop-blur">
          <CardContent className="text-center py-12">
            <div className="flex justify-center gap-4 mb-4">
              <Globe className="w-10 h-10 text-purple-400 opacity-50" />
              <Smartphone className="w-10 h-10 text-pink-400 opacity-50" />
              <Clock className="w-10 h-10 text-blue-400 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Build Your Audience</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Your audience insights will appear here once listeners start engaging with your podcasts
            </p>
            <div className="text-left max-w-md mx-auto space-y-2 text-sm text-muted-foreground">
              <p>📍 <strong>Geographic Data:</strong> See where your listeners are located worldwide</p>
              <p>📱 <strong>Device Analytics:</strong> Understand how people access your content</p>
              <p>⏰ <strong>Peak Hours:</strong> Know the best times to publish new episodes</p>
              <p>👥 <strong>Engagement:</strong> Track how long listeners stay tuned in</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AudienceInsights;