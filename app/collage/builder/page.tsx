'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { useCanvas } from '@/hooks/useCanvas';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useChallenges } from '@/hooks/useChallenges';

// Dynamically import canvas components with SSR disabled
const FabricCanvas = dynamic(() => import('@/components/canvas/FabricCanvas'), { ssr: false });
const ToolPanel = dynamic(() => import('@/components/canvas/ToolPanel').then(mod => ({ default: mod.ToolPanel })), { ssr: false });
const ChallengePanel = dynamic(() => import('@/components/canvas/ChallengePanel').then(mod => ({ default: mod.ChallengePanel })), { ssr: false });
const BadgeSidebar = dynamic(() => import('@/components/canvas/BadgeSidebar').then(mod => ({ default: mod.BadgeSidebar })), { ssr: false });

// Dynamically import confetti to avoid SSR issues
const confetti = typeof window !== 'undefined' ? require('canvas-confetti') : null;

export default function BuilderPage() {
  const router = useRouter();
  const { canvasRef, selectedTool, setSelectedTool, addImage, addText, addSticker, getElementsForChallenge, getTotalElements } = useCanvas();

  const [collageId, setCollageId] = useState<string | null>(null);
  const [studentId] = useState('demo-student-123'); // TODO: Get from auth
  const [aiCreditsUsed, setAiCreditsUsed] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [templateData, setTemplateData] = useState<any>(null);

  const {
    challenges,
    currentChallenge,
    setCurrentChallenge,
    completedChallenges,
    unlockedBadges,
    checkChallengeCompletion,
    updateChallengeProgress,
    markChallengeComplete,
    nextChallenge,
  } = useChallenges(getElementsForChallenge);

  const { lastSaved, saving, saveNow } = useAutoSave(canvasRef, collageId);

  // Load template data on mount
  useEffect(() => {
    const template = localStorage.getItem('selectedTemplate');
    if (template) {
      try {
        setTemplateData(JSON.parse(template));
      } catch (error) {
        console.error('Failed to parse template:', error);
      }
    }
  }, []);

  // Initialize collage
  useEffect(() => {
    const initCollage = async () => {
      const session1Input = localStorage.getItem('session1Input');
      const template = localStorage.getItem('selectedTemplate');

      console.log('Initializing collage...', { session1Input, template });

      if (!session1Input || !template) {
        console.log('Missing session1Input or template, redirecting...');
        router.push('/collage/session1-input');
        return;
      }

      try {
        // Create collage via API
        console.log('Creating collage via API...');
        const response = await fetch('/api/collages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId,
            session1Input: JSON.parse(session1Input),
            templateType: JSON.parse(template).id,
          }),
        });

        console.log('API Response:', response.status, response.statusText);

        if (response.ok) {
          const collage = await response.json();
          console.log('Collage created:', collage);
          setCollageId(collage.id);
        } else {
          const errorData = await response.json();
          console.error('Failed to create collage:', response.status, errorData);
          alert(`Failed to create collage: ${errorData.error || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Failed to create collage:', error);
        alert(`Error creating collage: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    initCollage();
  }, [router, studentId]);

  // Apply template background to canvas
  useEffect(() => {
    // Wait for both template and canvas to be ready
    if (!templateData) {
      console.log('Template data not loaded yet');
      return;
    }

    console.log('Applying template background:', templateData);

    // Wait for canvas to be fully initialized
    const applyBackground = () => {
      if (!canvasRef.current?.canvas) {
        // Canvas not ready yet, try again in 50ms
        console.log('Canvas not ready, retrying...');
        setTimeout(applyBackground, 50);
        return;
      }

      console.log('Canvas ready, applying background...');

      try {
        // Apply background based on template type
        if (templateData.id === 'prefilled') {
          // Apply gradient for prefilled template
          console.log('Applying gradient background');
          canvasRef.current.setBackgroundGradient('#BCF2F6', '#FFF100');
        } else if (templateData.backgroundColor) {
          // Apply solid color for other templates
          console.log('Applying solid background:', templateData.backgroundColor);
          canvasRef.current.setBackgroundColor(templateData.backgroundColor);
        }
        console.log('Background applied successfully');
      } catch (error) {
        console.error('Failed to apply template background:', error);
      }
    };

    // Start trying to apply background
    applyBackground();
  }, [templateData, collageId]); // Trigger when template loads AND when collage is created

  // Update challenge progress when canvas changes
  useEffect(() => {
    updateChallengeProgress();
  }, [getTotalElements()]);

  // Check challenge completion
  const handleCheckCompletion = async () => {
    if (!collageId) return;

    const newlyCompleted = checkChallengeCompletion(currentChallenge);

    if (newlyCompleted) {
      const badge = await markChallengeComplete(currentChallenge, collageId);

      if (badge) {
        // Show celebration
        triggerCelebration();

        // Show badge unlock notification
        setTimeout(() => {
          alert(`🎉 Badge Unlocked: ${badge.name}!\n\n${badge.stickersUnlocked.length} new stickers added!`);
        }, 1000);
      }

      // Move to next challenge
      setTimeout(() => {
        nextChallenge();
      }, 2000);
    }
  };

  const triggerCelebration = () => {
    if (confetti) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const handleFinish = async () => {
    if (!collageId) return;

    // Save one last time
    await saveNow();

    // Navigate to About Me page
    router.push(`/collage/about-me?id=${collageId}`);
  };

  const progress = (completedChallenges.length / 5) * 100;
  const currentChallengeData = challenges.find((c) => c.id === currentChallenge);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex-1">
            <ProgressBar value={progress} showLabel label={`${Math.round(progress)}%`} />
          </div>
          <div className="text-sm text-gray-600">
            {saving ? (
              <span className="text-blue-primary">💾 Saving...</span>
            ) : lastSaved ? (
              <span>✓ Saved {new Date(lastSaved).toLocaleTimeString()}</span>
            ) : (
              <span>Not saved yet</span>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push('/')}
          >
            Exit
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Challenges */}
        <div className="w-64 bg-white border-r overflow-y-auto flex-shrink-0">
          <ChallengePanel
            challenges={challenges}
            currentChallenge={currentChallenge}
            completedChallenges={completedChallenges}
            onSelectChallenge={setCurrentChallenge}
          />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Challenge Header */}
            <div className="mb-6 bg-white rounded-2xl p-6 shadow-md">
              <div className="flex items-start gap-4">
                <div className="text-5xl">{currentChallengeData?.emoji}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Challenge {currentChallenge}: {currentChallengeData?.title}
                  </h2>
                  <p className="text-gray-700 mb-3">{currentChallengeData?.description}</p>

                  <div className="bg-blue-50 border-l-4 border-blue-primary p-3 rounded mb-3">
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      📋 Your Task:
                    </p>
                    <p className="text-sm text-gray-700">{currentChallengeData?.requirement}</p>
                  </div>

                  {currentChallengeData && currentChallengeData.ideas.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-1">💡 Ideas:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {currentChallengeData.ideas.map((idea, idx) => (
                          <li key={idx}>• {idea}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Progress */}
                  {currentChallengeData && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Progress:</span>
                        <span className="font-semibold">
                          {currentChallengeData.elementsAdded}/{currentChallengeData.requiredElements} elements
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-success h-3 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              (currentChallengeData.elementsAdded / currentChallengeData.requiredElements) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      {currentChallengeData.elementsAdded >= currentChallengeData.requiredElements && (
                        <Button
                          variant="success"
                          className="w-full mt-3"
                          onClick={handleCheckCompletion}
                        >
                          ✓ Mark Challenge Complete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="mb-6">
              <FabricCanvas
                ref={canvasRef}
                width={800}
                height={600}
                onObjectAdded={updateChallengeProgress}
                onObjectRemoved={updateChallengeProgress}
                onObjectModified={updateChallengeProgress}
              />
            </div>

            {/* Canvas Controls */}
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => canvasRef.current?.undo()}
                >
                  ↶ Undo
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => canvasRef.current?.redo()}
                >
                  ↷ Redo
                </Button>
                <div className="border-l border-gray-300 mx-2" />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => canvasRef.current?.bringToFront()}
                >
                  ↑ Bring to Front
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => canvasRef.current?.sendToBack()}
                >
                  ↓ Send to Back
                </Button>
                <div className="border-l border-gray-300 mx-2" />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => canvasRef.current?.deleteSelected()}
                >
                  🗑️ Delete
                </Button>
              </div>
            </div>

            {/* Finish Button */}
            {completedChallenges.length === 5 && (
              <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-success rounded-2xl p-6 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  🎉 All Challenges Complete!
                </h3>
                <p className="text-gray-700 mb-4">
                  Amazing work! Now let's add your "About Me" statement to complete your collage.
                </p>
                <Button variant="success" size="lg" onClick={handleFinish}>
                  Continue to About Me →
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Tools & Badges */}
        <div className="w-80 bg-white border-l overflow-y-auto flex-shrink-0">
          <ToolPanel
            selectedTool={selectedTool}
            onSelectTool={setSelectedTool}
            onAddImage={addImage}
            onAddText={addText}
            onAddSticker={addSticker}
            currentChallenge={currentChallenge}
            unlockedBadges={unlockedBadges}
            aiCreditsRemaining={10 - aiCreditsUsed}
          />

          <BadgeSidebar unlockedBadges={unlockedBadges} />
        </div>
      </div>

      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="text-8xl animate-bounce">🎉</div>
        </div>
      )}
    </div>
  );
}
