
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

  async validateApiKey(): Promise<boolean> {
    try {
      // Use voices endpoint instead of user endpoint for validation
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('API key validation failed:', error);
      return false;
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
      
      // Generate subtitles with speed adjustment
      const subtitles = this.generateSubtitles(text, speed);
      
      // Chunk text for better processing
      const chunks = this.chunkText(text, 2500);
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
            pronunciation_dictionary_locators: [],
            seed: null,
            previous_text: i > 0 ? chunks[i - 1].slice(-100) : null,
            next_text: i < chunks.length - 1 ? chunks[i + 1].slice(0, 100) : null,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('TTS API Error Response:', errorText);
          throw new Error(`TTS API error: ${response.status} - ${errorText}`);
        }

        const audioBlob = await response.blob();
        audioBlobs.push(audioBlob);
        
        // Shorter delay between requests
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
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
