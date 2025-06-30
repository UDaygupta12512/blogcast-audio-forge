
import React from 'react';
import PodcastGenerator from '../components/PodcastGenerator';
import Header from '../components/Header';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <PodcastGenerator />
      </main>
    </div>
  );
};

export default Index;
