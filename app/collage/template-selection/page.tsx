'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TEMPLATES } from '@/lib/constants/templates';
import { CollageTemplate } from '@/types/collage';

export default function TemplateSelectionPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<CollageTemplate | null>(null);

  const handleSelectTemplate = (template: CollageTemplate) => {
    setSelectedTemplate(template);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      localStorage.setItem('selectedTemplate', JSON.stringify(selectedTemplate));
      router.push('/collage/builder');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <ProgressBar value={10} showLabel label="10%" />
        </div>

        {/* Header */}
        <Card className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎨 Choose Your Canvas Style
          </h1>
          <p className="text-gray-600">
            Pick a template to guide you, or start with a blank canvas for complete freedom!
          </p>
        </Card>

        {/* Template Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all ${
                selectedTemplate?.id === template.id
                  ? 'ring-4 ring-blue-primary shadow-xl'
                  : 'hover:shadow-xl'
              }`}
              onClick={() => handleSelectTemplate(template)}
            >
              {/* Template Preview */}
              <div
                className="w-full h-48 rounded-xl mb-4 flex items-center justify-center"
                style={{
                  backgroundColor: template.backgroundColor || '#FFFFFF',
                  backgroundImage:
                    template.id === 'prefilled'
                      ? 'linear-gradient(135deg, #BCF2F6, #FFF100)'
                      : undefined,
                }}
              >
                {/* Simple visual representation */}
                {template.type === 'grid' && (
                  <div className="grid grid-cols-3 gap-2 p-4">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 bg-white border-2 border-gray-300 rounded"
                      />
                    ))}
                  </div>
                )}
                {template.type === 'circular' && (
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-white border-4 border-gray-300" />
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-8 h-8 rounded-full bg-blue-primary"
                        style={{
                          top: `${50 + 50 * Math.sin((i * Math.PI) / 3)}%`,
                          left: `${50 + 50 * Math.cos((i * Math.PI) / 3)}%`,
                        }}
                      />
                    ))}
                  </div>
                )}
                {template.type === 'freeform' && (
                  <div className="relative w-full h-full">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute bg-purple-creative rounded-lg"
                        style={{
                          width: `${20 + Math.random() * 30}px`,
                          height: `${20 + Math.random() * 30}px`,
                          top: `${Math.random() * 70}%`,
                          left: `${Math.random() * 70}%`,
                        }}
                      />
                    ))}
                  </div>
                )}
                {template.type === 'blank' && (
                  <div className="text-gray-400 text-6xl">□</div>
                )}
                {template.type === 'prefilled' && (
                  <div className="text-white text-4xl">✨</div>
                )}
              </div>

              {/* Template Info */}
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {template.name}
              </h3>
              <p className="text-sm text-gray-600">{template.description}</p>

              {template.id === 'prefilled' && (
                <div className="mt-2 inline-block px-3 py-1 bg-yellow-primary text-gray-900 rounded-full text-xs font-bold">
                  ✨ Recommended!
                </div>
              )}

              <Button
                variant={selectedTemplate?.id === template.id ? 'primary' : 'secondary'}
                size="sm"
                className="w-full mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectTemplate(template);
                }}
              >
                {selectedTemplate?.id === template.id ? '✓ Selected' : 'Select'}
              </Button>
            </Card>
          ))}
        </div>

        {/* Selection Info */}
        {selectedTemplate && (
          <Card className="mb-8 bg-blue-50 border-2 border-blue-primary">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900">
                  ✓ You selected: {selectedTemplate.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedTemplate.description}
                </p>
              </div>
              <Button variant="primary" onClick={handleContinue}>
                Let's Create! →
              </Button>
            </div>
          </Card>
        )}

        <div className="text-center text-gray-600 text-sm">
          💡 Templates have helpful guides to get you started! You can always change
          elements later.
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-8">
          <Button
            variant="secondary"
            onClick={() => router.push('/collage/session1-input')}
          >
            ← Back
          </Button>
          {selectedTemplate && (
            <Button variant="primary" onClick={handleContinue}>
              Continue →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
