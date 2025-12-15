'use client';

import { useState } from 'react';
import { ImageSearchTool } from '../tools/ImageSearchTool';
import { AIGeneratorTool } from '../tools/AIGeneratorTool';
import { UploadTool } from '../tools/UploadTool';
import { TextTool } from '../tools/TextTool';
import { getUnlockedStickers } from '@/lib/constants/badges';

interface ToolPanelProps {
  selectedTool: string;
  onSelectTool: (tool: string) => void;
  onAddImage: (url: string, challengeId?: number) => void;
  onAddText: (text: string, options?: any, challengeId?: number) => void;
  onAddSticker: (emoji: string, challengeId?: number) => void;
  currentChallenge: number;
  unlockedBadges: string[];
  aiCreditsRemaining: number;
  collageId?: string;
}

export function ToolPanel({
  selectedTool,
  onSelectTool,
  onAddImage,
  onAddText,
  onAddSticker,
  currentChallenge,
  unlockedBadges,
  aiCreditsRemaining,
  collageId,
}: ToolPanelProps) {
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showTextTool, setShowTextTool] = useState(false);

  const tools = [
    { id: 'search', name: 'Search Images', icon: '🔍', action: () => setShowImageSearch(true) },
    { id: 'ai', name: 'AI Generate', icon: '🎨', action: () => setShowAIGenerator(true) },
    { id: 'upload', name: 'Upload Photo', icon: '📤', action: () => setShowUpload(true) },
    { id: 'text', name: 'Add Text', icon: '✏️', action: () => setShowTextTool(true) },
  ];

  const unlockedStickers = getUnlockedStickers(unlockedBadges);

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-bold text-gray-900">🛠️ Tools</h3>

      {/* Tool Buttons */}
      <div className="grid grid-cols-2 gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={tool.action}
            className={`p-4 rounded-xl border-2 font-semibold transition-all hover:shadow-lg ${
              selectedTool === tool.id
                ? 'border-blue-primary bg-blue-50 text-blue-primary'
                : 'border-gray-300 hover:border-blue-primary'
            }`}
          >
            <div className="text-2xl mb-1">{tool.icon}</div>
            <div className="text-sm">{tool.name}</div>
          </button>
        ))}
      </div>

      {/* Stickers */}
      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-2">
          ✨ Stickers ({unlockedStickers.length})
        </h4>
        <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-50 rounded-lg">
          {unlockedStickers.map((sticker, idx) => (
            <button
              key={idx}
              onClick={() => onAddSticker(sticker, currentChallenge)}
              className="text-2xl hover:scale-125 transition-transform p-2 rounded hover:bg-white"
              title="Click to add sticker"
            >
              {sticker}
            </button>
          ))}
        </div>
        {unlockedStickers.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-4">
            Complete challenges to unlock stickers!
          </p>
        )}
      </div>

      {/* Modals */}
      {showImageSearch && (
        <ImageSearchTool
          onSelectImage={(url) => {
            onAddImage(url, currentChallenge);
            setShowImageSearch(false);
          }}
          onClose={() => setShowImageSearch(false)}
        />
      )}

      {showAIGenerator && (
        <AIGeneratorTool
          onImageGenerated={(url) => {
            onAddImage(url, currentChallenge);
            setShowAIGenerator(false);
          }}
          onClose={() => setShowAIGenerator(false)}
          creditsRemaining={aiCreditsRemaining}
        />
      )}

      {showUpload && (
        <UploadTool
          onImageUploaded={(url) => {
            onAddImage(url, currentChallenge);
            setShowUpload(false);
          }}
          onClose={() => setShowUpload(false)}
        />
      )}

      {showTextTool && (
        <TextTool
          onAddText={(text, options) => {
            onAddText(text, options, currentChallenge);
            setShowTextTool(false);
          }}
          onClose={() => setShowTextTool(false)}
          collageId={collageId}
          currentChallenge={currentChallenge}
        />
      )}
    </div>
  );
}
