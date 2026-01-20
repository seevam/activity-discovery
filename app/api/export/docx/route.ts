import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { identityCollages, badgeUnlocks, BadgeUnlock } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { BADGES } from '@/lib/constants/badges';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  PageBreak,
  HeadingLevel,
  VerticalAlign,
  ImageRun
} from 'docx';

// Brand Colors
const COLORS = {
  primaryBlue: '0066FF',
  purple: '9C27B0',
  green: '00C853',
  orange: 'FF6F00',
  yellow: 'FFD600',
  pink: 'E91E63',
  teal: '00BCD4',
  lightBlue: 'E3F2FD',
  lightPurple: 'F3E5F5',
  lightGreen: 'E8F5E9',
  lightOrange: 'FFF3E0',
  lightYellow: 'FFFDE7',
  lightPink: 'FCE4EC',
  darkGray: '333333',
  mediumGray: '666666',
  lightGray: '999999'
};

// Helper: Create colored border
const createBorder = (color: string, size = 6) => ({
  style: BorderStyle.THICK,
  size,
  color
});

// Helper: Create table with colored cells
function createStatsTable(progress: { challengesCompleted: number; challengesTotal: number; badgesEarned: number; badgesTotal: number; elementsCreated: number }) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [3120, 3120, 3120],
    rows: [
      new TableRow({
        height: { value: 1200, rule: 'atLeast' },
        children: [
          // Challenges cell
          new TableCell({
            width: { size: 3120, type: WidthType.DXA },
            shading: { fill: COLORS.lightBlue, type: ShadingType.CLEAR },
            borders: {
              top: createBorder(COLORS.primaryBlue),
              bottom: createBorder(COLORS.primaryBlue),
              left: createBorder(COLORS.primaryBlue),
              right: createBorder(COLORS.primaryBlue)
            },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${progress.challengesCompleted}/${progress.challengesTotal}`,
                    bold: true,
                    size: 48,
                    color: COLORS.primaryBlue
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'CHALLENGES',
                    size: 20,
                    color: COLORS.darkGray
                  })
                ]
              })
            ]
          }),
          // Badges cell
          new TableCell({
            width: { size: 3120, type: WidthType.DXA },
            shading: { fill: COLORS.lightPurple, type: ShadingType.CLEAR },
            borders: {
              top: createBorder(COLORS.purple),
              bottom: createBorder(COLORS.purple),
              left: createBorder(COLORS.purple),
              right: createBorder(COLORS.purple)
            },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${progress.badgesEarned}/${progress.badgesTotal}`,
                    bold: true,
                    size: 48,
                    color: COLORS.purple
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'BADGES',
                    size: 20,
                    color: COLORS.darkGray
                  })
                ]
              })
            ]
          }),
          // Elements cell
          new TableCell({
            width: { size: 3120, type: WidthType.DXA },
            shading: { fill: COLORS.lightGreen, type: ShadingType.CLEAR },
            borders: {
              top: createBorder(COLORS.green),
              bottom: createBorder(COLORS.green),
              left: createBorder(COLORS.green),
              right: createBorder(COLORS.green)
            },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: `${progress.elementsCreated}`,
                    bold: true,
                    size: 48,
                    color: COLORS.green
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'ELEMENTS',
                    size: 20,
                    color: COLORS.darkGray
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

// Helper: Create badge card cell
function createBadgeCell(badge: any, unlockDate: Date | undefined, bgColor: string, borderColor: string) {
  const dateStr = unlockDate
    ? new Date(unlockDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return new TableCell({
    width: { size: 4680, type: WidthType.DXA },
    shading: { fill: bgColor, type: ShadingType.CLEAR },
    borders: {
      top: createBorder(borderColor, 8),
      bottom: createBorder(borderColor, 8),
      left: createBorder(borderColor, 8),
      right: createBorder(borderColor, 8)
    },
    verticalAlign: VerticalAlign.CENTER,
    margins: {
      top: 200,
      bottom: 200,
      left: 200,
      right: 200
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: badge.emoji || '🏆',
            size: 80
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100 },
        children: [
          new TextRun({
            text: badge.name,
            bold: true,
            size: 28,
            color: COLORS.darkGray
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100 },
        children: [
          new TextRun({
            text: badge.description,
            size: 22,
            color: COLORS.mediumGray
          })
        ]
      }),
      ...(dateStr
        ? [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 100 },
              children: [
                new TextRun({
                  text: dateStr,
                  size: 20,
                  italics: true,
                  color: COLORS.lightGray
                })
              ]
            })
          ]
        : [])
    ]
  });
}

