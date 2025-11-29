import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { identityCollages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { BADGES } from '@/lib/constants/badges';
import { jsPDF } from 'jspdf';

// POST /api/export/pdf
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { collageId, canvasDataUrl } = body;

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

    // Use provided canvas data URL, or fall back to stored pngUrl
    const imageUrl = canvasDataUrl || collage.pngUrl;

    // Ensure badgesEarned is an array
    const badgesEarned = Array.isArray(collage.badgesEarned) ? collage.badgesEarned : [];

    // Create PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('My Identity Collage', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Add collage image if available
    if (imageUrl) {
      try {
        // Add image (centered, max width 170mm)
        const imgWidth = 170;
        const imgHeight = 120; // Maintain aspect ratio
        const xPosition = (pageWidth - imgWidth) / 2;

        doc.addImage(imageUrl, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      } catch (error) {
        console.error('Failed to add image to PDF:', error);
        doc.setFontSize(10);
        doc.text('(Collage image not available)', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;
      }
    }

    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    // Stats section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Statistics', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const completedChallenges = [
      collage.challenge1Complete,
      collage.challenge2Complete,
      collage.challenge3Complete,
      collage.challenge4Complete,
      collage.challenge5Complete,
    ].filter(Boolean).length;

    doc.text(`Challenges Completed: ${completedChallenges}/5`, 20, yPosition);
    yPosition += 6;
    doc.text(`Badges Earned: ${badgesEarned.length}/6`, 20, yPosition);
    yPosition += 6;
    doc.text(`Total Elements Created: ${collage.elementCount || 0}`, 20, yPosition);
    yPosition += 12;

    // Badges section
    if (badgesEarned.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Badges Earned', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      badgesEarned.forEach((badgeId: string) => {
        const badge = BADGES[badgeId];
        if (badge) {
          doc.text(`• ${badge.name}: ${badge.description}`, 25, yPosition);
          yPosition += 6;
        }
      });
      yPosition += 6;
    }

    // Check if we need a new page for About Me
    if (yPosition > pageHeight - 40 && collage.aboutMe) {
      doc.addPage();
      yPosition = 20;
    }

    // About Me section
    if (collage.aboutMe) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('About Me', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      // Split text into lines that fit the page width
      const maxWidth = pageWidth - 40; // 20mm margins on each side
      const lines = doc.splitTextToSize(collage.aboutMe, maxWidth);

      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, 20, yPosition);
        yPosition += 5;
      });
    }

    // Footer
    const footerY = pageHeight - 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Created on ${new Date(collage.completedAt || Date.now()).toLocaleDateString()}`,
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );

    // Generate PDF as buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Identity_Collage_${collageId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: 'Failed to export PDF: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
