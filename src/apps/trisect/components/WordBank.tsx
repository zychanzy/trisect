import { useRef, useEffect } from 'react';
import { useDrag } from '../context/DragContext';
import type { HintState } from '../types';

interface WordBankProps {
  words: string[];
  onWordClick: (word: string) => void;
  hasSelectedZone: boolean;
  isDisabled: boolean;
  hints: HintState;
}

export function WordBank({ words, onWordClick, hasSelectedZone, isDisabled, hints }: WordBankProps) {
  const canPlace = hasSelectedZone && !isDisabled;
  const { startDrag, endDrag, dragging, ghostRef, setTouchTargetZone } = useDrag();

  const revealedSet = new Map(hints.revealedWords.map(r => [r.word, r.categories]));

  return (
    <div className="mt-[22px]">
      <hr className="border-0 border-t border-stone-300 mb-3 relative left-1/2 -translate-x-1/2 w-screen" />
      <div className="flex flex-wrap gap-2 justify-center">
        {words.map(word => (
          <DraggableWord
            key={word}
            word={word}
            canPlace={canPlace}
            isDisabled={isDisabled}
            categories={revealedSet.get(word) ?? null}
            onClick={() => canPlace && onWordClick(word)}
            onDragStart={() => startDrag(word, null)}
            onDragEnd={endDrag}
            isDragging={dragging?.word === word && dragging?.sourceZone === null}
            ghostRef={ghostRef}
            setTouchTargetZone={setTouchTargetZone}
          />
        ))}
      </div>
    </div>
  );
}

interface DraggableWordProps {
  word: string;
  canPlace: boolean;
  isDisabled: boolean;
  categories: 1 | 2 | 3 | null;
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
  ghostRef: React.RefObject<HTMLDivElement | null>;
  setTouchTargetZone: (z: import('../types').ZoneId | null) => void;
}

function DraggableWord({ word, canPlace, isDisabled, categories, onClick, onDragStart, onDragEnd, isDragging, ghostRef, setTouchTargetZone }: DraggableWordProps) {
  const elementRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    function handleTouchMove(e: TouchEvent) {
      if (!ghostRef.current || ghostRef.current.style.display === 'none') return;
      e.preventDefault();
      const touch = e.touches[0];
      ghostRef.current.style.left = touch.clientX - 40 + 'px';
      ghostRef.current.style.top = touch.clientY - 20 + 'px';
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const zoneEl = target?.closest('[data-zone-id]');
      setTouchTargetZone(
        zoneEl ? (zoneEl.getAttribute('data-zone-id') as import('../types').ZoneId) : null
      );
    }
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', handleTouchMove);
  }, [ghostRef, setTouchTargetZone]);

  function handleTouchStart(e: React.TouchEvent) {
    if (isDisabled) return;
    onDragStart();
    const touch = e.touches[0];
    if (ghostRef.current) {
      ghostRef.current.textContent = word;
      ghostRef.current.style.display = 'block';
      ghostRef.current.style.left = touch.clientX - 40 + 'px';
      ghostRef.current.style.top = touch.clientY - 20 + 'px';
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (ghostRef.current) ghostRef.current.style.display = 'none';
    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const zoneEl = el?.closest('[data-zone-id]');
    if (zoneEl) {
      zoneEl.dispatchEvent(new CustomEvent('word-drop', { bubbles: false, detail: { word } }));
    }
    onDragEnd();
  }

  const isRevealed = categories !== null;
  const borderStyle = isDisabled
    ? 'border-stone-300 bg-stone-200 text-stone-500 cursor-not-allowed shadow-none'
    : isRevealed
      ? 'border-[2px] border-stone-800 bg-white text-ink cursor-grab shadow-[0_1px_3px_rgba(0,0,0,0.10)]'
      : 'border-stone-500 bg-white text-ink cursor-grab shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-stone-200 hover:border-stone-600';

  return (
    <button
      ref={elementRef}
      onClick={onClick}
      disabled={!canPlace && isDisabled}
      draggable={!isDisabled}
      className={[
        'relative px-[18px] py-2 rounded-full text-[15px] font-medium tracking-[0.01em]',
        'transition-all duration-150 ease-in-out outline-none',
        'touch-none select-none border-[1.5px]',
        borderStyle,
        isDragging ? 'opacity-35' : 'opacity-100',
      ].join(' ')}
      onDragStart={e => {
        e.dataTransfer.setData('text/plain', word);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {word}
      {isRevealed && (
        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-stone-800 text-white text-[9px] font-bold leading-none">
          {categories}
        </span>
      )}
    </button>
  );
}
