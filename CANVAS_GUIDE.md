# Canvas Builder Implementation Guide

Complete guide to implementing the Fabric.js canvas builder - the heart of the Identity Collage application.

## Overview

The canvas builder is where students create their collages by:
- Adding images (search, AI generate, upload)
- Adding text with custom fonts
- Drawing freehand
- Manipulating elements (drag, resize, rotate)
- Managing layers (bring to front/back)
- Auto-saving progress

## Architecture

```
app/collage/builder/page.tsx           # Main builder page
├── components/canvas/
│   ├── FabricCanvas.tsx               # Fabric.js canvas component
│   ├── ToolPanel.tsx                  # Tools sidebar
│   ├── ChallengePanel.tsx             # Challenge tracker
│   └── BadgeSidebar.tsx               # Badge display
├── components/tools/
│   ├── ImageSearchTool.tsx            # Unsplash search
│   ├── AIGeneratorTool.tsx            # DALL-E generator
│   ├── UploadTool.tsx                 # File upload
│   ├── TextTool.tsx                   # Text editor
│   └── DrawingTool.tsx                # Drawing pad
└── hooks/
    ├── useCanvas.ts                   # Canvas state management
    ├── useAutoSave.ts                 # Auto-save logic
    └── useChallenges.ts               # Challenge tracking
```

## Step 1: Create Canvas Component

### File: `components/canvas/FabricCanvas.tsx`

```tsx
'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { fabric } from 'fabric';

export interface CanvasRef {
  canvas: fabric.Canvas | null;
  addImage: (url: string) => Promise<void>;
  addText: (text: string, options?: fabric.ITextOptions) => void;
  deleteSelected: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  toJSON: () => object;
  loadFromJSON: (json: object) => Promise<void>;
  exportPNG: () => string;
}

const FabricCanvas = forwardRef<CanvasRef>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndex = useRef(-1);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && !fabricRef.current) {
      fabricRef.current = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#FFFFFF',
      });

      // Set selection style
      fabric.Object.prototype.set({
        transparentCorners: false,
        cornerColor: '#006BFF',
        cornerStyle: 'circle',
        borderColor: '#006BFF',
        borderScaleFactor: 2,
      });

      // Save initial state
      saveState();

      // Listen for changes
      fabricRef.current.on('object:modified', saveState);
      fabricRef.current.on('object:added', saveState);
      fabricRef.current.on('object:removed', saveState);
    }

    return () => {
      fabricRef.current?.dispose();
    };
  }, []);

  // Save state for undo/redo
  const saveState = () => {
    if (!fabricRef.current) return;

    const json = JSON.stringify(fabricRef.current.toJSON(['id', 'challenge', 'tags']));

    // Remove states after current index
    historyRef.current = historyRef.current.slice(0, historyIndex.current + 1);

    // Add new state
    historyRef.current.push(json);
    historyIndex.current++;

    // Limit history to 50 states
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
      historyIndex.current--;
    }
  };

  // Undo
  const undo = () => {
    if (historyIndex.current > 0) {
      historyIndex.current--;
      loadState(historyRef.current[historyIndex.current]);
    }
  };

  // Redo
  const redo = () => {
    if (historyIndex.current < historyRef.current.length - 1) {
      historyIndex.current++;
      loadState(historyRef.current[historyIndex.current]);
    }
  };

  // Load state
  const loadState = (state: string) => {
    if (!fabricRef.current) return;

    fabricRef.current.loadFromJSON(state, () => {
      fabricRef.current?.renderAll();
    });
  };

  // Add image
  const addImage = async (url: string) => {
    return new Promise<void>((resolve, reject) => {
      fabric.Image.fromURL(url, (img) => {
        if (!fabricRef.current) {
          reject(new Error('Canvas not initialized'));
          return;
        }

        // Scale to fit
        const maxWidth = 300;
        const maxHeight = 300;
        const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);

        img.set({
          left: fabricRef.current.width! / 2,
          top: fabricRef.current.height! / 2,
          scaleX: scale,
          scaleY: scale,
          originX: 'center',
          originY: 'center',
        });

        fabricRef.current.add(img);
        fabricRef.current.setActiveObject(img);
        fabricRef.current.renderAll();
        resolve();
      }, {
        crossOrigin: 'anonymous'
      });
    });
  };

  // Add text
  const addText = (text: string, options?: fabric.ITextOptions) => {
    if (!fabricRef.current) return;

    const textObj = new fabric.Text(text, {
      left: fabricRef.current.width! / 2,
      top: fabricRef.current.height! / 2,
      fontFamily: 'Nunito',
      fontSize: 24,
      fill: '#006BFF',
      originX: 'center',
      originY: 'center',
      ...options,
    });

    fabricRef.current.add(textObj);
    fabricRef.current.setActiveObject(textObj);
    fabricRef.current.renderAll();
  };

  // Delete selected
  const deleteSelected = () => {
    if (!fabricRef.current) return;

    const activeObjects = fabricRef.current.getActiveObjects();
    activeObjects.forEach((obj) => {
      fabricRef.current?.remove(obj);
    });
    fabricRef.current.discardActiveObject();
    fabricRef.current.renderAll();
  };

  // Layer management
  const bringToFront = () => {
    const obj = fabricRef.current?.getActiveObject();
    if (obj) {
      fabricRef.current?.bringToFront(obj);
      fabricRef.current?.renderAll();
    }
  };

  const sendToBack = () => {
    const obj = fabricRef.current?.getActiveObject();
    if (obj) {
      fabricRef.current?.sendToBack(obj);
      fabricRef.current?.renderAll();
    }
  };

  // Export
  const toJSON = () => {
    return fabricRef.current?.toJSON(['id', 'challenge', 'tags']) || {};
  };

  const loadFromJSON = async (json: object) => {
    return new Promise<void>((resolve) => {
      fabricRef.current?.loadFromJSON(json, () => {
        fabricRef.current?.renderAll();
        resolve();
      });
    });
  };

  const exportPNG = () => {
    return fabricRef.current?.toDataURL({ format: 'png' }) || '';
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    canvas: fabricRef.current,
    addImage,
    addText,
    deleteSelected,
    bringToFront,
    sendToBack,
    undo,
    redo,
    clear: () => fabricRef.current?.clear(),
    toJSON,
    loadFromJSON,
    exportPNG,
  }));

  return (
    <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
      <canvas ref={canvasRef} />
    </div>
  );
});

FabricCanvas.displayName = 'FabricCanvas';

export default FabricCanvas;
```

