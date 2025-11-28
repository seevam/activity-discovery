import { NextResponse } from 'next/server';
import { searchImages } from '@/lib/api/unsplash';

// GET /api/images/search
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const perPage = parseInt(searchParams.get('perPage') || '20');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const images = await searchImages(query, perPage);
    return NextResponse.json(images);
  } catch (error) {
    console.error('Image search error:', error);
    return NextResponse.json(
      { error: 'Failed to search images' },
      { status: 500 }
    );
  }
}
