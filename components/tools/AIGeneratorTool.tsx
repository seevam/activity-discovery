'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface AIGeneratorToolProps {
  onImageGenerated: (url: string) => void;
  onClose: () => void;
  creditsRemaining: number;
}

export function AIGeneratorTool({
  onImageGenerated,
  onClose,
  creditsRemaining,
}: AIGeneratorToolProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<'icon' | 'illustration' | 'abstract' | 'realistic'>(
    'illustration'
  );
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || creditsRemaining <= 0) return;

    setGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      const data = await response.json();
      setGeneratedImage(data.url);
    } catch (err: any) {
      setError(err.message || 'Failed to generate image. Please try again.');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleAddToCanvas = () => {
    if (generatedImage) {
      onImageGenerated(generatedImage);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">🎨 AI Image Generator</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              💡 Credits remaining: <strong>{creditsRemaining}/10</strong>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Prompt Input */}
          <div>
            <label htmlFor="ai-prompt" className="block text-sm font-semibold text-gray-700 mb-2">
              Describe what you want to create:
            </label>
            <Input
              id="ai-prompt"
              name="ai-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'A colorful heart with wings, simple icon style'"
              className="w-full"
              disabled={generating}
            />
          </div>

          {/* Style Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Style:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(['icon', 'illustration', 'abstract', 'realistic'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  disabled={generating}
                  className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                    style === s
                      ? 'border-blue-primary bg-blue-50 text-blue-primary'
                      : 'border-gray-300 hover:border-blue-primary'
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating || creditsRemaining <= 0}
            className="w-full"
            variant="primary"
          >
            {generating ? '✨ Generating... (this may take 10-15 seconds)' : '✨ Generate Image'}
          </Button>

          {creditsRemaining <= 0 && (
            <p className="text-red-600 text-sm text-center">
              No credits remaining. You've used all 10 AI generations for this activity.
            </p>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Generated Image */}
          {generatedImage && (
            <div className="space-y-4">
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                <img
                  src={generatedImage}
                  alt="Generated image"
                  className="w-full h-auto"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleAddToCanvas}
                  variant="success"
                  className="flex-1"
                >
                  ✅ Add to Canvas
                </Button>
                <Button
                  onClick={handleGenerate}
                  variant="secondary"
                  disabled={creditsRemaining <= 0}
                >
                  🔄 Regenerate
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-600 text-center">
            💡 Each generation uses 1 credit. Choose your style carefully!
          </p>
        </div>
      </div>
    </div>
  );
}
