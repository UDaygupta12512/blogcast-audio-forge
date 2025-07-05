
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Download, Share2, RotateCcw, Subtitles, SkipBack, SkipForward } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AudioControls from './AudioControls';
import type { PodcastData } from './PodcastGenerator';

interface AudioPlayerProps {
  podcastData: PodcastData;
  onReset: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ podcastData, onReset }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [currentSubtitle, setCurrentSubtitle] = useState<string>('');
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioQuality, setAudioQuality] = useState<'standard' | 'high'>('high');
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      
      if (podcastData.subtitles && showSubtitles) {
        const current = podcastData.subtitles.find(
          subtitle => audio.currentTime >= subtitle.start && audio.currentTime <= subtitle.end
        );
        setCurrentSubtitle(current?.text || '');
      }
    };
    
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    // Apply audio settings
    audio.volume = isMuted ? 0 : volume / 100;
    audio.playbackRate = playbackRate;

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [podcastData.audioUrl, podcastData.subtitles, showSubtitles, volume, isMuted, playbackRate]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audio.currentTime = newTime;
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (podcastData.audioUrl) {
      const link = document.createElement('a');
      link.href = podcastData.audioUrl;
      link.download = `${podcastData.title}.mp3`;
      link.click();
      
      toast({
        title: "Download Started",
        description: "Your podcast episode is being downloaded.",
      });
    }
  };

  const handleShare = () => {
    if (podcastData.audioUrl) {
      navigator.clipboard.writeText(podcastData.audioUrl);
      toast({
        title: "Audio URL Copied",
        description: "Audio URL has been copied to your clipboard.",
      });
    }
  };

  if (!podcastData.audioUrl) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Audio is being generated...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-semibold mb-2">Your Enhanced Podcast is Ready!</h3>
        <p className="text-muted-foreground">
          Listen with advanced controls, subtitles, and high-quality audio
        </p>
      </div>

      <audio ref={audioRef} src={podcastData.audioUrl} preload="metadata" />

      <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-purple-200">{podcastData.title}</h4>
            <p className="text-sm text-muted-foreground">Duration: {formatTime(duration)} • Quality: {audioQuality}</p>
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
              <span>{playbackRate}x speed</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div 
              className="w-full bg-muted rounded-full h-3 cursor-pointer hover:h-4 transition-all"
              onClick={handleProgressClick}
            >
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-300 relative"
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
              >
                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-3">
            <Button
              onClick={() => skipTime(-10)}
              size="sm"
              variant="outline"
              className="rounded-full"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={togglePlayback}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full w-16 h-16"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>
            
            <Button
              onClick={() => skipTime(10)}
              size="sm"
              variant="outline"
              className="rounded-full"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <Button
              onClick={() => setShowSubtitles(!showSubtitles)}
              variant="outline"
              size="sm"
              className={showSubtitles ? 'bg-purple-600/20' : ''}
            >
              <Subtitles className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Enhanced Audio Controls */}
      <div className="flex gap-2">
        <Button
          onClick={() => setShowControls(!showControls)}
          variant="outline"
          size="sm"
          className="mb-4"
        >
          {showControls ? 'Hide' : 'Show'} Controls
        </Button>
      </div>

      {showControls && (
        <AudioControls
          volume={volume}
          onVolumeChange={setVolume}
          playbackRate={playbackRate}
          onPlaybackRateChange={setPlaybackRate}
          isMuted={isMuted}
          onMuteToggle={() => setIsMuted(!isMuted)}
          audioQuality={audioQuality}
          onQualityChange={setAudioQuality}
        />
      )}

      {/* Enhanced Subtitles Display */}
      {showSubtitles && currentSubtitle && (
        <Card className="p-6 bg-black/90 backdrop-blur-sm border-purple-500/30">
          <p className="text-center text-white text-xl leading-relaxed font-medium">
            {currentSubtitle}
          </p>
        </Card>
      )}

      {/* Script Preview */}
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
