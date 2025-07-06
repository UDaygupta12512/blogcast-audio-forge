export interface TTSOptions {
  text: string;
  voiceId: string;
  model?: string;
  speed?: number;
  stability?: number;
  similarity?: number;
}

export interface SubtitleSegment {
  start: number;
  end: number;
  text: string;
}

export class TTSService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async validateApiKey(): Promise<{ isValid: boolean; error?: string }> {
    try {
      console.log('Validating ElevenLabs API key...');
      
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        console.log('API validation error:', errorData);
        
        if (errorData.detail?.status === 'detected_unusual_activity') {
          return {
            isValid: false,
            error: 'ElevenLabs has detected unusual activity. This often happens with free tier accounts. Please upgrade to a paid plan or try again later without VPN/proxy.'
          };
        }
        
        return {
          isValid: false,
          error: 'Invalid API key. Please check your ElevenLabs API key is correct and has the required permissions.'
        };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('API error:', errorData);
        
        return {
          isValid: false,
          error: `API validation failed: ${response.status}. Please check your API key and account status.`
        };
      }

      const data = await response.json();
      if (!data.voices || data.voices.length === 0) {
        return {
          isValid: false,
          error: 'No voices available. Please check your ElevenLabs subscription and API key permissions.'
        };
      }

      console.log('API key validation successful');
      return { isValid: true };
    } catch (error) {
      console.error('API key validation failed:', error);
      return {
        isValid: false,
        error: 'Network error during validation. Please check your internet connection.'
      };
    }
  }

  private chunkText(text: string, maxLength: number = 2500): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length === 0) continue;
      
      const potentialChunk = currentChunk + (currentChunk ? '. ' : '') + trimmedSentence + '.';
      
      if (potentialChunk.length > maxLength && currentChunk.length > 0) {
        chunks.push(currentChunk + '.');
        currentChunk = trimmedSentence;
      } else {
        currentChunk = potentialChunk.slice(0, -1);
      }
    }
    
    if (currentChunk.length > 0) {
      chunks.push(currentChunk + '.');
    }
    
    return chunks;
  }

  private generateSubtitles(text: string, speed: number = 1): SubtitleSegment[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const subtitles: SubtitleSegment[] = [];
    let currentTime = 0;
    
    sentences.forEach((sentence, index) => {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length === 0) return;
      
      const wordCount = trimmedSentence.split(' ').length;
      const baseDuration = Math.max(1.5, wordCount / 2.2);
      const duration = baseDuration / speed;
      
      subtitles.push({
        start: currentTime,
        end: currentTime + duration,
        text: trimmedSentence + '.'
      });
      
      currentTime += duration + (0.3 / speed);
    });
    
    return subtitles;
  }

  async generateAudio(options: TTSOptions): Promise<{ audioUrl: string; subtitles: SubtitleSegment[] }> {
    const { 
      text, 
      voiceId, 
      model = 'eleven_multilingual_v2',
      speed = 1,
      stability = 0.6,
      similarity = 0.8
    } = options;

    try {
      console.log('Starting TTS generation...');
      
      const subtitles = this.generateSubtitles(text, speed);
      const chunks = this.chunkText(text, 1500);
      console.log(`Processing ${chunks.length} text chunks`);
      
      const audioBlobs: Blob[] = [];
      
      for (let i = 0; i < chunks.length; i++) {
        console.log(`Processing chunk ${i + 1}/${chunks.length}`);
        
        const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text: chunks[i],
            model_id: model,
            voice_settings: {
              stability: stability,
              similarity_boost: similarity,
              style: 0.2,
              use_speaker_boost: true,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('TTS API Error:', errorData);
          
          // Handle specific ElevenLabs errors
          if (errorData.detail?.status === 'detected_unusual_activity') {
            throw new Error('ElevenLabs detected unusual activity. Free tier accounts may be limited. Please upgrade to a paid plan or disable VPN/proxy and try again.');
          }
          
          if (response.status === 401) {
            throw new Error('API key authentication failed. Please check your ElevenLabs API key and account status.');
          }
          
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait a moment and try again, or upgrade your ElevenLabs plan.');
          }
          
          throw new Error(`TTS generation failed: ${errorData.detail?.message || `HTTP ${response.status}`}`);
        }

        const audioBlob = await response.blob();
        audioBlobs.push(audioBlob);
        
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      const finalBlob = audioBlobs[0];
      const audioUrl = URL.createObjectURL(finalBlob);
      
      console.log('TTS generation completed successfully');
      return { audioUrl, subtitles };
    } catch (error) {
      console.error('TTS generation failed:', error);
      throw error;
    }
  }

  async getAvailableVoices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }
      
      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      return [];
    }
  }
}

export const VOICE_IDS = {
  aria: '9BWtsMINqrJLrRacOk9x',
  sarah: 'EXAVITQu4vr4xnSDxMaL',
  charlie: 'IKne3meq5aSn9XLyUdCD',
  laura: 'FGY2WhTYpPnrIDTdsKH5',
  george: 'JBFqnCBsd6RMkjVDRZzb',
  roger: 'CwhRBWXzGAHq8TQ4Fs17',
  liam: 'TX3LPaxmHKxFdv7VOQHJ',
  charlotte: 'XB0fDUnXU5powFXDhCwa',
};
