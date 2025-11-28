import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { identityCollages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateAboutMeSuggestions } from '@/lib/api/openai';

// POST /api/about-me/suggestions
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { collageId } = body;

    if (!collageId) {
      return NextResponse.json({ error: 'collageId is required' }, { status: 400 });
    }

    // Get collage data
    const collages = await db
      .select()
      .from(identityCollages)
      .where(eq(identityCollages.id, collageId));

    if (collages.length === 0) {
      return NextResponse.json({ error: 'Collage not found' }, { status: 404 });
    }

    const collage = collages[0];

    // Prepare data for AI
    const collageData = {
      themes: (collage.session1Themes as string[]) || [],
      interests: (collage.session1Interests as string[]) || [],
      values: [], // Extract from canvas if possible
      careerClusters: (collage.session1Clusters as string[]) || [],
      quote: undefined, // Extract from canvas if possible
    };

    // Generate suggestions
    const suggestions = await generateAboutMeSuggestions(collageData);

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error('About Me suggestions error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}
