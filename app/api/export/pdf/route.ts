import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { identityCollages, badgeUnlocks, BadgeUnlock } from '@/lib/db/schema';
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

    // Extract student name from studentId (if it's a name, otherwise use "Student")
    const studentName = collage.studentId || 'Student';

    // Extract quote from canvasJSON if available
    let quoteText = '';
    try {
      const canvasData = collage.canvasJSON as any;
      if (canvasData && canvasData.objects) {
        // Find text objects that might be quotes (contain quotation marks or are from challenge 3)
        const textObjects = canvasData.objects.filter((obj: any) =>
          obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox'
        );

        for (const textObj of textObjects) {
          const text = textObj.text || '';
          // Look for text with quotes or from challenge 3
          if (text.includes('"') || text.includes('"') || text.includes('"')) {
            quoteText = text;
            break;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to extract quote from canvasJSON:', e);
    }

    // If no quote found, use a default
    if (!quoteText) {
      quoteText = '"If life gives you lemons, make lemonade."';
    }

    // Get session data
    const themes = Array.isArray(collage.session1Themes) ? collage.session1Themes as string[] : [];
    const interests = Array.isArray(collage.session1Interests) ? collage.session1Interests as string[] : [];
    const clusters = Array.isArray(collage.session1Clusters) ? collage.session1Clusters as string[] : [];

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

    // Helper function to add a new page with consistent styling
    const addNewPage = () => {
      doc.addPage();
      yPosition = margin;
    };

    // Helper function to draw colored boxes
    const drawColoredBox = (x: number, y: number, width: number, height: number, fillColor: [number, number, number], borderColor: [number, number, number]) => {
      doc.setFillColor(...fillColor);
      doc.roundedRect(x, y, width, height, 3, 3, 'F');
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.5);
      doc.roundedRect(x, y, width, height, 3, 3, 'S');
    };

    // ===========================
    // PAGE 1: QUOTE REVEALS & THEMES
    // ===========================
    yPosition = margin;

    // Title: "What This Quote Reveals about [Name]:"
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(139, 69, 177); // Purple
    doc.text(`What This Quote Reveals about ${studentName}:`, margin, yPosition);
    yPosition += 12;

    // 2x2 Grid of traits
    const boxWidth = (pageWidth - margin * 2 - 6) / 2; // 2 boxes with 6mm gap
    const boxHeight = 28;
    const boxGap = 6;

    // Box 1: Resourcefulness (Blue)
    let boxX = margin;
    let boxY = yPosition;
    drawColoredBox(boxX, boxY, boxWidth, boxHeight, [227, 242, 253], [66, 153, 225]);

    doc.setFontSize(9);
    doc.text('💪', boxX + 3, boxY + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 107, 255);
    doc.text('Resourcefulness', boxX + 10, boxY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const text1 = doc.splitTextToSize('Turning challenges into opportunities', boxWidth - 12);
    doc.text(text1, boxX + 6, boxY + 14);

    // Box 2: Optimism (Pink)
    boxX = margin + boxWidth + boxGap;
    drawColoredBox(boxX, boxY, boxWidth, boxHeight, [252, 231, 243], [219, 39, 119]);

    doc.setFontSize(9);
    doc.text('😊', boxX + 3, boxY + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(219, 39, 119);
    doc.text('Optimism', boxX + 10, boxY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const text2 = doc.splitTextToSize('Maintaining a positive outlook', boxWidth - 12);
    doc.text(text2, boxX + 6, boxY + 14);

    // Box 3: Problem-Solving (Green)
    boxX = margin;
    boxY = yPosition + boxHeight + boxGap;
    drawColoredBox(boxX, boxY, boxWidth, boxHeight, [220, 252, 231], [34, 197, 94]);

    doc.setFontSize(9);
    doc.text('🧠', boxX + 3, boxY + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(34, 197, 94);
    doc.text('Problem-Solving', boxX + 10, boxY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const text3 = doc.splitTextToSize('Finding practical solutions', boxWidth - 12);
    doc.text(text3, boxX + 6, boxY + 14);

    // Box 4: Resilience (Orange)
    boxX = margin + boxWidth + boxGap;
    drawColoredBox(boxX, boxY, boxWidth, boxHeight, [254, 243, 199], [245, 158, 11]);

    doc.setFontSize(9);
    doc.text('☀️', boxX + 3, boxY + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(245, 158, 11);
    doc.text('Resilience', boxX + 10, boxY + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const text4 = doc.splitTextToSize('Making the best of any situation', boxWidth - 12);
    doc.text(text4, boxX + 6, boxY + 14);

    yPosition = boxY + boxHeight + 18;

    // "Themes in My Collage" section
    doc.setFontSize(9);
    doc.text('🎯', margin, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 107, 255);
    doc.text('Themes in My Collage', margin + 7, yPosition + 1);
    yPosition += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text('My collage includes these awesome elements that tell my story:', margin, yPosition);
    yPosition += 10;

    // Define themes based on interests and career clusters
    const collageThemes = [
      {
        icon: '🧠',
        title: 'Brain & Intelligence',
        description: 'The brain imagery represents my intellectual curiosity and love for critical thinking. I enjoy solving problems and learning new things!',
        color: [236, 72, 153] as [number, number, number] // Pink
      },
      {
        icon: '💻',
        title: 'Technology & Coding',
        description: 'Images of coding and technology show my passion for STEM and digital innovation. Programming perfectly matches my hands-on, builder mindset!',
        color: [59, 130, 246] as [number, number, number] // Blue
      },
      {
        icon: '🏙️',
        title: 'Futuristic Cities',
        description: 'Futuristic cityscapes show my vision for tomorrow and global perspective. I dream of working on large-scale projects that make a worldwide impact!',
        color: [139, 69, 177] as [number, number, number] // Purple
      },
      {
        icon: '🚗',
        title: 'Luxury & Success',
        description: 'Images of luxury cars show my aspirations for success. This motivates me to work hard and accomplish big goals!',
        color: [220, 38, 38] as [number, number, number] // Red
      },
      {
        icon: '💪',
        title: 'Fitness & Determination',
        description: 'Gym equipment represents my determination and work ethic. Physical fitness shows discipline, perseverance, and the ability to set and crush goals!',
        color: [34, 197, 94] as [number, number, number] // Green
      }
    ];

    // Draw theme entries
    collageThemes.forEach((theme, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 35) {
        addNewPage();
      }

      doc.setFontSize(9);
      doc.text(theme.icon, margin, yPosition);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...theme.color);
      doc.text(theme.title, margin + 7, yPosition + 1);

      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const themeLines = doc.splitTextToSize(theme.description, pageWidth - margin * 2);
      doc.text(themeLines, margin, yPosition);

      yPosition += themeLines.length * 4 + 6;
    });

    // ===========================
    // PAGE 2: VISUAL IDENTITY COLLAGE & INSPIRING QUOTE
    // ===========================
    addNewPage();

    // Title: "My Visual Identity Collage"
    doc.setFontSize(9);
    doc.text('🎨', margin, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(0, 107, 255);
    doc.text('My Visual Identity Collage', margin + 7, yPosition + 1);
    yPosition += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text('Here\'s my collage showing who I am and what I love!', margin, yPosition);
    yPosition += 12;

    // Collage image with pink border frame
    if (imageUrl) {
      try {
        const imgWidth = 160;
        const imgHeight = 120;
        const imgX = (pageWidth - imgWidth) / 2;

        // Pink border frame
        doc.setFillColor(252, 231, 243);
        doc.roundedRect(imgX - 2, yPosition - 2, imgWidth + 4, imgHeight + 4, 3, 3, 'F');

        // Add the collage image
        doc.addImage(imageUrl, 'PNG', imgX, yPosition, imgWidth, imgHeight);

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

    // "My Inspiring Quote" section
    doc.setFontSize(9);
    doc.text('💡', margin, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(245, 158, 11); // Orange
    doc.text('My Inspiring Quote', margin + 7, yPosition + 1);
    yPosition += 15;

    // Quote text in italics with yellow/orange color
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(14);
    doc.setTextColor(245, 158, 11);
    const quoteLines = doc.splitTextToSize(quoteText, pageWidth - margin * 2 - 20);
    doc.text(quoteLines, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += quoteLines.length * 7 + 5;

    // Quote emojis
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('🍋 🥤', pageWidth / 2, yPosition, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // ===========================
    // PAGE 3: BADGES EARNED & ABOUT ME
    // ===========================
    addNewPage();

    // Title: "Badges Earned"
    doc.setFontSize(9);
    doc.text('🏆', margin, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(245, 158, 11);
    doc.text('Badges Earned', margin + 7, yPosition + 1);
    yPosition += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`${studentName} unlocked ${badgesEarned.length} amazing badge${badgesEarned.length !== 1 ? 's' : ''}! Here's what each one means:`, margin, yPosition);
    yPosition += 12;

    // Badge grid (2x2)
    const badgeBoxWidth = (pageWidth - margin * 2 - 6) / 2;
    const badgeBoxHeight = 32;

    if (badgesEarned.length > 0) {
      badgesEarned.slice(0, 4).forEach((badgeId: string, index: number) => {
        const badge = BADGES[badgeId];
        if (badge) {
          const col = index % 2;
          const row = Math.floor(index / 2);
          const badgeX = margin + col * (badgeBoxWidth + 6);
          const badgeY = yPosition + row * (badgeBoxHeight + 6);

          // Colored box based on index
          const colors: Array<[number, number, number]> = [
            [227, 242, 253], // Blue
            [252, 231, 243], // Pink
            [220, 252, 231], // Green
            [254, 243, 199]  // Orange
          ];
          const borderColors: Array<[number, number, number]> = [
            [66, 153, 225],  // Blue
            [219, 39, 119],  // Pink
            [34, 197, 94],   // Green
            [245, 158, 11]   // Orange
          ];

          drawColoredBox(badgeX, badgeY, badgeBoxWidth, badgeBoxHeight, colors[index % 4], borderColors[index % 4]);

          // Badge icon
          doc.setFontSize(12);
          doc.text(badge.emoji || '🏆', badgeX + 4, badgeY + 8);

          // Badge name
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(60, 60, 60);
          doc.text(badge.name, badgeX + 12, badgeY + 8);

          // Badge description
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(80, 80, 80);
          const badgeDesc = doc.splitTextToSize(badge.description, badgeBoxWidth - 14);
          doc.text(badgeDesc, badgeX + 4, badgeY + 15);

          // Date
          const unlockDate = badgeUnlockDates.get(badgeId);
          if (unlockDate) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(7);
            doc.setTextColor(120, 120, 120);
            const dateStr = new Date(unlockDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            doc.text(dateStr, badgeX + 4, badgeY + badgeBoxHeight - 4);
          }
        }
      });

      yPosition += Math.ceil(badgesEarned.length / 2) * (badgeBoxHeight + 6) + 10;
    }

    // "About Me" section
    if (collage.aboutMe) {
      // Check if we need space
      if (yPosition > pageHeight - 60) {
        addNewPage();
      }

      doc.setFontSize(9);
      doc.text('✨', margin, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(139, 69, 177); // Purple
      doc.text('About Me', margin + 7, yPosition + 1);
      yPosition += 12;

      // Yellow background box
      const aboutMeLines = doc.splitTextToSize(collage.aboutMe, pageWidth - margin * 2 - 16);
      const aboutMeHeight = aboutMeLines.length * 5 + 16;

      doc.setFillColor(255, 251, 235); // Light yellow
      doc.roundedRect(margin, yPosition, pageWidth - margin * 2, aboutMeHeight, 4, 4, 'F');
      doc.setDrawColor(245, 158, 11);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, yPosition, pageWidth - margin * 2, aboutMeHeight, 4, 4, 'S');

      // Text content
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(aboutMeLines, margin + 8, yPosition + 10);

      yPosition += aboutMeHeight + 10;
    }

    // ===========================
    // PAGE 4: JOURNEY AHEAD
    // ===========================
    addNewPage();

    // Centered title with stars
    doc.setFontSize(9);
    doc.text('🌟', pageWidth / 2 - 35, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0, 107, 255);
    doc.text(`${studentName.toUpperCase()}'S JOURNEY AHEAD`, pageWidth / 2, yPosition + 1, { align: 'center' });
    doc.setFontSize(9);
    doc.text('🌟', pageWidth / 2 + 35, yPosition);
    yPosition += 15;

    // Journey summary box
    const journeySummary = `${studentName} is a determined, ambitious builder with a passion for creating and innovating. With ${studentName}'s hands-on learning style, technology interest, and resilient problem-solving mindset, ${studentName} is ready to tackle big challenges and make meaningful contributions to the world!`;

    doc.setFillColor(227, 242, 253); // Light blue
    const summaryLines = doc.splitTextToSize(journeySummary, pageWidth - margin * 2 - 16);
    const summaryHeight = summaryLines.length * 6 + 16;

    doc.roundedRect(margin, yPosition, pageWidth - margin * 2, summaryHeight, 4, 4, 'F');
    doc.setDrawColor(0, 107, 255);
    doc.setLineWidth(1);
    doc.roundedRect(margin, yPosition, pageWidth - margin * 2, summaryHeight, 4, 4, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);
    doc.text(summaryLines, margin + 8, yPosition + 10);

    yPosition += summaryHeight + 20;

    // Platform branding
    doc.setFontSize(9);
    doc.text('✨', pageWidth / 2 - 45, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(139, 69, 177); // Purple
    doc.text('Ascend Now Career Exploration Platform', pageWidth / 2, yPosition + 1, { align: 'center' });
    doc.setFontSize(9);
    doc.text('✨', pageWidth / 2 + 45, yPosition);
    yPosition += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const completedDate = new Date(collage.completedAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    doc.text(completedDate, pageWidth / 2, yPosition, { align: 'center' });

    // ===========================
    // PAGE 5: CAREER PATHWAYS & NEXT STEPS
    // ===========================
    addNewPage();

    // Title: "Career Pathways That Match [Name]"
    doc.setFontSize(9);
    doc.text('🎓', margin, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`Career Pathways That Match ${studentName}`, margin + 7, yPosition + 1);
    yPosition += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text('Based on my collage themes, here are careers that align with my interests and strengths:', margin, yPosition);
    yPosition += 12;

    // Career pathways grid (2x2)
    const careerBoxWidth = (pageWidth - margin * 2 - 6) / 2;
    const careerBoxHeight = 28;

    const careers = [
      {
        icon: '💻',
        title: 'Software Engineering',
        description: 'Perfect for my coding interest and builder mindset. Create apps, solve problems, and innovate!',
        color: [227, 242, 253] as [number, number, number],
        border: [66, 153, 225] as [number, number, number]
      },
      {
        icon: '⚙️',
        title: 'Mechanical/Electrical Engineering',
        description: 'Perfect for my hands-on builder mentality. Design, test, and create tangible solutions to real-world problems!',
        color: [252, 231, 243] as [number, number, number],
        border: [219, 39, 119] as [number, number, number]
      },
      {
        icon: '🏛️',
        title: 'Architecture',
        description: 'Design the cities of tomorrow. Combine creativity, technical skills, and problem-solving!',
        color: [220, 252, 231] as [number, number, number],
        border: [34, 197, 94] as [number, number, number]
      },
      {
        icon: '💼',
        title: 'Tech Entrepreneur',
        description: 'Start companies and create solutions. Build, innovate, and make a significant impact!',
        color: [254, 243, 199] as [number, number, number],
        border: [245, 158, 11] as [number, number, number]
      }
    ];

    careers.forEach((career, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const careerX = margin + col * (careerBoxWidth + 6);
      const careerY = yPosition + row * (careerBoxHeight + 6);

      drawColoredBox(careerX, careerY, careerBoxWidth, careerBoxHeight, career.color, career.border);

      // Career icon
      doc.setFontSize(10);
      doc.text(career.icon, careerX + 4, careerY + 7);

      // Career title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(career.title, careerX + 12, careerY + 7);

      // Career description
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      const careerDesc = doc.splitTextToSize(career.description, careerBoxWidth - 14);
      doc.text(careerDesc, careerX + 4, careerY + 14);
    });

    yPosition += 2 * (careerBoxHeight + 6) + 12;

    // "My Next Steps" section
    doc.setFontSize(9);
    doc.text('🎯', margin, yPosition);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(0, 107, 255);
    doc.text('My Next Steps', margin + 7, yPosition + 1);
    yPosition += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text('Here\'s how I\'ll continue exploring and developing my skills:', margin, yPosition);
    yPosition += 12;

    // Next steps boxes
    const steps = [
      {
        number: '1',
        title: 'Work on Hands-On Projects',
        description: 'Build coding projects, robotics, or engineering challenges using Arduino, Raspberry Pi, or web frameworks!',
        color: [0, 107, 255] as [number, number, number]
      },
      {
        number: '2',
        title: 'Join STEM Competitions',
        description: 'Participate in science fairs, coding competitions, and robotics challenges to showcase my skills!',
        color: [219, 39, 119] as [number, number, number]
      },
      {
        number: '3',
        title: 'Take Advanced Courses',
        description: 'Pursue advanced math, physics, and computer science. Use Khan Academy, Coursera, or CodeAcademy!',
        color: [34, 197, 94] as [number, number, number]
      }
    ];

    steps.forEach((step, index) => {
      const stepBoxWidth = pageWidth - margin * 2;
      const stepBoxHeight = 18;

      // Colored left border
      doc.setFillColor(...step.color);
      doc.roundedRect(margin, yPosition, 8, stepBoxHeight, 2, 2, 'F');

      // Main box
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(margin + 8, yPosition, stepBoxWidth - 8, stepBoxHeight, 2, 2, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin + 8, yPosition, stepBoxWidth - 8, stepBoxHeight, 2, 2, 'S');

      // Number
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text(step.number, margin + 4, yPosition + 11, { align: 'center' });

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...step.color);
      doc.text(step.title, margin + 14, yPosition + 7);

      // Description
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      const stepDesc = doc.splitTextToSize(step.description, stepBoxWidth - 22);
      doc.text(stepDesc, margin + 14, yPosition + 12);

      yPosition += stepBoxHeight + 4;
    });

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
