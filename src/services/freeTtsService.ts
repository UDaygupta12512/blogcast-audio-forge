
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

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices(): void {
    this.voices = this.synth.getVoices();
    
    // If voices aren't loaded yet, wait for the event
    if (this.voices.length === 0) {
      this.synth.addEventListener('voiceschanged', () => {
        this.voices = this.synth.getVoices();
      });
    }
  }

  async validateApiKey(): Promise<{ isValid: boolean; error?: string }> {
    // No API key needed for Web Speech API
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
    
    return new Promise((resolve, reject) => {
      try {
        console.log('Starting free TTS generation...');
        
        const subtitles = this.generateSubtitles(text, rate);
        
        // Create speech utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Find the selected voice
        const selectedVoice = this.voices.find(v => v.name === voice) || this.voices[0];
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;
        
        // We can't get actual audio file from Web Speech API easily
        // So we'll create a simple audio URL placeholder
        const audioUrl = `data:audio/wav;base64,${btoa('DUMMY_AUDIO_DATA')}`;
        
        utterance.onend = () => {
          console.log('Free TTS generation completed');
          resolve({ audioUrl, subtitles });
        };
        
        utterance.onerror = (error) => {
          console.error('Free TTS error:', error);
          reject(new Error('Speech synthesis failed'));
        };
        
        // Start speaking
        this.synth.speak(utterance);
        
        // Return immediately with subtitles for preview
        setTimeout(() => {
          resolve({ audioUrl, subtitles });
        }, 1000);
        
      } catch (error) {
        console.error('Free TTS generation failed:', error);
        reject(error);
      }
    });
  }
}

export const FREE_VOICE_OPTIONS = {
  'Google US English': 'Google US English',
  'Microsoft David': 'Microsoft David Desktop - English (United States)',
  'Microsoft Zira': 'Microsoft Zira Desktop - English (United States)',
  'Chrome Default': '',
};
