import { useState, useEffect, useMemo } from "react";
import type { GameState, ZoneId, PlacementMap } from "../types";
import {
  getTodaysPuzzle,
  checkSolution,
  isComplete,
} from "../utils/puzzleEngine";
import { loadState, saveState } from "../utils/storage";

const puzzle = getTodaysPuzzle();

function makeInitialState(puzzleId: number): GameState {
  return {
    puzzleId,
    placements: {},
    selectedZone: null,
    status: "playing",
    themesRevealed: false,
    hints: {
      revealedWords: [],
      hintsUsed: 0,
    },
  };
}

function initState(): GameState {
  const saved = loadState();
  if (saved && saved.puzzleId === puzzle.id) {
    // Migrate saves that predate the hints field
    if (!saved.hints || !("revealedWords" in saved.hints)) {
      return { ...saved, hints: makeInitialState(puzzle.id).hints };
    }
    return saved;
  }
  return makeInitialState(puzzle.id);
}

const ZONES: ZoneId[] = ["A", "B", "C", "AB", "AC", "BC", "ABC"];

/** Decompose placements into a sequence of two-zone swaps that sorts them to match puzzle.solution. */
function computeSwapSequence(
  placements: Required<PlacementMap>,
  solution: Record<ZoneId, string>,
): [ZoneId, ZoneId][] {
  const current = { ...placements } as Record<ZoneId, string>;
  const swaps: [ZoneId, ZoneId][] = [];
  for (let i = 0; i < ZONES.length; i++) {
    const zone = ZONES[i];
    if (current[zone] === solution[zone]) continue;
    // Find which zone currently holds the word that belongs here
    const targetZone = ZONES.find((z) => current[z] === solution[zone])!;
    swaps.push([zone, targetZone]);
    // Apply the swap to current so next iterations see updated state
    [current[zone], current[targetZone]] = [current[targetZone], current[zone]];
  }
  return swaps;
}

