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
  themesRevealed,
  themes,
  selectedZone,
  hoveredZone,
}: {
  themesRevealed: boolean;
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
    if (glowSig !== "") setAnimKey(k => k + 1);
  }

  return (
    <svg
      viewBox="0 0 160 132"
      width="240"
      height="198"
      className="block overflow-visible shrink-0"
    >
      {!glowA && <circle cx={cA.cx} cy={cA.cy} r={r} fill={THEME_COLORS.A} fillOpacity={0.38} />}
      {!glowB && <circle cx={cB.cx} cy={cB.cy} r={r} fill={THEME_COLORS.B} fillOpacity={0.38} />}
      {!glowC && <circle cx={cC.cx} cy={cC.cy} r={r} fill={THEME_COLORS.C} fillOpacity={0.38} />}

      {anyGlow && (
        <g key={animKey}>
          {glowA && <circle cx={cA.cx} cy={cA.cy} r={r} fill={THEME_COLORS.A} fillOpacity={0.72} className="venn-circle-glow" />}
          {glowB && <circle cx={cB.cx} cy={cB.cy} r={r} fill={THEME_COLORS.B} fillOpacity={0.72} className="venn-circle-glow" />}
          {glowC && <circle cx={cC.cx} cy={cC.cy} r={r} fill={THEME_COLORS.C} fillOpacity={0.72} className="venn-circle-glow" />}
        </g>
      )}

      {themesRevealed && (
        <>
          <text
            x={36}
            y={48}
            textAnchor="middle"
            fontSize="10"
            fontFamily='"DM Sans",sans-serif'
            fontWeight="600"
            fill={THEME_COLORS.A}
            fillOpacity={0.9}
          >
            {themes.A}
          </text>
          <text
            x={124}
            y={48}
            textAnchor="middle"
            fontSize="10"
            fontFamily='"DM Sans",sans-serif'
            fontWeight="600"
            fill={THEME_COLORS.B}
            fillOpacity={0.9}
          >
            {themes.B}
          </text>
          <text
            x={80}
            y={118}
            textAnchor="middle"
            fontSize="10"
            fontFamily='"DM Sans",sans-serif'
            fontWeight="600"
            fill={THEME_COLORS.C}
            fillOpacity={0.9}
          >
            {themes.C}
          </text>
        </>
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
  } = useTrisect();

  const { touchTargetZone } = useDrag();
  const [tileHoveredZone, setTileHoveredZone] = useState<ZoneId | null>(null);
  const isGameOver = state.status !== "playing";

  return (
    <div className="animate-fade-in-up w-full flex flex-col font-sans">
      <DragGhost />

      {/* Top nav — full width */}
      <GameToolbar title="Trisect" date={formatDate(localDateString())} />

      <div className="w-full max-w-[390px] mx-auto pb-[52px] flex flex-col">

      {/* Decorative Venn + instruction */}
      <div className="px-5 flex flex-col items-center gap-3 mb-6">
        <DecorativeVenn
          themesRevealed={state.themesRevealed}
          themes={puzzle.themes}
          selectedZone={state.selectedZone}
          hoveredZone={touchTargetZone ?? tileHoveredZone}
        />
        <p className="text-[12px] text-stone-800 leading-[1.3] tracking-[0.01em] text-center m-0">
          Sort each word into its category.
          <br />
          Some words belong to more than one.
        </p>
      </div>

      <div className="px-5">
        {/* Zone grid */}
        <ZoneGrid
          placements={state.placements}
          selectedZone={state.selectedZone}
          themesRevealed={state.themesRevealed}
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
            words={bankWords}
            onWordClick={placeWord}
            hasSelectedZone={state.selectedZone !== null}
            isDisabled={isGameOver}
          />
        )}

        {/* Status / actions */}
        <StatusBar
          status={state.status}
          allPlaced={allPlaced}
          onSubmit={submitSolution}
          onReveal={revealThemes}
        />

        {import.meta.env.DEV && (
          <div className="text-center mt-6">
            <button
              onClick={reset}
              className="text-[11px] text-stone-500 bg-transparent border border-stone-300 rounded-md px-[10px] py-1 cursor-pointer tracking-[0.05em]"
            >
              ↺ reset puzzle
            </button>
          </div>
        )}
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
