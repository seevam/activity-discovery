import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { identityCollages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/collages - Create new collage
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, session1Input, templateType } = body;

    if (!studentId || !session1Input || !templateType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newCollage = await db
      .insert(identityCollages)
      .values({
        studentId,
        session1Themes: session1Input.themes,
        session1Interests: session1Input.interests,
        session1Clusters: session1Input.careerClusters,
        templateType,
        canvasWidth: 800,
        canvasHeight: 600,
        canvasJSON: { objects: [], version: '5.3.0' },
        status: 'in_progress',
      })
      .returning();

    return NextResponse.json(newCollage[0], { status: 201 });
  } catch (error) {
    console.error('Error creating collage:', error);
    return NextResponse.json(
      { error: 'Failed to create collage' },
      { status: 500 }
    );
  }
}

// GET /api/collages?studentId=xxx - Get collages by student
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    const collages = await db
      .select()
      .from(identityCollages)
      .where(eq(identityCollages.studentId, studentId));

    return NextResponse.json(collages);
  } catch (error) {
    console.error('Error fetching collages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collages' },
      { status: 500 }
    );
  }
}
