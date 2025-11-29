'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AboutMeSuggestion } from '@/types/collage';

function AboutMeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const collageId = searchParams.get('id');

  const [aboutMe, setAboutMe] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AboutMeSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);

  const wordCount = aboutMe.trim().split(/\s+/).filter(Boolean).length;
  const progress = Math.min((wordCount / 100) * 100, 100);

  useEffect(() => {
    if (!collageId) {
      router.push('/collage/session1-input');
    }
  }, [collageId, router]);

  const handleGenerateSuggestions = async () => {
    if (!collageId) return;

    setLoading(true);

    try {
      const response = await fetch('/api/about-me/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collageId }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      alert('Failed to generate suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseSuggestion = (suggestion: AboutMeSuggestion) => {
    setAboutMe(suggestion.text);
    setShowSuggestions(false);
  };

  const handleContinue = async () => {
    if (!collageId || aboutMe.trim().length < 50) {
      alert('Please write at least 50 characters for your About Me statement.');
      return;
    }

    setSaving(true);

    try {
      // Save About Me to database
      const response = await fetch(`/api/collages/${collageId}/about-me`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aboutMe }),
      });

      if (response.ok) {
        // Navigate to review/download page
        router.push(`/collage/review?id=${collageId}`);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Failed to save About Me:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <ProgressBar value={90} showLabel label="90%" />
        </div>

        {/* Header */}
        <Card className="mb-8 text-center">
          <div className="text-5xl mb-4">✍️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Final Challenge: Tell Your Story
          </h1>
          <p className="text-gray-600">
            Your collage is almost complete! Now add the words that bring it all together.
          </p>
        </Card>

        {/* Instructions */}
        <Card className="mb-8 bg-blue-50 border-2 border-blue-primary">
          <h3 className="font-bold text-gray-900 mb-3">
            Write a short "About Me" statement (50-100 words):
          </h3>
          <p className="text-gray-700 mb-2">This should answer:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
            <li>Who are you?</li>
            <li>What do you love?</li>
            <li>What makes you unique?</li>
            <li>Where do you want to go?</li>
          </ul>

          {!showSuggestions && (
            <Button
              variant="secondary"
              onClick={handleGenerateSuggestions}
              disabled={loading}
              className="w-full"
            >
              {loading ? '✨ Generating...' : '✨ Get AI Writing Suggestions'}
            </Button>
          )}
        </Card>

        {/* AI Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <Card className="mb-8">
            <h3 className="font-bold text-gray-900 mb-4">
              ✨ AI Writing Suggestions
            </h3>
            <p className="text-gray-600 mb-4">
              Based on your collage, here are 3 "About Me" starters. Pick one to use or edit!
            </p>

            <div className="space-y-4">
              {suggestions.map((suggestion, idx) => (
                <div
                  key={idx}
                  className="border-2 border-gray-300 rounded-xl p-4 hover:border-blue-primary transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-semibold text-blue-primary">
                      Option {idx + 1}: {suggestion.focus.charAt(0).toUpperCase() + suggestion.focus.slice(1)} Focus
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{suggestion.text}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleUseSuggestion(suggestion)}
                    >
                      Use This
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setAboutMe(suggestion.text);
                        setShowSuggestions(false);
                      }}
                    >
                      Edit This
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="secondary"
              onClick={() => setShowSuggestions(false)}
              className="w-full mt-4"
            >
              ← Write My Own
            </Button>
          </Card>
        )}

        {/* Text Editor */}
        <Card className="mb-8">
          <h3 className="font-bold text-gray-900 mb-4">Your About Me:</h3>

          <TextArea
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
            placeholder="Start typing here..."
            rows={8}
            className="w-full mb-4"
          />

          {/* Word Count */}
          <div className="flex items-center justify-between text-sm mb-4">
            <span className="text-gray-600">Word count: {wordCount}/100</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    wordCount >= 50 ? 'bg-green-success' : 'bg-blue-primary'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={wordCount >= 50 ? 'text-green-success font-semibold' : 'text-gray-600'}>
                {wordCount >= 50 ? '✓' : `${Math.max(50 - wordCount, 0)} more`}
              </span>
            </div>
          </div>

          {aboutMe && (
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Preview:</h4>
              <p className="text-gray-800">{aboutMe}</p>
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex justify-between">
          <Button
            variant="secondary"
            onClick={() => router.push(`/collage/builder`)}
          >
            ← Back to Builder
          </Button>

          <Button
            variant="success"
            onClick={handleContinue}
            disabled={wordCount < 50 || saving}
          >
            {saving ? 'Saving...' : "I'm Done! →"}
          </Button>
        </div>

        {wordCount < 50 && (
          <p className="text-center text-gray-600 text-sm mt-4">
            💡 Write at least 50 characters to continue
          </p>
        )}
      </div>
    </div>
  );
}

export default function AboutMePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <AboutMeContent />
    </Suspense>
  );
}
