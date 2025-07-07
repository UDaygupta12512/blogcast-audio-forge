import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Download, Share2, RotateCcw, Subtitles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AudioControls from './AudioControls';
import { FreeTTSService } from '../services/freeTtsService';
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
  const [audioQuality, setAudioQuality] = useState<'standard' | 'high'>('standard');
  const [showControls, setShowControls] = useState(false);
  const ttsServiceRef = useRef<FreeTTSService | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Initialize TTS service
  useEffect(() => {
    ttsServiceRef.current = new FreeTTSService();
    
    // Calculate duration from subtitles
    if (podcastData.subtitles && podcastData.subtitles.length > 0) {
      const lastSubtitle = podcastData.subtitles[podcastData.subtitles.length - 1];
      setDuration(lastSubtitle.end);
    }
  }, [podcastData.subtitles]);

  // Handle subtitle timing during playback
  useEffect(() => {
    if (isPlaying && podcastData.subtitles && showSubtitles) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          
          const current = podcastData.subtitles?.find(
            subtitle => newTime >= subtitle.start && newTime <= subtitle.end
          );
          setCurrentSubtitle(current?.text || '');
          
          return newTime;
        });
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, podcastData.subtitles, showSubtitles]);

  const togglePlayback = async () => {
    if (!ttsServiceRef.current) {
      console.error('TTS service not initialized');
      toast({
        title: "Audio Error",
        description: "Speech synthesis service not available. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    if (isPlaying) {
      console.log('Stopping speech synthesis');
      ttsServiceRef.current.stop();
      setIsPlaying(false);
      setCurrentTime(0);
    } else {
      try {
        console.log('Starting speech synthesis with settings:', {
          voice: podcastData.voice,
          rate: playbackRate,
          volume: isMuted ? 0 : volume / 100,
          textLength: podcastData.script.length
        });
        
        setIsPlaying(true);
        setCurrentTime(0);
        
        // Ensure volume is set correctly
        const effectiveVolume = isMuted ? 0 : Math.max(0.1, volume / 100);
        
        await ttsServiceRef.current.speak({
          text: podcastData.script,
          voice: podcastData.voice === 'default' ? undefined : podcastData.voice,
          rate: playbackRate,
          pitch: 1,
          volume: effectiveVolume,
        });
        
        // Speech ended naturally
        console.log('Speech synthesis completed');
        setIsPlaying(false);
        setCurrentTime(0);
        
      } catch (error) {
        console.error('Playback error:', error);
        setIsPlaying(false);
        setCurrentTime(0);
        toast({
          title: "Playback Error",
          description: "Failed to play audio. Please try again or check your browser's audio settings.",
          variant: "destructive"
        });
      }
    }
  };

  // Update volume in real-time
  useEffect(() => {
    if (ttsServiceRef.current && isPlaying) {
      const effectiveVolume = isMuted ? 0 : volume / 100;
      console.log('Updating volume to:', effectiveVolume);
      // Note: Web Speech API doesn't support real-time volume changes during playback
      // This will apply to the next playback
    }
  }, [volume, isMuted, isPlaying]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    const blob = new Blob([podcastData.script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${podcastData.title}_script.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Script Downloaded",
      description: "Your podcast script has been downloaded as a text file.",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(podcastData.script);
    toast({
      title: "Script Copied",
      description: "Podcast script has been copied to your clipboard.",
    });
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
        <h3 className="text-2xl font-semibold mb-2">🎉 Your Free Podcast is Ready!</h3>
        <p className="text-muted-foreground">
          Click play to listen with real-time subtitles
        </p>
        <p className="text-sm text-yellow-600 mt-2">
          💡 If audio is not audible, check your browser's audio settings and ensure volume is up
        </p>
      </div>

      <Card className="p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20">
        <div className="space-y-4">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-purple-200">{podcastData.title}</h4>
            <p className="text-sm text-muted-foreground">
              Duration: ~{formatTime(duration)} • Volume: {isMuted ? '0' : volume}% • Speed: {playbackRate}x
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Voice: {podcastData.voice || 'Browser Default'}
            </p>
          </div>

          {/* Simple Waveform Animation */}
          <div className="flex items-center justify-center">
            <div className="flex space-x-1">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isPlaying 
                      ? 'h-8 bg-gradient-to-t from-purple-500 to-blue-400' 
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

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{playbackRate}x speed</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-300"
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
            </div>
          </div>

          {/* Play Controls */}
          <div className="flex items-center justify-center space-x-3">
            <Button
              onClick={togglePlayback}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full w-16 h-16"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
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

      {/* Live Subtitles Display */}
      {showSubtitles && (
        <Card className="p-6 bg-black/90 backdrop-blur-sm border-purple-500/30 min-h-[100px] flex items-center justify-center">
          {currentSubtitle ? (
            <p className="text-center text-white text-xl leading-relaxed font-medium">
              {currentSubtitle}
            </p>
          ) : (
            <p className="text-center text-gray-400 text-lg">
              {isPlaying ? 'Listen for subtitles...' : 'Press play to see subtitles here'}
            </p>
          )}
        </Card>
      )}

      {/* Subtitle Timeline */}
      {showSubtitles && podcastData.subtitles && (
        <Card className="p-4 bg-muted/20">
          <h5 className="font-medium mb-3 flex items-center gap-2">
            <Subtitles className="w-4 h-4" />
            Full Subtitle Timeline
          </h5>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {podcastData.subtitles.map((subtitle, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm transition-colors ${
                  currentTime >= subtitle.start && currentTime <= subtitle.end
                    ? 'bg-purple-600/20 border border-purple-500/30'
                    : 'bg-muted/10'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatTime(subtitle.start)} - {formatTime(subtitle.end)}
                  </span>
                </div>
                <p className="mt-1">{subtitle.text}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Enhanced Audio Controls */}
      <div className="flex gap-2">
        <Button
          onClick={() => setShowControls(!showControls)}
          variant="outline"
          size="sm"
        >
          {showControls ? 'Hide' : 'Show'} Audio Controls
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

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Script
        </Button>
        <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Share Script
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
