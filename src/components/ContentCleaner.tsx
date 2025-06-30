
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, Hash } from 'lucide-react';

interface ContentCleanerProps {
  originalContent: string;
  cleanedContent: string;
  metadata: {
    title: string;
    readingTime: string;
    wordCount: number;
  };
}

const ContentCleaner: React.FC<ContentCleanerProps> = ({ 
  originalContent, 
  cleanedContent, 
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
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {metadata.readingTime}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {metadata.wordCount} words
            </Badge>
          </div>
        </div>
        
        <div className="text-sm">
          <h5 className="font-medium mb-2">Extracted Title:</h5>
          <p className="text-muted-foreground">{metadata.title}</p>
        </div>
        
        <div className="text-sm">
          <h5 className="font-medium mb-2">Cleaned Content Preview:</h5>
          <p className="text-muted-foreground line-clamp-4">
            {cleanedContent.substring(0, 300)}...
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ContentCleaner;
