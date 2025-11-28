import { useEffect, useRef, useState } from 'react';
import { CanvasRef } from '@/components/canvas/FabricCanvas';

export function useAutoSave(canvasRef: React.RefObject<CanvasRef>, collageId: string | null) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastStateRef = useRef<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!collageId) return;

    const performSave = async () => {
      if (!canvasRef.current) return;

      const currentState = JSON.stringify(canvasRef.current.toJSON());

      // Only save if state changed
      if (currentState === lastStateRef.current) return;

      setSaving(true);
      setError(null);

      try {
        const response = await fetch(`/api/collages/${collageId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            canvasJSON: canvasRef.current.toJSON(),
            elementCount: canvasRef.current.getObjects().length,
          }),
        });

        if (response.ok) {
          lastStateRef.current = currentState;
          setLastSaved(new Date());
        } else {
          throw new Error('Save failed');
        }
      } catch (err) {
        console.error('Auto-save failed:', err);
        setError('Failed to save');
      } finally {
        setSaving(false);
      }
    };

    // Auto-save every 30 seconds
    const interval = setInterval(performSave, 30000);

    return () => clearInterval(interval);
  }, [canvasRef, collageId]);

  // Manual save function
  const saveNow = async () => {
    if (!collageId || !canvasRef.current) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/collages/${collageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canvasJSON: canvasRef.current.toJSON(),
          elementCount: canvasRef.current.getObjects().length,
        }),
      });

      if (response.ok) {
        lastStateRef.current = JSON.stringify(canvasRef.current.toJSON());
        setLastSaved(new Date());
      } else {
        throw new Error('Save failed');
      }
    } catch (err) {
      console.error('Manual save failed:', err);
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return { lastSaved, saving, error, saveNow };
}
