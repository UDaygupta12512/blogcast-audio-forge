import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookMarked, Play } from 'lucide-react';

export interface Chapter {
  title: string;
  timestamp: number;
  duration: number;
}

interface ChapterMarkersProps {
  chapters: Chapter[];
  currentTime: number;
  onSeek: (time: number) => void;
}

const ChapterMarkers: React.FC<ChapterMarkersProps> = ({ chapters, currentTime, onSeek }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentChapterIndex = () => {
    return chapters.findIndex((chapter, index) => {
      const nextChapter = chapters[index + 1];
      return currentTime >= chapter.timestamp && 
             (!nextChapter || currentTime < nextChapter.timestamp);
    });
  };

  const currentChapter = getCurrentChapterIndex();

  return (
    <Card className="p-6 glass border-white/10">
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <BookMarked className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold">Podcast Chapters</h3>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {chapters.map((chapter, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                currentChapter === index
                  ? 'bg-purple-500/20 border-purple-400/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
              onClick={() => onSeek(chapter.timestamp)}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {currentChapter === index && (
                      <Play className="w-3 h-3 text-purple-400 animate-pulse" />
                    )}
                    <h4 className="font-medium text-sm truncate">{chapter.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {formatTime(chapter.timestamp)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.floor(chapter.duration / 60)}m {Math.floor(chapter.duration % 60)}s
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeek(chapter.timestamp);
                  }}
                  className="shrink-0"
                >
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ChapterMarkers;