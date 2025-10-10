import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Radio, Mic2, BookOpen, Newspaper, Users, Sparkles } from 'lucide-react';

export type PodcastTemplate = 'standard' | 'interview' | 'news' | 'storytelling' | 'educational' | 'conversational';

interface Template {
  id: PodcastTemplate;
  name: string;
  description: string;
  icon: React.ReactNode;
  style: string;
}

const templates: Template[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Classic podcast format with smooth narration',
    icon: <Radio className="w-6 h-6" />,
    style: 'Professional and clear delivery'
  },
  {
    id: 'interview',
    name: 'Interview Style',
    description: 'Question and answer format with engaging dialogue',
    icon: <Mic2 className="w-6 h-6" />,
    style: 'Conversational with multiple perspectives'
  },
  {
    id: 'news',
    name: 'News Broadcast',
    description: 'Breaking news style with urgent delivery',
    icon: <Newspaper className="w-6 h-6" />,
    style: 'Fast-paced and informative'
  },
  {
    id: 'storytelling',
    name: 'Storytelling',
    description: 'Narrative format with dramatic elements',
    icon: <BookOpen className="w-6 h-6" />,
    style: 'Engaging story arc with emotion'
  },
  {
    id: 'educational',
    name: 'Educational',
    description: 'Teaching format with clear explanations',
    icon: <Sparkles className="w-6 h-6" />,
    style: 'Step-by-step with examples'
  },
  {
    id: 'conversational',
    name: 'Casual Chat',
    description: 'Friendly conversation between hosts',
    icon: <Users className="w-6 h-6" />,
    style: 'Relaxed and friendly tone'
  }
];

interface PodcastTemplateSelectorProps {
  selectedTemplate: PodcastTemplate;
  onTemplateChange: (template: PodcastTemplate) => void;
}

const PodcastTemplateSelector: React.FC<PodcastTemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Your Podcast Style</h3>
        <p className="text-sm text-muted-foreground">
          Select a template that matches your content type
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`p-4 cursor-pointer transition-all hover:scale-105 ${
              selectedTemplate === template.id
                ? 'border-purple-400 bg-purple-500/10'
                : 'glass border-white/10 hover:border-white/20'
            }`}
            onClick={() => onTemplateChange(template.id)}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  selectedTemplate === template.id
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-white/5'
                }`}>
                  {template.icon}
                </div>
                <h4 className="font-semibold">{template.name}</h4>
              </div>
              <p className="text-xs text-muted-foreground">{template.description}</p>
              <p className="text-xs italic text-purple-300/70">{template.style}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PodcastTemplateSelector;