import { useState, useEffect, useMemo } from 'react';
import type { GameState, ZoneId } from '../types';
import { getTodaysPuzzle, checkSolution, isComplete } from '../utils/puzzleEngine';
import { loadState, saveState } from '../utils/storage';

const puzzle = getTodaysPuzzle();

function makeInitialState(puzzleId: number): GameState {
  return {
    puzzleId,
    placements: {},
    selectedZone: null,
    status: 'playing',
    themesRevealed: false,
  };
}

function initState(): GameState {
  const saved = loadState();
  if (saved && saved.puzzleId === puzzle.id) return saved;
  return makeInitialState(puzzle.id);
}

export function useTrisect() {
  const [state, setState] = useState<GameState>(initState);
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const allWords = useMemo(() => Object.values(puzzle.solution), []);

  const bankWords = useMemo(() => {
    const placed = new Set(Object.values(state.placements));
    return allWords.filter(w => !placed.has(w));
  }, [allWords, state.placements]);

  const allPlaced = isComplete(state.placements);

  function selectZone(zoneId: ZoneId) {
    if (state.status !== 'playing') return;
    setState(s => ({
      ...s,
      selectedZone: s.selectedZone === zoneId ? null : zoneId,
    }));
  }

  function placeWord(word: string) {
    if (state.status !== 'playing') return;
    if (!state.selectedZone) return;

    setState(s => {
      const targetZone = s.selectedZone!;
      const newPlacements = { ...s.placements };

      for (const [z, w] of Object.entries(newPlacements)) {
        if (w === word) delete newPlacements[z as ZoneId];
      }

      newPlacements[targetZone] = word;

      return { ...s, placements: newPlacements, selectedZone: null };
    });
  }

  function removeWord(zoneId: ZoneId) {
    if (state.status !== 'playing') return;
    setState(s => {
      const newPlacements = { ...s.placements };
      delete newPlacements[zoneId];
      return { ...s, placements: newPlacements, selectedZone: null };
    });
  }

  function submitSolution() {
    if (state.status !== 'playing') return;
    if (!allPlaced) return;
    const correct = checkSolution(state.placements, puzzle);
    if (correct) {
      setState(s => ({ ...s, status: 'solved', themesRevealed: true }));
    } else {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  }

  function revealThemes() {
    if (state.status !== 'playing') return;
    setState(s => ({ ...s, themesRevealed: true, status: 'revealed' }));
  }

  // Drop a word directly into a zone (from drag-and-drop, no selectedZone needed)
  function dropWordIntoZone(word: string, targetZone: ZoneId) {
    if (state.status !== 'playing') return;
    setState(s => {
      const newPlacements = { ...s.placements };
      // Remove word from wherever it currently lives
      for (const [z, w] of Object.entries(newPlacements)) {
        if (w === word) delete newPlacements[z as ZoneId];
      }
      // Swap if target zone already has a word — put displaced word back to bank (delete it)
      newPlacements[targetZone] = word;
      return { ...s, placements: newPlacements, selectedZone: null };
    });
  }

  function reset() {
    setState(makeInitialState(puzzle.id));
  }

  return {
    puzzle,
    state,
    bankWords,
    allPlaced,
    shaking,
    selectZone,
    placeWord,
    removeWord,
    dropWordIntoZone,
    submitSolution,
    revealThemes,
    reset,
  };
}
