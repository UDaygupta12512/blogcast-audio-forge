
import React from 'react';
import { Brain, Heart, TrendingUp, Globe, Code, Stethoscope, DollarSign, Lightbulb } from 'lucide-react';

interface ContentVisualProps {
  contentType: 'tech' | 'health' | 'business' | 'general';
  title: string;
}

const ContentVisual: React.FC<ContentVisualProps> = ({ contentType, title }) => {
  const getVisualElements = () => {
    switch (contentType) {
      case 'tech':
        return {
          primaryIcon: Brain,
          secondaryIcon: Code,
          gradient: 'from-blue-400 via-purple-500 to-cyan-400',
          bgPattern: 'tech-pattern',
          particles: ['💻', '🤖', '⚡', '🔧', '💡'],
          description: 'Technology & Innovation'
        };
      case 'health':
        return {
          primaryIcon: Heart,
          secondaryIcon: Stethoscope,
          gradient: 'from-green-400 via-emerald-500 to-teal-400',
          bgPattern: 'health-pattern',
          particles: ['🏥', '💊', '🔬', '🩺', '❤️'],
          description: 'Health & Wellness'
        };
      case 'business':
        return {
          primaryIcon: TrendingUp,
          secondaryIcon: DollarSign,
          gradient: 'from-orange-400 via-red-500 to-pink-400',
          bgPattern: 'business-pattern',
          particles: ['📈', '💼', '🎯', '💰', '🚀'],
          description: 'Business & Entrepreneurship'
        };
      default:
        return {
          primaryIcon: Globe,
          secondaryIcon: Lightbulb,
          gradient: 'from-purple-400 via-pink-500 to-blue-400',
          bgPattern: 'general-pattern',
          particles: ['🌟', '💭', '🎨', '📚', '🔮'],
          description: 'General Knowledge'
        };
    }
  };

  const visual = getVisualElements();
  const PrimaryIcon = visual.primaryIcon;
  const SecondaryIcon = visual.secondaryIcon;

  return (
    <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${visual.gradient} opacity-20`} />
      
      {/* Animated particles */}
      <div className="absolute inset-0">
        {visual.particles.map((particle, index) => (
          <div
            key={index}
            className="absolute text-2xl animate-bounce opacity-30"
            style={{
              left: `${20 + (index * 15)}%`,
              top: `${10 + (index * 10)}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: '3s'
            }}
          >
            {particle}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${visual.gradient} flex items-center justify-center shadow-lg`}>
            <PrimaryIcon className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <SecondaryIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">{visual.description}</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground line-clamp-2">{title}</h3>
        </div>
      </div>

      {/* Animated border */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${visual.gradient} opacity-30 animate-pulse`} 
           style={{ padding: '2px' }}>
        <div className="w-full h-full bg-background rounded-xl" />
      </div>
    </div>
  );
};

export default ContentVisual;
