'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

// Preset backgrounds
const SOLID_COLORS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Light Blue', value: '#E3F2FD' },
  { name: 'Light Purple', value: '#F3E5F5' },
  { name: 'Light Green', value: '#E8F5E9' },
  { name: 'Light Orange', value: '#FFF3E0' },
  { name: 'Light Yellow', value: '#FFFDE7' },
  { name: 'Light Pink', value: '#FCE4EC' },
  { name: 'Light Gray', value: '#F5F5F5' },
  { name: 'Cream', value: '#FFF8E1' },
  { name: 'Mint', value: '#E0F2F1' }
];

const GRADIENTS = [
  { name: 'Ocean Breeze', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Sunset Glow', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Forest Fresh', value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Warm Sunrise', value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: 'Cool Twilight', value: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' }
];

const CANVAS_SIZES = [
  { name: 'Standard', width: 800, height: 600, description: 'Perfect balance' },
  { name: 'Wide', width: 1000, height: 600, description: 'Great for landscapes' },
  { name: 'Portrait', width: 600, height: 800, description: 'Vertical layout' }
];

const MOODS = [
  {
    name: 'Energetic',
    emoji: '⚡',
    description: 'Bright & vibrant colors',
    background: 'linear-gradient(135deg, #FF6B6B, #FFD93D)',
    color: '#FFFFFF'
  },
  {
    name: 'Calm',
    emoji: '🌊',
    description: 'Soft pastel tones',
    background: 'linear-gradient(135deg, #A8E6CF, #DCEDC1)',
    color: '#333333'
  },
  {
    name: 'Professional',
    emoji: '💼',
    description: 'Clean neutral palette',
    background: 'linear-gradient(135deg, #E0E0E0, #BDBDBD)',
    color: '#333333'
  },
  {
    name: 'Creative',
    emoji: '🎨',
    description: 'Rainbow spectrum',
    background: 'linear-gradient(135deg, #FF6B6B, #FFD93D, #4ECDC4, #9B59B6)',
    color: '#FFFFFF'
  }
];

const TOOLS = [
  {
    icon: '🔍',
    name: 'Image Search',
    description: 'Find 1M+ free images from Unsplash',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    icon: '🎨',
    name: 'AI Generate',
    description: 'Create custom images with AI',
    color: 'bg-purple-50 border-purple-200'
  },
  {
    icon: '📤',
    name: 'Upload',
    description: 'Add your own photos',
    color: 'bg-green-50 border-green-200'
  },
  {
    icon: '✏️',
    name: 'Text Tool',
    description: 'Style quotes with cool fonts',
    color: 'bg-orange-50 border-orange-200'
  },
  {
    icon: '✨',
    name: 'Stickers',
    description: 'Unlock 100+ stickers by earning badges',
    color: 'bg-pink-50 border-pink-200'
  }
];

const QUICK_TIPS = [
  'You can resize, rotate, and move anything on the canvas',
  'Save happens automatically every 30 seconds',
  'Earn badges to unlock more stickers and features',
  'Double-click text to edit it quickly'
];

