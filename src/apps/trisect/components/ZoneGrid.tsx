import type { ZoneId, PlacementMap, Puzzle } from '../types';
import { ZoneTile } from './ZoneTile';

interface ZoneGridProps {
  placements: PlacementMap;
  selectedZone: ZoneId | null;
  themesRevealed: boolean;
  puzzle: Puzzle;
  onSelectZone: (zoneId: ZoneId) => void;
  onRemoveWord: (zoneId: ZoneId) => void;
  isDisabled: boolean;
}

const ROWS: ZoneId[][] = [
  ['A', 'AB', 'B'],
  ['AC', 'ABC', 'BC'],
];

export function ZoneGrid({
  placements,
  selectedZone,
  themesRevealed,
  puzzle,
  onSelectZone,
  onRemoveWord,
  isDisabled,
}: ZoneGridProps) {
  return (
    <div className="flex flex-col gap-2">
      {ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="grid grid-cols-3 gap-2">
          {row.map(zoneId => (
            <ZoneTile
              key={zoneId}
              zoneId={zoneId}
              word={placements[zoneId]}
              isSelected={selectedZone === zoneId}
              themesRevealed={themesRevealed}
              puzzle={puzzle}
              onSelect={onSelectZone}
              onRemove={onRemoveWord}
              isDisabled={isDisabled}
            />
          ))}
        </div>
      ))}
      {/* Row 2: C tile centred */}
      <div className="grid grid-cols-3 gap-2">
        <div />
        <ZoneTile
          zoneId="C"
          word={placements['C']}
          isSelected={selectedZone === 'C'}
          themesRevealed={themesRevealed}
          puzzle={puzzle}
          onSelect={onSelectZone}
          onRemove={onRemoveWord}
          isDisabled={isDisabled}
        />
        <div />
      </div>
    </div>
  );
}
