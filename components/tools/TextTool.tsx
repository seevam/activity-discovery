'use client';

import { useState } from 'react';
import { Input, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { QuoteSuggestions } from './QuoteSuggestions';
import { QuoteSuggestion } from '@/types/collage';

const CANVAS_FONTS = [
  { name: 'Handwriting Script', family: 'Pacifico' },
  { name: 'Bold Modern', family: 'Montserrat', weight: 700 },
  { name: 'Clean Sans-Serif', family: 'Open Sans' },
  { name: 'Playful Rounded', family: 'Fredoka One' },
  { name: 'Elegant Serif', family: 'Playfair Display' },
  { name: 'Casual Handwritten', family: 'Caveat', weight: 600 },
  { name: 'Modern Sans', family: 'Poppins', weight: 600 },
];

interface TextToolProps {
  onAddText: (text: string, options: any) => void;
  onClose: () => void;
  collageId?: string;
  currentChallenge?: number;
}

export function TextTool({ onAddText, onClose, collageId, currentChallenge }: TextToolProps) {
  const [showQuoteSuggestions, setShowQuoteSuggestions] = useState(
    currentChallenge === 3 && collageId
  );
  const [text, setText] = useState('');
  const [fontFamily, setFontFamily] = useState('Nunito');
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState('#006BFF');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [shadow, setShadow] = useState(false);

  const handleSelectQuote = (quote: QuoteSuggestion) => {
    // Pre-fill the text with the selected quote
    setText(`"${quote.text}"\n— ${quote.author}`);
    // Switch to manual editing mode
    setShowQuoteSuggestions(false);
  };

  const handleAddText = () => {
    if (!text.trim()) return;

    const options: any = {
      fontFamily,
      fontSize,
      fill: color,
    };

    if (bold) {
      options.fontWeight = 'bold';
    }

    if (italic) {
      options.fontStyle = 'italic';
    }

    if (shadow) {
      options.shadow = {
        color: 'rgba(0,0,0,0.3)',
        blur: 5,
        offsetX: 2,
        offsetY: 2,
      };
    }

    onAddText(text, options);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentChallenge === 3 && showQuoteSuggestions ? '💬 Choose Your Quote' : '✏️ Add Text'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Show Quote Suggestions for Challenge 3 */}
          {currentChallenge === 3 && showQuoteSuggestions && collageId ? (
            <QuoteSuggestions
              collageId={collageId}
              onSelectQuote={handleSelectQuote}
              onSkip={() => setShowQuoteSuggestions(false)}
            />
          ) : (
            <>
          {/* Text Input */}
          <div>
            <label htmlFor="text-content" className="block text-sm font-semibold text-gray-700 mb-2">
              Enter your text:
            </label>
            <TextArea
              id="text-content"
              name="text-content"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your text here..."
              rows={3}
            />
          </div>

          {/* Font Selector */}
          <div>
            <label htmlFor="text-font" className="block text-sm font-semibold text-gray-700 mb-2">
              Font:
            </label>
            <select
              id="text-font"
              name="text-font"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="input-field w-full"
            >
              {CANVAS_FONTS.map((font) => (
                <option key={font.family} value={font.family}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          {/* Size Slider */}
          <div>
            <label htmlFor="text-size" className="block text-sm font-semibold text-gray-700 mb-2">
              Size: {fontSize}pt
            </label>
            <input
              id="text-size"
              name="text-size"
              type="range"
              min="12"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Color Picker */}
          <div>
            <label htmlFor="text-color-picker" className="block text-sm font-semibold text-gray-700 mb-2">
              Color:
            </label>
            <div className="flex items-center gap-2">
              <input
                id="text-color-picker"
                name="text-color-picker"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 rounded border-2 border-gray-300 cursor-pointer"
              />
              <Input
                id="text-color-input"
                name="text-color-input"
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1"
                aria-label="Color hex value"
              />
            </div>
          </div>

          {/* Effects */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Effects:
            </label>
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg cursor-pointer hover:border-blue-primary">
                <input
                  id="text-bold"
                  name="text-bold"
                  type="checkbox"
                  checked={bold}
                  onChange={(e) => setBold(e.target.checked)}
                  className="rounded"
                />
                <span className="font-semibold">Bold</span>
              </label>

              <label className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg cursor-pointer hover:border-blue-primary">
                <input
                  id="text-italic"
                  name="text-italic"
                  type="checkbox"
                  checked={italic}
                  onChange={(e) => setItalic(e.target.checked)}
                  className="rounded"
                />
                <span className="italic">Italic</span>
              </label>

              <label className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg cursor-pointer hover:border-blue-primary">
                <input
                  id="text-shadow"
                  name="text-shadow"
                  type="checkbox"
                  checked={shadow}
                  onChange={(e) => setShadow(e.target.checked)}
                  className="rounded"
                />
                <span>Shadow</span>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Preview:
            </label>
            <div className="border-2 border-gray-300 rounded-lg p-8 bg-gray-50 min-h-[120px] flex items-center justify-center">
              {text ? (
                <div
                  style={{
                    fontFamily,
                    fontSize: `${fontSize}px`,
                    color,
                    fontWeight: bold ? 'bold' : 'normal',
                    fontStyle: italic ? 'italic' : 'normal',
                    textShadow: shadow ? '2px 2px 5px rgba(0,0,0,0.3)' : 'none',
                  }}
                >
                  {text}
                </div>
              ) : (
                <div className="text-gray-400">Your text will appear here</div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleAddText}
              disabled={!text.trim()}
              variant="primary"
              className="flex-1"
            >
              Add to Canvas
            </Button>
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
