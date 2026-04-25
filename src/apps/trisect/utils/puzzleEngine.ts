import { PUZZLES, PUZZLE_EPOCH } from '../data/puzzles';
import type { Puzzle, PlacementMap, ZoneId } from '../types';
import { ZONE_META } from '../data/zones';

function daysBetween(epochStr: string, todayStr: string): number {
  const epoch = new Date(epochStr).getTime();
  const today = new Date(todayStr).getTime();
  return Math.floor((today - epoch) / (1000 * 60 * 60 * 24));
}

export function localDateString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getTodaysPuzzle(): Puzzle {
  const today = localDateString();
  const days = daysBetween(PUZZLE_EPOCH, today);
  const index = ((days % PUZZLES.length) + PUZZLES.length) % PUZZLES.length;
  return PUZZLES[index];
}

type ThemeLetter = 'A' | 'B' | 'C';
const PERMUTATIONS: [ThemeLetter, ThemeLetter, ThemeLetter][] = [
  ['A', 'B', 'C'],
  ['A', 'C', 'B'],
  ['B', 'A', 'C'],
  ['B', 'C', 'A'],
  ['C', 'A', 'B'],
  ['C', 'B', 'A'],
];

function remapZoneId(zoneId: ZoneId, perm: [ThemeLetter, ThemeLetter, ThemeLetter]): ZoneId {
  const orig: ThemeLetter[] = ['A', 'B', 'C'];
  const letters = ZONE_META[zoneId].themes.map(t => perm[orig.indexOf(t)]);
  return letters.sort().join('') as ZoneId;
}

export function checkSolution(placements: PlacementMap, puzzle: Puzzle): boolean {
  const zones: ZoneId[] = ['A', 'B', 'C', 'AB', 'AC', 'BC', 'ABC'];
  for (const z of zones) {
    if (!placements[z]) return false;
  }

  for (const perm of PERMUTATIONS) {
    const allMatch = zones.every(zoneId => {
      const remapped = remapZoneId(zoneId, perm);
      const playerWord = placements[zoneId]!;
      const solutionWord = puzzle.solution[remapped];
      return playerWord.toLowerCase() === solutionWord.toLowerCase();
    });
    if (allMatch) return true;
  }
  return false;
}

export function isComplete(placements: PlacementMap): boolean {
  const zones: ZoneId[] = ['A', 'B', 'C', 'AB', 'AC', 'BC', 'ABC'];
  return zones.every(z => !!placements[z]);
}
