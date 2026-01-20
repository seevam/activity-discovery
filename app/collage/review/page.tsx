'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BadgeGrid } from '@/components/ui/Badge';
import { BADGES } from '@/lib/constants/badges';
import { Badge as BadgeType } from '@/types/collage';
import dynamic from 'next/dynamic';

// Dynamically import canvas-confetti to prevent SSR issues
const confettiLoader = () => import('canvas-confetti');

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const collageId = searchParams.get('id');

  const [collage, setCollage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [canvasImageUrl, setCanvasImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<any>(null);

  useEffect(() => {
    if (!collageId) {
      router.push('/');
      return;
    }

    loadCollage();

    // Celebration
    setTimeout(async () => {
      const confetti = (await confettiLoader()).default;
      confetti({
        particleCount: 200,
        spread: 160,
        origin: { y: 0.5 },
      });
    }, 500);
  }, [collageId, router]);

  const loadCollage = async () => {
    try {
      const response = await fetch(`/api/collages/${collageId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('[Review] Collage data loaded:', {
          hasCanvasJSON: !!data.canvasJSON,
          elementCount: data.elementCount,
          canvasObjectsCount: data.canvasJSON?.objects?.length
        });
        setCollage(data);

        // Load canvas image from canvasJSON if available
        if (data.canvasJSON) {
          loadCanvasImage(data.canvasJSON);
        } else {
          console.warn('[Review] No canvasJSON found in collage data!');
        }
      }
    } catch (error) {
      console.error('Failed to load collage:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCanvasImage = async (canvasJSON: any) => {
    try {
      console.log('[Review] Loading canvas from JSON, objects count:', canvasJSON?.objects?.length);
      if (canvasJSON?.objects && canvasJSON.objects.length > 0) {
        console.log('[Review] First 3 objects:', canvasJSON.objects.slice(0, 3).map((o: any) => ({
          type: o.type,
          text: o.type === 'text' ? o.text : undefined
        })));
      }

      // Validate canvas JSON
      if (!canvasJSON || !canvasJSON.objects || canvasJSON.objects.length === 0) {
        console.warn('[Review] Canvas JSON is empty or has no objects!');
        console.log('[Review] Full canvas JSON:', canvasJSON);
        alert('Warning: Your canvas appears to be empty. Elements may not have been saved properly. Try going back to the builder and saving again.');
        return;
      }

      // Dynamically import fabric
      const { fabric } = await import('fabric');

      // Create an off-screen canvas
      const offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = 800;
      offscreenCanvas.height = 600;

      const fabricCanvas = new fabric.Canvas(offscreenCanvas);

      // Load from JSON (background will be loaded automatically)
      await new Promise<void>((resolve) => {
        fabricCanvas.loadFromJSON(canvasJSON, () => {
          console.log('[Review] Background after load:', (fabricCanvas as any).backgroundColor);
          const loadedObjects = fabricCanvas.getObjects();
          console.log('[Review] Canvas loaded successfully!');
          console.log('[Review] Loaded object count:', loadedObjects.length);
          console.log('[Review] Object types:', loadedObjects.map(o => o.type).join(', '));

          // Log text objects specifically
          const textObjects = loadedObjects.filter(o => o.type === 'text');
          console.log('[Review] Text objects:', textObjects.length);
          textObjects.forEach((obj: any, idx) => {
            console.log(`[Review] Text ${idx + 1}:`, obj.text?.substring(0, 50));
          });

          fabricCanvas.renderAll();

          // Small delay to ensure rendering completes
          setTimeout(() => resolve(), 100);
        });
      });

      // Export as data URL with error handling
      try {
        const dataUrl = fabricCanvas.toDataURL({ format: 'png', quality: 1 });
        console.log('[Review] Canvas exported to data URL, length:', dataUrl.length);
        setCanvasImageUrl(dataUrl);
      } catch (exportError) {
        console.error('[Review] Failed to export canvas to data URL:', exportError);
        // Try alternative export method
        try {
          const dataUrl = offscreenCanvas.toDataURL('image/png');
          console.log('[Review] Fallback export successful, length:', dataUrl.length);
          setCanvasImageUrl(dataUrl);
        } catch (fallbackError) {
          console.error('[Review] Fallback export also failed:', fallbackError);
          throw new Error('Both export methods failed');
        }
      }

      // Clean up
      fabricCanvas.dispose();
    } catch (error) {
      console.error('[Review] Failed to load canvas image:', error);
      console.error('[Review] Error details:', {
        message: (error as Error)?.message,
        stack: (error as Error)?.stack,
        error
      });
      alert('Error loading canvas. Please check the console for details and try refreshing the page.');
    }
  };

  const handleDownloadPDF = async () => {
    if (!collageId) return;

    setDownloading(true);

    try {
      const response = await fetch(`/api/export/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collageId,
          canvasDataUrl: canvasImageUrl // Pass the canvas image
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Identity_Collage_${collageId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        console.error('PDF export failed:', error);
        alert('Failed to download PDF: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadDOCX = async () => {
    if (!collageId) return;

    setDownloading(true);

    try {
      const response = await fetch(`/api/export/docx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collageId,
          canvasDataUrl: canvasImageUrl // Pass the canvas image
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Identity_Collage_${collageId}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        console.error('DOCX export failed:', error);
        alert('Failed to download Word document: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download Word document. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPNG = async () => {
    if (!canvasImageUrl) {
      alert('Canvas image is still loading. Please wait a moment.');
      return;
    }

    try {
      // Download directly from the data URL
      const a = document.createElement('a');
      a.href = canvasImageUrl;
      a.download = `Identity_Collage_${collageId}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download PNG. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-xl font-semibold text-gray-900">Loading your collage...</div>
        </div>
      </div>
    );
  }

  const badges: BadgeType[] = Object.values(BADGES).map((badge) => ({
    ...badge,
    unlocked: collage?.badgesEarned?.includes(badge.id) || false,
    unlockedAt: collage?.badgesEarned?.includes(badge.id) ? new Date() : undefined,
  }));

  const completedChallenges = [
    collage?.challenge1Complete,
    collage?.challenge2Complete,
    collage?.challenge3Complete,
    collage?.challenge4Complete,
    collage?.challenge5Complete,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            AMAZING WORK!
          </h1>
          <h2 className="text-2xl text-gray-700 mb-2">
            YOUR COLLAGE IS READY!
          </h2>
          <p className="text-gray-600">
            You've created a beautiful visual story that shows who you are!
          </p>
        </div>

        {/* Collage Preview */}
        {canvasImageUrl && (
          <Card className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Identity Collage:</h3>
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
              <img
                src={canvasImageUrl}
                alt="Your identity collage"
                className="w-full h-auto"
              />
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="text-center bg-blue-50 border-2 border-blue-primary">
            <div className="text-4xl font-bold text-blue-primary mb-1">
              {completedChallenges}/5
            </div>
            <div className="text-sm text-gray-700">Challenges Completed</div>
          </Card>

          <Card className="text-center bg-purple-50 border-2 border-purple-500">
            <div className="text-4xl font-bold text-purple-600 mb-1">
              {collage?.badgesEarned?.length || 0}/6
            </div>
            <div className="text-sm text-gray-700">Badges Earned</div>
          </Card>

          <Card className="text-center bg-green-50 border-2 border-green-success">
            <div className="text-4xl font-bold text-green-600 mb-1">
              {collage?.elementCount || 0}
            </div>
            <div className="text-sm text-gray-700">Elements Created</div>
          </Card>
        </div>

        {/* Badges */}
        <Card className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🏆 Your Badge Collection:</h3>
          <BadgeGrid badges={badges} />

          {badges.filter((b) => b.unlocked).length === 6 && (
            <div className="mt-6 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">⭐</div>
              <div className="font-bold text-lg text-gray-900">
                MASTER STORYTELLER!
              </div>
              <div className="text-sm text-gray-700">
                You earned ALL 6 badges! Incredible work!
              </div>
            </div>
          )}
        </Card>

        {/* About Me */}
        {collage?.aboutMe && (
          <Card className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">✍️ About Me:</h3>
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
              <p className="text-gray-800 leading-relaxed">{collage.aboutMe}</p>
            </div>
          </Card>
        )}

        {/* Download Options */}
        <Card className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📥 Download Your Collage:</h3>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="border-2 border-gray-300 rounded-xl p-6 text-center hover:border-blue-primary transition-colors">
              <div className="text-4xl mb-3">📝</div>
              <h4 className="font-bold text-gray-900 mb-2">Word Document</h4>
              <p className="text-sm text-gray-600 mb-4">
                Complete report with themes & career paths
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={handleDownloadDOCX}
                disabled={downloading}
              >
                {downloading ? 'Generating...' : 'Download DOCX'}
              </Button>
            </div>

            <div className="border-2 border-gray-300 rounded-xl p-6 text-center hover:border-blue-primary transition-colors">
              <div className="text-4xl mb-3">📄</div>
              <h4 className="font-bold text-gray-900 mb-2">PDF (Printable)</h4>
              <p className="text-sm text-gray-600 mb-4">
                Full collage + badges + About Me
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={handleDownloadPDF}
                disabled={downloading}
              >
                {downloading ? 'Generating...' : 'Download PDF'}
              </Button>
            </div>

            <div className="border-2 border-gray-300 rounded-xl p-6 text-center hover:border-blue-primary transition-colors">
              <div className="text-4xl mb-3">🖼️</div>
              <h4 className="font-bold text-gray-900 mb-2">PNG (Digital)</h4>
              <p className="text-sm text-gray-600 mb-4">
                Just your collage image
              </p>
              <Button
                variant="primary"
                className="w-full"
                onClick={handleDownloadPNG}
              >
                Download PNG
              </Button>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8 bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-blue-primary">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 What's Next?</h3>

          <ul className="space-y-2 text-gray-700 mb-4">
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span>Share your collage with your mentor</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span>Discuss what your collage reveals about you</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span>Identify interests to explore further</span>
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span>
              <span>Get ready for Session 2: Career Exploration</span>
            </li>
          </ul>

          <div className="bg-white rounded-lg p-4 border-2 border-cyan-light">
            <p className="font-semibold text-gray-900 mb-2">Coming Up in Session 2:</p>
            <p className="text-sm text-gray-700">
              Explore careers that match your interests! We'll connect your identity collage
              to real career clusters and help you discover exciting pathways.
            </p>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => router.push('/collage/builder')}
          >
            🔄 Keep Editing
          </Button>

          <Button
            variant="primary"
            className="flex-1"
            onClick={() => router.push('/')}
          >
            🏠 Go to Home
          </Button>

          <Button
            variant="success"
            className="flex-1"
            onClick={() => alert('Session 2 coming soon!')}
          >
            Next: Session 2 →
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">⏳</div>
        <div className="text-xl font-semibold text-gray-900">Loading your collage...</div>
      </div>
    </div>}>
      <ReviewContent />
    </Suspense>
  );
}
