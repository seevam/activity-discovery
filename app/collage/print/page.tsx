'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { BADGES } from '@/lib/constants/badges';
import type { CollageAnalysis, ExtendedCanvasJSON } from '@/types/collage';

function PrintableContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const collageId = searchParams.get('id');

  const [collage, setCollage] = useState<any>(null);
  const [analysis, setAnalysis] = useState<CollageAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [canvasImageUrl, setCanvasImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!collageId) {
      router.push('/');
      return;
    }

    loadData();
  }, [collageId, router]);

  const loadData = async () => {
    try {
      // Load collage data
      const collageResponse = await fetch(`/api/collages/${collageId}`);
      if (collageResponse.ok) {
        const data = await collageResponse.json();
        setCollage(data);

        // Load canvas image
        if (data.canvasJSON) {
          loadCanvasImage(data.canvasJSON);
        }

        // Get or generate analysis
        const canvasJSON = data.canvasJSON as ExtendedCanvasJSON;
        if (canvasJSON?.analysis) {
          setAnalysis(canvasJSON.analysis);
        } else {
          // Generate analysis
          const analysisResponse = await fetch(`/api/collages/${collageId}/analyze`, {
            method: 'POST',
          });
          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();
            setAnalysis(analysisData.analysis);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCanvasImage = async (canvasJSON: any) => {
    try {
      const { fabric } = await import('fabric');
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = 800;
      offscreenCanvas.height = 600;

      const fabricCanvas = new fabric.Canvas(offscreenCanvas);

      await new Promise<void>((resolve) => {
        fabricCanvas.loadFromJSON(canvasJSON, () => {
          fabricCanvas.renderAll();
          setTimeout(() => resolve(), 100);
        });
      });

      const dataUrl = fabricCanvas.toDataURL({ format: 'png', quality: 1 });
      setCanvasImageUrl(dataUrl);
      fabricCanvas.dispose();
    } catch (error) {
      console.error('Failed to load canvas image:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-600">Loading your collage report...</p>
        </div>
      </div>
    );
  }

  if (!collage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Collage not found</p>
        </div>
      </div>
    );
  }

  const studentName = collage.studentId || 'Student';
  const badgesEarned = Array.isArray(collage.badgesEarned) ? collage.badgesEarned : [];
  const completedChallenges = [
    collage.challenge1Complete,
    collage.challenge2Complete,
    collage.challenge3Complete,
    collage.challenge4Complete,
    collage.challenge5Complete,
  ].filter(Boolean).length;

  const canvasJSON = collage.canvasJSON as ExtendedCanvasJSON;
  const selectedQuote = canvasJSON?.selectedQuote;
  const quoteText = selectedQuote?.text || '"The future belongs to those who believe in the beauty of their dreams."';
  const quoteAuthor = selectedQuote?.author || 'Eleanor Roosevelt';

  return (
    <>
      {/* Print Button - Only visible on screen */}
      <div className="no-print fixed top-4 right-4 z-50">
        <Button onClick={handlePrint} size="lg" className="shadow-lg">
          🖨️ Print Report
        </Button>
      </div>

      {/* Printable Content */}
      <div className="print-container">
        {/* Page 1: Cover Page */}
        <div className="print-page cover-page">
          <div className="text-center">
            <h1 className="cover-title">MY IDENTITY COLLAGE</h1>
            <div className="cover-emoji">🎨</div>
            <p className="cover-subtitle">A Story of Who I Am!</p>

            <div className="stats-grid">
              <div className="stat-card stat-blue">
                <div className="stat-number">{completedChallenges}/5</div>
                <div className="stat-label">CHALLENGES</div>
              </div>
              <div className="stat-card stat-orange">
                <div className="stat-number">{badgesEarned.length}/6</div>
                <div className="stat-label">BADGES</div>
              </div>
              <div className="stat-card stat-green">
                <div className="stat-number">{collage.elementCount || 0}</div>
                <div className="stat-label">ELEMENTS</div>
              </div>
            </div>

            <div className="cover-info">
              <p className="student-name">Created by: {studentName}</p>
              <p className="completion-date">
                📅 {new Date(collage.completedAt || collage.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="cover-footer">
              Ascend Now Career Exploration Platform
            </div>
          </div>
        </div>

        {/* Page 2: Badges & About Me */}
        <div className="print-page">
          <h2 className="page-title">🏆 Badges Earned</h2>
          <p className="page-subtitle">Unlocked achievements on your journey!</p>

          <div className="badges-grid">
            {badgesEarned.map((badgeId: string) => {
              const badge = BADGES[badgeId];
              if (!badge) return null;
              return (
                <div key={badgeId} className="badge-card">
                  <div className="badge-emoji">{badge.emoji}</div>
                  <div className="badge-content">
                    <h3 className="badge-name">{badge.name}</h3>
                    <p className="badge-description">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {collage.aboutMe && (
            <div className="about-me-section">
              <h2 className="section-title">✨ About Me</h2>
              <p className="about-me-text">{collage.aboutMe}</p>
            </div>
          )}
        </div>

        {/* Page 3: Collage & Quote */}
        <div className="print-page">
          <h2 className="page-title">🎨 My Visual Identity Collage</h2>
          <p className="page-subtitle">Here's my collage showing who I am and what I love!</p>

          {canvasImageUrl && (
            <div className="collage-image-container">
              <img src={canvasImageUrl} alt="Identity Collage" className="collage-image" />
            </div>
          )}

          <div className="quote-section">
            <h2 className="section-title">💡 My Inspiring Quote</h2>
            <div className="quote-box">
              <p className="quote-text">"{quoteText}"</p>
              {quoteAuthor && <p className="quote-author">— {quoteAuthor}</p>}
            </div>

            {analysis?.quoteAnalysis?.reveals && (
              <div className="quote-reveals">
                <h3 className="subsection-title">What This Quote Reveals:</h3>
                <ul className="reveals-list">
                  {analysis.quoteAnalysis.reveals.map((reveal, idx) => (
                    <li key={idx}>{reveal}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Page 4: Themes Analysis */}
        {analysis?.themes && analysis.themes.length > 0 && (
          <div className="print-page">
            <h2 className="page-title">🎯 Themes in My Collage</h2>
            <p className="page-subtitle">My collage includes these themes that tell my story:</p>

            <div className="themes-grid">
              {analysis.themes.map((theme, idx) => (
                <div key={idx} className="theme-card">
                  <div className="theme-emoji">{theme.emoji}</div>
                  <div className="theme-content">
                    <h3 className="theme-title">{theme.title}</h3>
                    <p className="theme-description">{theme.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Page 5: Career Pathways */}
        {analysis?.careerPathways && analysis.careerPathways.length > 0 && (
          <div className="print-page">
            <h2 className="page-title">🎓 Career Pathways That Match</h2>
            <p className="page-subtitle">Based on {studentName}'s interests and strengths:</p>

            <div className="careers-grid">
              {analysis.careerPathways.map((career, idx) => (
                <div key={idx} className="career-card">
                  <div className="career-emoji">{career.emoji}</div>
                  <div className="career-content">
                    <h3 className="career-title">{career.title}</h3>
                    <p className="career-description">{career.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Page 6: Next Steps */}
        <div className="print-page">
          <h2 className="page-title">🎯 My Next Steps</h2>
          <p className="page-subtitle">Here's how I'll continue exploring and developing:</p>

          <div className="next-steps-list">
            {(analysis?.nextSteps || [
              'Work on hands-on projects using skills I love',
              'Join competitions and challenges to showcase abilities',
              'Take advanced courses in areas of interest',
              'Connect with mentors in fields I want to explore',
            ]).map((step, idx) => (
              <div key={idx} className="next-step-item">
                <div className="step-number">{idx + 1}</div>
                <div className="step-text">{step}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Page 7: Conclusion */}
        <div className="print-page conclusion-page">
          <h2 className="conclusion-title">🌟 YOUR JOURNEY AHEAD 🌟</h2>

          <div className="conclusion-text">
            <p>
              {studentName} is a {(collage.session1Themes as string[] || []).slice(0, 3).join(', ') || 'passionate'} individual
              with a passion for creating and learning. With a hands-on learning style, strong interests, and resilient
              problem-solving mindset, you are ready to tackle big challenges and make meaningful contributions to the world!
            </p>
          </div>

          <div className="conclusion-footer">
            <p className="footer-brand">✨ Ascend Now Career Exploration Platform ✨</p>
            <p className="footer-date">
              {new Date(collage.completedAt || collage.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Screen Styles */
        .print-container {
          max-width: 8.5in;
          margin: 2rem auto;
          background: white;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        }

        .print-page {
          padding: 1in;
          min-height: 10in;
          background: white;
          page-break-after: always;
        }

        .print-page:last-child {
          page-break-after: auto;
        }

        /* Cover Page */
        .cover-page {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cover-title {
          font-size: 3rem;
          font-weight: bold;
          color: #006BFF;
          margin-bottom: 1rem;
        }

        .cover-emoji {
          font-size: 4rem;
          margin: 1rem 0;
        }

        .cover-subtitle {
          font-size: 1.5rem;
          color: #4B5563;
          margin-bottom: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin: 3rem 0;
        }

        .stat-card {
          text-align: center;
        }

        .stat-number {
          font-size: 3rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #6B7280;
        }

        .stat-blue .stat-number { color: #006BFF; }
        .stat-orange .stat-number { color: #F59E0B; }
        .stat-green .stat-number { color: #10B981; }

        .cover-info {
          margin-top: 2rem;
        }

        .student-name {
          font-size: 1.125rem;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .completion-date {
          font-size: 1rem;
          color: #6B7280;
        }

        .cover-footer {
          position: absolute;
          bottom: 1in;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 0.875rem;
          color: #9CA3AF;
        }

        /* Page Titles */
        .page-title {
          font-size: 2rem;
          font-weight: bold;
          color: #006BFF;
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .page-subtitle {
          text-align: center;
          color: #6B7280;
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #006BFF;
          margin: 2rem 0 1rem 0;
        }

        /* Badges */
        .badges-grid {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .badge-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #F9FAFB;
          border-radius: 0.5rem;
          border: 1px solid #E5E7EB;
        }

        .badge-emoji {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .badge-content {
          flex: 1;
        }

        .badge-name {
          font-size: 1.125rem;
          font-weight: bold;
          color: #006BFF;
          margin-bottom: 0.25rem;
        }

        .badge-description {
          font-size: 0.875rem;
          color: #6B7280;
        }

        /* About Me */
        .about-me-section {
          margin-top: 2rem;
          padding: 1.5rem;
          background: #FEF3C7;
          border-radius: 0.5rem;
          border-left: 4px solid #F59E0B;
        }

        .about-me-text {
          color: #374151;
          line-height: 1.6;
        }

        /* Collage Image */
        .collage-image-container {
          text-align: center;
          margin: 2rem 0;
        }

        .collage-image {
          max-width: 100%;
          height: auto;
          border: 2px solid #006BFF;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        /* Quote */
        .quote-section {
          margin-top: 2rem;
        }

        .quote-box {
          padding: 1.5rem;
          background: #FEF9E7;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }

        .quote-text {
          font-size: 1.125rem;
          font-style: italic;
          color: #374151;
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .quote-author {
          text-align: center;
          color: #6B7280;
        }

        .quote-reveals {
          margin-top: 1rem;
        }

        .subsection-title {
          font-size: 1.125rem;
          font-weight: bold;
          color: #8B5CF6;
          margin-bottom: 0.5rem;
        }

        .reveals-list {
          list-style: none;
          padding: 0;
        }

        .reveals-list li {
          padding: 0.5rem 0;
          padding-left: 1.5rem;
          position: relative;
        }

        .reveals-list li:before {
          content: "•";
          position: absolute;
          left: 0;
          color: #8B5CF6;
          font-weight: bold;
        }

        /* Themes */
        .themes-grid {
          display: grid;
          gap: 1.5rem;
        }

        .theme-card {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background: #F9FAFB;
          border-radius: 0.5rem;
          border: 1px solid #E5E7EB;
        }

        .theme-emoji {
          font-size: 2.5rem;
          flex-shrink: 0;
        }

        .theme-content {
          flex: 1;
        }

        .theme-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: #006BFF;
          margin-bottom: 0.5rem;
        }

        .theme-description {
          color: #4B5563;
          line-height: 1.5;
        }

        /* Careers */
        .careers-grid {
          display: grid;
          gap: 1.5rem;
        }

        .career-card {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background: #EFF6FF;
          border-radius: 0.5rem;
          border: 1px solid #BFDBFE;
        }

        .career-emoji {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .career-content {
          flex: 1;
        }

        .career-title {
          font-size: 1.125rem;
          font-weight: bold;
          color: #006BFF;
          margin-bottom: 0.5rem;
        }

        .career-description {
          color: #4B5563;
          line-height: 1.5;
          font-size: 0.875rem;
        }

        /* Next Steps */
        .next-steps-list {
          display: grid;
          gap: 1rem;
        }

        .next-step-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .step-number {
          width: 2rem;
          height: 2rem;
          background: #006BFF;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }

        .step-text {
          flex: 1;
          padding-top: 0.25rem;
          color: #374151;
          line-height: 1.6;
        }

        /* Conclusion */
        .conclusion-page {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .conclusion-title {
          font-size: 2rem;
          font-weight: bold;
          color: #006BFF;
          text-align: center;
          margin-bottom: 2rem;
        }

        .conclusion-text {
          text-align: center;
          font-size: 1.125rem;
          color: #374151;
          line-height: 1.8;
          margin-bottom: 3rem;
        }

        .conclusion-footer {
          padding: 1.5rem;
          background: #EFF6FF;
          border-radius: 0.5rem;
          text-align: center;
        }

        .footer-brand {
          font-size: 1.125rem;
          font-weight: bold;
          color: #006BFF;
          margin-bottom: 0.5rem;
        }

        .footer-date {
          color: #6B7280;
        }

        /* Print Styles */
        @media print {
          body {
            margin: 0;
            padding: 0;
          }

          .no-print {
            display: none !important;
          }

          .print-container {
            max-width: none;
            margin: 0;
            box-shadow: none;
          }

          .print-page {
            padding: 0.75in;
            min-height: 0;
            page-break-after: always;
            page-break-inside: avoid;
          }

          .print-page:last-child {
            page-break-after: auto;
          }

          .cover-footer {
            position: static;
            margin-top: 3rem;
          }

          @page {
            size: letter;
            margin: 0;
          }

          /* Prevent breaks inside cards */
          .badge-card,
          .theme-card,
          .career-card,
          .next-step-item {
            page-break-inside: avoid;
          }

          /* Ensure images don't break */
          .collage-image-container {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}

export default function PrintablePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📄</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PrintableContent />
    </Suspense>
  );
}
