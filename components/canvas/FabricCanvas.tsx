'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { fabric } from 'fabric';

export interface CanvasRef {
  canvas: fabric.Canvas | null;
  addImage: (url: string) => Promise<void>;
  addText: (text: string, options?: fabric.ITextOptions) => void;
  addSticker: (emoji: string) => void;
  deleteSelected: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  setBackgroundColor: (color: string) => void;
  setBackgroundGradient: (color1: string, color2: string) => void;
  toJSON: () => any;
  loadFromJSON: (json: any) => Promise<void>;
  exportPNG: () => string;
  getObjects: () => fabric.Object[];
}

interface FabricCanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  backgroundGradient?: { color1: string; color2: string };
  onObjectAdded?: () => void;
  onObjectRemoved?: () => void;
  onObjectModified?: () => void;
  onReady?: () => void;
  onMount?: (api: CanvasRef) => void;
}

const FabricCanvas = forwardRef<CanvasRef, FabricCanvasProps>((props, ref) => {
  const {
    width = 800,
    height = 600,
    backgroundColor = '#FFFFFF',
    backgroundGradient,
    onObjectAdded,
    onObjectRemoved,
    onObjectModified,
    onReady,
    onMount,
  } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndex = useRef(-1);
  const isLoadingRef = useRef(false);
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (canvasRef.current && !fabricRef.current) {
      console.log('[FabricCanvas] Initializing with background:', { backgroundColor, backgroundGradient });

      fabricRef.current = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        backgroundColor,
      });

      // Apply gradient if provided
      if (backgroundGradient) {
        console.log('[FabricCanvas] Applying gradient during init:', backgroundGradient);
        const gradient = new fabric.Gradient({
          type: 'linear',
          coords: {
            x1: 0,
            y1: 0,
            x2: width,
            y2: height,
          },
          colorStops: [
            { offset: 0, color: backgroundGradient.color1 },
            { offset: 1, color: backgroundGradient.color2 },
          ],
        });
        fabricRef.current.setBackgroundColor(gradient, () => {
          fabricRef.current?.renderAll();
          console.log('[FabricCanvas] Gradient applied during init');
        });
      }

      // Set selection style
      fabric.Object.prototype.set({
        transparentCorners: false,
        cornerColor: '#006BFF',
        cornerStyle: 'circle',
        borderColor: '#006BFF',
        borderScaleFactor: 2,
        cornerSize: 10,
      });

      // Save initial state
      saveState();

      // Mark canvas as ready
      console.log('[FabricCanvas] Canvas ready, setting isCanvasReady to true');
      setIsCanvasReady(true);

      // Notify parent that canvas is ready
      onReady?.();

      // Listen for changes
      fabricRef.current.on('object:modified', () => {
        saveState();
        onObjectModified?.();
      });

      fabricRef.current.on('object:added', () => {
        if (!isLoadingRef.current) {
          saveState();
          onObjectAdded?.();
        }
      });

      fabricRef.current.on('object:removed', () => {
        if (!isLoadingRef.current) {
          saveState();
          onObjectRemoved?.();
        }
      });
    }

    return () => {
      console.log('[FabricCanvas] Cleanup: disposing canvas');
      setIsCanvasReady(false);
      fabricRef.current?.dispose();
      fabricRef.current = null;
    };
    // Only run on mount/unmount or when canvas dimensions change
    // Callbacks are intentionally NOT in dependencies to prevent recreation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  // Save state for undo/redo
  const saveState = () => {
    if (!fabricRef.current || isLoadingRef.current) return;

    const json = JSON.stringify(fabricRef.current.toJSON(['id', 'challenge', 'tags', 'source']));

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

    isLoadingRef.current = true;
    fabricRef.current.loadFromJSON(JSON.parse(state), () => {
      fabricRef.current?.renderAll();
      isLoadingRef.current = false;
    });
  };

  // Add image
  const addImage = async (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!fabricRef.current) {
        reject(new Error('Canvas not initialized'));
        return;
      }

      fabric.Image.fromURL(
        url,
        (img: fabric.Image) => {
          if (!fabricRef.current || !img) {
            reject(new Error('Failed to load image'));
            return;
          }

          // Scale to fit
          const maxWidth = 300;
          const maxHeight = 300;
          const scale = Math.min(
            maxWidth / (img.width || 1),
            maxHeight / (img.height || 1),
            1
          );

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
        },
        { crossOrigin: 'anonymous' }
      );
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

  // Add sticker (emoji)
  const addSticker = (emoji: string) => {
    if (!fabricRef.current) return;

    const stickerObj = new fabric.Text(emoji, {
      left: fabricRef.current.width! / 2,
      top: fabricRef.current.height! / 2,
      fontSize: 48,
      originX: 'center',
      originY: 'center',
    });

    fabricRef.current.add(stickerObj);
    fabricRef.current.setActiveObject(stickerObj);
    fabricRef.current.renderAll();
  };

  // Delete selected
  const deleteSelected = () => {
    if (!fabricRef.current) return;

    const activeObjects = fabricRef.current.getActiveObjects();
    if (activeObjects.length === 0) return;

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
      saveState();
    }
  };

  const sendToBack = () => {
    const obj = fabricRef.current?.getActiveObject();
    if (obj) {
      fabricRef.current?.sendToBack(obj);
      fabricRef.current?.renderAll();
      saveState();
    }
  };

  const bringForward = () => {
    const obj = fabricRef.current?.getActiveObject();
    if (obj) {
      fabricRef.current?.bringForward(obj);
      fabricRef.current?.renderAll();
      saveState();
    }
  };

  const sendBackward = () => {
    const obj = fabricRef.current?.getActiveObject();
    if (obj) {
      fabricRef.current?.sendBackward(obj);
      fabricRef.current?.renderAll();
      saveState();
    }
  };

  // Background
  const setBackgroundColor = (color: string) => {
    console.log('[FabricCanvas] setBackgroundColor called with:', color);
    if (!fabricRef.current) {
      console.log('[FabricCanvas] No canvas ref, skipping');
      return;
    }
    fabricRef.current.setBackgroundColor(color, () => {
      console.log('[FabricCanvas] Background color applied, rendering');
      fabricRef.current?.renderAll();
      saveState();
      console.log('[FabricCanvas] State saved');
    });
  };

  const setBackgroundGradient = (color1: string, color2: string) => {
    console.log('[FabricCanvas] setBackgroundGradient called with:', color1, color2);
    if (!fabricRef.current) {
      console.log('[FabricCanvas] No canvas ref, skipping');
      return;
    }

    const gradient = new fabric.Gradient({
      type: 'linear',
      coords: {
        x1: 0,
        y1: 0,
        x2: fabricRef.current.width!,
        y2: fabricRef.current.height!,
      },
      colorStops: [
        { offset: 0, color: color1 },
        { offset: 1, color: color2 },
      ],
    });

    fabricRef.current.setBackgroundColor(gradient, () => {
      console.log('[FabricCanvas] Background gradient applied, rendering');
      fabricRef.current?.renderAll();
      saveState();
      console.log('[FabricCanvas] State saved');
    });
  };

  // Export
  const toJSON = () => {
    const json = fabricRef.current?.toJSON(['id', 'challenge', 'tags', 'source']) || {};
    console.log('[FabricCanvas] toJSON called, background:', json.background, json.backgroundColor);
    return json;
  };

  const loadFromJSON = async (json: any): Promise<void> => {
    return new Promise((resolve) => {
      if (!fabricRef.current) {
        resolve();
        return;
      }

      isLoadingRef.current = true;
      fabricRef.current.loadFromJSON(json, () => {
        fabricRef.current?.renderAll();
        isLoadingRef.current = false;
        saveState();
        resolve();
      });
    });
  };

  const exportPNG = () => {
    return fabricRef.current?.toDataURL({ format: 'png', quality: 1 }) || '';
  };

  const getObjects = () => {
    return fabricRef.current?.getObjects() || [];
  };

  // Create canvas API object
  const canvasAPI: CanvasRef = {
    get canvas() {
      return fabricRef.current;
    },
    addImage,
    addText,
    addSticker,
    deleteSelected,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
    undo,
    redo,
    clear: () => {
      fabricRef.current?.clear();
      fabricRef.current?.setBackgroundColor(backgroundColor, () => {
        fabricRef.current?.renderAll();
      });
    },
    setBackgroundColor,
    setBackgroundGradient,
    toJSON,
    loadFromJSON,
    exportPNG,
    getObjects,
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => canvasAPI, []);

  // Also call onMount callback with the API (for dynamic imports where ref doesn't work)
  useEffect(() => {
    if (fabricRef.current && onMount) {
      console.log('[FabricCanvas] Calling onMount with canvas API');
      onMount(canvasAPI);
    }
  }, [onMount]);

  // Debug: Log when isCanvasReady changes
  useEffect(() => {
    console.log('[FabricCanvas] isCanvasReady changed to:', isCanvasReady);
  }, [isCanvasReady]);

  return (
    <div className="relative">
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
});

FabricCanvas.displayName = 'FabricCanvas';

export default FabricCanvas;
