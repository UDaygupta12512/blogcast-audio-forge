
import React, { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const steps = [
  { id: 1, name: 'Analyzing Content', description: 'Processing blog structure and key points' },
  { id: 2, name: 'Generating Script', description: 'Creating engaging podcast narrative' },
  { id: 3, name: 'Voice Synthesis', description: 'Converting text to natural speech' },
  { id: 4, name: 'Adding Audio Effects', description: 'Enhancing with music and sound effects' },
  { id: 5, name: 'Final Assembly', description: 'Mixing and mastering your podcast' },
];

const ProcessingSteps = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 2;
        const stepProgress = Math.floor(newProgress / 20);
        setCurrentStep(stepProgress);
        
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-semibold mb-2">Creating Your Podcast</h3>
        <p className="text-muted-foreground">
          Our AI is working its magic to transform your content
        </p>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground text-center">{progress}% Complete</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center space-x-4 p-4 rounded-lg bg-muted/20">
            <div className="flex-shrink-0">
              {index < currentStep ? (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              ) : index === currentStep ? (
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">{step.id}</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className={`font-medium ${index <= currentStep ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.name}
              </h4>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-8 bg-gradient-to-t from-purple-500 to-blue-400 rounded-full waveform-bar"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessingSteps;
