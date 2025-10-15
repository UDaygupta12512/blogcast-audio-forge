import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import AnalyticsOverview from '@/components/analytics/AnalyticsOverview';
import PodcastPerformance from '@/components/analytics/PodcastPerformance';
import AudienceInsights from '@/components/analytics/AudienceInsights';

const Analytics = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      setAnalyticsLoading(false);
    }
  }, [user]);

  if (loading || analyticsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-blue-900/20">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track your podcast performance and audience insights
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="audience" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Audience
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AnalyticsOverview />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PodcastPerformance />
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <AudienceInsights />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Analytics;
