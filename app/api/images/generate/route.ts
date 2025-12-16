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

    console.log('[API] Generating AI image with prompt:', prompt, 'style:', style);

    const imageUrl = await generateAIImage(prompt, style);
    console.log('[API] DALL-E returned URL:', imageUrl);

    // Download the image and convert to base64 to avoid CORS issues
    // DALL-E URLs expire quickly and have CORS restrictions
    try {
      console.log('[API] Downloading image from DALL-E...');
      const imageResponse = await fetch(imageUrl);

      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`);
      }

      const arrayBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;

      console.log('[API] Image converted to base64, length:', dataUrl.length);

      return NextResponse.json({
        id: Date.now().toString(),
        url: dataUrl, // Return base64 data URL instead of DALL-E URL
        prompt,
      });
    } catch (downloadError) {
      console.error('[API] Failed to download/convert image:', downloadError);
      // Fallback to original URL if download fails
      return NextResponse.json({
        id: Date.now().toString(),
        url: imageUrl,
        prompt,
        warning: 'Using direct URL - may have CORS issues'
      });
    }
  } catch (error: any) {
    console.error('[API] AI image generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
