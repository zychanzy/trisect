import type { ZoneId, Puzzle } from '../types';
import { ZONE_META, THEME_COLORS } from '../data/zones';

interface ZoneTileProps {
  zoneId: ZoneId;
  word?: string;
  isSelected: boolean;
  themesRevealed: boolean;
  puzzle: Puzzle;
  onSelect: (zoneId: ZoneId) => void;
  onRemove: (zoneId: ZoneId) => void;
  isDisabled: boolean;
}

export function ZoneTile({
  zoneId,
  word,
  isSelected,
  themesRevealed,
  puzzle,
  onSelect,
  onRemove,
  isDisabled,
}: ZoneTileProps) {
  const meta = ZONE_META[zoneId];
  const isABC = zoneId === 'ABC';

  function handleClick() {
    if (isDisabled && !word) return;
    if (word) onRemove(zoneId);
    else onSelect(zoneId);
  }

  const themeLabel = themesRevealed
    ? meta.themes.map(t => puzzle.themes[t]).join(' · ')
    : null;

  const dots = meta.themes.map(t => THEME_COLORS[t]);

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled && !word}
      style={{
        width: '100%',
        height: isABC ? 60 : 72,
        borderRadius: 14,
        border: `1.5px solid ${isSelected && !word ? '#1C1B19' : word ? '#D8D5CF' : '#E5E2DC'}`,
        background: word ? '#FFFFFF' : isSelected ? '#F0EDE8' : '#FAFAF8',
        boxShadow: word ? '0 1px 4px rgba(0,0,0,0.07)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        padding: '8px 6px',
        cursor: isDisabled && !word ? 'not-allowed' : 'pointer',
        transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s, transform 0.1s',
        transform: isSelected && !word ? 'scale(1.02)' : 'scale(1)',
        opacity: isDisabled && !word ? 0.45 : 1,
        outline: 'none',
        fontFamily: '"DM Sans", sans-serif',
      }}
    >
      {/* Membership dots */}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {dots.map((color, i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: color,
              opacity: word ? 0.5 : 0.7,
            }}
          />
        ))}
      </div>

      {/* Word */}
      {word && (
        <span
          className="tile-word-appear"
          style={{
            fontSize: isABC ? 13 : 12,
            fontWeight: 600,
            color: '#1C1B19',
            letterSpacing: '0.01em',
            lineHeight: 1.2,
            textAlign: 'center',
            wordBreak: 'break-word',
          }}
        >
          {word}
        </span>
      )}

      {/* Theme label when revealed */}
      {themeLabel && (
        <span
          style={{
            fontSize: 8.5,
            fontWeight: 400,
            color: '#A09D98',
            letterSpacing: '0.03em',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          {themeLabel}
        </span>
      )}
    </button>
  );
}
