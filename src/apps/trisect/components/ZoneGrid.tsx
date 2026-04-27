import type { ZoneId, PlacementMap, Puzzle } from '../types';
import { ZoneTile } from './ZoneTile';

interface ZoneGridProps {
  placements: PlacementMap;
  selectedZone: ZoneId | null;
  tileLabelsReady: boolean;
  swappingZones: [ZoneId, ZoneId] | null;
  swapGeneration: number;
  puzzle: Puzzle;
  onSelectZone: (zoneId: ZoneId) => void;
  onRemoveWord: (zoneId: ZoneId) => void;
  onDropWord: (word: string, zoneId: ZoneId) => void;
  isDisabled: boolean;
  shaking: boolean;
  onTileHover: (zoneId: ZoneId | null) => void;
}

export function ZoneGrid({
  placements,
  selectedZone,
  tileLabelsReady,
  swappingZones,
  swapGeneration,
  puzzle,
  onSelectZone,
  onRemoveWord,
  onDropWord,
  isDisabled,
  shaking,
  onTileHover,
}: ZoneGridProps) {
  function tile(zoneId: ZoneId) {
    return (
      <ZoneTile
        key={zoneId}
        zoneId={zoneId}
        word={placements[zoneId]}
        isSelected={selectedZone === zoneId}
        tileLabelsReady={tileLabelsReady}
        isSwapping={swappingZones?.includes(zoneId) ?? false}
        swapGeneration={swapGeneration}
        puzzle={puzzle}
        onSelect={onSelectZone}
        onRemove={onRemoveWord}
        onDrop={onDropWord}
        isDisabled={isDisabled}
        onHover={onTileHover}
      />
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${shaking ? 'animate-shake' : ''}`}>
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
