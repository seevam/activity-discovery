import { useRef, useState, useCallback } from 'react';
import { CanvasRef } from '@/components/canvas/FabricCanvas';

export function useCanvas() {
  const canvasRef = useRef<CanvasRef>(null);
  const [selectedTool, setSelectedTool] = useState<string>('select');

  const addImage = useCallback(async (url: string, challengeId?: number) => {
    console.log('[useCanvas] addImage called', { url, challengeId, hasCanvasRef: !!canvasRef.current });
    if (!canvasRef.current) {
      console.error('[useCanvas] Cannot add image - canvasRef.current is null');
      return;
    }

    await canvasRef.current.addImage(url);
    console.log('[useCanvas] Image added successfully');

    // Tag with challenge
    const canvas = canvasRef.current.canvas;
    const activeObj = canvas?.getActiveObject();
    if (activeObj && challengeId) {
      (activeObj as any).challenge = challengeId;
      (activeObj as any).source = 'image';
    }
  }, []);

  const addText = useCallback((text: string, options?: any, challengeId?: number) => {
    console.log('[useCanvas] addText called', { text, challengeId, hasCanvasRef: !!canvasRef.current });
    if (!canvasRef.current) {
      console.error('[useCanvas] Cannot add text - canvasRef.current is null');
      return;
    }

    canvasRef.current.addText(text, options);
    console.log('[useCanvas] Text added successfully');

    const canvas = canvasRef.current.canvas;
    const activeObj = canvas?.getActiveObject();
    if (activeObj && challengeId) {
      (activeObj as any).challenge = challengeId;
      (activeObj as any).source = 'text';
    }
  }, []);

  const addSticker = useCallback((emoji: string, challengeId?: number) => {
    console.log('[useCanvas] addSticker called', { emoji, challengeId, hasCanvasRef: !!canvasRef.current });
    if (!canvasRef.current) {
      console.error('[useCanvas] Cannot add sticker - canvasRef.current is null');
      return;
    }

    canvasRef.current.addSticker(emoji);
    console.log('[useCanvas] Sticker added successfully');

    const canvas = canvasRef.current.canvas;
    const activeObj = canvas?.getActiveObject();
    if (activeObj && challengeId) {
      (activeObj as any).challenge = challengeId;
      (activeObj as any).source = 'sticker';
    }
  }, []);

  const getElementsForChallenge = useCallback((challengeId: number) => {
    const canvas = canvasRef.current?.canvas;
    if (!canvas) return [];

    return canvas.getObjects().filter((obj: any) => obj.challenge === challengeId);
  }, []);

  const getTotalElements = useCallback(() => {
    return canvasRef.current?.getObjects().length || 0;
  }, []);

  return {
    canvasRef,
    selectedTool,
    setSelectedTool,
    addImage,
    addText,
    addSticker,
    getElementsForChallenge,
    getTotalElements,
  };
}
