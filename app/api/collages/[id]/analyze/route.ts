import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { identityCollages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import OpenAI from 'openai';
import type { CollageAnalysis } from '@/types/collage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get collage data
    const collages = await db
      .select()
      .from(identityCollages)
      .where(eq(identityCollages.id, id));

    if (collages.length === 0) {
      return NextResponse.json({ error: 'Collage not found' }, { status: 404 });
    }

    const collage = collages[0];

    // Check if analysis already exists
    const canvasJSON = collage.canvasJSON as any;
    if (canvasJSON?.analysis) {
      return NextResponse.json({ analysis: canvasJSON.analysis, cached: true });
    }

    // Generate analysis using GPT-4
    console.log('[Analysis] Generating analysis for collage:', id);
    const analysis = await generateCollageAnalysis({
      themes: collage.session1Themes as string[] || [],
      interests: collage.session1Interests as string[] || [],
      careerClusters: collage.session1Clusters as string[] || [],
      aboutMe: collage.aboutMe || '',
      elementCount: collage.elementCount || 0,
      challenges: {
        challenge1: collage.challenge1Complete,
        challenge2: collage.challenge2Complete,
        challenge3: collage.challenge3Complete,
        challenge4: collage.challenge4Complete,
        challenge5: collage.challenge5Complete,
      },
    });

    console.log('[Analysis] Generated analysis:', JSON.stringify(analysis, null, 2));

    // Save analysis back to database
    await db
      .update(identityCollages)
      .set({
        canvasJSON: {
          ...canvasJSON,
          analysis,
        },
      })
      .where(eq(identityCollages.id, id));

    console.log('[Analysis] Saved analysis to database');

    return NextResponse.json({ analysis, cached: false });
  } catch (error) {
    console.error('[Analysis] Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

async function generateCollageAnalysis(data: {
  themes: string[];
  interests: string[];
  careerClusters: string[];
  aboutMe: string;
  elementCount: number;
  challenges: any;
}): Promise<CollageAnalysis> {
  const completedChallenges = Object.values(data.challenges).filter(Boolean).length;

  const prompt = `Analyze this middle school student's identity collage and generate a comprehensive report.

Student Profile:
- Selected Themes: ${data.themes.join(', ') || 'Not specified'}
- Interests: ${data.interests.join(', ') || 'Not specified'}
- Career Clusters: ${data.careerClusters.join(', ') || 'Not specified'}
- About Me Statement: "${data.aboutMe || 'Not provided'}"
- Elements Created: ${data.elementCount}
- Challenges Completed: ${completedChallenges}/5

Generate a JSON response with the following structure:
{
  "themes": [
    {
      "title": "Theme name (e.g., 'Brain & Intelligence', 'Community & Connection')",
      "description": "2-3 sentences explaining how this theme appears in their collage and what it reveals about them",
      "emoji": "Relevant emoji (e.g., '🧠', '🤝', '🎨', '🌍')"
    }
    // Generate 4-5 themes total based on their profile
  ],
  "careerPathways": [
    {
      "title": "Career field (e.g., 'Software Engineering', 'Environmental Science', 'Creative Arts')",
      "description": "2 sentences explaining why this career matches their interests and strengths",
      "emoji": "Career emoji (e.g., '💻', '🌱', '🎨', '🔬')"
    }
    // Generate 4 career pathways that genuinely match their profile
  ],
  "quoteAnalysis": {
    "reveals": [
      "Quality 1 (e.g., 'Resourcefulness')",
      "Quality 2 (e.g., 'Optimism')",
      "Quality 3 (e.g., 'Problem-Solving')",
      "Quality 4 (e.g., 'Resilience')"
    ]
  },
  "nextSteps": [
    "Specific, actionable step 1 related to their interests",
    "Specific, actionable step 2 related to their career interests",
    "Specific, actionable step 3 for skill development",
    "Specific, actionable step 4 for exploration"
  ]
}

Guidelines:
- Be specific and personalized to THIS student's profile
- Use encouraging, age-appropriate language (6th-8th grade level)
- Focus on strengths and possibilities
- Make career suggestions realistic and inspiring
- Next steps should be concrete and achievable
- If limited information, make reasonable inferences based on what's provided`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert career counselor for middle school students (grades 6-8). You help students discover their strengths and explore career possibilities in an encouraging, age-appropriate way.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    const analysis = JSON.parse(content) as CollageAnalysis;

    // Validate structure
    if (!analysis.themes || !Array.isArray(analysis.themes)) {
      throw new Error('Invalid analysis structure: themes missing or invalid');
    }
    if (!analysis.careerPathways || !Array.isArray(analysis.careerPathways)) {
      throw new Error('Invalid analysis structure: careerPathways missing or invalid');
    }
    if (!analysis.nextSteps || !Array.isArray(analysis.nextSteps)) {
      throw new Error('Invalid analysis structure: nextSteps missing or invalid');
    }

    return analysis;
  } catch (error) {
    console.error('[Analysis] OpenAI error:', error);

    // Fallback to default analysis if OpenAI fails
    return {
      themes: [
        {
          title: 'Creative Expression',
          description: 'Your collage shows a creative approach to self-expression, combining different elements to tell your unique story.',
          emoji: '🎨',
        },
        {
          title: 'Personal Growth',
          description: 'You demonstrate a commitment to learning and developing new skills through the challenges you\'ve completed.',
          emoji: '🌱',
        },
        {
          title: 'Future-Focused',
          description: 'Your choices reflect someone thinking about the future and exploring different possibilities.',
          emoji: '🚀',
        },
      ],
      careerPathways: [
        {
          title: 'Creative Fields',
          description: 'Your artistic expression and creativity could lead to careers in design, media, arts, or entertainment.',
          emoji: '🎨',
        },
        {
          title: 'Technology',
          description: 'Your problem-solving skills and interest in building things align well with technology and engineering careers.',
          emoji: '💻',
        },
        {
          title: 'Education',
          description: 'Your ability to communicate and help others suggests potential in teaching, training, or mentoring roles.',
          emoji: '📚',
        },
        {
          title: 'Entrepreneurship',
          description: 'Your innovative thinking and self-direction could lead to starting your own projects or business.',
          emoji: '💡',
        },
      ],
      quoteAnalysis: {
        reveals: ['Creativity', 'Determination', 'Optimism', 'Growth Mindset'],
      },
      nextSteps: [
        'Work on hands-on projects using skills you enjoy',
        'Join clubs or competitions related to your interests',
        'Take elective courses in areas you want to explore more',
        'Connect with mentors or professionals in fields that interest you',
      ],
    };
  }
}
