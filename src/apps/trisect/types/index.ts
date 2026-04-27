export type ZoneId = 'A' | 'B' | 'C' | 'AB' | 'AC' | 'BC' | 'ABC';

export interface Puzzle {
  id: number;
  date: string;
  themes: { A: string; B: string; C: string };
  solution: Record<ZoneId, string>;
}

export type PlacementMap = Partial<Record<ZoneId, string>>;
export type GameStatus = 'playing' | 'solved' | 'failed';

export type AttemptResult = Record<ZoneId, boolean>;

export interface HintState {
  // Words revealed by hints, with how many categories they belong to
  revealedWords: { word: string; categories: 1 | 2 | 3 }[];
  hintsUsed: number;
}

export interface GameState {
  puzzleId: number;
  placements: PlacementMap;
  selectedZone: ZoneId | null;
  status: GameStatus;
  themesRevealed: boolean;
  mistakesUsed: number;
  hints: HintState;
  attempts: AttemptResult[];
}
