export interface GenerateSpeechOptions {
  text: string;
  voiceId: string;
}

export interface GenerateSpeechResult {
  audioBase64: string;
  mimeType: string;
}

export interface GenerateSpeechError {
  error: string;
}

export type SpeechResult = GenerateSpeechResult | GenerateSpeechError;

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export async function generateSpeech({ text, voiceId }: GenerateSpeechOptions): Promise<SpeechResult> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return { error: 'ElevenLabs API key not configured' };
  }

  try {
    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      
      if (response.status === 401) {
        return { error: 'Invalid API key' };
      }
      if (response.status === 429) {
        return { error: 'Rate limit exceeded. Please try again later.' };
      }
      if (response.status === 400) {
        return { error: 'Invalid request. The text may be too long or contain unsupported characters.' };
      }
      
      return { error: `Speech generation failed: ${response.status}` };
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    return {
      audioBase64,
      mimeType: 'audio/mpeg',
    };
  } catch (err) {
    console.error('ElevenLabs fetch error:', err);
    return { error: 'Failed to connect to ElevenLabs API' };
  }
}
