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
    let yPosition = 0;

    // Helper function to draw rounded rectangle
    const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number, fillColor: string) => {
      doc.setFillColor(fillColor);
      doc.roundedRect(x, y, width, height, radius, radius, 'F');
    };

    // Header with gradient-like effect (using multiple colored rectangles)
    const headerHeight = 50;
    doc.setFillColor('#006BFF'); // Blue primary
    doc.rect(0, 0, pageWidth, headerHeight, 'F');

    // Add semi-transparent overlay for gradient effect
    doc.setFillColor('#4A9EFF');
    doc.setGState(new doc.GState({ opacity: 0.5 }));
    doc.rect(0, 0, pageWidth, headerHeight / 2, 'F');
    
    doc.setGState(new (doc.GState as any)({ opacity: 0.5 })); // Reset opacity

    // Title in header
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    yPosition = 25;
    doc.text('My Identity Collage', pageWidth / 2, yPosition, { align: 'center' });

    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    yPosition += 8;
    doc.text('A Visual Story of Who I Am', pageWidth / 2, yPosition, { align: 'center' });

    yPosition = headerHeight + 15;
    doc.setTextColor(0, 0, 0); // Reset to black

    // Add collage image if available
    if (imageUrl) {
      try {
        // Add decorative border around image
        const imgWidth = 170;
        const imgHeight = 120;
        const xPosition = (pageWidth - imgWidth) / 2;

        // Shadow effect
        doc.setFillColor('#E0E0E0');
        doc.roundedRect(xPosition + 2, yPosition + 2, imgWidth, imgHeight, 3, 3, 'F');

        // White border
        doc.setFillColor('#FFFFFF');
        doc.roundedRect(xPosition, yPosition, imgWidth, imgHeight, 3, 3, 'F');

        // Add image
        doc.addImage(imageUrl, 'PNG', xPosition + 3, yPosition + 3, imgWidth - 6, imgHeight - 6);

        // Border outline
        doc.setDrawColor('#006BFF');
        doc.setLineWidth(0.5);
        doc.roundedRect(xPosition, yPosition, imgWidth, imgHeight, 3, 3, 'S');

        yPosition += imgHeight + 15;
      } catch (error) {
        console.error('Failed to add image to PDF:', error);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('(Collage image not available)', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;
        doc.setTextColor(0, 0, 0);
      }
    }

    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    // Stats section with colored cards
    const completedChallenges = [
      collage.challenge1Complete,
      collage.challenge2Complete,
      collage.challenge3Complete,
      collage.challenge4Complete,
      collage.challenge5Complete,
    ].filter(Boolean).length;

    const statBoxWidth = 55;
    const statBoxHeight = 25;
    const statBoxGap = 5;
    const totalStatsWidth = (statBoxWidth * 3) + (statBoxGap * 2);
    const statBoxX = (pageWidth - totalStatsWidth) / 2;

    // Stat box 1: Challenges
    doc.setFillColor('#E3F2FD'); // Light blue
    doc.roundedRect(statBoxX, yPosition, statBoxWidth, statBoxHeight, 2, 2, 'F');
    doc.setDrawColor('#006BFF');
    doc.setLineWidth(0.3);
    doc.roundedRect(statBoxX, yPosition, statBoxWidth, statBoxHeight, 2, 2, 'S');

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#006BFF');
    doc.text(`${completedChallenges}/5`, statBoxX + statBoxWidth / 2, yPosition + 12, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Challenges', statBoxX + statBoxWidth / 2, yPosition + 18, { align: 'center' });

    // Stat box 2: Badges
    const badge2X = statBoxX + statBoxWidth + statBoxGap;
    doc.setFillColor('#F3E5F5'); // Light purple
    doc.roundedRect(badge2X, yPosition, statBoxWidth, statBoxHeight, 2, 2, 'F');
    doc.setDrawColor('#9C27B0');
    doc.roundedRect(badge2X, yPosition, statBoxWidth, statBoxHeight, 2, 2, 'S');

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#9C27B0');
    doc.text(`${badgesEarned.length}/6`, badge2X + statBoxWidth / 2, yPosition + 12, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Badges Earned', badge2X + statBoxWidth / 2, yPosition + 18, { align: 'center' });

    // Stat box 3: Elements
    const badge3X = badge2X + statBoxWidth + statBoxGap;
    doc.setFillColor('#E8F5E9'); // Light green
    doc.roundedRect(badge3X, yPosition, statBoxWidth, statBoxHeight, 2, 2, 'F');
    doc.setDrawColor('#4CAF50');
    doc.roundedRect(badge3X, yPosition, statBoxWidth, statBoxHeight, 2, 2, 'S');

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#4CAF50');
    doc.text(`${collage.elementCount || 0}`, badge3X + statBoxWidth / 2, yPosition + 12, { align: 'center' });
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Elements Created', badge3X + statBoxWidth / 2, yPosition + 18, { align: 'center' });

    yPosition += statBoxHeight + 15;
    doc.setTextColor(0, 0, 0); // Reset color

    // Badges section with decorative styling
    if (badgesEarned.length > 0) {
      // Section header
      doc.setFillColor('#FFF9E6'); // Light yellow background
      doc.roundedRect(15, yPosition - 5, pageWidth - 30, 12, 2, 2, 'F');

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#F59E0B'); // Orange color
      doc.text('🏆 Badges Earned', 20, yPosition + 2);
      yPosition += 12;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);

      badgesEarned.forEach((badgeId: string, index: number) => {
        const badge = BADGES[badgeId];
        if (badge) {
          // Alternating background colors for badges
          if (index % 2 === 0) {
            doc.setFillColor('#F9FAFB');
            doc.roundedRect(18, yPosition - 3, pageWidth - 36, 8, 1, 1, 'F');
          }

          doc.setFont('helvetica', 'bold');
          doc.setTextColor('#006BFF');
          doc.text(`• ${badge.name}`, 22, yPosition + 2);

          doc.setFont('helvetica', 'normal');
          doc.setTextColor(80, 80, 80);
          doc.text(`: ${badge.description}`, 22 + doc.getTextWidth(`• ${badge.name}`) + 2, yPosition + 2);

          yPosition += 8;
        }
      });
      yPosition += 8;
    }

    // Check if we need a new page for About Me
    if (yPosition > pageHeight - 40 && collage.aboutMe) {
      doc.addPage();
      yPosition = 20;
    }

    // About Me section with styled box
    if (collage.aboutMe) {
      // Section header
      doc.setFillColor('#E3F2FD'); // Light blue background
      doc.roundedRect(15, yPosition - 5, pageWidth - 30, 12, 2, 2, 'F');

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#006BFF');
      doc.text('✍️ About Me', 20, yPosition + 2);
      yPosition += 15;

      // Content box
      const contentBoxPadding = 8;
      const contentStartY = yPosition;

      // Estimate height needed for content
      const maxWidth = pageWidth - 40;
      const lines = doc.splitTextToSize(collage.aboutMe, maxWidth - contentBoxPadding * 2);
      const contentHeight = lines.length * 5 + contentBoxPadding * 2;

      // Draw content box background
      doc.setFillColor('#F9FAFB');
      doc.roundedRect(20, contentStartY, pageWidth - 40, contentHeight, 2, 2, 'F');
      doc.setDrawColor('#E5E7EB');
      doc.setLineWidth(0.3);
      doc.roundedRect(20, contentStartY, pageWidth - 40, contentHeight, 2, 2, 'S');

      // Add text content
      yPosition = contentStartY + contentBoxPadding + 4;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);

      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 25) {
          doc.addPage();
          yPosition = 25;
        }
        doc.text(line, 20 + contentBoxPadding, yPosition);
        yPosition += 5;
      });

      yPosition += contentBoxPadding + 5;
    }

    // Modern Footer
    const footerHeight = 15;
    const footerY = pageHeight - footerHeight;

    // Footer background
    doc.setFillColor('#F3F4F6');
    doc.rect(0, footerY, pageWidth, footerHeight, 'F');

    // Footer line
    doc.setDrawColor('#006BFF');
    doc.setLineWidth(0.5);
    doc.line(0, footerY, pageWidth, footerY);

    // Footer text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const dateText = `Created on ${new Date(collage.completedAt || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`;
    doc.text(dateText, pageWidth / 2, footerY + 9, { align: 'center' });

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
