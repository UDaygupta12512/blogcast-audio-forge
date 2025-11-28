import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PodcastGenerator from '../components/PodcastGenerator';
import Header from '../components/Header';
import CollaborationHub from '../components/CollaborationHub';
import CommunityChallenges from '../components/CommunityChallenges';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const podcastGeneratorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const scrollToPodcastGenerator = () => {
    podcastGeneratorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
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
        <div className="space-y-6">
          <div ref={podcastGeneratorRef}>
            <PodcastGenerator />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CollaborationHub onCreatePodcast={scrollToPodcastGenerator} />
            <CommunityChallenges />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
