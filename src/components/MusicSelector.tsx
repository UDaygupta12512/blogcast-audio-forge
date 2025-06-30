
import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';

interface MusicTrack {
  id: string;
  name: string;
  genre: string;
  mood: string;
}

interface MusicSelectorProps {
  selectedTrack: string;
  onTrackChange: (trackId: string) => void;
}

const musicTracks: MusicTrack[] = [
  { id: 'ambient-tech', name: 'Ambient Tech', genre: 'Electronic', mood: 'Professional' },
  { id: 'calm-nature', name: 'Calm Nature', genre: 'Ambient', mood: 'Relaxing' },
  { id: 'upbeat-corporate', name: 'Upbeat Corporate', genre: 'Corporate', mood: 'Energetic' },
  { id: 'news-intro', name: 'News Intro', genre: 'Orchestral', mood: 'Authoritative' },
  { id: 'minimal-piano', name: 'Minimal Piano', genre: 'Classical', mood: 'Thoughtful' },
  { id: 'none', name: 'No Background Music', genre: 'None', mood: 'Clean' },
];

const MusicSelector: React.FC<MusicSelectorProps> = ({ selectedTrack, onTrackChange }) => {
  return (
    <div className="space-y-4">
      <Label className="text-lg font-medium">Background Music</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {musicTracks.map((track) => (
          <Card
            key={track.id}
            className={`p-4 cursor-pointer transition-all hover:scale-105 ${
              selectedTrack === track.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-muted hover:border-blue-300'
            }`}
            onClick={() => onTrackChange(track.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{track.name}</h4>
                <p className="text-xs text-muted-foreground">{track.genre}</p>
                <p className="text-xs text-blue-400 mt-1">{track.mood}</p>
              </div>
              {track.id !== 'none' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="p-1 h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement music preview
                  }}
                >
                  <Volume2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MusicSelector;
