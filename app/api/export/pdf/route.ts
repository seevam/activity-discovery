import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { identityCollages, badgeUnlocks, BadgeUnlock } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { BADGES } from '@/lib/constants/badges';
import { jsPDF } from 'jspdf';
import type { CollageAnalysis, ExtendedCanvasJSON } from '@/types/collage';

// POST /api/export/pdf
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { collageId, canvasDataUrl } = body;

    if (!collageId) {
      return NextResponse.json({ error: 'collageId is required' }, { status: 400 });
    }

    console.log('[PDF Export] Starting export for collage:', collageId);

    // Get collage data
    const collages = await db
      .select()
      .from(identityCollages)
      .where(eq(identityCollages.id, collageId));

    if (collages.length === 0) {
      return NextResponse.json({ error: 'Collage not found' }, { status: 404 });
    }

    const collage = collages[0];
    const canvasJSON = collage.canvasJSON as ExtendedCanvasJSON;
    const analysis = canvasJSON?.analysis;

    // If no analysis, warn but continue with defaults
    if (!analysis) {
      console.warn('[PDF Export] No analysis found - using defaults');
    }

    // Use provided canvas data URL, or fall back to stored pngUrl
    const imageUrl = canvasDataUrl || collage.pngUrl;

    // Ensure badgesEarned is an array
    const badgesEarned = Array.isArray(collage.badgesEarned) ? collage.badgesEarned : [];

    // Fetch badge unlock dates
    const badgeUnlocksData = await db
      .select()
      .from(badgeUnlocks)
      .where(eq(badgeUnlocks.collageId, collageId));

    // Create a map of badgeId -> unlockDate
    const badgeUnlockDates = new Map<string, Date>();
    badgeUnlocksData.forEach((unlock: BadgeUnlock) => {
      badgeUnlockDates.set(unlock.badgeId, unlock.unlockedAt);
    });

    // Extract student name
    const studentName = collage.studentId || 'Student';

    // Extract quote
    const selectedQuote = canvasJSON?.selectedQuote;
    let quoteText = selectedQuote?.text || '';
    let quoteAuthor = selectedQuote?.author || '';

    // If no quote from stored data, try to find in canvas objects
    if (!quoteText) {
      try {
        if (canvasJSON && canvasJSON.objects) {
          const textObjects = canvasJSON.objects.filter((obj: any) =>
            obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox'
          );

          for (const textObj of textObjects) {
            const text = textObj.text || '';
            if (text.includes('"') || text.includes('"') || text.includes('"')) {
              quoteText = text;
              break;
            }
          }
        }
      } catch (e) {
        console.warn('Failed to extract quote from canvasJSON:', e);
      }
    }

    // Default quote if none found
    if (!quoteText) {
      quoteText = '"The future belongs to those who believe in the beauty of their dreams."';
      quoteAuthor = 'Eleanor Roosevelt';
    }

    // Count completed challenges
    const completedChallenges = [
      collage.challenge1Complete,
      collage.challenge2Complete,
      collage.challenge3Complete,
      collage.challenge4Complete,
      collage.challenge5Complete,
    ].filter(Boolean).length;

    // Create PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    console.log('[PDF Export] Creating pages...');

    // ====================
    // PAGE 1: COVER PAGE
    // ====================
    createCoverPage(doc, {
      studentName,
      completedChallenges,
      badgesEarned: badgesEarned.length,
      elementCount: collage.elementCount || 0,
      completedAt: collage.completedAt || collage.createdAt,
      pageWidth,
      pageHeight,
      margin,
    });

    // ====================
    // PAGE 2: BADGES & ABOUT ME
    // ====================
    doc.addPage();
    createBadgesPage(doc, {
      studentName,
      badgesEarned,
      badgeUnlockDates,
      aboutMe: collage.aboutMe,
      pageWidth,
      pageHeight,
      margin,
    });

    // ====================
    // PAGE 3: COLLAGE & QUOTE
    // ====================
    doc.addPage();
    createCollagePage(doc, {
      imageUrl,
      quoteText,
      quoteAuthor,
      quoteAnalysis: analysis?.quoteAnalysis,
      pageWidth,
      pageHeight,
      margin,
    });

    // ====================
    // PAGE 4: THEMES ANALYSIS
    // ====================
    if (analysis?.themes && analysis.themes.length > 0) {
      doc.addPage();
      createThemesPage(doc, {
        themes: analysis.themes,
        pageWidth,
        pageHeight,
        margin,
      });
    }

    // ====================
    // PAGE 5: CAREER PATHWAYS
    // ====================
    if (analysis?.careerPathways && analysis.careerPathways.length > 0) {
      doc.addPage();
      createCareerPathwaysPage(doc, {
        careerPathways: analysis.careerPathways,
        studentName,
        pageWidth,
        pageHeight,
        margin,
      });
    }

    // ====================
    // PAGE 6: NEXT STEPS
    // ====================
    doc.addPage();
    createNextStepsPage(doc, {
      nextSteps: analysis?.nextSteps || [],
      pageWidth,
      pageHeight,
      margin,
    });

    // ====================
    // PAGE 7: CONCLUSION
    // ====================
    doc.addPage();
    createConclusionPage(doc, {
      studentName,
      themes: (collage.session1Themes as string[]) || [],
      completedAt: collage.completedAt || collage.createdAt,
      pageWidth,
      pageHeight,
      margin,
    });

    console.log('[PDF Export] PDF generated successfully');

    // Generate PDF as buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Identity_Collage_${studentName.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('[PDF Export] Error:', error);
    return NextResponse.json(
      { error: 'Failed to export PDF: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// ==================== PAGE CREATION FUNCTIONS ====================

function createCoverPage(
  doc: jsPDF,
  opts: {
    studentName: string;
    completedChallenges: number;
    badgesEarned: number;
    elementCount: number;
    completedAt: Date;
    pageWidth: number;
    pageHeight: number;
    margin: number;
  }
) {
  const { studentName, completedChallenges, badgesEarned, elementCount, completedAt, pageWidth, pageHeight, margin } = opts;

  // Title with emoji
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 107, 255);
  doc.text('MY IDENTITY COLLAGE', pageWidth / 2, 40, { align: 'center' });

  doc.setFontSize(24);
  doc.text('🎨', pageWidth / 2, 50, { align: 'center' });

  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text('A Story of Who I Am!', pageWidth / 2, 65, { align: 'center' });

  // Stats boxes
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');

  // Challenges stat
  doc.setTextColor(0, 107, 255);
  doc.text(`${completedChallenges}/5`, pageWidth / 2 - 40, 100, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('CHALLENGES', pageWidth / 2 - 40, 110, { align: 'center' });

  // Badges stat
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(245, 158, 11);
  doc.text(`${badgesEarned}/6`, pageWidth / 2 + 40, 100, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('BADGES', pageWidth / 2 + 40, 110, { align: 'center' });

  // Elements stat
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(76, 175, 80);
  doc.text(`${elementCount}`, pageWidth / 2, 140, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('ELEMENTS', pageWidth / 2, 150, { align: 'center' });

  // Student name and date
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text(`Created by: ${studentName}`, pageWidth / 2, 180, { align: 'center' });

  const date = new Date(completedAt);
  doc.text(`📅 ${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, 190, { align: 'center' });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text('Ascend Now Career Exploration Platform', pageWidth / 2, pageHeight - 10, { align: 'center' });
}

function createBadgesPage(
  doc: jsPDF,
  opts: {
    studentName: string;
    badgesEarned: string[];
    badgeUnlockDates: Map<string, Date>;
    aboutMe?: string | null;
    pageWidth: number;
    pageHeight: number;
    margin: number;
  }
) {
  const { studentName, badgesEarned, badgeUnlockDates, aboutMe, pageWidth, pageHeight, margin } = opts;

  let yPos = margin + 10;

  // Page title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 107, 255);
  doc.text('🏆 Badges Earned', pageWidth / 2, yPos, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('Unlocked achievements on your journey!', pageWidth / 2, yPos + 8, { align: 'center' });

  yPos += 20;

  // List badges
  badgesEarned.forEach((badgeId: string) => {
    const badge = BADGES[badgeId];
    if (badge) {
      // Check if we need a new page
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = margin;
      }

      // Badge box
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(margin, yPos, pageWidth - margin * 2, 25, 3, 3, 'F');

      // Badge emoji
      doc.setFontSize(20);
      doc.text(badge.emoji, margin + 5, yPos + 15);

      // Badge name
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 107, 255);
      doc.text(badge.name, margin + 20, yPos + 10);

      // Badge description
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(badge.description, margin + 20, yPos + 18);

      // Date (if available)
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      const date = badgeUnlockDates.get(badgeId);
      if (date) {
        doc.text(new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), pageWidth - margin - 40, yPos + 14);
      }

      yPos += 30;
    }
  });

  // About Me section
  if (aboutMe) {
    yPos += 10;

    // Check if we need a new page
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 107, 255);
    doc.text('✨ About Me', margin, yPos);

    yPos += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(aboutMe, pageWidth - margin * 2);
    lines.forEach((line: string) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, margin, yPos);
      yPos += 6;
    });
  }
}

function createCollagePage(
  doc: jsPDF,
  opts: {
    imageUrl: string | null;
    quoteText: string;
    quoteAuthor: string;
    quoteAnalysis?: { reveals: string[] };
    pageWidth: number;
    pageHeight: number;
    margin: number;
  }
) {
  const { imageUrl, quoteText, quoteAuthor, quoteAnalysis, pageWidth, pageHeight, margin } = opts;

  let yPos = margin + 10;

  // Page title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 107, 255);
  doc.text('🎨 My Visual Identity Collage', pageWidth / 2, yPos, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text("Here's my collage showing who I am and what I love!", pageWidth / 2, yPos + 8, { align: 'center' });

  yPos += 20;

  // Add collage image
  if (imageUrl) {
    try {
      const imgWidth = 160;
      const imgHeight = 120;
      const imgX = (pageWidth - imgWidth) / 2;

      // Shadow
      doc.setFillColor(200, 200, 200);
      doc.roundedRect(imgX + 2, yPos + 2, imgWidth, imgHeight, 3, 3, 'F');

      // Image
      doc.addImage(imageUrl, 'PNG', imgX, yPos, imgWidth, imgHeight);

      // Border
      doc.setDrawColor(0, 107, 255);
      doc.setLineWidth(0.5);
      doc.roundedRect(imgX, yPos, imgWidth, imgHeight, 3, 3, 'S');

      yPos += imgHeight + 20;
    } catch (error) {
      console.error('Failed to add collage image:', error);
      yPos += 10;
    }
  }

  // Quote section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(245, 158, 11);
  doc.text('💡 My Inspiring Quote', margin, yPos);

  yPos += 15;

  // Quote box
  doc.setFillColor(255, 249, 230);
  const quoteHeight = 30;
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, quoteHeight, 3, 3, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(40, 40, 40);
  const formattedQuote = quoteText.includes('"') ? quoteText : `"${quoteText}"`;
  const quoteLines = doc.splitTextToSize(formattedQuote, pageWidth - margin * 2 - 10);
  let quoteY = yPos + 10;
  quoteLines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, quoteY, { align: 'center' });
    quoteY += 6;
  });

  if (quoteAuthor) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`— ${quoteAuthor}`, pageWidth / 2, quoteY + 3, { align: 'center' });
  }

  yPos += quoteHeight + 15;

  // Quote analysis if available
  if (quoteAnalysis?.reveals && quoteAnalysis.reveals.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 69, 177);
    doc.text('What This Quote Reveals:', margin, yPos);

    yPos += 10;

    const reveals = quoteAnalysis.reveals.slice(0, 4);
    reveals.forEach((reveal: string) => {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`• ${reveal}`, margin + 5, yPos);
      yPos += 7;
    });
  }
}

function createThemesPage(
  doc: jsPDF,
  opts: {
    themes: Array<{ title: string; description: string; emoji: string }>;
    pageWidth: number;
    pageHeight: number;
    margin: number;
  }
) {
  const { themes, pageWidth, pageHeight, margin } = opts;

  let yPos = margin + 10;

  // Page title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 107, 255);
  doc.text('🎯 Themes in My Collage', pageWidth / 2, yPos, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('My collage includes these themes that tell my story:', pageWidth / 2, yPos + 8, { align: 'center' });

  yPos += 25;

  themes.forEach((theme) => {
    // Check if we need a new page
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }

    // Theme box
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 35, 3, 3, 'F');

    // Emoji
    doc.setFontSize(24);
    doc.text(theme.emoji, margin + 5, yPos + 18);

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 107, 255);
    doc.text(theme.title, margin + 20, yPos + 12);

    // Description
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const descLines = doc.splitTextToSize(theme.description, pageWidth - margin * 2 - 25);
    let descY = yPos + 20;
    descLines.slice(0, 2).forEach((line: string) => {
      doc.text(line, margin + 20, descY);
      descY += 5;
    });

    yPos += 40;
  });
}

function createCareerPathwaysPage(
  doc: jsPDF,
  opts: {
    careerPathways: Array<{ title: string; description: string; emoji: string }>;
    studentName: string;
    pageWidth: number;
    pageHeight: number;
    margin: number;
  }
) {
  const { careerPathways, studentName, pageWidth, pageHeight, margin } = opts;

  let yPos = margin + 10;

  // Page title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 107, 255);
  doc.text('🎓 Career Pathways That Match', pageWidth / 2, yPos, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text(`Based on ${studentName}'s interests and strengths:`, pageWidth / 2, yPos + 8, { align: 'center' });

  yPos += 25;

  careerPathways.forEach((career) => {
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }

    // Career box
    doc.setFillColor(227, 242, 253);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 30, 3, 3, 'F');

    // Emoji
    doc.setFontSize(20);
    doc.text(career.emoji, margin + 5, yPos + 15);

    // Title
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 107, 255);
    doc.text(career.title, margin + 18, yPos + 10);

    // Description
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    const descLines = doc.splitTextToSize(career.description, pageWidth - margin * 2 - 23);
    let descY = yPos + 17;
    descLines.slice(0, 2).forEach((line: string) => {
      doc.text(line, margin + 18, descY);
      descY += 4;
    });

    yPos += 35;
  });
}

function createNextStepsPage(
  doc: jsPDF,
  opts: {
    nextSteps: string[];
    pageWidth: number;
    pageHeight: number;
    margin: number;
  }
) {
  const { nextSteps, pageWidth, pageHeight, margin } = opts;

  let yPos = margin + 10;

  // Page title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 107, 255);
  doc.text('🎯 My Next Steps', pageWidth / 2, yPos, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text("Here's how I'll continue exploring and developing:", pageWidth / 2, yPos + 8, { align: 'center' });

  yPos += 25;

  // Default steps if none provided
  const defaultSteps = [
    'Work on hands-on projects using skills I love',
    'Join competitions and challenges to showcase abilities',
    'Take advanced courses in areas of interest',
    'Connect with mentors in fields I want to explore',
  ];

  const stepsToShow = nextSteps.length > 0 ? nextSteps : defaultSteps;

  stepsToShow.forEach((step, index) => {
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = margin;
    }

    // Step number
    doc.setFillColor(0, 107, 255);
    doc.circle(margin + 8, yPos + 3, 6, 'F');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}`, margin + 8, yPos + 5, { align: 'center' });

    // Step text
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    const stepLines = doc.splitTextToSize(step, pageWidth - margin * 2 - 20);
    let stepY = yPos + 5;
    stepLines.forEach((line: string) => {
      doc.text(line, margin + 20, stepY);
      stepY += 6;
    });

    yPos += Math.max(20, stepLines.length * 6 + 10);
  });
}

function createConclusionPage(
  doc: jsPDF,
  opts: {
    studentName: string;
    themes: string[];
    completedAt: Date;
    pageWidth: number;
    pageHeight: number;
    margin: number;
  }
) {
  const { studentName, themes, completedAt, pageWidth, pageHeight, margin } = opts;

  let yPos = margin + 30;

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 107, 255);
  doc.text('🌟 YOUR JOURNEY AHEAD 🌟', pageWidth / 2, yPos, { align: 'center' });

  yPos += 25;

  // Personalized conclusion
  const themesText = themes.slice(0, 3).join(', ') || 'passionate';
  const conclusionText = `${studentName} is a ${themesText} individual with a passion for creating and learning. With a hands-on learning style, strong interests, and resilient problem-solving mindset, you are ready to tackle big challenges and make meaningful contributions to the world!`;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);

  const lines = doc.splitTextToSize(conclusionText, pageWidth - margin * 2);
  lines.forEach((line: string) => {
    doc.text(line, pageWidth / 2, yPos, { align: 'center' });
    yPos += 7;
  });

  // Footer
  yPos = pageHeight - 40;
  doc.setFillColor(227, 242, 253);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 25, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 107, 255);
  doc.text('✨ Ascend Now Career Exploration Platform ✨', pageWidth / 2, yPos + 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const date = new Date(completedAt);
  doc.text(date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth / 2, yPos + 18, { align: 'center' });
}
