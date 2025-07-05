
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Volume2, 
  VolumeX, 
  Gauge, 
  Settings, 
  Headphones,
  PlayCircle
} from 'lucide-react';

interface AudioControlsProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
  audioQuality: 'standard' | 'high';
  onQualityChange: (quality: 'standard' | 'high') => void;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  volume,
  onVolumeChange,
  playbackRate,
  onPlaybackRateChange,
  isMuted,
  onMuteToggle,
  audioQuality,
  onQualityChange,
}) => {
  return (
    <Card className="p-4 bg-muted/10 border-purple-500/20">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-purple-400" />
          <h4 className="font-medium text-sm">Audio Controls</h4>
        </div>
        
        {/* Volume Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-1">
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              Volume
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={onMuteToggle}
              className="h-6 w-6 p-0"
            >
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </Button>
          </div>
          <Slider
            value={[isMuted ? 0 : volume]}
            onValueChange={(value) => onVolumeChange(value[0])}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground text-right">
            {Math.round(isMuted ? 0 : volume)}%
          </div>
        </div>

        {/* Playback Speed */}
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-1">
            <Gauge className="w-3 h-3" />
            Playback Speed
          </Label>
          <Slider
            value={[playbackRate]}
            onValueChange={(value) => onPlaybackRateChange(value[0])}
            min={0.5}
            max={2}
            step={0.1}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground text-right">
            {playbackRate.toFixed(1)}x
          </div>
        </div>

        {/* Audio Quality */}
        <div className="space-y-2">
          <Label className="text-xs flex items-center gap-1">
            <Headphones className="w-3 h-3" />
            Audio Quality
          </Label>
          <div className="flex gap-2">
            <Button
              variant={audioQuality === 'standard' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onQualityChange('standard')}
              className="flex-1 text-xs"
            >
              Standard
            </Button>
            <Button
              variant={audioQuality === 'high' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onQualityChange('high')}
              className="flex-1 text-xs"
            >
              High Quality
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AudioControls;
