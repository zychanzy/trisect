import { useState, useEffect, useMemo } from "react";
import type { GameState, ZoneId, PlacementMap } from "../types";
import {
  getTodaysPuzzle,
  checkSolution,
  isComplete,
} from "../utils/puzzleEngine";
import { loadState, saveState } from "../utils/storage";

const puzzle = getTodaysPuzzle();

const MAX_MISTAKES = 4;

function makeInitialState(puzzleId: number): GameState {
  return {
    puzzleId,
    placements: {},
    selectedZone: null,
    status: "playing",
    themesRevealed: false,
    mistakesUsed: 0,
    hints: {
      revealedWords: [],
      hintsUsed: 0,
    },
  };
}

function initState(): GameState {
  const saved = loadState();
  if (saved && saved.puzzleId === puzzle.id) {
    const initial = makeInitialState(puzzle.id);
    let migrated = saved;
    if (!saved.hints || !("revealedWords" in saved.hints)) {
      migrated = { ...migrated, hints: initial.hints };
    }
    if (typeof saved.mistakesUsed !== "number") {
      migrated = { ...migrated, mistakesUsed: 0 };
    }
    return migrated;
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

const THEME_KEYS: ("A" | "B" | "C")[] = ["A", "B", "C"];
const THEME_STAGGER_MS = 1000; // delay between each theme label
const WORD_FILL_MS = 500;      // delay between each word filling in on fail

export function useTrisect() {
  const [state, setState] = useState<GameState>(initState);
  const [shaking, setShaking] = useState(false);
  const [swappingZones, setSwappingZones] = useState<[ZoneId, ZoneId] | null>(
    null,
  );
  const [swapGeneration, setSwapGeneration] = useState(0);
  // ms until the post-solve celebration (TRISECTED headline) should begin
  const [celebrationDelayMs, setCelebrationDelayMs] = useState(0);
  // Which theme labels are visible in the Venn diagram (staggered reveal)
  const [revealedThemeKeys, setRevealedThemeKeys] = useState<Set<"A" | "B" | "C">>(
    () => (initState().themesRevealed ? new Set(THEME_KEYS) : new Set()),
  );
  // Whether zone tile theme labels are allowed to show (after words are fully in place)
  const [tileLabelsReady, setTileLabelsReady] = useState(
    () => initState().themesRevealed,
  );

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

  function staggerThemeReveal(afterMs = 0) {
    THEME_KEYS.forEach((key, i) => {
      setTimeout(() => {
        setRevealedThemeKeys((prev) => new Set([...prev, key]));
      }, afterMs + i * THEME_STAGGER_MS);
    });
  }

  function submitSolution() {
    if (state.status !== "playing") return;
    if (!allPlaced) return;
    const perm = checkSolution(state.placements, puzzle);
    if (!perm) {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      const nextMistakes = state.mistakesUsed + 1;
      if (nextMistakes >= MAX_MISTAKES) {
        // Lock board immediately, clear placements so words drip in
        setState((s) => ({
          ...s,
          mistakesUsed: nextMistakes,
          placements: {},
          themesRevealed: false,
          status: "failed",
          hints: makeInitialState(puzzle.id).hints,
        }));
        // Stagger theme labels: A at 0s, B at 1s, C at 2s
        staggerThemeReveal(0);
        // Fill words one by one starting after all 3 themes have appeared
        const wordFillStart = THEME_KEYS.length * THEME_STAGGER_MS;
        ZONES.forEach((zone, i) => {
          setTimeout(() => {
            setState((s) => ({
              ...s,
              placements: { ...s.placements, [zone]: puzzle.solution[zone] },
            }));
          }, wordFillStart + i * WORD_FILL_MS);
        });
        // Show tile theme labels + mark persisted after last word is in
        const allWordsInMs = wordFillStart + (ZONES.length - 1) * WORD_FILL_MS + 50;
        setTimeout(() => {
          setTileLabelsReady(true);
          setState((s) => ({ ...s, themesRevealed: true }));
        }, allWordsInMs);
      } else {
        setState((s) => ({ ...s, mistakesUsed: nextMistakes }));
      }
      return;
    }

    // Lock the board, keep player's layout — themes stagger first, then words swap into place.
    setState((s) => ({
      ...s,
      themesRevealed: false,
      status: "solved",
      hints: makeInitialState(puzzle.id).hints,
    }));

    // Stagger theme labels: A at 0s, B at 1s, C at 2s
    staggerThemeReveal(0);

    // Word swaps begin after all 3 themes have appeared
    const swapStart = THEME_KEYS.length * THEME_STAGGER_MS;

    const startPlacements = { ...state.placements } as Record<ZoneId, string>;
    const swaps = computeSwapSequence(startPlacements, puzzle.solution);

    const SWAP_DURATION = 600;
    const SWAP_GAP = 250;
    const STEP = SWAP_DURATION + SWAP_GAP;

    let working = { ...startPlacements };
    const snapshots: Record<ZoneId, string>[] = swaps.map(([zA, zB]) => {
      [working[zA], working[zB]] = [working[zB], working[zA]];
      return { ...working };
    });

    // Tell StatusBar to wait for theme stagger + swaps before celebration.
    const totalSwapMs =
      swaps.length === 0 ? 0 : (swaps.length - 1) * STEP + SWAP_DURATION + 200;
    const celebrationDelay = swapStart + totalSwapMs;
    setCelebrationDelayMs(celebrationDelay);

    // Show tile theme labels + mark persisted after all swaps settle
    setTimeout(() => {
      setTileLabelsReady(true);
      setState((s) => ({ ...s, themesRevealed: true }));
    }, celebrationDelay);

    swaps.forEach(([zA, zB], i) => {
      setTimeout(() => {
        setSwapGeneration((g) => g + 1);
        setSwappingZones([zA, zB]);
      }, swapStart + i * STEP);

      setTimeout(() => {
        setState((s) => ({ ...s, placements: snapshots[i] }));
      }, swapStart + i * STEP + SWAP_DURATION / 2);

      setTimeout(() => setSwappingZones(null), swapStart + i * STEP + SWAP_DURATION);
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
    setState((s) => ({
      ...makeInitialState(puzzle.id),
      hints: s.hints,
    }));
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
    revealedThemeKeys,
    tileLabelsReady,
    selectZone,
    placeWord,
    removeWord,
    dropWordIntoZone,
    submitSolution,
    useHint,
    reset,
  };
}
