import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { identityCollages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generatePersonalization } from '@/lib/api/openai';
import { Session1Input } from '@/types/collage';

// GET /api/collages/[id]/quotes - Get personalized quote suggestions
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch the collage to get session1Input
    const collages = await db
      .select()
      .from(identityCollages)
      .where(eq(identityCollages.id, params.id));

    if (collages.length === 0) {
      return NextResponse.json({ error: 'Collage not found' }, { status: 404 });
    }

    const collage = collages[0];

    // Reconstruct Session1Input from database fields
    const session1Input: Session1Input = {
      themes: collage.session1Themes as string[],
      interests: collage.session1Interests as string[],
      careerClusters: collage.session1Clusters as string[],
    };

    if (!session1Input.themes || !session1Input.interests || !session1Input.careerClusters) {
      return NextResponse.json(
        { error: 'Session 1 input not found for this collage' },
        { status: 400 }
      );
    }

    // Generate personalized content including quotes
    const personalization = await generatePersonalization(session1Input);

    // Return only the quotes
    return NextResponse.json({ quotes: personalization.quotes });
  } catch (error) {
    console.error('Error generating quote suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate quote suggestions' },
      { status: 500 }
    );
  }
}
