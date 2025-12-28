import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface AudioWaveformProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ isPlaying, currentTime, duration }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const bars = 60;
    const barWidth = width / bars;

    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#a855f7');
      gradient.addColorStop(0.5, '#ec4899');
      gradient.addColorStop(1, '#3b82f6');

      for (let i = 0; i < bars; i++) {
        const progress = currentTime / duration;
        const barProgress = i / bars;
        
        // Dynamic height based on playback position
        let barHeight;
        if (isPlaying) {
          const wave = Math.sin((i * 0.15) + phase) * 0.5 + 0.5;
          const proximity = 1 - Math.abs(barProgress - progress) * 2;
          barHeight = (wave * proximity * height * 0.6) + (height * 0.1);
        } else {
          barHeight = height * 0.2;
        }

        const x = i * barWidth;
        const y = (height - barHeight) / 2;

        // Highlight played portion
        if (barProgress <= progress) {
          ctx.fillStyle = gradient;
          ctx.globalAlpha = 0.9;
        } else {
          ctx.fillStyle = '#4a5568';
          ctx.globalAlpha = 0.3;
        }

        ctx.fillRect(x + 2, y, barWidth - 4, barHeight);
      }

      if (isPlaying) {
        phase += 0.08;
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, currentTime, duration]);

  return (
    <Card className="p-4 glass border-white/10 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={800}
        height={100}
        className="w-full h-24 rounded-lg"
      />
    </Card>
  );
};

export default AudioWaveform;