import { useState } from "react";
import { useTrisect } from "./hooks/useTrisect";
import { ZoneGrid } from "./components/ZoneGrid";
import { WordBank } from "./components/WordBank";
import { StatusBar } from "./components/StatusBar";
import { GameToolbar } from "./components/GameToolbar";
import { DragProvider, useDrag } from "./context/DragContext";
import { THEME_COLORS } from "./data/zones";
import { localDateString } from "./utils/puzzleEngine";
import type { Puzzle, ZoneId } from "./types";

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function DecorativeVenn({
  revealedThemeKeys,
  themes,
  selectedZone,
  hoveredZone,
}: {
  revealedThemeKeys: Set<"A" | "B" | "C">;
  themes: Puzzle["themes"];
  selectedZone: ZoneId | null;
  hoveredZone: ZoneId | null;
}) {
  const [animKey, setAnimKey] = useState(0);
  const [prevGlowSig, setPrevGlowSig] = useState("");

  const r = 42;
  const cA = { cx: 62, cy: 54 };
  const cB = { cx: 98, cy: 54 };
  const cC = { cx: 80, cy: 87 };

  const sel = hoveredZone ?? selectedZone ?? "";
  const glowA = sel.includes("A");
  const glowB = sel.includes("B");
  const glowC = sel.includes("C");
  const anyGlow = glowA || glowB || glowC;
  const glowSig = `${glowA ? "A" : ""}${glowB ? "B" : ""}${glowC ? "C" : ""}`;

  if (glowSig !== prevGlowSig) {
    setPrevGlowSig(glowSig);
    if (glowSig !== "") setAnimKey((k) => k + 1);
  }

  return (
    <svg
      viewBox="0 0 160 132"
      width="280"
      height="200"
      className="block overflow-visible shrink-0"
    >
      {!glowA && (
        <circle
          cx={cA.cx}
          cy={cA.cy}
          r={r}
          fill={THEME_COLORS.A}
          fillOpacity={0.38}
        />
      )}
      {!glowB && (
        <circle
          cx={cB.cx}
          cy={cB.cy}
          r={r}
          fill={THEME_COLORS.B}
          fillOpacity={0.38}
        />
      )}
      {!glowC && (
        <circle
          cx={cC.cx}
          cy={cC.cy}
          r={r}
          fill={THEME_COLORS.C}
          fillOpacity={0.38}
        />
      )}

      {anyGlow && (
        <g key={animKey}>
          {glowA && (
            <circle
              cx={cA.cx}
              cy={cA.cy}
              r={r}
              fill={THEME_COLORS.A}
              fillOpacity={0.72}
              className="venn-circle-glow"
            />
          )}
          {glowB && (
            <circle
              cx={cB.cx}
              cy={cB.cy}
              r={r}
              fill={THEME_COLORS.B}
              fillOpacity={0.72}
              className="venn-circle-glow"
            />
          )}
          {glowC && (
            <circle
              cx={cC.cx}
              cy={cC.cy}
              r={r}
              fill={THEME_COLORS.C}
              fillOpacity={0.72}
              className="venn-circle-glow"
            />
          )}
        </g>
      )}

      {revealedThemeKeys.has("A") && (
        <text
          x={36}
          y={48}
          textAnchor="middle"
          fontSize="11"
          fontFamily='"DM Sans",sans-serif'
          fontWeight="600"
          fill={THEME_COLORS.A}
          fillOpacity={0.9}
        >
          {themes.A}
        </text>
      )}
      {revealedThemeKeys.has("B") && (
        <text
          x={124}
          y={48}
          textAnchor="middle"
          fontSize="11"
          fontFamily='"DM Sans",sans-serif'
          fontWeight="600"
          fill={THEME_COLORS.B}
          fillOpacity={0.9}
        >
          {themes.B}
        </text>
      )}
      {revealedThemeKeys.has("C") && (
        <text
          x={80}
          y={118}
          textAnchor="middle"
          fontSize="11"
          fontFamily='"DM Sans",sans-serif'
          fontWeight="600"
          fill={THEME_COLORS.C}
          fillOpacity={0.9}
        >
          {themes.C}
        </text>
      )}
    </svg>
  );
}

