import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Headphones, Volume2, Play, Pause, RotateCcw } from 'lucide-react';

interface SpatialAudioMixerProps {
  audioUrl?: string;
}

const SpatialAudioMixer: React.FC<SpatialAudioMixerProps> = ({ audioUrl }) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [pan, setPan] = useState(0); // -1 to 1 (left to right)
  const [depth, setDepth] = useState(50); // 0 to 100 (proximity/reverb)
  const [rotation, setRotation] = useState(0); // -180 to 180 degrees
  const [binauralEnabled, setBinauralEnabled] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  
  // Presets for different spatial effects
  const presets = [
    { name: '🎭 Theater', pan: 0, depth: 80, rotation: 0 },
    { name: '🏟️ Stadium', pan: 0, depth: 30, rotation: 0 },
    { name: '🎸 Live Concert', pan: -0.3, depth: 60, rotation: -30 },
    { name: '🎧 Intimate', pan: 0, depth: 90, rotation: 0 },
    { name: '🌀 Surround', pan: 0, depth: 50, rotation: 0, autoRotate: true },
  ];

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    let animationId: number;
    
    if (autoRotate && isPlaying) {
      const animate = () => {
        setRotation(prev => {
          const newRotation = prev + 2;
          return newRotation > 180 ? -180 : newRotation;
        });
        animationId = requestAnimationFrame(animate);
      };
      animationId = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [autoRotate, isPlaying]);

  useEffect(() => {
    if (pannerRef.current) {
      // Convert rotation to pan value
      const panFromRotation = Math.sin((rotation * Math.PI) / 180);
      pannerRef.current.pan.value = autoRotate ? panFromRotation : pan;
    }
  }, [pan, rotation, autoRotate]);

  const initAudio = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    // Create nodes
    pannerRef.current = audioContextRef.current.createStereoPanner();
    gainRef.current = audioContextRef.current.createGain();
    
    // Connect nodes
    pannerRef.current.connect(gainRef.current);
    gainRef.current.connect(audioContextRef.current.destination);
    
    return audioContextRef.current;
  };

  const playDemo = async () => {
    if (isPlaying) {
      sourceRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    try {
      const ctx = await initAudio();
      
      // Create oscillator for demo (simulates audio)
      const oscillator = ctx.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = 440;
      
      // Create a more complex sound
      const oscillator2 = ctx.createOscillator();
      oscillator2.type = 'triangle';
      oscillator2.frequency.value = 554.37; // C# above A
      
      const merger = ctx.createChannelMerger(2);
      
      oscillator.connect(pannerRef.current!);
      oscillator2.connect(pannerRef.current!);
      
      oscillator.start();
      oscillator2.start();
      
      setIsPlaying(true);
      toast.success('Playing spatial audio demo - use headphones for best experience!');
      
      // Stop after 5 seconds
      setTimeout(() => {
        oscillator.stop();
        oscillator2.stop();
        setIsPlaying(false);
      }, 5000);
      
    } catch (error) {
      console.error('Audio error:', error);
      toast.error('Failed to play audio');
    }
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setPan(preset.pan);
    setDepth(preset.depth);
    setRotation(preset.rotation);
    setAutoRotate(preset.autoRotate || false);
    toast.success(`Applied ${preset.name} preset`);
  };

  const resetSettings = () => {
    setPan(0);
    setDepth(50);
    setRotation(0);
    setAutoRotate(false);
    toast.success('Reset to default');
  };

  return (
    <Card className="p-4 glass border-white/10">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Spatial Audio / 3D Sound</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={resetSettings}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-xs text-muted-foreground">
            🎧 Use headphones for immersive binaural audio experience
          </p>
        </div>

        {/* Visual representation */}
        <div className="relative h-32 bg-background/50 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-4 h-4 bg-primary rounded-full shadow-lg shadow-primary/50 transition-all duration-100"
              style={{
                transform: `translateX(${pan * 50}px) translateY(${(100 - depth) * 0.3 - 15}px)`,
              }}
            />
            <div className="absolute w-20 h-20 border border-primary/30 rounded-full" />
            <div className="absolute w-32 h-32 border border-primary/20 rounded-full" />
          </div>
          <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">L</div>
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">R</div>
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">Far</div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">Near</div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">Pan (Left/Right)</Label>
              <span className="text-xs text-muted-foreground">{pan.toFixed(1)}</span>
            </div>
            <Slider
              value={[pan]}
              onValueChange={([v]) => setPan(v)}
              min={-1}
              max={1}
              step={0.1}
              disabled={autoRotate}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs">Depth (Proximity)</Label>
              <span className="text-xs text-muted-foreground">{depth}%</span>
            </div>
            <Slider
              value={[depth]}
              onValueChange={([v]) => setDepth(v)}
              min={0}
              max={100}
              step={5}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Auto-Rotate (360°)</Label>
            <Switch checked={autoRotate} onCheckedChange={setAutoRotate} />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs">Binaural Mode</Label>
            <Switch checked={binauralEnabled} onCheckedChange={setBinauralEnabled} />
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <Label className="text-xs">Quick Presets</Label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="text-xs"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Demo button */}
        <Button 
          onClick={playDemo} 
          className="w-full"
          variant={isPlaying ? "destructive" : "default"}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Stop Demo
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Play Spatial Demo
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default SpatialAudioMixer;
