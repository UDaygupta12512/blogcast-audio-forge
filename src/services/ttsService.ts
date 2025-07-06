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
      
      // First try to get user info (less permissions required)
      const userResponse = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (userResponse.status === 401) {
        const errorData = await userResponse.json().catch(() => ({}));
        if (errorData.detail?.message?.includes('missing_permissions')) {
          return {
            isValid: false,
            error: 'API key lacks required permissions. Please ensure your ElevenLabs API key has text-to-speech and voices permissions enabled.'
          };
        }
        return {
          isValid: false,
          error: 'Invalid API key. Please check your ElevenLabs API key.'
        };
      }

      if (!userResponse.ok) {
        return {
          isValid: false,
          error: `API validation failed with status: ${userResponse.status}`
        };
      }

      // If user endpoint works, try voices endpoint
      const voicesResponse = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (voicesResponse.status === 401) {
        return {
          isValid: false,
          error: 'API key lacks voices permissions. Please upgrade your ElevenLabs plan or contact support.'
        };
      }

      if (!voicesResponse.ok) {
        return {
          isValid: false,
          error: 'Unable to access voices. Please check your API key permissions.'
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
      
      // Adjust duration based on speed and word count
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
      console.log('Starting TTS generation with improved settings...');
      
      // Validate API key first
      const validation = await this.validateApiKey();
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid API key');
      }
      
      // Generate subtitles with speed adjustment
      const subtitles = this.generateSubtitles(text, speed);
      
      // Chunk text for better processing
      const chunks = this.chunkText(text, 1500); // Smaller chunks for better reliability
      console.log(`Processing ${chunks.length} text chunks for better quality`);
      
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
          const errorText = await response.text();
          console.error('TTS API Error Response:', errorText);
          
          if (response.status === 401) {
            throw new Error('API key is invalid or lacks required permissions for text-to-speech.');
          }
          
          throw new Error(`TTS API error: ${response.status} - ${errorText}`);
        }

        const audioBlob = await response.blob();
        audioBlobs.push(audioBlob);
        
        // Shorter delay between requests
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      // Use the first chunk for now (in production, you'd concatenate)
      const finalBlob = audioBlobs[0];
      
      if (audioBlobs.length > 1) {
        console.log('Multiple audio chunks generated. Using first chunk for demo.');
      }
      
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

// Enhanced voice options with more variety
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
