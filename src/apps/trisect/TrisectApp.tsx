import { useTrisect } from './hooks/useTrisect';
import { ZoneGrid } from './components/ZoneGrid';
import { WordBank } from './components/WordBank';
import { StatusBar } from './components/StatusBar';
import { DragProvider, useDrag } from './context/DragContext';
import { THEME_COLORS } from './data/zones';
import type { Puzzle, ZoneId } from './types';

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function DecorativeVenn({ themesRevealed, themes, selectedZone }: { themesRevealed: boolean; themes: Puzzle['themes']; selectedZone: ZoneId | null }) {
  const r = 42;
  const cA = { cx: 62,  cy: 54 };
  const cB = { cx: 98,  cy: 54 };
  const cC = { cx: 80,  cy: 87 };

  const sel = selectedZone ?? '';
  const glowA = sel.includes('A');
  const glowB = sel.includes('B');
  const glowC = sel.includes('C');

  return (
    <svg
      viewBox="0 0 160 132"
      width="160"
      height="132"
      style={{ display: 'block', overflow: 'visible', flexShrink: 0 }}
    >
      <circle cx={cA.cx} cy={cA.cy} r={r} fill={THEME_COLORS.A} fillOpacity={glowA ? 0.72 : 0.38} style={{ transition: 'fill-opacity 0.2s' }} />
      <circle cx={cB.cx} cy={cB.cy} r={r} fill={THEME_COLORS.B} fillOpacity={glowB ? 0.72 : 0.38} style={{ transition: 'fill-opacity 0.2s' }} />
      <circle cx={cC.cx} cy={cC.cy} r={r} fill={THEME_COLORS.C} fillOpacity={glowC ? 0.72 : 0.38} style={{ transition: 'fill-opacity 0.2s' }} />

      {themesRevealed && (
        <>
          <text x={36} y={48} textAnchor="middle" fontSize="10" fontFamily='"DM Sans",sans-serif' fontWeight="600" fill={THEME_COLORS.A} fillOpacity={0.9}>
            {themes.A}
          </text>
          <text x={124} y={48} textAnchor="middle" fontSize="10" fontFamily='"DM Sans",sans-serif' fontWeight="600" fill={THEME_COLORS.B} fillOpacity={0.9}>
            {themes.B}
          </text>
          <text x={80} y={118} textAnchor="middle" fontSize="10" fontFamily='"DM Sans",sans-serif' fontWeight="600" fill={THEME_COLORS.C} fillOpacity={0.9}>
            {themes.C}
          </text>
        </>
      )}
    </svg>
  );
}

// The floating ghost chip shown while touch-dragging
function DragGhost() {
  const { ghostRef } = useDrag();
  return (
    <div
      ref={ghostRef}
      style={{
        display: 'none',
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 9999,
        padding: '8px 18px',
        borderRadius: 100,
        background: '#1C1B19',
        color: '#F7F5F2',
        fontSize: 13,
        fontFamily: '"DM Sans", sans-serif',
        fontWeight: 500,
        letterSpacing: '0.01em',
        boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
        whiteSpace: 'nowrap',
        transform: 'rotate(-2deg)',
      }}
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

  const isGameOver = state.status !== 'playing';

  return (
    <div
      className="animate-fade-in-up"
      style={{
        width: '100%',
        maxWidth: 390,
        padding: '36px 20px 52px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"DM Sans", sans-serif',
      }}
    >
      <DragGhost />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 style={{
          fontSize: 24,
          fontWeight: 200,
          letterSpacing: '0.30em',
          textTransform: 'uppercase',
          color: '#1C1B19',
          margin: 0,
        }}>
          Trisect
        </h1>
        <p style={{ fontSize: 11, color: '#B5B1AA', marginTop: 5, letterSpacing: '0.05em' }}>
          {formatDate(puzzle.date)}
        </p>
      </div>

      {/* Decorative Venn + instruction */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 24,
      }}>
        <DecorativeVenn themesRevealed={state.themesRevealed} themes={puzzle.themes} selectedZone={state.selectedZone} />
        <div style={{ maxWidth: 140 }}>
          <p style={{ fontSize: 12, color: '#8A8880', lineHeight: 1.6, letterSpacing: '0.01em' }}>
            Place each word in the zone where it belongs — a single category, or where two or three overlap.
          </p>
        </div>
      </div>

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
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            onClick={reset}
            style={{
              fontSize: 11,
              color: '#B5B1AA',
              background: 'none',
              border: '1px solid #E0DDD8',
              borderRadius: 6,
              padding: '4px 10px',
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            ↺ reset puzzle
          </button>
        </div>
      )}
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
