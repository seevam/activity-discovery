import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { identityCollages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/collages/[id] - Get specific collage
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const collages = await db
      .select()
      .from(identityCollages)
      .where(eq(identityCollages.id, params.id));

    if (collages.length === 0) {
      return NextResponse.json({ error: 'Collage not found' }, { status: 404 });
    }

    return NextResponse.json(collages[0]);
  } catch (error) {
    console.error('Error fetching collage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collage' },
      { status: 500 }
    );
  }
}

// PUT /api/collages/[id] - Update collage (auto-save)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { canvasJSON, elementCount, aboutMe, ...otherUpdates } = body;

    const updateData: any = {
      updatedAt: new Date(),
      ...otherUpdates,
    };

    if (canvasJSON) {
      updateData.canvasJSON = canvasJSON;
    }

    if (elementCount !== undefined) {
      updateData.elementCount = elementCount;
    }

    if (aboutMe !== undefined) {
      updateData.aboutMe = aboutMe;
    }

    const updated = await db
      .update(identityCollages)
      .set(updateData)
      .where(eq(identityCollages.id, params.id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Collage not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Error updating collage:', error);
    return NextResponse.json(
      { error: 'Failed to update collage' },
      { status: 500 }
    );
  }
}
