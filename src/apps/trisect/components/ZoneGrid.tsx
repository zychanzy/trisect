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

export function ZoneGrid({
  placements,
  selectedZone,
  themesRevealed,
  puzzle,
  onSelectZone,
  onRemoveWord,
  isDisabled,
}: ZoneGridProps) {
  function tile(zoneId: ZoneId) {
    return (
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
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {tile('A')}{tile('B')}{tile('C')}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {tile('AB')}{tile('AC')}{tile('BC')}
      </div>
      {tile('ABC')}
    </div>
  );
}
