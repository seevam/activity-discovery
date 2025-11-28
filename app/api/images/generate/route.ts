import { NextResponse } from 'next/server';
import { generateAIImage } from '@/lib/api/openai';

// POST /api/images/generate
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, style = 'illustration' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const imageUrl = await generateAIImage(prompt, style);

    return NextResponse.json({
      id: Date.now().toString(),
      url: imageUrl,
      prompt,
    });
  } catch (error: any) {
    console.error('AI image generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