## Step 2: Create Canvas Hook

### File: `hooks/useCanvas.ts`

```tsx
import { useRef, useState } from 'react';
import { CanvasRef } from '@/components/canvas/FabricCanvas';

export function useCanvas() {
  const canvasRef = useRef<CanvasRef>(null);
  const [selectedTool, setSelectedTool] = useState<string>('select');

  const addImage = async (url: string, challengeId?: number) => {
    await canvasRef.current?.addImage(url);

    // Tag with challenge
    const canvas = canvasRef.current?.canvas;
    const activeObj = canvas?.getActiveObject();
    if (activeObj && challengeId) {
      (activeObj as any).challenge = challengeId;
    }
  };

  const addText = (text: string, challengeId?: number) => {
    canvasRef.current?.addText(text);

    const canvas = canvasRef.current?.canvas;
    const activeObj = canvas?.getActiveObject();
    if (activeObj && challengeId) {
      (activeObj as any).challenge = challengeId;
    }
  };

  const getElementsForChallenge = (challengeId: number) => {
    const canvas = canvasRef.current?.canvas;
    if (!canvas) return [];

    return canvas.getObjects().filter((obj: any) => obj.challenge === challengeId);
  };

  return {
    canvasRef,
    selectedTool,
    setSelectedTool,
    addImage,
    addText,
    getElementsForChallenge,
  };
}
```

## Step 3: Create Auto-save Hook

### File: `hooks/useAutoSave.ts`

```tsx
import { useEffect, useRef, useState } from 'react';
import { CanvasRef } from '@/components/canvas/FabricCanvas';

export function useAutoSave(canvasRef: React.RefObject<CanvasRef>, collageId: string) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const lastStateRef = useRef<string | null>(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!canvasRef.current) return;

      const currentState = JSON.stringify(canvasRef.current.toJSON());

      // Only save if state changed
      if (currentState === lastStateRef.current) return;

      setSaving(true);

      try {
        const response = await fetch(`/api/collages/${collageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            canvasJSON: canvasRef.current.toJSON(),
            elementCount: canvasRef.current.canvas?.getObjects().length || 0,
          }),
        });

        if (response.ok) {
          lastStateRef.current = currentState;
          setLastSaved(new Date());
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setSaving(false);
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [canvasRef, collageId]);

  return { lastSaved, saving };
}
```

## Step 4: Create Main Builder Page

### File: `app/collage/builder/page.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FabricCanvas from '@/components/canvas/FabricCanvas';
import { ToolPanel } from '@/components/canvas/ToolPanel';
import { ChallengePanel } from '@/components/canvas/ChallengePanel';
import { BadgeSidebar } from '@/components/canvas/BadgeSidebar';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useCanvas } from '@/hooks/useCanvas';
import { useAutoSave } from '@/hooks/useAutoSave';
import { CHALLENGES } from '@/lib/constants/challenges';

