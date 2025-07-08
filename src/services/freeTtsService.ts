
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
  private isInitialized = false;

  constructor() {
    this.synth = window.speechSynthesis;
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    // Ensure speech synthesis is ready
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    
    await this.loadVoices();
    this.isInitialized = true;
  }

  private loadVoices(): Promise<void> {
    return new Promise((resolve) => {
      const loadVoicesWithDelay = () => {
        this.voices = this.synth.getVoices();
        console.log('Available voices loaded:', this.voices.length);
        
        if (this.voices.length > 0) {
          resolve();
        }
      };

      // Try loading voices immediately
      loadVoicesWithDelay();
      
      // If no voices, wait for the event
      if (this.voices.length === 0) {
        const handleVoicesChanged = () => {
          loadVoicesWithDelay();
          this.synth.removeEventListener('voiceschanged', handleVoicesChanged);
          resolve();
        };
        
        this.synth.addEventListener('voiceschanged', handleVoicesChanged);
        
        // Fallback timeout
        setTimeout(() => {
          this.synth.removeEventListener('voiceschanged', handleVoicesChanged);
          resolve();
        }, 2000);
      }
    });
  }

  async validateApiKey(): Promise<{ isValid: boolean; error?: string }> {
    if (!('speechSynthesis' in window)) {
      return {
        isValid: false,
        error: 'Speech synthesis not supported in this browser. Please use Chrome, Firefox, or Edge.'
      };
    }
    
    // Wait for initialization
    if (!this.isInitialized) {
      await this.initializeService();
    }
    
    // Test basic functionality
    try {
      const testUtterance = new SpeechSynthesisUtterance('test');
      testUtterance.volume = 0;
      this.synth.speak(testUtterance);
      this.synth.cancel();
      console.log('Speech synthesis validation successful');
    } catch (error) {
      console.warn('Speech synthesis validation failed:', error);
      return {
        isValid: false,
        error: 'Speech synthesis initialization failed. Please refresh the page.'
      };
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
      const baseDuration = Math.max(2.5, wordCount / (rate * 2.2));
      
      subtitles.push({
        start: currentTime,
        end: currentTime + baseDuration,
        text: trimmedSentence + '.'
      });
      
      currentTime += baseDuration + 0.8;
    });
    
    return subtitles;
  }

  async generateAudio(options: FreeTTSOptions): Promise<{ audioUrl: string; subtitles: SubtitleSegment[] }> {
    const { text, rate = 1 } = options;
    
    if (!this.isInitialized) {
      await this.initializeService();
    }
    
    console.log('Generating audio with improved TTS service...');
    
    const subtitles = this.generateSubtitles(text, rate);
    const audioUrl = 'browser-speech-synthesis';
    
    console.log('Audio generation completed with', subtitles.length, 'subtitle segments');
    return { audioUrl, subtitles };
  }

  speak(options: FreeTTSOptions): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.isInitialized) {
          await this.initializeService();
        }

        const { text, voice, rate = 1, pitch = 1, volume = 0.8 } = options;
        
        console.log('Starting enhanced speech synthesis:', { 
          voice, 
          rate, 
          pitch, 
          volume, 
          textLength: text.length 
        });
        
        // Ensure clean state
        this.stop();
        
        // Wait for any previous speech to stop
        await new Promise(resolve => setTimeout(resolve, 200));
        
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        
        // Enhanced voice selection
        if (voice && voice !== 'default') {
          const selectedVoice = this.voices.find(v => 
            v.name === voice || 
            v.name.toLowerCase().includes(voice.toLowerCase()) ||
            voice.toLowerCase().includes(v.name.toLowerCase())
          );
          
          if (selectedVoice) {
            console.log('Selected voice:', selectedVoice.name);
            this.currentUtterance.voice = selectedVoice;
          } else {
            console.log('Voice not found, using default');
          }
        }
        
        // Apply speech parameters with validation
        this.currentUtterance.rate = Math.max(0.3, Math.min(2.5, rate));
        this.currentUtterance.pitch = Math.max(0.1, Math.min(2, pitch));
        this.currentUtterance.volume = Math.max(0.1, Math.min(1, volume));
        
        // Enhanced event handlers
        this.currentUtterance.onstart = () => {
          console.log('Enhanced speech synthesis started successfully');
        };
        
        this.currentUtterance.onend = () => {
          console.log('Enhanced speech synthesis completed');
          this.currentUtterance = null;
          resolve();
        };
        
        this.currentUtterance.onerror = (error) => {
          console.error('Enhanced speech synthesis error:', error);
          this.currentUtterance = null;
          
          if (error.error === 'interrupted') {
            resolve(); // User stopped playback
          } else {
            reject(new Error(`Speech synthesis failed: ${error.error}`));
          }
        };
        
        this.currentUtterance.onpause = () => {
          console.log('Speech synthesis paused');
        };
        
        this.currentUtterance.onresume = () => {
          console.log('Speech synthesis resumed');
        };
        
        // Start speaking with retry mechanism
        try {
          this.synth.speak(this.currentUtterance);
          
          // Monitor speech progress
          const progressMonitor = setInterval(() => {
            if (!this.synth.speaking && this.currentUtterance) {
              console.log('Speech synthesis monitoring: not speaking but utterance exists');
              clearInterval(progressMonitor);
            }
          }, 1000);
          
          // Clear monitor when done
          this.currentUtterance.onend = () => {
            clearInterval(progressMonitor);
            console.log('Enhanced speech synthesis completed');
            this.currentUtterance = null;
            resolve();
          };
          
        } catch (speakError) {
          console.error('Failed to start speech:', speakError);
          reject(new Error('Failed to start speech synthesis'));
        }
        
      } catch (error) {
        console.error('Speech synthesis setup failed:', error);
        reject(error);
      }
    });
  }

  stop(): void {
    console.log('Stopping enhanced speech synthesis');
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  isPlaying(): boolean {
    return this.synth.speaking;
  }

  // Get speech synthesis status
  getStatus(): { speaking: boolean; pending: boolean; paused: boolean } {
    return {
      speaking: this.synth.speaking,
      pending: this.synth.pending,
      paused: this.synth.paused
    };
  }
}

export const FREE_VOICE_OPTIONS = {
  'Browser Default': 'default',
  'Google US English': 'Google US English',
  'Microsoft David': 'Microsoft David Desktop - English (United States)',
  'Microsoft Zira': 'Microsoft Zira Desktop - English (United States)',
  'Google UK English Female': 'Google UK English Female',
  'Google UK English Male': 'Google UK English Male',
};
