export interface Voice {
  id: string;
  name: string;
  description: string;
}

// Store associate appropriate voices - warm, friendly, professional
// Replace these with your actual ElevenLabs voice IDs
// Find voice IDs at: https://elevenlabs.io/app/voice-library
export const VOICES: Voice[] = [
  {
    id: '21m00Tcm4TlvDq8ikWAM', // Rachel
    name: 'Alex',
    description: 'Energetic and enthusiastic',
  },
  {
    id: 'pNInz6obpgDQGcFmaJgB', // Adam
    name: 'Jordan',
    description: 'Warm and helpful',
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL', // Bella
    name: 'Sarah',
    description: 'Friendly and approachable',
  },
  {
    id: 'ErXwobaYiN019PkySvjV', // Antoni
    name: 'Marcus',
    description: 'Professional and knowledgeable',
  },
];

export function getVoiceById(id: string): Voice | undefined {
  return VOICES.find((v) => v.id === id);
}

export function getDefaultVoice(): Voice {
  return VOICES[0];
}