export default function BuilderPage() {
  const router = useRouter();
  const { canvasRef, selectedTool, setSelectedTool, addImage, addText } = useCanvas();
  const [collageId, setCollageId] = useState<string>('');
  const [currentChallenge, setCurrentChallenge] = useState(1);
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([]);

  const { lastSaved, saving } = useAutoSave(canvasRef, collageId);

  // Initialize collage
  useEffect(() => {
    const initCollage = async () => {
      const session1Input = localStorage.getItem('session1Input');
      const template = localStorage.getItem('selectedTemplate');

      if (!session1Input || !template) {
        router.push('/collage/session1-input');
        return;
      }

      // Create collage via API
      const response = await fetch('/api/collages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: 'demo-student', // TODO: Get from auth
          session1Input: JSON.parse(session1Input),
          templateType: JSON.parse(template).id,
        }),
      });

      const collage = await response.json();
      setCollageId(collage.id);
    };

    initCollage();
  }, [router]);

  const progress = (completedChallenges.length / 5) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex-1">
            <ProgressBar value={progress} showLabel label={`${Math.round(progress)}%`} />
          </div>
          <div className="ml-4 text-sm text-gray-600">
            {saving ? 'Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : ''}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-60px)]">
        {/* Left Sidebar - Challenges */}
        <div className="w-64 bg-white border-r overflow-y-auto">
          <ChallengePanel
            challenges={CHALLENGES}
            currentChallenge={currentChallenge}
            completedChallenges={completedChallenges}
            onSelectChallenge={setCurrentChallenge}
          />
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <FabricCanvas ref={canvasRef} />

            {/* Canvas Controls */}
            <div className="mt-4 flex items-center gap-2">
              <button onClick={() => canvasRef.current?.undo()}>Undo</button>
              <button onClick={() => canvasRef.current?.redo()}>Redo</button>
              <button onClick={() => canvasRef.current?.bringToFront()}>
                Bring to Front
              </button>
              <button onClick={() => canvasRef.current?.sendToBack()}>
                Send to Back
              </button>
              <button onClick={() => canvasRef.current?.deleteSelected()}>
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Tools & Badges */}
        <div className="w-80 bg-white border-l overflow-y-auto">
          <ToolPanel
            selectedTool={selectedTool}
            onSelectTool={setSelectedTool}
            onAddImage={addImage}
            onAddText={addText}
            currentChallenge={currentChallenge}
          />
          <BadgeSidebar badges={[]} />
        </div>
      </div>
    </div>
  );
}
```

## Step 5: Key Features to Implement

### Image Search Tool
- Modal with search input
- Display Unsplash results in grid
- Click to add to canvas
- Track photographer attribution

### AI Image Generator
- Text prompt input
- Style selector
- Generate button
- Credit tracking (10 per session)
- Loading state

### File Upload
- Drag & drop zone
- File validation (5MB max, JPG/PNG/GIF/WebP)
- Image compression
- Preview before adding

### Text Tool
- Text input
- Font selector (7 canvas fonts)
- Size slider
- Color picker
- Style options (bold, italic, shadow)
- Add to canvas

### Drawing Tool
- HTML5 canvas for drawing
- Brush size slider
- Color picker
- Eraser tool
- Clear button
- Convert to image and add to canvas

## Step 6: Challenge Detection

```tsx
const checkChallengeCompletion = (challengeId: number) => {
  const elements = getElementsForChallenge(challengeId);
  const challenge = CHALLENGES.find(c => c.id === challengeId);

  if (elements.length >= challenge.requiredElements) {
    // Challenge complete!
    markChallengeComplete(challengeId);
    unlockBadge(challengeId);
    showCelebration();
  }
};
```

## Step 7: Badge Unlock

```tsx
const unlockBadge = async (challengeId: number) => {
  const response = await fetch(`/api/collages/${collageId}/challenges/${challengeId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ elements: getElementsForChallenge(challengeId) }),
  });

  const result = await response.json();

  if (result.badgeUnlocked) {
    // Show badge unlock animation
    showBadgeAnimation(result.badgeUnlocked);

    // Unlock stickers
    updateAvailableStickers(result.badgeUnlocked.stickersUnlocked);
  }
};
```

## Keyboard Shortcuts

Implement these shortcuts:
- `Delete`/`Backspace`: Delete selected
- `Ctrl+Z`: Undo
- `Ctrl+Shift+Z` or `Ctrl+Y`: Redo
- `Ctrl+A`: Select all
- `Arrow keys`: Move selected object

## Mobile Considerations

- Touch events for drag/pinch/rotate
- Simplified UI for small screens
- Bottom toolbar instead of sidebars
- Separate pages for each tool

## Performance Optimization

- Lazy load Fabric.js
- Debounce auto-save
- Compress images before adding
- Limit canvas objects (max 100)
- Use object caching

## Testing Checklist

- [ ] Add image from search
- [ ] Add AI generated image
- [ ] Upload custom image
- [ ] Add and style text
- [ ] Draw freehand
- [ ] Drag elements
- [ ] Resize elements
- [ ] Rotate elements
- [ ] Delete elements
- [ ] Undo/Redo
- [ ] Layer management
- [ ] Auto-save
- [ ] Challenge completion detection
- [ ] Badge unlock
- [ ] Export to PNG
- [ ] Export to PDF

---

For more examples, check the Fabric.js documentation:
http://fabricjs.com/docs/
