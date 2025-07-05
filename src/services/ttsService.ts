
export interface TTSOptions {
  text: string;
  voiceId: string;
  model?: string;
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
      const response = await fetch(`${this.baseUrl}/user`, {
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

  private chunkText(text: string, maxLength: number = 5000): string[] {
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
        currentChunk = potentialChunk.slice(0, -1); // Remove the extra period
      }
    }
    
    if (currentChunk.length > 0) {
      chunks.push(currentChunk + '.');
    }
    
    return chunks;
  }

  private generateSubtitles(text: string): SubtitleSegment[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const subtitles: SubtitleSegment[] = [];
    let currentTime = 0;
    
    sentences.forEach((sentence, index) => {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length === 0) return;
      
      // Estimate duration based on word count (average 2.5 words per second)
      const wordCount = trimmedSentence.split(' ').length;
      const duration = Math.max(2, wordCount / 2.5);
      
      subtitles.push({
        start: currentTime,
        end: currentTime + duration,
        text: trimmedSentence + '.'
      });
      
      currentTime += duration + 0.5; // Add small pause between sentences
    });
    
    return subtitles;
  }

  async generateAudio(options: TTSOptions): Promise<{ audioUrl: string; subtitles: SubtitleSegment[] }> {
    const { text, voiceId, model = 'eleven_multilingual_v2' } = options;

    try {
      // Generate subtitles first
      const subtitles = this.generateSubtitles(text);
      
      // Check if text is too long and chunk if necessary
      const chunks = this.chunkText(text, 5000);
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
              stability: 0.5,
              similarity_boost: 0.5,
              style: 0.0,
              use_speaker_boost: true,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('TTS API Error:', errorData);
          throw new Error(`TTS API error: ${response.status} - ${errorData.detail?.message || response.statusText}`);
        }

        const audioBlob = await response.blob();
        audioBlobs.push(audioBlob);
        
        // Add a small delay between requests to avoid rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Combine audio blobs if multiple chunks
      let finalBlob: Blob;
      if (audioBlobs.length === 1) {
        finalBlob = audioBlobs[0];
      } else {
        // For multiple chunks, we'll use the first one for now
        // In production, you'd want to concatenate the audio properly
        finalBlob = audioBlobs[0];
        console.log('Note: Multiple audio chunks detected. Using first chunk only.');
      }
      
      const audioUrl = URL.createObjectURL(finalBlob);
      return { audioUrl, subtitles };
    } catch (error) {
      console.error('TTS generation failed:', error);
      throw error;
    }
  }
}

// Voice ID mapping for our predefined voices
export const VOICE_IDS = {
  aria: '9BWtsMINqrJLrRacOk9x',
  sarah: 'EXAVITQu4vr4xnSDxMaL',
  charlie: 'IKne3meq5aSn9XLyUdCD',
  laura: 'FGY2WhTYpPnrIDTdsKH5',
  george: 'JBFqnCBsd6RMkjVDRZzb',
};
