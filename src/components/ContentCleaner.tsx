
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, User, Calendar } from 'lucide-react';
import ContentVisual from './ContentVisual';

interface ContentCleanerProps {
  originalContent: string;
  cleanedContent: string;
  contentType?: 'tech' | 'health' | 'business' | 'general';
  title?: string;
  metadata: {
    wordCount: number;
    readingTime: string;
    author?: string;
    publishDate?: string;
  };
}

const ContentCleaner: React.FC<ContentCleanerProps> = ({ 
  originalContent, 
  cleanedContent, 
  contentType = 'general',
  title = 'Blog Content',
  metadata 
}) => {
  return (
    <Card className="p-6 bg-muted/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Content Analysis
          </h4>
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
            Processed
          </Badge>
        </div>

        {/* Visual representation of content type */}
        <ContentVisual contentType={contentType} title={title} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{metadata.wordCount}</div>
            <div className="text-xs text-muted-foreground">Words</div>
          </div>
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-400 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4" />
              {metadata.readingTime.split(' ')[0]}
            </div>
            <div className="text-xs text-muted-foreground">Min Read</div>
          </div>
          {metadata.author && (
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <div className="text-sm font-medium text-green-400 flex items-center justify-center gap-1">
                <User className="w-4 h-4" />
                Author
              </div>
              <div className="text-xs text-muted-foreground">{metadata.author}</div>
            </div>
          )}
          {metadata.publishDate && (
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <div className="text-sm font-medium text-orange-400 flex items-center justify-center gap-1">
                <Calendar className="w-4 h-4" />
                Published
              </div>
              <div className="text-xs text-muted-foreground">{metadata.publishDate}</div>
            </div>
          )}
        </div>

        <div className="bg-background/30 rounded-lg p-4 max-h-48 overflow-y-auto">
          <p className="text-sm text-foreground/80 line-clamp-6">
            {cleanedContent.substring(0, 500)}
            {cleanedContent.length > 500 && '...'}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ContentCleaner;
