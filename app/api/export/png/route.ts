import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { identityCollages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/export/png
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { collageId, dataUrl } = body;

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

    // If dataUrl provided, save it
    if (dataUrl) {
      await db
        .update(identityCollages)
        .set({ pngUrl: dataUrl })
        .where(eq(identityCollages.id, collageId));

      return NextResponse.json({ pngUrl: dataUrl });
    }

    const collage = collages[0];

    // Return existing PNG URL if available
    if (collage.pngUrl) {
      return NextResponse.json({ pngUrl: collage.pngUrl });
    }

    return NextResponse.json(
      { error: 'No PNG data available. Please provide dataUrl.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('PNG export error:', error);
    return NextResponse.json(
      { error: 'Failed to export PNG' },
      { status: 500 }
    );
  }
}
