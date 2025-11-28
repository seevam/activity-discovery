import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { identityCollages, badgeUnlocks } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { BADGES } from '@/lib/constants/badges';

// POST /api/collages/[id]/challenges/[challengeNumber]/complete
export async function POST(
  request: Request,
  { params }: { params: { id: string; challengeNumber: string } }
) {
  try {
    const challengeNumber = parseInt(params.challengeNumber);

    if (challengeNumber < 1 || challengeNumber > 5) {
      return NextResponse.json(
        { error: 'Invalid challenge number' },
        { status: 400 }
      );
    }

    // Get collage
    const collages = await db
      .select()
      .from(identityCollages)
      .where(eq(identityCollages.id, params.id));

    if (collages.length === 0) {
      return NextResponse.json({ error: 'Collage not found' }, { status: 404 });
    }

    const collage = collages[0];

    // Mark challenge as complete
    const fieldName = `challenge${challengeNumber}Complete` as keyof typeof identityCollages.$inferInsert;
    const updateData: any = {
      [fieldName]: true,
    };

    await db
      .update(identityCollages)
      .set(updateData)
      .where(eq(identityCollages.id, params.id));

    // Find the badge for this challenge
    const badge = Object.values(BADGES).find((b) => b.challenge === challengeNumber);

    if (!badge) {
      return NextResponse.json({ success: true, badgeUnlocked: null });
    }

    // Check if badge already unlocked
    const existingBadges = await db
      .select()
      .from(badgeUnlocks)
      .where(
        and (
          eq(badgeUnlocks.collageId, params.id))
          eq(badgeUnlocks.badgeId, badge.id)
      )
    );

    if (existingBadges.length === 0) {
      // Unlock badge
      await db.insert(badgeUnlocks).values({
        collageId: params.id,
        studentId: collage.studentId,
        badgeId: badge.id,
      });

      // Update collage badges array
      const currentBadges = (collage.badgesEarned as string[]) || [];
      await db
        .update(identityCollages)
        .set({
          badgesEarned: [...currentBadges, badge.id],
        })
        .where(eq(identityCollages.id, params.id));

      return NextResponse.json({
        success: true,
        badgeUnlocked: {
          id: badge.id,
          name: badge.name,
          emoji: badge.emoji,
          stickersUnlocked: badge.stickersUnlocked,
        },
      });
    }

    return NextResponse.json({ success: true, badgeUnlocked: null });
  } catch (error) {
    console.error('Error completing challenge:', error);
    return NextResponse.json(
      { error: 'Failed to complete challenge' },
      { status: 500 }
    );
  }
}
