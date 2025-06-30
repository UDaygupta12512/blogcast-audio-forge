
import React from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';

interface Voice {
  id: string;
  name: string;
  description: string;
  preview?: string;
}

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
}

const voices: Voice[] = [
  { id: 'aria', name: 'Aria', description: 'Warm and engaging, perfect for educational content' },
  { id: 'sarah', name: 'Sarah', description: 'Professional news anchor style' },
  { id: 'charlie', name: 'Charlie', description: 'Energetic and friendly for tech content' },
  { id: 'laura', name: 'Laura', description: 'Calm and soothing for meditation topics' },
  { id: 'george', name: 'George', description: 'Authoritative and informative' },
];

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onVoiceChange }) => {
  return (
    <div className="space-y-4">
      <Label className="text-lg font-medium">Choose Voice Persona</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {voices.map((voice) => (
          <Card
            key={voice.id}
            className={`p-4 cursor-pointer transition-all hover:scale-105 ${
              selectedVoice === voice.id
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-muted hover:border-purple-300'
            }`}
            onClick={() => onVoiceChange(voice.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{voice.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{voice.description}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="p-1 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Implement voice preview
                }}
              >
                <Volume2 className="w-3 h-3" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default VoiceSelector;
