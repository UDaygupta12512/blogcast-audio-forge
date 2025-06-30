
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, FileText, Brain, Mic, Music } from 'lucide-react';

interface ProcessingStepsProps {
  customSteps?: string[];
}

const ProcessingSteps: React.FC<ProcessingStepsProps> = ({ customSteps }) => {
  const defaultSteps = [
    'Parsing blog content',
    'Generating podcast script',
    'Converting text to speech',
    'Adding background music'
  ];

  const steps = customSteps || defaultSteps;
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [steps.length]);

  const getStepIcon = (index: number) => {
    const icons = [FileText, Brain, Mic, Music];
    const IconComponent = icons[index % icons.length];
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <Card className="p-8 bg-muted/20">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-2">Processing Your Content</h3>
          <p className="text-muted-foreground">
            Transforming your blog into a professional podcast episode
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-500 ${
                index <= currentStep 
                  ? 'bg-purple-500/20 border border-purple-500/30' 
                  : 'bg-muted/50'
              }`}
            >
              <div className={`flex-shrink-0 ${
                index < currentStep 
                  ? 'text-green-400' 
                  : index === currentStep 
                    ? 'text-purple-400' 
                    : 'text-muted-foreground'
              }`}>
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : index === currentStep ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  getStepIcon(index)
                )}
              </div>
              
              <div className="flex-1">
                <p className={`font-medium ${
                  index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step}
                </p>
              </div>
              
              <Badge 
                variant={index < currentStep ? 'default' : index === currentStep ? 'secondary' : 'outline'}
                className={
                  index < currentStep 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                    : index === currentStep 
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                      : ''
                }
              >
                {index < currentStep ? 'Complete' : index === currentStep ? 'Processing' : 'Pending'}
              </Badge>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <div className="flex space-x-1">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-8 bg-gradient-to-t from-purple-500 to-blue-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProcessingSteps;
