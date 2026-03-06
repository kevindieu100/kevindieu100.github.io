import { NextRequest, NextResponse } from 'next/server';
import { generateAssistantResponse, ShopperContext, SuggestedAction } from '@/lib/nikeAssistant';
import { generateSpeech } from '@/lib/elevenlabs';
import { getVoiceById, getDefaultVoice } from '@/lib/voices';

interface RequestBody {
  message: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  selectedVoiceId?: string;
  shopperContext?: ShopperContext;
}

interface SuccessResponse {
  reply: string;
  audioBase64?: string;
  mimeType?: string;
  suggestedActions: SuggestedAction[];
  updatedShopperContext?: ShopperContext;
}

interface ErrorResponse {
  error: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const body: RequestBody = await request.json();
    const { message, conversationHistory, selectedVoiceId, shopperContext } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Generate assistant response using rule-based logic
    const assistantResponse = generateAssistantResponse(
      message,
      conversationHistory || [],
      shopperContext || {}
    );

    // Get voice for TTS
    const voice = selectedVoiceId ? getVoiceById(selectedVoiceId) : getDefaultVoice();
    const voiceId = voice?.id || getDefaultVoice().id;

    // Generate speech from the reply
    const speechResult = await generateSpeech({
      text: assistantResponse.reply,
      voiceId,
    });

    // Return response with or without audio
    if ('error' in speechResult) {
      // Return text response even if TTS fails
      return NextResponse.json({
        reply: assistantResponse.reply,
        suggestedActions: assistantResponse.suggestedActions,
        updatedShopperContext: assistantResponse.updatedShopperContext,
      });
    }

    return NextResponse.json({
      reply: assistantResponse.reply,
      audioBase64: speechResult.audioBase64,
      mimeType: speechResult.mimeType,
      suggestedActions: assistantResponse.suggestedActions,
      updatedShopperContext: assistantResponse.updatedShopperContext,
    });
  } catch (err) {
    console.error('Nike Assistant API error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
