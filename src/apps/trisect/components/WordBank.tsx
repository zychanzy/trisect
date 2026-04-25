import { useRef } from 'react';
import { useDrag } from '../context/DragContext';

interface WordBankProps {
  words: string[];
  onWordClick: (word: string) => void;
  hasSelectedZone: boolean;
  isDisabled: boolean;
}

export function WordBank({ words, onWordClick, hasSelectedZone, isDisabled }: WordBankProps) {
  const canPlace = hasSelectedZone && !isDisabled;
  const { startDrag, endDrag, dragging, ghostRef } = useDrag();

  return (
    <div style={{ marginTop: 22 }}>
      <p
        style={{
          textAlign: 'center',
          fontSize: 10.5,
          letterSpacing: '0.09em',
          textTransform: 'uppercase',
          color: '#AEAAA4',
          marginBottom: 12,
          fontWeight: 500,
          minHeight: 14,
          fontFamily: '"DM Sans", sans-serif',
        }}
      >
        {isDisabled ? '' : canPlace ? 'Tap or drag a word to place it' : 'Tap a zone · then a word · or drag'}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {words.map(word => (
          <DraggableWord
            key={word}
            word={word}
            canPlace={canPlace}
            isDisabled={isDisabled}
            onClick={() => canPlace && onWordClick(word)}
            onDragStart={() => startDrag(word, null)}
            onDragEnd={endDrag}
            isDragging={dragging?.word === word && dragging?.sourceZone === null}
            ghostRef={ghostRef}
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
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
  ghostRef: React.RefObject<HTMLDivElement | null>;
}

function DraggableWord({ word, canPlace, isDisabled, onClick, onDragStart, onDragEnd, isDragging, ghostRef }: DraggableWordProps) {
  const elementRef = useRef<HTMLButtonElement | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    if (isDisabled) return;
    onDragStart();

    const touch = e.touches[0];

    // Create ghost element
    if (ghostRef.current) {
      ghostRef.current.textContent = word;
      ghostRef.current.style.display = 'block';
      ghostRef.current.style.left = touch.clientX - 40 + 'px';
      ghostRef.current.style.top = touch.clientY - 20 + 'px';
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!ghostRef.current || ghostRef.current.style.display === 'none') return;
    e.preventDefault();
    const touch = e.touches[0];
    ghostRef.current.style.left = touch.clientX - 40 + 'px';
    ghostRef.current.style.top = touch.clientY - 20 + 'px';
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (ghostRef.current) {
      ghostRef.current.style.display = 'none';
    }
    // The zone's touchend handler fires after this, so we just clean up the ghost here.
    // The actual drop is handled by the zone via document-level touch tracking in ZoneTile.
    const touch = e.changedTouches[0];
    // Find element under the finger
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const zoneEl = el?.closest('[data-zone-id]');
    if (zoneEl) {
      zoneEl.dispatchEvent(new CustomEvent('word-drop', { bubbles: false, detail: { word } }));
    }
    onDragEnd();
  }

  return (
    <button
      ref={elementRef}
      onClick={onClick}
      disabled={!canPlace && isDisabled}
      draggable={!isDisabled}
      className={isDisabled ? '' : 'word-chip'}
      onDragStart={e => {
        e.dataTransfer.setData('text/plain', word);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        padding: '8px 18px',
        borderRadius: 100,
        border: `1.5px solid ${isDisabled ? '#E5E2DC' : '#C8C5BF'}`,
        background: isDisabled ? '#F2F0ED' : '#FFFFFF',
        color: isDisabled ? '#B5B1AA' : '#1C1B19',
        fontSize: 13,
        fontFamily: '"DM Sans", sans-serif',
        fontWeight: 500,
        cursor: isDisabled ? 'not-allowed' : 'grab',
        transition: 'all 0.15s ease',
        letterSpacing: '0.01em',
        boxShadow: isDisabled ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
        outline: 'none',
        opacity: isDragging ? 0.35 : 1,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {word}
    </button>
  );
}