// Helper: Create career card cell
function createCareerCell(career: any, bgColor: string, borderColor: string) {
  return new TableCell({
    width: { size: 4680, type: WidthType.DXA },
    shading: { fill: bgColor, type: ShadingType.CLEAR },
    borders: {
      top: createBorder(borderColor, 8),
      bottom: createBorder(borderColor, 8),
      left: createBorder(borderColor, 8),
      right: createBorder(borderColor, 8)
    },
    verticalAlign: VerticalAlign.CENTER,
    margins: {
      top: 200,
      bottom: 200,
      left: 200,
      right: 200
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: career.icon,
            size: 60
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100 },
        children: [
          new TextRun({
            text: career.title,
            bold: true,
            size: 28,
            color: COLORS.darkGray
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 100 },
        children: [
          new TextRun({
            text: career.description,
            size: 24,
            color: COLORS.mediumGray
          })
        ]
      })
    ]
  });
}

// POST /api/export/docx
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

    // Extract student name from studentId
    const studentName = collage.studentId || 'Student';

    // Extract quote from canvasJSON if available
    let quoteText = '';
    try {
      const canvasData = collage.canvasJSON as any;
      if (canvasData && canvasData.objects) {
        const textObjects = canvasData.objects.filter(
          (obj: any) => obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox'
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

    if (!quoteText) {
      quoteText = '"If life gives you lemons, make lemonade."';
    }

    // Calculate progress
    const completedChallenges = [
      collage.challenge1Complete,
      collage.challenge2Complete,
      collage.challenge3Complete,
      collage.challenge4Complete,
      collage.challenge5Complete
    ].filter(Boolean).length;

    const progress = {
      challengesCompleted: completedChallenges,
      challengesTotal: 5,
      badgesEarned: badgesEarned.length,
      badgesTotal: 6,
      elementsCreated: collage.elementCount || 0
    };

    // Format date
    const completedDate = new Date(collage.completedAt || Date.now()).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    // ====================================
    // BUILD DOCUMENT SECTIONS
    // ====================================

    const sections: Paragraph[] = [];

    // ====================================
    // 1. COVER PAGE
    // ====================================
    sections.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: '🎨 MY IDENTITY COLLAGE 🎨',
            bold: true,
            size: 72,
            color: COLORS.primaryBlue
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: 'A Colorful Story of Who I Am!',
            bold: true,
            size: 36,
            color: COLORS.purple
          })
        ]
      })
    );

    // Stats table
    sections.push(new Paragraph({ children: [] })); // Spacing
    const statsTable = createStatsTable(progress);
    sections.push(new Paragraph({ children: [statsTable as any] }));

    sections.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
        children: [
          new TextRun({
            text: 'Created by: ',
            size: 32,
            color: COLORS.darkGray
          }),
          new TextRun({
            text: studentName,
            bold: true,
            size: 32,
            color: COLORS.orange
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200 },
        children: [
          new TextRun({
            text: `📅 ${completedDate}`,
            size: 26,
            color: COLORS.teal
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
        children: [
          new TextRun({
            text: 'Ascend Now Career Exploration Platform',
            size: 22,
            color: COLORS.primaryBlue
          })
        ]
      })
    );

    // Page break
    sections.push(new Paragraph({ children: [new PageBreak()] }));

    // ====================================
    // 2. BADGES EARNED
    // ====================================
    sections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: '🏆 Badges Earned',
            bold: true,
            size: 42,
            color: COLORS.primaryBlue
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: `${studentName} unlocked ${badgesEarned.length} amazing badge${
              badgesEarned.length !== 1 ? 's' : ''
            }! Here's what each one means:`,
            size: 24
          })
        ]
      })
    );

    // Create badge grid (2x2)
    if (badgesEarned.length > 0) {
      const badgeColors = [
        { bg: COLORS.lightBlue, border: COLORS.primaryBlue },
        { bg: COLORS.lightPink, border: COLORS.pink },
        { bg: COLORS.lightGreen, border: COLORS.green },
        { bg: COLORS.lightOrange, border: COLORS.orange }
      ];

      // Create rows of 2 badges each
      for (let i = 0; i < badgesEarned.length; i += 2) {
        const badge1 = BADGES[badgesEarned[i] as string];
        const badge2 = i + 1 < badgesEarned.length ? BADGES[badgesEarned[i + 1] as string] : null;

        const cells = [];
        if (badge1) {
          const colors = badgeColors[i % 4];
          cells.push(createBadgeCell(badge1, badgeUnlockDates.get(badgesEarned[i] as string), colors.bg, colors.border));
        }
        if (badge2) {
          const colors = badgeColors[(i + 1) % 4];
          cells.push(
            createBadgeCell(badge2, badgeUnlockDates.get(badgesEarned[i + 1] as string), colors.bg, colors.border)
          );
        }

        const badgeTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          columnWidths: badge2 ? [4680, 4680] : [9360],
          rows: [
            new TableRow({
              height: { value: 1800, rule: 'atLeast' },
              children: cells
            })
          ]
        });

        sections.push(new Paragraph({ children: [badgeTable as any], spacing: { after: 200 } }));
      }
    }

    // Page break
    sections.push(new Paragraph({ children: [new PageBreak()] }));

    // ====================================
    // 3. ABOUT ME & COLLAGE
    // ====================================
    sections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: '✨ About Me',
            bold: true,
            size: 42,
            color: COLORS.primaryBlue
          })
        ]
      })
    );

    if (collage.aboutMe) {
      const aboutMeTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 100, type: WidthType.PERCENTAGE },
                shading: { fill: COLORS.lightYellow, type: ShadingType.CLEAR },
                borders: {
                  top: createBorder(COLORS.orange, 8),
                  bottom: createBorder(COLORS.orange, 8),
                  left: createBorder(COLORS.orange, 8),
                  right: createBorder(COLORS.orange, 8)
                },
                margins: {
                  top: 300,
                  bottom: 300,
                  left: 300,
                  right: 300
                },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: collage.aboutMe,
                        size: 24,
                        italics: true,
                        color: COLORS.darkGray
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      });

      sections.push(new Paragraph({ children: [aboutMeTable as any], spacing: { after: 400 } }));
    }

    // Collage Image Section
    sections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: '🎨 My Visual Identity Collage',
            bold: true,
            size: 42,
            color: COLORS.primaryBlue
          })
        ]
      })
    );

    // Collage image placeholder or actual image
    if (imageUrl) {
      try {
        // If we have a data URL, extract the base64 data
        let imageBuffer: Buffer;
        if (imageUrl.startsWith('data:')) {
          const base64Data = imageUrl.split(',')[1];
          imageBuffer = Buffer.from(base64Data, 'base64');
        } else {
          // If it's a URL, we'd need to fetch it - for now, show placeholder
          throw new Error('URL not supported yet');
        }

        sections.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: 600,
                  height: 450
                },
                type: 'png'
              })
            ]
          })
        );
      } catch (error) {
        console.error('Failed to add image:', error);
        // Fallback to placeholder
        const placeholderTable = new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              height: { value: 3600, rule: 'atLeast' },
              children: [
                new TableCell({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  shading: { fill: COLORS.lightPink, type: ShadingType.CLEAR },
                  borders: {
                    top: createBorder(COLORS.pink, 8),
                    bottom: createBorder(COLORS.pink, 8),
                    left: createBorder(COLORS.pink, 8),
                    right: createBorder(COLORS.pink, 8)
                  },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: '[ INSERT COLLAGE IMAGE HERE ]',
                          size: 28,
                          italics: true,
                          color: COLORS.lightGray
                        })
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        });

        sections.push(new Paragraph({ children: [placeholderTable as any], spacing: { after: 400 } }));
      }
    }

    // Page break
    sections.push(new Paragraph({ children: [new PageBreak()] }));

    // ====================================
    // 4. INSPIRING QUOTE
    // ====================================
    sections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: '💡 My Inspiring Quote',
            bold: true,
            size: 42,
            color: COLORS.primaryBlue
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 400 },
        children: [
          new TextRun({
            text: quoteText,
            bold: true,
            italics: true,
            size: 36,
            color: COLORS.orange
          })
        ]
      }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
        children: [
          new TextRun({
            text: 'What This Quote Reveals:',
            bold: true,
            size: 34,
            color: COLORS.purple
          })
        ]
      })
    );

    // Trait cards 2x2
    const traits = [
      {
        trait: 'Resourcefulness',
        description: 'Turning challenges into opportunities',
        emoji: '💪',
        bg: COLORS.lightBlue,
        border: COLORS.primaryBlue
      },
      {
        trait: 'Optimism',
        description: 'Maintaining a positive outlook',
        emoji: '😊',
        bg: COLORS.lightPink,
        border: COLORS.pink
      },
      {
        trait: 'Problem-Solving',
        description: 'Finding practical solutions',
        emoji: '🧠',
        bg: COLORS.lightGreen,
        border: COLORS.green
      },
      {
        trait: 'Resilience',
        description: 'Making the best of any situation',
        emoji: '☀️',
        bg: COLORS.lightOrange,
        border: COLORS.orange
      }
    ];

    // Create 2x2 grid for traits
    for (let i = 0; i < traits.length; i += 2) {
      const trait1 = traits[i];
      const trait2 = traits[i + 1];

      const traitTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [4680, 4680],
        rows: [
          new TableRow({
            height: { value: 1200, rule: 'atLeast' },
            children: [
              new TableCell({
                width: { size: 4680, type: WidthType.DXA },
                shading: { fill: trait1.bg, type: ShadingType.CLEAR },
                borders: {
                  top: createBorder(trait1.border, 8),
                  bottom: createBorder(trait1.border, 8),
                  left: createBorder(trait1.border, 8),
                  right: createBorder(trait1.border, 8)
                },
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: `${trait1.emoji} ${trait1.trait}`,
                        bold: true,
                        size: 28,
                        color: COLORS.darkGray
                      })
                    ]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 100 },
                    children: [
                      new TextRun({
                        text: trait1.description,
                        size: 22,
                        color: COLORS.mediumGray
                      })
                    ]
                  })
                ]
              }),
              new TableCell({
                width: { size: 4680, type: WidthType.DXA },
                shading: { fill: trait2.bg, type: ShadingType.CLEAR },
                borders: {
                  top: createBorder(trait2.border, 8),
                  bottom: createBorder(trait2.border, 8),
                  left: createBorder(trait2.border, 8),
                  right: createBorder(trait2.border, 8)
                },
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: `${trait2.emoji} ${trait2.trait}`,
                        bold: true,
                        size: 28,
                        color: COLORS.darkGray
                      })
                    ]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 100 },
                    children: [
                      new TextRun({
                        text: trait2.description,
                        size: 22,
                        color: COLORS.mediumGray
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      });

      sections.push(new Paragraph({ children: [traitTable as any], spacing: { after: 200 } }));
    }

    // Page break
    sections.push(new Paragraph({ children: [new PageBreak()] }));

    // ====================================
    // 5. COLLAGE THEMES
    // ====================================
    sections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: '🎯 Themes in My Collage',
            bold: true,
            size: 42,
            color: COLORS.primaryBlue
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: 'My collage includes these awesome elements that tell my story:',
            size: 24
          })
        ]
      })
    );

    const collageThemes = [
      {
        icon: '🧠',
        title: 'Brain & Intelligence',
        description:
          'The brain imagery represents my intellectual curiosity and love for critical thinking. I enjoy solving problems and learning new things!'
      },
      {
        icon: '💻',
        title: 'Technology & Coding',
        description:
          'Images of coding and technology show my passion for STEM and digital innovation. Programming perfectly matches my hands-on, builder mindset!'
      },
      {
        icon: '🏙️',
        title: 'Futuristic Cities',
        description:
          'Futuristic cityscapes show my vision for tomorrow and global perspective. I dream of working on large-scale projects that make a worldwide impact!'
      },
      {
        icon: '🚗',
        title: 'Luxury & Success',
        description:
          'Images of luxury cars show my aspirations for success. This motivates me to work hard and accomplish big goals!'
      },
      {
        icon: '💪',
        title: 'Fitness & Determination',
        description:
          'Gym equipment represents my determination and work ethic. Physical fitness shows discipline, perseverance, and the ability to set and crush goals!'
      }
    ];

    collageThemes.forEach((theme) => {
      sections.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 100 },
          children: [
            new TextRun({
              text: `${theme.icon} ${theme.title}`,
              bold: true,
              size: 28,
              color: COLORS.purple
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: theme.description,
              size: 24
            })
          ]
        })
      );
    });

    // Page break
    sections.push(new Paragraph({ children: [new PageBreak()] }));

    // ====================================
    // 6. CAREER PATHWAYS
    // ====================================
    sections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: '🎓 Career Pathways That Match Me',
            bold: true,
            size: 42,
            color: COLORS.primaryBlue
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: 'Based on my collage themes, here are careers that align with my interests and strengths:',
            size: 24
          })
        ]
      })
    );

    const careers = [
      {
        icon: '💻',
        title: 'Software Engineering',
        description: 'Perfect for my coding interest and builder mindset. Create apps, solve problems, and innovate!',
        bg: COLORS.lightBlue,
        border: COLORS.primaryBlue
      },
      {
        icon: '⚙️',
        title: 'Mechanical/Electrical Engineering',
        description:
          'Perfect for my hands-on builder mentality. Design, test, and create tangible solutions to real-world problems!',
        bg: COLORS.lightPink,
        border: COLORS.pink
      },
      {
        icon: '🏛️',
        title: 'Architecture',
        description: 'Design the cities of tomorrow. Combine creativity, technical skills, and problem-solving!',
        bg: COLORS.lightGreen,
        border: COLORS.green
      },
      {
        icon: '💼',
        title: 'Tech Entrepreneur',
        description: 'Start companies and create solutions. Build, innovate, and make a significant impact!',
        bg: COLORS.lightOrange,
        border: COLORS.orange
      }
    ];

    // Create career grid (2x2)
    for (let i = 0; i < careers.length; i += 2) {
      const career1 = careers[i];
      const career2 = i + 1 < careers.length ? careers[i + 1] : null;

      const cells = [];
      cells.push(createCareerCell(career1, career1.bg, career1.border));
      if (career2) {
        cells.push(createCareerCell(career2, career2.bg, career2.border));
      }

      const careerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: career2 ? [4680, 4680] : [9360],
        rows: [
          new TableRow({
            height: { value: 1400, rule: 'atLeast' },
            children: cells
          })
        ]
      });

      sections.push(new Paragraph({ children: [careerTable as any], spacing: { after: 200 } }));
    }

    // Page break
    sections.push(new Paragraph({ children: [new PageBreak()] }));

    // ====================================
    // 7. NEXT STEPS
    // ====================================
    sections.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: '🎯 My Next Steps',
            bold: true,
            size: 42,
            color: COLORS.primaryBlue
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: "Here's how I'll continue exploring and developing my skills:",
            size: 24
          })
        ]
      })
    );

    const steps = [
      {
        number: '1',
        title: 'Work on Hands-On Projects',
        description:
          'Build coding projects, robotics, or engineering challenges using Arduino, Raspberry Pi, or web frameworks!',
        color: COLORS.primaryBlue
      },
      {
        number: '2',
        title: 'Join STEM Competitions',
        description:
          'Participate in science fairs, coding competitions, and robotics challenges to showcase my skills!',
        color: COLORS.purple
      },
      {
        number: '3',
        title: 'Take Advanced Courses',
        description: 'Pursue advanced math, physics, and computer science. Use Khan Academy, Coursera, or CodeAcademy!',
        color: COLORS.green
      }
    ];

    steps.forEach((step) => {
      const stepTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [800, 8560],
        rows: [
          new TableRow({
            height: { value: 800, rule: 'atLeast' },
            children: [
              new TableCell({
                width: { size: 800, type: WidthType.DXA },
                shading: { fill: step.color, type: ShadingType.CLEAR },
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: step.number,
                        bold: true,
                        size: 32,
                        color: 'FFFFFF'
                      })
                    ]
                  })
                ]
              }),
              new TableCell({
                width: { size: 8560, type: WidthType.DXA },
                shading: { fill: 'F9FAFB', type: ShadingType.CLEAR },
                borders: {
                  top: createBorder('E5E7EB'),
                  bottom: createBorder('E5E7EB'),
                  left: createBorder('E5E7EB'),
                  right: createBorder('E5E7EB')
                },
                verticalAlign: VerticalAlign.CENTER,
                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: step.title,
                        bold: true,
                        size: 26,
                        color: step.color
                      })
                    ]
                  }),
                  new Paragraph({
                    spacing: { before: 100 },
                    children: [
                      new TextRun({
                        text: step.description,
                        size: 22,
                        color: COLORS.mediumGray
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      });

      sections.push(new Paragraph({ children: [stepTable as any], spacing: { after: 200 } }));
    });

    // ====================================
    // 8. CONCLUSION
    // ====================================
    sections.push(new Paragraph({ children: [new PageBreak()] }));

    const journeySummary = `${studentName} is a determined, ambitious builder with a passion for creating and innovating. With ${studentName}'s hands-on learning style, technology interest, and resilient problem-solving mindset, ${studentName} is ready to tackle big challenges and make meaningful contributions to the world!`;

    const conclusionTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              shading: { fill: COLORS.lightBlue, type: ShadingType.CLEAR },
              borders: {
                top: createBorder(COLORS.primaryBlue, 8),
                bottom: createBorder(COLORS.primaryBlue, 8),
                left: createBorder(COLORS.primaryBlue, 8),
                right: createBorder(COLORS.primaryBlue, 8)
              },
              margins: { top: 400, bottom: 400, left: 400, right: 400 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 200 },
                  children: [
                    new TextRun({
                      text: `🌟 ${studentName.toUpperCase()}'S JOURNEY AHEAD 🌟`,
                      bold: true,
                      size: 36,
                      color: COLORS.primaryBlue
                    })
                  ]
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: journeySummary,
                      size: 24,
                      color: COLORS.darkGray
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    });

    sections.push(new Paragraph({ children: [conclusionTable as any], spacing: { before: 400, after: 400 } }));

    sections.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
        children: [
          new TextRun({
            text: '✨ Ascend Now Career Exploration Platform ✨',
            bold: true,
            size: 28,
            color: COLORS.purple
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200 },
        children: [
          new TextRun({
            text: completedDate,
            size: 20,
            color: COLORS.mediumGray
          })
        ]
      })
    );

    // ====================================
    // CREATE DOCUMENT
    // ====================================
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440
              }
            }
          },
          children: sections
        }
      ]
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);

    // Return document
    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Identity_Collage_${studentName}.docx"`
      }
    });
  } catch (error) {
    console.error('Document export error:', error);
    return NextResponse.json(
      { error: 'Failed to export document: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
