
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
          description: 'Technology & Innovation',
          bgImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
          altText: 'Circuit board technology background'
        };
      case 'health':
        return {
          primaryIcon: Heart,
          secondaryIcon: Stethoscope,
          gradient: 'from-green-400 via-emerald-500 to-teal-400',
          bgPattern: 'health-pattern',
          particles: ['🏥', '💊', '🔬', '🩺', '❤️'],
          description: 'Health & Wellness',
          bgImage: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=800&q=80',
          altText: 'Peaceful wellness background'
        };
      case 'business':
        return {
          primaryIcon: TrendingUp,
          secondaryIcon: DollarSign,
          gradient: 'from-orange-400 via-red-500 to-pink-400',
          bgPattern: 'business-pattern',
          particles: ['📈', '💼', '🎯', '💰', '🚀'],
          description: 'Business & Entrepreneurship',
          bgImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
          altText: 'Business coding workspace'
        };
      default:
        return {
          primaryIcon: Globe,
          secondaryIcon: Lightbulb,
          gradient: 'from-purple-400 via-pink-500 to-blue-400',
          bgPattern: 'general-pattern',
          particles: ['🌟', '💭', '🎨', '📚', '🔮'],
          description: 'General Knowledge',
          bgImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
          altText: 'Peaceful nature background'
        };
    }
  };

  const visual = getVisualElements();
  const PrimaryIcon = visual.primaryIcon;
  const SecondaryIcon = visual.secondaryIcon;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br min-h-[200px] group hover:scale-[1.02] transition-all duration-500">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={visual.bgImage} 
          alt={visual.altText}
          className="w-full h-full object-cover opacity-20 transition-opacity duration-500 group-hover:opacity-30"
        />
        <div className={`absolute inset-0 bg-gradient-to-br ${visual.gradient} opacity-40`} />
      </div>
      
      {/* Animated particles with improved positioning */}
      <div className="absolute inset-0 overflow-hidden">
        {visual.particles.map((particle, index) => (
          <div
            key={index}
            className="absolute text-2xl opacity-40 animate-bounce transition-all duration-300 group-hover:opacity-60 group-hover:scale-110"
            style={{
              left: `${15 + (index * 18)}%`,
              top: `${15 + (index * 12)}%`,
              animationDelay: `${index * 0.3}s`,
              animationDuration: `${2 + index * 0.5}s`
            }}
          >
            {particle}
          </div>
        ))}
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0">
        <div className={`absolute top-4 right-4 w-16 h-16 rounded-full bg-gradient-to-r ${visual.gradient} opacity-20 animate-pulse`} />
        <div className={`absolute bottom-6 left-6 w-12 h-12 rotate-45 bg-gradient-to-r ${visual.gradient} opacity-15 animate-spin`} style={{ animationDuration: '8s' }} />
        <div className={`absolute top-1/2 right-1/4 w-8 h-8 rounded-full bg-gradient-to-r ${visual.gradient} opacity-25 animate-bounce`} style={{ animationDelay: '1s' }} />
      </div>

      {/* Main content with enhanced styling */}
      <div className="relative z-10 flex items-center space-x-6 p-6 h-full">
        <div className="flex-shrink-0">
          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${visual.gradient} flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            <PrimaryIcon className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${visual.gradient} bg-opacity-20 backdrop-blur-sm`}>
              <SecondaryIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white/90 tracking-wide uppercase">{visual.description}</span>
          </div>
          <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight drop-shadow-lg">{title}</h3>
          
          {/* Progress bar animation */}
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${visual.gradient} rounded-full animate-pulse`} style={{ width: '75%' }} />
          </div>
        </div>
      </div>

      {/* Animated border glow */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${visual.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-300`} 
           style={{ padding: '1px' }}>
        <div className="w-full h-full bg-transparent rounded-xl" />
      </div>
    </div>
  );
};

export default ContentVisual;