export function useTrisect() {
  const [state, setState] = useState<GameState>(initState);
  const [shaking, setShaking] = useState(false);
  const [swappingZones, setSwappingZones] = useState<[ZoneId, ZoneId] | null>(
    null,
  );
  const [swapGeneration, setSwapGeneration] = useState(0);
  // ms until the post-solve celebration (TRISECTED headline) should begin
  const [celebrationDelayMs, setCelebrationDelayMs] = useState(0);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const allWords = useMemo(() => Object.values(puzzle.solution), []);

  const bankWords = useMemo(() => {
    const placed = new Set(Object.values(state.placements));
    return allWords.filter((w) => !placed.has(w));
  }, [allWords, state.placements]);

  const allPlaced = isComplete(state.placements);

  function selectZone(zoneId: ZoneId) {
    if (state.status !== "playing") return;
    setState((s) => ({
      ...s,
      selectedZone: s.selectedZone === zoneId ? null : zoneId,
    }));
  }

  function placeWord(word: string) {
    if (state.status !== "playing") return;
    if (!state.selectedZone) return;

    setState((s) => {
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
    if (state.status !== "playing") return;
    setState((s) => {
      const newPlacements = { ...s.placements };
      delete newPlacements[zoneId];
      return { ...s, placements: newPlacements, selectedZone: null };
    });
  }

  function submitSolution() {
    if (state.status !== "playing") return;
    if (!allPlaced) return;
    const perm = checkSolution(state.placements, puzzle);
    if (!perm) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }

    // Animate FROM the player's actual layout TO the canonical solution.
    // Theme labels appear at canonical positions, so the player sees their
    // words migrating step-by-step into the "right" cells.
    const startPlacements = { ...state.placements } as Record<ZoneId, string>;
    const swaps = computeSwapSequence(startPlacements, puzzle.solution);

    const SWAP_DURATION = 600;
    const SWAP_GAP = 250;
    const STEP = SWAP_DURATION + SWAP_GAP;

    // Snapshot that we mutate as we schedule each swap
    let working = { ...startPlacements };

    // Precompute the placement state after each swap so each setTimeout
    // closes over its own snapshot rather than a shared mutable reference.
    const snapshots: Record<ZoneId, string>[] = swaps.map(([zA, zB]) => {
      [working[zA], working[zB]] = [working[zB], working[zA]];
      return { ...working };
    });

    // Lock the board and reveal themes at their canonical positions.
    // Words stay in the player's original layout — they will swap into place.
    setState((s) => ({ ...s, themesRevealed: true, status: "solved" }));

    // Tell StatusBar to wait for swaps to finish before the headline plays.
    // Last swap finishes at (n-1)*STEP + SWAP_DURATION; add a small breath.
    const totalSwapMs =
      swaps.length === 0 ? 0 : (swaps.length - 1) * STEP + SWAP_DURATION + 200;
    setCelebrationDelayMs(totalSwapMs);

    // Already in canonical order — nothing to animate.
    if (swaps.length === 0) return;

    swaps.forEach(([zA, zB], i) => {
      // Increment generation so tiles re-trigger their CSS animation even if
      // the same zone is involved in back-to-back swaps
      setTimeout(() => {
        setSwapGeneration((g) => g + 1);
        setSwappingZones([zA, zB]);
      }, i * STEP);

      setTimeout(
        () => {
          setState((s) => ({ ...s, placements: snapshots[i] }));
        },
        i * STEP + SWAP_DURATION / 2,
      );

      setTimeout(() => setSwappingZones(null), i * STEP + SWAP_DURATION);
    });
  }

  function revealThemes() {
    if (state.status !== "playing") return;
    setState((s) => {
      const fullPlacements = { ...puzzle.solution, ...s.placements };
      return {
        ...s,
        placements: fullPlacements,
        themesRevealed: true,
        status: "revealed",
      };
    });
  }

  // Drop a word directly into a zone (from drag-and-drop, no selectedZone needed)
  function dropWordIntoZone(word: string, targetZone: ZoneId) {
    if (state.status !== "playing") return;
    setState((s) => {
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

  function useHint() {
    if (state.status !== "playing") return;
    const { hintsUsed } = state.hints;
    if (hintsUsed >= 3) return;

    // Hint 1: a word that belongs to exactly 1 category (pure zone: A, B, or C)
    // Hint 2: a word that belongs to exactly 2 categories (AB, AC, or BC)
    // Hint 3: the word that belongs to all 3 categories (ABC) - basically giving out the answer of the ABC word
    const categoryCount: Record<ZoneId, 1 | 2 | 3> = {
      A: 1,
      B: 1,
      C: 1,
      AB: 2,
      AC: 2,
      BC: 2,
      ABC: 3,
    };
    const targetCount = ([1, 2, 3] as const)[hintsUsed];
    const alreadyRevealed = new Set(
      state.hints.revealedWords.map((r) => r.word),
    );

    const zone = (Object.keys(puzzle.solution) as ZoneId[]).find(
      (z) =>
        categoryCount[z] === targetCount &&
        !alreadyRevealed.has(puzzle.solution[z]),
    );
    if (!zone) return;

    const word = puzzle.solution[zone];
    setState((s) => ({
      ...s,
      hints: {
        ...s.hints,
        revealedWords: [
          ...s.hints.revealedWords,
          { word, categories: targetCount },
        ],
        hintsUsed: hintsUsed + 1,
      },
    }));
  }

  function reset() {
    setState(makeInitialState(puzzle.id));
  }

  return {
    puzzle,
    state,
    allWords,
    bankWords,
    allPlaced,
    shaking,
    swappingZones,
    swapGeneration,
    celebrationDelayMs,
    selectZone,
    placeWord,
    removeWord,
    dropWordIntoZone,
    submitSolution,
    revealThemes,
    useHint,
    reset,
  };
}