export default function TemplateSelectionPage() {
  const router = useRouter();

  // Canvas customization state
  const [backgroundType, setBackgroundType] = useState<'solid' | 'gradient' | 'custom'>('solid');
  const [selectedBackground, setSelectedBackground] = useState(SOLID_COLORS[0].value);
  const [customColor, setCustomColor] = useState('#FFFFFF');
  const [canvasSize, setCanvasSize] = useState(CANVAS_SIZES[0]);
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);
  const [showTutorial, setShowTutorial] = useState(false);

  const handleContinue = () => {
    // Save canvas preferences to localStorage
    const canvasConfig = {
      background: backgroundType === 'custom' ? customColor : selectedBackground,
      width: canvasSize.width,
      height: canvasSize.height,
      mood: selectedMood.name
    };

    localStorage.setItem('canvasConfig', JSON.stringify(canvasConfig));
    router.push('/collage/builder');
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
            🎨 Canvas Customization Hub
          </h1>
          <p className="text-gray-600">
            Personalize your canvas setup before starting your creative journey!
          </p>
        </Card>

        {/* Background Selection */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🌈</span>
            <span>Background Selection</span>
          </h2>

          {/* Background Type Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setBackgroundType('solid');
                setSelectedBackground(SOLID_COLORS[0].value);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                backgroundType === 'solid'
                  ? 'bg-blue-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Solid Colors
            </button>
            <button
              onClick={() => {
                setBackgroundType('gradient');
                setSelectedBackground(GRADIENTS[0].value);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                backgroundType === 'gradient'
                  ? 'bg-blue-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Gradients
            </button>
            <button
              onClick={() => {
                setBackgroundType('custom');
                setSelectedBackground(customColor);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                backgroundType === 'custom'
                  ? 'bg-blue-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Custom Color
            </button>
          </div>

          {/* Solid Colors Grid */}
          {backgroundType === 'solid' && (
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
              {SOLID_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedBackground(color.value)}
                  className={`aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                    selectedBackground === color.value
                      ? 'ring-4 ring-blue-primary border-blue-primary'
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          )}

          {/* Gradients Grid */}
          {backgroundType === 'gradient' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {GRADIENTS.map((gradient) => (
                <button
                  key={gradient.name}
                  onClick={() => setSelectedBackground(gradient.value)}
                  className={`h-24 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedBackground === gradient.value
                      ? 'ring-4 ring-blue-primary border-blue-primary'
                      : 'border-gray-300'
                  }`}
                  style={{ background: gradient.value }}
                  title={gradient.name}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                      {gradient.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Custom Color Picker */}
          {backgroundType === 'custom' && (
            <div className="flex flex-col items-center gap-4">
              <input
                type="color"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value);
                  setSelectedBackground(e.target.value);
                }}
                className="w-32 h-32 rounded-lg border-2 border-gray-300 cursor-pointer"
              />
              <div className="text-center">
                <p className="text-sm text-gray-600">Selected Color:</p>
                <p className="font-mono font-bold text-gray-900">{customColor}</p>
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <div
              className="h-32 rounded-lg border-2 border-gray-300"
              style={{
                background: selectedBackground
              }}
            />
          </div>
        </Card>

        {/* Canvas Size Preference */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📐</span>
            <span>Canvas Size Preference</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CANVAS_SIZES.map((size) => (
              <button
                key={size.name}
                onClick={() => setCanvasSize(size)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  canvasSize.name === size.name
                    ? 'border-blue-primary bg-blue-50 ring-4 ring-blue-100'
                    : 'border-gray-300 hover:border-blue-primary hover:bg-gray-50'
                }`}
              >
                <div className="text-center mb-3">
                  <div
                    className="mx-auto border-2 border-gray-400 bg-white"
                    style={{
                      width: `${(size.width / 10)}px`,
                      height: `${(size.height / 10)}px`
                    }}
                  />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{size.name}</h3>
                <p className="text-sm text-gray-600">{size.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {size.width} × {size.height}px
                </p>
              </button>
            ))}
          </div>
        </Card>

        {/* Mood/Vibe Selection */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>✨</span>
            <span>Choose Your Vibe</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {MOODS.map((mood) => (
              <button
                key={mood.name}
                onClick={() => setSelectedMood(mood)}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedMood.name === mood.name
                    ? 'border-blue-primary ring-4 ring-blue-100'
                    : 'border-gray-300 hover:border-blue-primary'
                }`}
                style={{
                  background: mood.background
                }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">{mood.emoji}</div>
                  <h3 className="font-bold mb-1" style={{ color: mood.color }}>
                    {mood.name}
                  </h3>
                  <p className="text-sm" style={{ color: mood.color, opacity: 0.9 }}>
                    {mood.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Interactive Tutorial Section */}
        <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>🎓</span>
              <span>Quick Tutorial</span>
            </h2>
            <button
              onClick={() => setShowTutorial(!showTutorial)}
              className="text-blue-primary hover:underline font-medium"
            >
              {showTutorial ? 'Hide' : 'Show'} Tutorial
            </button>
          </div>

          {showTutorial && (
            <>
              {/* Tool Preview Cards */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">🛠️ Your Creative Tools</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {TOOLS.map((tool) => (
                    <div
                      key={tool.name}
                      className={`p-4 rounded-lg border-2 ${tool.color}`}
                    >
                      <div className="text-3xl mb-2">{tool.icon}</div>
                      <h4 className="font-bold text-gray-900 mb-1">{tool.name}</h4>
                      <p className="text-sm text-gray-600">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3">💡 Pro Tips</h3>
                <ul className="space-y-2">
                  {QUICK_TIPS.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-success text-lg">✓</span>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Demo Placeholder */}
              <div className="mt-4 bg-white rounded-lg p-6 border-2 border-gray-200 text-center">
                <div className="text-4xl mb-2">🎬</div>
                <p className="text-gray-600">
                  Video demos coming soon! For now, jump in and explore the tools yourself.
                </p>
              </div>
            </>
          )}

          {!showTutorial && (
            <p className="text-gray-600 text-center">
              Click "Show Tutorial" to see a quick overview of the canvas tools! (60 seconds)
            </p>
          )}
        </Card>

        {/* Summary Card */}
        <Card className="mb-8 bg-blue-50 border-2 border-blue-primary">
          <h3 className="font-bold text-gray-900 mb-3">📋 Your Canvas Setup</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Background:</p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-6 h-6 rounded border-2 border-gray-300"
                  style={{ background: selectedBackground }}
                />
                <p className="font-medium text-gray-900">
                  {backgroundType === 'solid'
                    ? SOLID_COLORS.find((c) => c.value === selectedBackground)?.name || 'Custom'
                    : backgroundType === 'gradient'
                    ? GRADIENTS.find((g) => g.value === selectedBackground)?.name || 'Custom'
                    : 'Custom'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-gray-600">Canvas Size:</p>
              <p className="font-medium text-gray-900 mt-1">
                {canvasSize.name} ({canvasSize.width} × {canvasSize.height})
              </p>
            </div>
            <div>
              <p className="text-gray-600">Vibe:</p>
              <p className="font-medium text-gray-900 mt-1">
                {selectedMood.emoji} {selectedMood.name}
              </p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Button variant="secondary" onClick={() => router.push('/collage/session1-input')}>
            ← Back
          </Button>
          <Button variant="primary" onClick={handleContinue} className="px-8">
            Start Creating! 🎨 →
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center text-gray-600 text-sm mt-6">
          💡 Don't worry! You can change these settings anytime while creating your collage.
        </div>
      </div>
    </div>
  );
}
