import type { ZoneId, PlacementMap, Puzzle } from '../types';
import { ZoneTile } from './ZoneTile';

interface ZoneGridProps {
  placements: PlacementMap;
  selectedZone: ZoneId | null;
  themesRevealed: boolean;
  puzzle: Puzzle;
  onSelectZone: (zoneId: ZoneId) => void;
  onRemoveWord: (zoneId: ZoneId) => void;
  onDropWord: (word: string, zoneId: ZoneId) => void;
  isDisabled: boolean;
  shaking: boolean;
}

export function ZoneGrid({
  placements,
  selectedZone,
  themesRevealed,
  puzzle,
  onSelectZone,
  onRemoveWord,
  onDropWord,
  isDisabled,
  shaking,
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
        onDrop={onDropWord}
        isDisabled={isDisabled}
      />
    );
  }

  return (
    <div className={shaking ? 'grid-shake' : ''} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {tile('A')}{tile('B')}{tile('C')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {tile('AB')}{tile('AC')}{tile('BC')}
      </div>
      {tile('ABC')}
    </div>
  );
}
