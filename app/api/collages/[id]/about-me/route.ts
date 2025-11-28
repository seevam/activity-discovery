import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { identityCollages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/collages/[id]/about-me - Save About Me statement
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { aboutMe } = body;

    if (!aboutMe || aboutMe.trim().length < 50) {
      return NextResponse.json(
        { error: 'About Me statement must be at least 50 characters' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(identityCollages)
      .set({
        aboutMe: aboutMe.trim(),
        finalChallengeComplete: true,
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(identityCollages.id, params.id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Collage not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error saving About Me:', error);
    return NextResponse.json(
      { error: 'Failed to save About Me' },
      { status: 500 }
    );
  }
}
