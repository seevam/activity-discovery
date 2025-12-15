import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { identityCollages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generatePersonalization } from '@/lib/api/openai';
import { Session1Input, QuoteSuggestion } from '@/types/collage';

// Fallback quotes when OpenAI is not available
const FALLBACK_QUOTES: QuoteSuggestion[] = [
  {
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
    theme: "Authenticity"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    theme: "Passion"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    theme: "Confidence"
  },
  {
    text: "Dream big and dare to fail.",
    author: "Norman Vaughan",
    theme: "Courage"
  },
  {
    text: "Your limitation—it's only your imagination.",
    author: "Unknown",
    theme: "Possibility"
  }
];

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

    // Try to generate personalized content including quotes
    try {
      const personalization = await generatePersonalization(session1Input);
      return NextResponse.json({ quotes: personalization.quotes });
    } catch (aiError) {
      // If OpenAI fails (API key missing, rate limit, etc), use fallback quotes
      console.warn('OpenAI quote generation failed, using fallback quotes:', aiError);
      return NextResponse.json({
        quotes: FALLBACK_QUOTES,
        fallback: true
      });
    }
  } catch (error) {
    console.error('Error generating quote suggestions:', error);

    // Return fallback quotes even on error
    return NextResponse.json({
      quotes: FALLBACK_QUOTES,
      fallback: true
    });
  }
}
