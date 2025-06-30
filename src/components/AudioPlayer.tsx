
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Play, Pause, Download, Share2, RotateCcw, Volume2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PodcastData } from './PodcastGenerator';

interface AudioPlayerProps {
  podcastData: PodcastData;
  onReset: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ podcastData, onReset }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const { toast } = useToast();

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    
    if (!isPlaying) {
      // Simulate playback progress
      const interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= 332) { // 5:32 in seconds
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    toast({
      title: "Download Started",
      description: "Your podcast episode is being prepared for download.",
    });
  };

  const handleShare = () => {
    toast({
      title: "Share Link Copied",
      description: "Podcast share link has been copied to your clipboard.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-semibold mb-2">Your Podcast is Ready!</h3>
        <p className="text-muted-foreground">
          Listen to your AI-generated podcast episode
        </p>
      </div>

      <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-purple-200">{podcastData.title}</h4>
            <p className="text-sm text-muted-foreground">Duration: {podcastData.duration}</p>
          </div>

          <div className="flex items-center justify-center">
            <div className="flex space-x-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isPlaying 
                      ? 'h-8 bg-gradient-to-t from-purple-500 to-blue-400 waveform-bar' 
                      : 'h-4 bg-muted'
                  }`}
                  style={{ 
                    animationDelay: `${i * 0.05}s`,
                    height: isPlaying ? `${Math.random() * 32 + 16}px` : '16px'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{podcastData.duration}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentTime / 332) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={togglePlayback}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full w-16 h-16"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
            <Volume2 className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-muted/20">
        <h5 className="font-medium mb-2">Generated Script Preview</h5>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {podcastData.script}
        </p>
      </Card>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download MP3
        </Button>
        <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
        <Button onClick={onReset} variant="outline" className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4" />
          Create Another
        </Button>
      </div>
    </div>
  );
};

export default AudioPlayer;
