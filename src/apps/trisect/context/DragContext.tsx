import { createContext, useContext, useRef, useState, useCallback } from 'react';
import type { ZoneId } from '../types';

interface DragState {
  word: string;
  sourceZone: ZoneId | null; // null = from word bank
}

interface DragContextValue {
  dragging: DragState | null;
  startDrag: (word: string, sourceZone: ZoneId | null) => void;
  endDrag: () => void;
  // For touch: track the element under the finger so zones know when they're hovered
  touchTargetZone: ZoneId | null;
  setTouchTargetZone: (z: ZoneId | null) => void;
  // Ghost element ref for touch drag visual
  ghostRef: React.RefObject<HTMLDivElement | null>;
}

const DragContext = createContext<DragContextValue | null>(null);

export function DragProvider({ children }: { children: React.ReactNode }) {
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [touchTargetZone, setTouchTargetZone] = useState<ZoneId | null>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);

  const startDrag = useCallback((word: string, sourceZone: ZoneId | null) => {
    setDragging({ word, sourceZone });
  }, []);

  const endDrag = useCallback(() => {
    setDragging(null);
    setTouchTargetZone(null);
  }, []);

  return (
    <DragContext.Provider value={{ dragging, startDrag, endDrag, touchTargetZone, setTouchTargetZone, ghostRef }}>
      {children}
    </DragContext.Provider>
  );
}

export function useDrag() {
  const ctx = useContext(DragContext);
  if (!ctx) throw new Error('useDrag must be used inside DragProvider');
  return ctx;
}
