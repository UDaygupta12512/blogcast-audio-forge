
export interface FreeTTSOptions {
  text: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface SubtitleSegment {
  start: number;
  end: number;
  text: string;
}

export class FreeTTSService {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices(): void {
    // Load voices with a small delay to ensure they're available
    const loadVoicesWithDelay = () => {
      this.voices = this.synth.getVoices();
      console.log('Available voices:', this.voices.map(v => v.name));
    };

    loadVoicesWithDelay();
    
    if (this.voices.length === 0) {
      this.synth.addEventListener('voiceschanged', loadVoicesWithDelay);
    }
  }

  async validateApiKey(): Promise<{ isValid: boolean; error?: string }> {
    if (!('speechSynthesis' in window)) {
      return {
        isValid: false,
        error: 'Speech synthesis not supported in this browser. Please use Chrome, Firefox, or Edge.'
      };
    }
    
    // Test audio context availability
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContext.close();
      console.log('Audio context available');
    } catch (error) {
      console.warn('Audio context may not be available:', error);
    }
    
    return { isValid: true };
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => voice.lang.startsWith('en'));
  }

  private generateSubtitles(text: string, rate: number = 1): SubtitleSegment[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const subtitles: SubtitleSegment[] = [];
    let currentTime = 0;
    
    sentences.forEach((sentence) => {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length === 0) return;
      
      const wordCount = trimmedSentence.split(' ').length;
      const baseDuration = Math.max(2, wordCount / (rate * 2.5));
      
      subtitles.push({
        start: currentTime,
        end: currentTime + baseDuration,
        text: trimmedSentence + '.'
      });
      
      currentTime += baseDuration + 0.5;
    });
    
    return subtitles;
  }

  async generateAudio(options: FreeTTSOptions): Promise<{ audioUrl: string; subtitles: SubtitleSegment[] }> {
    const { text, rate = 1 } = options;
    
    console.log('Starting free TTS generation...');
    
    const subtitles = this.generateSubtitles(text, rate);
    
    // Create a simple audio URL indicator (not actual audio file)
    const audioUrl = 'browser-speech-synthesis';
    
    console.log('Free TTS generation completed with subtitles');
    return { audioUrl, subtitles };
  }

  speak(options: FreeTTSOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const { text, voice, rate = 1, pitch = 1, volume = 0.75 } = options;
        
        console.log('Speech synthesis starting with options:', { voice, rate, pitch, volume, textLength: text.length });
        
        // Stop any current speech
        this.synth.cancel();
        
        // Wait a bit for cancel to complete
        setTimeout(() => {
          this.currentUtterance = new SpeechSynthesisUtterance(text);
          
          // Find the selected voice
          if (voice && voice !== 'default') {
            const selectedVoice = this.voices.find(v => 
              v.name === voice || 
              v.name.includes(voice) ||
              voice.includes(v.name)
            );
            if (selectedVoice) {
              console.log('Using voice:', selectedVoice.name);
              this.currentUtterance.voice = selectedVoice;
            } else {
              console.log('Voice not found, using default. Available voices:', this.voices.map(v => v.name));
            }
          }
          
          // Set speech parameters with safe values
          this.currentUtterance.rate = Math.max(0.1, Math.min(2, rate));
          this.currentUtterance.pitch = Math.max(0, Math.min(2, pitch));
          this.currentUtterance.volume = Math.max(0, Math.min(1, volume));
          
          console.log('Final speech settings:', {
            rate: this.currentUtterance.rate,
            pitch: this.currentUtterance.pitch,
            volume: this.currentUtterance.volume,
            voice: this.currentUtterance.voice?.name || 'default'
          });
          
          this.currentUtterance.onstart = () => {
            console.log('Speech synthesis started');
          };
          
          this.currentUtterance.onend = () => {
            console.log('Speech synthesis completed successfully');
            resolve();
          };
          
          this.currentUtterance.onerror = (error) => {
            console.error('Speech synthesis error:', error);
            reject(new Error(`Speech synthesis failed: ${error.error}`));
          };
          
          this.currentUtterance.onboundary = (event) => {
            console.log('Speech boundary:', event.name, 'at', event.charIndex);
          };
          
          // Start speaking
          this.synth.speak(this.currentUtterance);
          
          // Fallback timeout
          setTimeout(() => {
            if (this.synth.speaking) {
              console.log('Speech synthesis still running...');
            }
          }, 1000);
          
        }, 100);
        
      } catch (error) {
        console.error('Speech synthesis setup failed:', error);
        reject(error);
      }
    });
  }

  stop(): void {
    console.log('Stopping speech synthesis');
    this.synth.cancel();
    this.currentUtterance = null;
  }

  isPlaying(): boolean {
    return this.synth.speaking;
  }
}

export const FREE_VOICE_OPTIONS = {
  'Browser Default': 'default',
  'Google US English': 'Google US English',
  'Microsoft David': 'Microsoft David Desktop - English (United States)',
  'Microsoft Zira': 'Microsoft Zira Desktop - English (United States)',
};
