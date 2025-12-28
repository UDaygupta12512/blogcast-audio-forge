
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
  private voicesLoadTimeout: NodeJS.Timeout | null = null;
  private activeUtterances: SpeechSynthesisUtterance[] = [];

  constructor() {
    this.synth = window.speechSynthesis;
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    // Cancel any ongoing speech first
    this.synth.cancel();
    
    // Wait a bit to ensure clean state
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await this.loadVoices();
    this.isInitialized = true;
    console.log('TTS Service initialized with', this.voices.length, 'voices');
  }

  private loadVoices(): Promise<void> {
    return new Promise((resolve) => {
      // Clear any existing timeout
      if (this.voicesLoadTimeout) {
        clearTimeout(this.voicesLoadTimeout);
      }

      const attemptLoadVoices = () => {
        this.voices = this.synth.getVoices();
        console.log('Voice loading attempt - found:', this.voices.length, 'voices');
        
        if (this.voices.length > 0) {
          console.log('Available voices:', this.voices.map(v => `${v.name} (${v.lang})`));
          resolve();
          return true;
        }
        return false;
      };

      // Try loading voices immediately
      if (attemptLoadVoices()) return;
      
      // Set up event listener for voice loading
      const handleVoicesChanged = () => {
        if (attemptLoadVoices()) {
          this.synth.removeEventListener('voiceschanged', handleVoicesChanged);
          if (this.voicesLoadTimeout) {
            clearTimeout(this.voicesLoadTimeout);
          }
        }
      };
      
      this.synth.addEventListener('voiceschanged', handleVoicesChanged);
      
      // Fallback timeout - resolve even if no voices loaded
      this.voicesLoadTimeout = setTimeout(() => {
        this.synth.removeEventListener('voiceschanged', handleVoicesChanged);
        console.warn('Voice loading timeout - proceeding with', this.voices.length, 'voices');
        resolve();
      }, 3000);
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
    
    // Simple validation without test utterance (which can timeout)
    console.log('Speech synthesis validation successful - voices loaded:', this.voices.length);
    return { isValid: true };
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => voice.lang.startsWith('en'));
  }

  // Method to access current active utterances for volume control
  getActiveUtterances(): SpeechSynthesisUtterance[] {
    return this.activeUtterances;
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
    
    console.log('Generating audio with TTS service...');
    
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
        
        console.log('Starting speech synthesis with options:', { 
          voice, 
          rate, 
          pitch, 
          volume, 
          textLength: text.length 
        });
        
        // Ensure completely clean state
        this.stop();
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Clear previous utterances array
        this.activeUtterances = [];
        
        // Create new utterance
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        
        // Add to active utterances array
        this.activeUtterances.push(this.currentUtterance);
        
        // Enhanced voice selection with better matching
        if (voice && voice !== 'default') {
          const selectedVoice = this.voices.find(v => {
            const voiceName = v.name.toLowerCase();
            const targetVoice = voice.toLowerCase();
            
            return voiceName === targetVoice || 
                   voiceName.includes(targetVoice) ||
                   targetVoice.includes(voiceName) ||
                   v.voiceURI.toLowerCase().includes(targetVoice);
          });
          
          if (selectedVoice) {
            console.log('Selected voice:', selectedVoice.name, selectedVoice.voiceURI);
            this.currentUtterance.voice = selectedVoice;
          } else {
            console.log('Voice not found, available voices:', this.voices.map(v => v.name));
          }
        }
        
        // Apply speech parameters with safer bounds
        this.currentUtterance.rate = Math.max(0.5, Math.min(2.0, rate));
        this.currentUtterance.pitch = Math.max(0.5, Math.min(2.0, pitch));
        this.currentUtterance.volume = Math.max(0.1, Math.min(1.0, volume));
        
        console.log('Final utterance settings:', {
          voice: this.currentUtterance.voice?.name || 'default',
          rate: this.currentUtterance.rate,
          pitch: this.currentUtterance.pitch,
          volume: this.currentUtterance.volume
        });
        
        // Set up event handlers
        this.currentUtterance.onstart = () => {
          console.log('✅ Speech synthesis started successfully');
        };
        
        this.currentUtterance.onend = () => {
          console.log('✅ Speech synthesis completed successfully');
          this.currentUtterance = null;
          // Remove from active utterances
          this.activeUtterances = [];
          resolve();
        };
        
        this.currentUtterance.onerror = (error) => {
          console.error('❌ Speech synthesis error:', error);
          this.currentUtterance = null;
          // Clear active utterances on error
          this.activeUtterances = [];
          
          if (error.error === 'interrupted' || error.error === 'canceled') {
            console.log('Speech was interrupted by user');
            resolve();
          } else {
            reject(new Error(`Speech synthesis failed: ${error.error}`));
          }
        };
        
        this.currentUtterance.onpause = () => {
          console.log('⏸️ Speech synthesis paused');
        };
        
        this.currentUtterance.onresume = () => {
          console.log('▶️ Speech synthesis resumed');
        };
        
        this.currentUtterance.onboundary = (event) => {
          console.log('📍 Speech boundary:', event.name, 'at position', event.charIndex);
        };
        
        // Start speaking with retry mechanism
        const startSpeaking = () => {
          try {
            console.log('🎤 Attempting to start speech...');
            this.synth.speak(this.currentUtterance!);
            
            // Monitor if speech actually starts
            setTimeout(() => {
              if (this.currentUtterance && !this.synth.speaking && !this.synth.pending) {
                console.warn('⚠️ Speech did not start, retrying...');
                this.synth.cancel();
                setTimeout(() => {
                  if (this.currentUtterance) {
                    this.synth.speak(this.currentUtterance);
                  }
                }, 100);
              }
            }, 500);
            
          } catch (speakError) {
            console.error('❌ Failed to start speech:', speakError);
            reject(new Error('Failed to start speech synthesis'));
          }
        };
        
        startSpeaking();
        
      } catch (error) {
        console.error('❌ Speech synthesis setup failed:', error);
        this.currentUtterance = null;
        this.activeUtterances = [];
        reject(error);
      }
    });
  }

  stop(): void {
    console.log('🛑 Stopping speech synthesis');
    if (this.synth.speaking || this.synth.pending) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
    this.activeUtterances = [];
  }

  isPlaying(): boolean {
    return this.synth.speaking;
  }

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
