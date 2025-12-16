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

    // Create PDF with modern styling
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = 0;

    // ===========================
    // MODERN HEADER WITH GRADIENT
    // ===========================
    const headerHeight = 60;

    // Gradient effect using multiple rectangles
    const gradientSteps = 20;
    for (let i = 0; i < gradientSteps; i++) {
      const ratio = i / gradientSteps;
      const r = Math.round(0 + (74 - 0) * ratio); // 0 -> 74
      const g = Math.round(107 + (158 - 107) * ratio); // 107 -> 158
      const b = Math.round(255 + (255 - 255) * ratio); // 255 -> 255
      doc.setFillColor(r, g, b);
      doc.rect(0, i * (headerHeight / gradientSteps), pageWidth, headerHeight / gradientSteps, 'F');
    }

    // Title in header with proper font
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    yPosition = 28;
    doc.text('MY IDENTITY COLLAGE', pageWidth / 2, yPosition, { align: 'center' });

    // Subtitle
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    yPosition += 10;
    doc.text('A Visual Story of Who I Am', pageWidth / 2, yPosition, { align: 'center' });

    // Decorative line under header
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    const lineMargin = 40;
    doc.line(lineMargin, yPosition + 8, pageWidth - lineMargin, yPosition + 8);

    yPosition = headerHeight + 20;

    // ===========================
    // COLLAGE IMAGE WITH MODERN FRAME
    // ===========================
    if (imageUrl) {
      try {
        const imgWidth = 160;
        const imgHeight = 120;
        const imgX = (pageWidth - imgWidth) / 2;

        // Modern shadow effect
        doc.setFillColor(200, 200, 200);
        doc.setGState(new (doc.GState as any)({ opacity: 0.3 }));
        doc.roundedRect(imgX + 3, yPosition + 3, imgWidth, imgHeight, 5, 5, 'F');
        doc.setGState(new (doc.GState as any)({ opacity: 1.0 })); // Reset opacity

        // White background frame
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(imgX, yPosition, imgWidth, imgHeight, 5, 5, 'F');

        // Add the collage image
        doc.addImage(imageUrl, 'PNG', imgX + 5, yPosition + 5, imgWidth - 10, imgHeight - 10);

        // Modern blue border
        doc.setDrawColor(0, 107, 255);
        doc.setLineWidth(1);
        doc.roundedRect(imgX, yPosition, imgWidth, imgHeight, 5, 5, 'S');

        yPosition += imgHeight + 20;
      } catch (error) {
        console.error('Failed to add image to PDF:', error);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150, 150, 150);
        doc.text('(Collage image unavailable)', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;
      }
    }

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // ===========================
    // ACHIEVEMENT STATS - Modern Cards
    // ===========================
    const completedChallenges = [
      collage.challenge1Complete,
      collage.challenge2Complete,
      collage.challenge3Complete,
      collage.challenge4Complete,
      collage.challenge5Complete,
    ].filter(Boolean).length;

    const statBoxWidth = 56;
    const statBoxHeight = 32;
    const statBoxGap = 6;
    const totalStatsWidth = (statBoxWidth * 3) + (statBoxGap * 2);
    const statBoxX = (pageWidth - totalStatsWidth) / 2;

    // Stat Card 1: Challenges Completed
    doc.setFillColor(227, 242, 253); // Light blue background
    doc.roundedRect(statBoxX, yPosition, statBoxWidth, statBoxHeight, 4, 4, 'F');
    doc.setDrawColor(0, 107, 255);
    doc.setLineWidth(0.5);
    doc.roundedRect(statBoxX, yPosition, statBoxWidth, statBoxHeight, 4, 4, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(0, 107, 255);
    doc.text(`${completedChallenges}/5`, statBoxX + statBoxWidth / 2, yPosition + 14, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text('Challenges', statBoxX + statBoxWidth / 2, yPosition + 21, { align: 'center' });
    doc.text('Completed', statBoxX + statBoxWidth / 2, yPosition + 27, { align: 'center' });

    // Stat Card 2: Badges Earned
    const badge2X = statBoxX + statBoxWidth + statBoxGap;
    doc.setFillColor(243, 229, 245); // Light purple background
    doc.roundedRect(badge2X, yPosition, statBoxWidth, statBoxHeight, 4, 4, 'F');
    doc.setDrawColor(156, 39, 176);
    doc.setLineWidth(0.5);
    doc.roundedRect(badge2X, yPosition, statBoxWidth, statBoxHeight, 4, 4, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(156, 39, 176);
    doc.text(`${badgesEarned.length}/6`, badge2X + statBoxWidth / 2, yPosition + 14, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text('Badges', badge2X + statBoxWidth / 2, yPosition + 21, { align: 'center' });
    doc.text('Earned', badge2X + statBoxWidth / 2, yPosition + 27, { align: 'center' });

    // Stat Card 3: Elements Created
    const badge3X = badge2X + statBoxWidth + statBoxGap;
    doc.setFillColor(232, 245, 233); // Light green background
    doc.roundedRect(badge3X, yPosition, statBoxWidth, statBoxHeight, 4, 4, 'F');
    doc.setDrawColor(76, 175, 80);
    doc.setLineWidth(0.5);
    doc.roundedRect(badge3X, yPosition, statBoxWidth, statBoxHeight, 4, 4, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(76, 175, 80);
    doc.text(`${collage.elementCount || 0}`, badge3X + statBoxWidth / 2, yPosition + 14, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text('Elements', badge3X + statBoxWidth / 2, yPosition + 21, { align: 'center' });
    doc.text('Created', badge3X + statBoxWidth / 2, yPosition + 27, { align: 'center' });

    yPosition += statBoxHeight + 25;

    // ===========================
    // BADGES SECTION - No Emojis
    // ===========================
    if (badgesEarned.length > 0) {
      // Section header with modern styling
      doc.setFillColor(255, 249, 230); // Warm yellow background
      doc.roundedRect(margin - 5, yPosition - 8, pageWidth - (margin * 2) + 10, 16, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(245, 158, 11); // Orange
      doc.text('BADGES EARNED', margin, yPosition);

      yPosition += 15;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);

      badgesEarned.forEach((badgeId: string, index: number) => {
        const badge = BADGES[badgeId];
        if (badge) {
          // Check if we need a new page
          if (yPosition > pageHeight - 50) {
            doc.addPage();
            yPosition = 25;
          }

          // Alternating background for better readability
          if (index % 2 === 0) {
            doc.setFillColor(249, 250, 251);
            doc.roundedRect(margin - 2, yPosition - 4, pageWidth - (margin * 2) + 4, 10, 2, 2, 'F');
          }

          // Badge number indicator
          doc.setFillColor(0, 107, 255);
          doc.circle(margin + 3, yPosition, 2, 'F');

          // Badge name (bold)
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 107, 255);
          doc.text(badge.name, margin + 8, yPosition + 1);

          // Badge description
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(80, 80, 80);
          const nameWidth = doc.getTextWidth(badge.name);
          doc.text(` - ${badge.description}`, margin + 8 + nameWidth, yPosition + 1);

          yPosition += 10;
        }
      });

      yPosition += 10;
    }

    // Check if we need a new page for About Me
    if (yPosition > pageHeight - 60 && collage.aboutMe) {
      doc.addPage();
      yPosition = 25;
    }

    // ===========================
    // ABOUT ME SECTION - Modern Styling
    // ===========================
    if (collage.aboutMe) {
      // Section header
      doc.setFillColor(227, 242, 253); // Light blue
      doc.roundedRect(margin - 5, yPosition - 8, pageWidth - (margin * 2) + 10, 16, 3, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(0, 107, 255);
      doc.text('ABOUT ME', margin, yPosition);

      yPosition += 18;

      // Content box with better styling
      const contentPadding = 10;
      const maxWidth = pageWidth - (margin * 2) - (contentPadding * 2);
      const lines = doc.splitTextToSize(collage.aboutMe, maxWidth);
      const lineHeight = 6;
      const contentHeight = (lines.length * lineHeight) + (contentPadding * 2);

      // Content box background
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(margin, yPosition, pageWidth - (margin * 2), contentHeight, 4, 4, 'F');

      // Subtle border
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, yPosition, pageWidth - (margin * 2), contentHeight, 4, 4, 'S');

      // Add quote-style decoration
      doc.setDrawColor(0, 107, 255);
      doc.setLineWidth(3);
      doc.line(margin + 5, yPosition + 5, margin + 5, yPosition + contentHeight - 5);

      // Text content with better typography
      yPosition += contentPadding + 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);

      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 30;
        }
        doc.text(line, margin + contentPadding + 8, yPosition);
        yPosition += lineHeight;
      });

      yPosition += contentPadding + 5;
    }

    // ===========================
    // MODERN FOOTER
    // ===========================
    const footerY = pageHeight - 20;

    // Decorative line
    doc.setDrawColor(0, 107, 255);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);

    const dateText = `Created ${new Date(collage.completedAt || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })}`;
    doc.text(dateText, pageWidth / 2, footerY + 8, { align: 'center' });

    doc.setFontSize(8);
    doc.text('Ascend Now Career Exploration Platform', pageWidth / 2, footerY + 13, { align: 'center' });

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
