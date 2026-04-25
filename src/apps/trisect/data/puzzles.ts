import type { Puzzle } from '../types';

export const PUZZLE_EPOCH = '2026-05-01';

export const PUZZLES: Puzzle[] = [
  {
    id: 0,
    date: '2026-05-01',
    themes: { A: 'Colors', B: 'Fruits', C: 'Flowers' },
    solution: {
      A: 'Scarlet', B: 'Mango',  C: 'Daisy',
      AB: 'Peach',  AC: 'Violet', BC: 'Plum',
      ABC: 'Rose',
    },
  },
  {
    id: 1,
    date: '2026-05-02',
    themes: { A: 'Metals', B: 'Colors', C: 'Music terms' },
    solution: {
      A: 'Iron',   B: 'Cyan',  C: 'Rest',
      AB: 'Gold',  AC: 'Lead', BC: 'Blue',
      ABC: 'Silver',
    },
  },
  {
    id: 2,
    date: '2026-05-03',
    themes: { A: 'Animals', B: 'Constellations', C: 'Myths' },
    solution: {
      A: 'Otter',    B: 'Vela',     C: 'Hydra',
      AB: 'Leo',     AC: 'Phoenix', BC: 'Orion',
      ABC: 'Pegasus',
    },
  },
];
