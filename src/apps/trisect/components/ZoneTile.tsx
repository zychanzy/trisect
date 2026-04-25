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

  function handleClick() {
    if (isDisabled) return;
    if (word) {
      onRemove(zoneId);
    } else {
      onSelect(zoneId);
    }
  }

  const borderClass = isSelected && !word
    ? 'border-2 border-blue-500 ring-2 ring-blue-300'
    : 'border border-gray-200';

  const bgClass = word ? 'bg-white' : 'bg-gray-50';

  const themeLabel = themesRevealed
    ? meta.themes.map(t => puzzle.themes[t]).join(' + ')
    : null;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled && !word}
      className={`
        aspect-square w-full rounded-xl flex flex-col items-center justify-center gap-1 p-2
        transition-all duration-150 cursor-pointer
        ${borderClass} ${bgClass}
        ${isDisabled ? 'opacity-60' : 'hover:bg-gray-100 active:scale-95'}
      `}
    >
      <div className="flex gap-1">
        {meta.themes.map(t => (
          <span
            key={t}
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: THEME_COLORS[t] }}
          />
        ))}
      </div>

      {word && (
        <span className="text-xs font-semibold text-gray-800 text-center leading-tight px-1 break-words">
          {word}
        </span>
      )}

      {themeLabel && (
        <span className="text-[9px] text-gray-400 text-center leading-tight px-1">
          {themeLabel}
        </span>
      )}
    </button>
  );
}
