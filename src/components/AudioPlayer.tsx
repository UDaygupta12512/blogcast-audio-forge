import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, Download, Share2, RotateCcw, Subtitles, Volume2, VolumeX } from 'lucide-react';
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
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioQuality, setAudioQuality] = useState<'standard' | 'high'>('standard');
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const ttsServiceRef = useRef<FreeTTSService | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Initialize TTS service with better error handling
  useEffect(() => {
    const initializeTTS = async () => {
      try {
        console.log('🔄 Initializing TTS service...');
        ttsServiceRef.current = new FreeTTSService();
        
        // Calculate duration from subtitles
        if (podcastData.subtitles && podcastData.subtitles.length > 0) {
          const lastSubtitle = podcastData.subtitles[podcastData.subtitles.length - 1];
          setDuration(lastSubtitle.end);
          console.log('📊 Calculated duration:', lastSubtitle.end, 'seconds');
        }
        
        setSpeechError(null);
      } catch (error) {
        console.error('❌ Failed to initialize TTS service:', error);
        setSpeechError('Failed to initialize speech service');
        toast({
          title: "Audio Service Error",
          description: "Failed to initialize speech synthesis. Please refresh the page.",
          variant: "destructive"
        });
      }
    };

    initializeTTS();
    
    // Cleanup on unmount
    return () => {
      if (ttsServiceRef.current) {
        ttsServiceRef.current.stop();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [podcastData.subtitles, toast]);

  // Enhanced subtitle timing with smooth animations
  useEffect(() => {
    if (isPlaying && podcastData.subtitles && showSubtitles) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          
          const current = podcastData.subtitles?.find(
            subtitle => newTime >= subtitle.start && newTime <= subtitle.end
          );
          
          const newSubtitle = current?.text || '';
          if (newSubtitle !== currentSubtitle) {
            setCurrentSubtitle(newSubtitle);
          }
          
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
  }, [isPlaying, podcastData.subtitles, showSubtitles, currentSubtitle]);

  const togglePlayback = async () => {
    if (!ttsServiceRef.current) {
      toast({
        title: "Audio Service Unavailable",
        description: "Speech synthesis service not ready. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    if (isPlaying) {
      console.log('🛑 User requested stop');
      ttsServiceRef.current.stop();
      setIsPlaying(false);
      setCurrentTime(0);
      setIsLoading(false);
      setSpeechError(null);
    } else {
      try {
        setIsLoading(true);
        setSpeechError(null);
        
        const effectiveVolume = isMuted ? 0 : Math.max(0.1, volume / 100);
        
        console.log('🎤 Starting speech with settings:', {
          voice: podcastData.voice,
          rate: playbackRate,
          volume: effectiveVolume,
          textLength: podcastData.script.length
        });
        
        setIsPlaying(true);
        setCurrentTime(0);
        
        // Add a small delay to ensure UI updates
        await new Promise(resolve => setTimeout(resolve, 200));
        
        await ttsServiceRef.current.speak({
          text: podcastData.script,
          voice: podcastData.voice === 'default' ? undefined : podcastData.voice,
          rate: playbackRate,
          pitch: 1,
          volume: effectiveVolume,
        });
        
        console.log('✅ Speech synthesis completed successfully');
        setIsPlaying(false);
        setCurrentTime(0);
        
        toast({
          title: "Podcast Completed! 🎉",
          description: "Thanks for listening to your AI-generated podcast.",
        });
        
      } catch (error) {
        console.error('❌ Playback error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setSpeechError(errorMessage);
        setIsPlaying(false);
        setCurrentTime(0);
        
        toast({
          title: "Playback Error",
          description: `Audio playback failed: ${errorMessage}. Please check your browser settings and try again.`,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

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
    link.download = `${podcastData.title.replace(/[^a-z0-9]/gi, '_')}_podcast_script.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Script Downloaded! 📄",
      description: "Your podcast script has been saved to your downloads.",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(podcastData.script);
    toast({
      title: "Script Copied! 📋",
      description: "Podcast script copied to clipboard - ready to share!",
    });
  };

  if (!podcastData.audioUrl) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse space-y-4">
          <div className="w-16 h-16 bg-purple-600/20 rounded-full mx-auto animate-ping"></div>
          <p className="text-muted-foreground">Preparing your podcast audio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="relative">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            🎉 Your Podcast is Ready!
          </h3>
          {isPlaying && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </div>
        <p className="text-muted-foreground text-lg">
          Professional AI-generated podcast with real-time subtitles
        </p>
        
        {speechError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-sm">⚠️ {speechError}</p>
          </div>
        )}
      </div>

      <Card className="p-8 bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-indigo-900/30 border-purple-500/30 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-float"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-pink-400 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative space-y-6">
          <div className="text-center space-y-2">
            <h4 className="text-xl font-bold text-purple-200">{podcastData.title}</h4>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>Duration: ~{formatTime(duration)}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                {isMuted ? '0' : volume}%
              </span>
              <span>•</span>
              <span>Speed: {playbackRate}x</span>
            </div>
            <p className="text-xs text-purple-300/70">
              Voice: {podcastData.voice || 'Browser Default'}
            </p>
          </div>

          {/* Enhanced Waveform Animation */}
          <div className="flex items-center justify-center py-4">
            <div className="flex space-x-2">
              {[...Array(25)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-500 ${
                    isPlaying 
                      ? 'bg-gradient-to-t from-purple-500 via-pink-400 to-blue-400 waveform-bar' 
                      : 'bg-muted/40'
                  }`}
                  style={{ 
                    height: isPlaying 
                      ? `${Math.random() * 40 + 20}px` 
                      : '12px',
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Progress Bar with Glow Effect */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span className="flex items-center gap-2">
                {isLoading && <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>}
                {isPlaying && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
                {playbackRate}x speed
              </span>
              <span>{formatTime(duration)}</span>
            </div>
            
            <div className="relative w-full bg-muted/30 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  isPlaying 
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 shadow-lg shadow-purple-500/50' 
                    : 'bg-gradient-to-r from-purple-600/50 to-blue-600/50'
                }`}
                style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
              />
              {isPlaying && (
                <div 
                  className="absolute top-0 w-1 h-full bg-white rounded-full shadow-lg"
                  style={{ left: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
                />
              )}
            </div>
          </div>

          {/* Enhanced Play Controls */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={togglePlayback}
              size="lg"
              disabled={isLoading}
              className={`rounded-full w-20 h-20 text-white border-2 transition-all duration-300 ${
                isPlaying 
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 border-red-400/50 shadow-lg shadow-red-500/30' 
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-purple-400/50 shadow-lg shadow-purple-500/30'
              } ${isLoading ? 'animate-pulse' : 'hover:scale-105'}`}
            >
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 ml-1" />
              )}
            </Button>

            <Button
              onClick={() => setShowSubtitles(!showSubtitles)}
              variant="outline"
              size="sm"
              className={`border-purple-500/30 hover:bg-purple-600/20 transition-all duration-200 ${
                showSubtitles ? 'bg-purple-600/30 text-purple-200' : ''
              }`}
            >
              <Subtitles className="w-4 h-4" />
            </Button>

            <Button
              onClick={() => setIsMuted(!isMuted)}
              variant="outline"
              size="sm"
              className="border-blue-500/30 hover:bg-blue-600/20 transition-all duration-200"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Card>

      {/* Enhanced Live Subtitles Display */}
      {showSubtitles && (
        <Card className="p-8 bg-black/95 backdrop-blur-sm border-purple-500/40 min-h-[120px] flex items-center justify-center relative overflow-hidden">
          {/* Subtitle Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-blue-900/10 to-indigo-900/10"></div>
          
          <div className="relative text-center">
            {currentSubtitle ? (
              <p className="text-white text-2xl leading-relaxed font-medium animate-fade-in max-w-4xl">
                {currentSubtitle}
              </p>
            ) : (
              <p className="text-gray-400 text-xl animate-pulse">
                {isPlaying ? 'Listen for subtitles...' : 'Press play to see subtitles here'}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Subtitle Timeline */}
      {showSubtitles && podcastData.subtitles && (
        <Card className="p-6 bg-muted/10 backdrop-blur-sm border-muted/20">
          <h5 className="font-medium mb-4 flex items-center gap-2 text-purple-200">
            <Subtitles className="w-4 h-4" />
            Full Subtitle Timeline
          </h5>
          <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
            {podcastData.subtitles.map((subtitle, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg text-sm transition-all duration-300 ${
                  currentTime >= subtitle.start && currentTime <= subtitle.end
                    ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-500/50 shadow-lg transform scale-[1.02]'
                    : 'bg-muted/10 hover:bg-muted/20'
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatTime(subtitle.start)} - {formatTime(subtitle.end)}
                  </span>
                  {currentTime >= subtitle.start && currentTime <= subtitle.end && (
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                <p className="leading-relaxed">{subtitle.text}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Enhanced Audio Controls */}
      <div className="flex gap-3">
        <Button
          onClick={() => setShowControls(!showControls)}
          variant="outline"
          size="sm"
          className="border-purple-500/30 hover:bg-purple-600/20 transition-all duration-200"
        >
          {showControls ? 'Hide' : 'Show'} Audio Controls
        </Button>
      </div>

      {showControls && (
        <div className="animate-fade-in">
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
        </div>
      )}

      {/* Enhanced Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button 
          onClick={handleDownload} 
          variant="outline" 
          className="flex items-center gap-2 hover:bg-green-600/20 border-green-500/30 transition-all duration-200 hover:scale-105"
        >
          <Download className="w-4 h-4" />
          Download Script
        </Button>
        <Button 
          onClick={handleShare} 
          variant="outline" 
          className="flex items-center gap-2 hover:bg-blue-600/20 border-blue-500/30 transition-all duration-200 hover:scale-105"
        >
          <Share2 className="w-4 h-4" />
          Share Script
        </Button>
        <Button 
          onClick={onReset} 
          variant="outline" 
          className="flex items-center gap-2 hover:bg-purple-600/20 border-purple-500/30 transition-all duration-200 hover:scale-105"
        >
          <RotateCcw className="w-4 h-4" />
          Create Another
        </Button>
      </div>
    </div>
  );
};

export default AudioPlayer;