function DragGhost() {
  const { ghostRef } = useDrag();
  return (
    <div
      ref={ghostRef}
      className="hidden fixed pointer-events-none z-[9999] px-[18px] py-2 rounded-full bg-ink text-parchment text-[13px] font-medium tracking-[0.01em] shadow-[0_4px_16px_rgba(0,0,0,0.22)] whitespace-nowrap -rotate-2"
    />
  );
}

function TrisectInner() {
  const {
    puzzle,
    state,
    allWords,
    allPlaced,
    shaking,
    swappingZones,
    swapGeneration,
    celebrationDelayMs,
    failedDelayMs,
    revealedThemeKeys,
    tileLabelsReady,
    selectZone,
    placeWord,
    removeWord,
    dropWordIntoZone,
    submitSolution,
    useHint,
    reset,
  } = useTrisect();

  const { touchTargetZone } = useDrag();
  const [tileHoveredZone, setTileHoveredZone] = useState<ZoneId | null>(null);
  const isGameOver = state.status !== "playing";

  return (
    <div className="animate-fade-in-up w-full flex flex-col font-sans">
      <DragGhost />

      {/* Top nav — full width */}
      <GameToolbar
        title="Trisect"
        date={formatDate(localDateString())}
        hints={state.hints}
        onUseHint={useHint}
        isGameOver={isGameOver}
      />

      <div className="w-full max-w-[390px] sm:max-w-[480px] mx-auto pb-[52px] flex flex-col">
        {/* Decorative Venn + instruction */}
        <div className="px-1 sm:px-5 flex flex-col items-center gap-3 mb-6">
          <DecorativeVenn
            revealedThemeKeys={revealedThemeKeys}
            themes={puzzle.themes}
            selectedZone={state.selectedZone}
            hoveredZone={touchTargetZone ?? tileHoveredZone}
          />
        </div>

        <div className="px-1 sm:px-5">
          {/* Zone grid */}
          <ZoneGrid
            placements={state.placements}
            selectedZone={state.selectedZone}
            tileLabelsReady={tileLabelsReady}
            swappingZones={swappingZones}
            swapGeneration={swapGeneration}
            puzzle={puzzle}
            onSelectZone={selectZone}
            onRemoveWord={removeWord}
            onDropWord={dropWordIntoZone}
            isDisabled={isGameOver}
            shaking={shaking}
            onTileHover={setTileHoveredZone}
          />

          {/* Word bank */}
          {!isGameOver && (
            <WordBank
              allWords={allWords}
              placedWords={new Set(Object.values(state.placements))}
              onWordClick={placeWord}
              onReturnWord={(word) => {
                const zoneId = (
                  Object.entries(state.placements) as [
                    import("./types").ZoneId,
                    string,
                  ][]
                ).find(([, w]) => w === word)?.[0];
                if (zoneId) removeWord(zoneId);
              }}
              hasSelectedZone={state.selectedZone !== null}
              isDisabled={isGameOver}
              hints={state.hints}
            />
          )}

          {/* Status / actions */}
          <StatusBar
            status={state.status}
            allPlaced={allPlaced}
            mistakesUsed={state.mistakesUsed}
            attempts={state.attempts}
            puzzleId={puzzle.id}
            onSubmit={submitSolution}
            celebrationDelayMs={celebrationDelayMs}
            failedDelayMs={failedDelayMs}
          />

          {!isGameOver && (
            <div className="text-center mt-4">
              <button
                onClick={reset}
                className="text-[15px] text-stone-600 bg-transparent border border-stone-300 rounded-md px-[10px] py-1 cursor-pointer tracking-[0.05em] hover:text-stone-900 hover:border-stone-500 hover:bg-stone-50 transition-colors duration-150"
              >
                ↺ reset puzzle
              </button>
            </div>
          )}
          {/* <div className="text-center mt-4">
            <button
              onClick={reset}
              className="text-[15px] text-stone-600 bg-transparent border border-stone-300 rounded-md px-[10px] py-1 cursor-pointer tracking-[0.05em] hover:text-stone-900 hover:border-stone-500 hover:bg-stone-50 transition-colors duration-150"
            >
              ↺ reset puzzle
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export function TrisectApp() {
  return (
    <DragProvider>
      <TrisectInner />
    </DragProvider>
  );
}
