import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { identityCollages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateAboutMeSuggestions, AboutMeSuggestion } from '@/lib/api/openai';

// Fallback About Me suggestions when OpenAI is not available
const FALLBACK_ABOUT_ME_SUGGESTIONS: AboutMeSuggestion[] = [
  {
    focus: 'creative',
    text: "I'm a creative thinker who loves exploring new ideas and bringing them to life. Whether I'm working on a project or solving a problem, I always look for unique and innovative approaches. I'm passionate about learning and growing, and I'm excited to see where my creativity takes me in the future."
  },
  {
    focus: 'collaborative',
    text: "I'm someone who believes in the power of teamwork and helping others. I love working with people to achieve common goals and making a positive difference in my community. My values of kindness, empathy, and cooperation guide everything I do, and I'm excited to continue building meaningful connections as I grow."
  },
  {
    focus: 'builder',
    text: "I'm a hands-on learner who loves creating, building, and making things happen. I enjoy taking on challenges and finding practical solutions to problems. I'm determined and hardworking, and I'm always ready to try new things. I can't wait to see what I'll accomplish in the future as I follow my passions."
  }
];

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

    // Try to generate AI suggestions, fall back to generic ones if it fails
    try {
      const suggestions = await generateAboutMeSuggestions(collageData);
      return NextResponse.json({ suggestions });
    } catch (aiError) {
      console.warn('OpenAI About Me generation failed, using fallback suggestions:', aiError);
      return NextResponse.json({
        suggestions: FALLBACK_ABOUT_ME_SUGGESTIONS,
        fallback: true
      });
    }
  } catch (error: any) {
    console.error('About Me suggestions error:', error);

    // Return fallback suggestions even on error
    return NextResponse.json({
      suggestions: FALLBACK_ABOUT_ME_SUGGESTIONS,
      fallback: true
    });
  }
}
