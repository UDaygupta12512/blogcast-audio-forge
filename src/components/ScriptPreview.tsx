
import React from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock } from 'lucide-react';

interface ScriptSection {
  type: 'intro' | 'main' | 'transition' | 'outro';
  content: string;
}

interface ScriptPreviewProps {
  script: string;
  estimatedDuration: string;
}

const ScriptPreview: React.FC<ScriptPreviewProps> = ({ script, estimatedDuration }) => {
  // Parse script into sections for better visualization
  const parseScript = (scriptText: string): ScriptSection[] => {
    const sections: ScriptSection[] = [];
    const lines = scriptText.split('\n\n');
    
    lines.forEach((line, index) => {
      if (index === 0) {
        sections.push({ type: 'intro', content: line });
      } else if (index === lines.length - 1) {
        sections.push({ type: 'outro', content: line });
      } else if (line.toLowerCase().includes('moving on') || line.toLowerCase().includes('next')) {
        sections.push({ type: 'transition', content: line });
      } else {
        sections.push({ type: 'main', content: line });
      }
    });
    
    return sections;
  };

  const sections = parseScript(script);
  
  const getSectionColor = (type: ScriptSection['type']) => {
    switch (type) {
      case 'intro': return 'bg-green-500/20 border-green-500/30';
      case 'outro': return 'bg-red-500/20 border-red-500/30';
      case 'transition': return 'bg-yellow-500/20 border-yellow-500/30';
      default: return 'bg-blue-500/20 border-blue-500/30';
    }
  };

  const getSectionLabel = (type: ScriptSection['type']) => {
    switch (type) {
      case 'intro': return 'Introduction';
      case 'outro': return 'Conclusion';
      case 'transition': return 'Transition';
      default: return 'Main Content';
    }
  };

  return (
    <Card className="p-6 bg-muted/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generated Script
          </h4>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {estimatedDuration} estimated
          </Badge>
        </div>
        
        <Separator />
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sections.map((section, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${getSectionColor(section.type)}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {getSectionLabel(section.type)}
                </Badge>
              </div>
              <p className="text-sm text-foreground/90">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default ScriptPreview;
