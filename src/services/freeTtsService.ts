
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
    this.voices = this.synth.getVoices();
    
    if (this.voices.length === 0) {
      this.synth.addEventListener('voiceschanged', () => {
        this.voices = this.synth.getVoices();
      });
    }
  }

  async validateApiKey(): Promise<{ isValid: boolean; error?: string }> {
    if (!('speechSynthesis' in window)) {
      return {
        isValid: false,
        error: 'Speech synthesis not supported in this browser. Please use Chrome, Firefox, or Edge.'
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
    const { text, voice, rate = 1, pitch = 1, volume = 1 } = options;
    
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
        const { text, voice, rate = 1, pitch = 1, volume = 1 } = options;
        
        // Stop any current speech
        this.synth.cancel();
        
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        
        // Find the selected voice
        const selectedVoice = this.voices.find(v => v.name === voice) || this.voices[0];
        if (selectedVoice) {
          this.currentUtterance.voice = selectedVoice;
        }
        
        this.currentUtterance.rate = rate;
        this.currentUtterance.pitch = pitch;
        this.currentUtterance.volume = volume;
        
        this.currentUtterance.onend = () => {
          console.log('Speech synthesis completed');
          resolve();
        };
        
        this.currentUtterance.onerror = (error) => {
          console.error('Speech synthesis error:', error);
          reject(new Error('Speech synthesis failed'));
        };
        
        this.synth.speak(this.currentUtterance);
        
      } catch (error) {
        console.error('Speech synthesis failed:', error);
        reject(error);
      }
    });
  }

  stop(): void {
    this.synth.cancel();
    this.currentUtterance = null;
  }

  isPlaying(): boolean {
    return this.synth.speaking;
  }
}

export const FREE_VOICE_OPTIONS = {
  'Chrome Default': 'default',
  'Google US English': 'Google US English',
  'Microsoft David': 'Microsoft David Desktop - English (United States)',
  'Microsoft Zira': 'Microsoft Zira Desktop - English (United States)',
};
