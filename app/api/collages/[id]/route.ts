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
    console.log('[API] GET /api/collages/[id] - Fetching collage:', params.id);

    const collages = await db
      .select()
      .from(identityCollages)
      .where(eq(identityCollages.id, params.id));

    if (collages.length === 0) {
      console.error('[API] Collage not found:', params.id);
      return NextResponse.json({ error: 'Collage not found' }, { status: 404 });
    }

    const collage = collages[0];
    console.log('[API] Collage retrieved:', {
      id: collage.id,
      hasCanvasJSON: !!collage.canvasJSON,
      objectCount: collage.canvasJSON?.objects?.length || 0,
      elementCount: collage.elementCount
    });

    if (collage.canvasJSON?.objects) {
      console.log('[API] Canvas objects retrieved:', collage.canvasJSON.objects.map((o: any) => ({
        type: o.type,
        text: o.type === 'text' ? o.text?.substring(0, 30) : undefined
      })));
    }

    return NextResponse.json(collage);
  } catch (error) {
    console.error('[API] Error fetching collage:', error);
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

    console.log('[API] PUT /api/collages/[id] - Updating collage:', params.id);
    console.log('[API] Canvas data:', {
      hasCanvasJSON: !!canvasJSON,
      objectCount: canvasJSON?.objects?.length || 0,
      elementCount,
      hasAboutMe: !!aboutMe
    });

    if (canvasJSON?.objects) {
      console.log('[API] Canvas objects being saved:', canvasJSON.objects.map((o: any) => ({
        type: o.type,
        text: o.type === 'text' ? o.text?.substring(0, 30) : undefined
      })));
    }

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
      console.error('[API] Collage not found:', params.id);
      return NextResponse.json({ error: 'Collage not found' }, { status: 404 });
    }

    console.log('[API] Collage updated successfully, objects saved:', updated[0].canvasJSON?.objects?.length || 0);
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('[API] Error updating collage:', error);
    return NextResponse.json(
      { error: 'Failed to update collage' },
      { status: 500 }
    );
  }
}
