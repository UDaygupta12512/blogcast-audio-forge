import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Smartphone } from 'lucide-react';

interface AudienceData {
  countries: { [key: string]: number };
  devices: { [key: string]: number };
}

const AudienceInsights = () => {
  const [audience, setAudience] = useState<AudienceData>({
    countries: {},
    devices: {},
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
        .select('country, device_type')
        .in('podcast_id', podcastIds);

      if (analytics) {
        const countries: { [key: string]: number } = {};
        const devices: { [key: string]: number } = {};

        analytics.forEach((item) => {
          if (item.country) {
            countries[item.country] = (countries[item.country] || 0) + 1;
          }
          if (item.device_type) {
            devices[item.device_type] = (devices[item.device_type] || 0) + 1;
          }
        });

        setAudience({ countries, devices });
      }
    } catch (error) {
      console.error('Error fetching audience data:', error);
    } finally {
      setLoading(false);
    }
  };

  const topCountries = Object.entries(audience.countries)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topDevices = Object.entries(audience.devices)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const hasData = topCountries.length > 0 || topDevices.length > 0;

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-purple-500/20 bg-black/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              Top Countries
            </CardTitle>
            <CardDescription>Where your listeners are from</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : topCountries.length === 0 ? (
              <div className="text-center py-8">
                <Globe className="w-8 h-8 text-purple-400/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No location data available yet</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Geographic data will appear once listeners interact with your podcasts
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {topCountries.map(([country, count]) => {
                  const total = Object.values(audience.countries).reduce((a, b) => a + b, 0);
                  const percentage = Math.round((count / total) * 100);
                  return (
                    <div key={country}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{country || 'Unknown'}</span>
                        <span className="text-muted-foreground">{percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-black/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-pink-400" />
              Device Types
            </CardTitle>
            <CardDescription>How your audience listens</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : topDevices.length === 0 ? (
              <div className="text-center py-8">
                <Smartphone className="w-8 h-8 text-pink-400/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No device data available yet</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Device analytics will show when people start listening
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {topDevices.map(([device, count]) => {
                  const total = Object.values(audience.devices).reduce((a, b) => a + b, 0);
                  const percentage = Math.round((count / total) * 100);
                  return (
                    <div key={device}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{device || 'Unknown'}</span>
                        <span className="text-muted-foreground">{percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-pink-500 to-blue-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {!loading && !hasData && (
        <Card className="border-purple-500/20 bg-black/40 backdrop-blur mt-6">
          <CardContent className="text-center py-12">
            <div className="flex justify-center gap-4 mb-4">
              <Globe className="w-10 h-10 text-purple-400 opacity-50" />
              <Smartphone className="w-10 h-10 text-pink-400 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Build Your Audience</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Your audience insights will appear here once listeners start engaging with your podcasts
            </p>
            <div className="text-left max-w-md mx-auto space-y-2 text-sm text-muted-foreground">
              <p>📍 <strong>Geographic Data:</strong> See where your listeners are located worldwide</p>
              <p>📱 <strong>Device Analytics:</strong> Understand how people access your content</p>
              <p>📊 <strong>Real-time Tracking:</strong> Watch your audience grow in real-time</p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default AudienceInsights;
