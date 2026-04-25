import type { ZoneId } from '../types';

export interface ZoneMeta {
  id: ZoneId;
  themes: ('A' | 'B' | 'C')[];
}

export const ZONE_META: Record<ZoneId, ZoneMeta> = {
  A:   { id: 'A',   themes: ['A'] },
  B:   { id: 'B',   themes: ['B'] },
  C:   { id: 'C',   themes: ['C'] },
  AB:  { id: 'AB',  themes: ['A', 'B'] },
  AC:  { id: 'AC',  themes: ['A', 'C'] },
  BC:  { id: 'BC',  themes: ['B', 'C'] },
  ABC: { id: 'ABC', themes: ['A', 'B', 'C'] },
};

export const THEME_COLORS = {
  A: '#3D9E7F',
  B: '#7060D0',
  C: '#C85836',
} as const;

export interface GridCell { zone: ZoneId; row: number; col: number }

export const GRID_CELLS: GridCell[] = [
  { zone: 'A',   row: 0, col: 0 },
  { zone: 'AB',  row: 0, col: 1 },
  { zone: 'B',   row: 0, col: 2 },
  { zone: 'AC',  row: 1, col: 0 },
  { zone: 'ABC', row: 1, col: 1 },
  { zone: 'BC',  row: 1, col: 2 },
  { zone: 'C',   row: 2, col: 1 },
];
