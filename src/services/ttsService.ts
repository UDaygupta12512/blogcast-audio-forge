
export interface TTSOptions {
  text: string;
  voiceId: string;
  model?: string;
}

export class TTSService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateAudio(options: TTSOptions): Promise<string> {
    const { text, voiceId, model = 'eleven_multilingual_v2' } = options;

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: model,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS API error: ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
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
