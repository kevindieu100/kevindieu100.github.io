import { NextRequest, NextResponse } from 'next/server';
import { validateWikipediaUrl, fetchWikipediaArticle } from '@/lib/wikipedia';
import { generatePodcastScript, Tone } from '@/lib/podcast';
import { generateSpeech } from '@/lib/elevenlabs';
import { getVoiceById, getDefaultVoice } from '@/lib/voices';

interface RequestBody {
  url: string;
  voiceId: string;
  tone?: Tone;
}

interface SuccessResponse {
  title: string;
  script: string;
  audioBase64: string;
  mimeType: string;
}

interface ErrorResponse {
  error: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const body: RequestBody = await request.json();
    const { url, voiceId, tone = 'neutral' } = body;

    // Validate inputs
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate Wikipedia URL
    const urlValidation = validateWikipediaUrl(url);
    if (!urlValidation.valid || !urlValidation.title) {
      return NextResponse.json(
        { error: urlValidation.error || 'Invalid Wikipedia URL' },
        { status: 400 }
      );
    }

    // Validate voice
    const voice = getVoiceById(voiceId) || getDefaultVoice();

    // Validate tone
    const validTones: Tone[] = ['neutral', 'energetic', 'documentary'];
    const selectedTone: Tone = validTones.includes(tone) ? tone : 'neutral';

    // Fetch Wikipedia article
    const articleResult = await fetchWikipediaArticle(urlValidation.title);
    if ('error' in articleResult) {
      return NextResponse.json({ error: articleResult.error }, { status: 400 });
    }

    // Generate podcast script
    const script = generatePodcastScript({
      article: articleResult,
      tone: selectedTone,
    });

    // Generate speech
    const speechResult = await generateSpeech({
      text: script,
      voiceId: voice.id,
    });

    if ('error' in speechResult) {
      return NextResponse.json({ error: speechResult.error }, { status: 500 });
    }

    return NextResponse.json({
      title: articleResult.title,
      script,
      audioBase64: speechResult.audioBase64,
      mimeType: speechResult.mimeType,
    });
  } catch (err) {
    console.error('Wikipodcast API error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
