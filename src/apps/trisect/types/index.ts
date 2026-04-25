export type ZoneId = 'A' | 'B' | 'C' | 'AB' | 'AC' | 'BC' | 'ABC';

export interface Puzzle {
  id: number;
  date: string;
  themes: { A: string; B: string; C: string };
  solution: Record<ZoneId, string>;
}

export type PlacementMap = Partial<Record<ZoneId, string>>;
export type GameStatus = 'playing' | 'solved' | 'revealed';

export interface GameState {
  puzzleId: number;
  placements: PlacementMap;
  selectedZone: ZoneId | null;
  status: GameStatus;
  themesRevealed: boolean;
}
