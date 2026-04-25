import { useTrisect } from './hooks/useTrisect';
import { ZoneGrid } from './components/ZoneGrid';
import { WordBank } from './components/WordBank';
import { StatusBar } from './components/StatusBar';
import { THEME_COLORS } from './data/zones';
import type { Puzzle } from './types';

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function DecorativeVenn({ themesRevealed, themes }: { themesRevealed: boolean; themes: Puzzle['themes'] }) {
  const r = 42;
  const cA = { cx: 62,  cy: 54 };
  const cB = { cx: 98,  cy: 54 };
  const cC = { cx: 80,  cy: 87 };

  return (
    <svg
      viewBox="0 0 160 132"
      width="160"
      height="132"
      style={{ display: 'block', overflow: 'visible', flexShrink: 0 }}
    >
      <circle cx={cA.cx} cy={cA.cy} r={r} fill={THEME_COLORS.A} fillOpacity={0.10} stroke={THEME_COLORS.A} strokeWidth="1.2" strokeOpacity={0.4} />
      <circle cx={cB.cx} cy={cB.cy} r={r} fill={THEME_COLORS.B} fillOpacity={0.10} stroke={THEME_COLORS.B} strokeWidth="1.2" strokeOpacity={0.4} />
      <circle cx={cC.cx} cy={cC.cy} r={r} fill={THEME_COLORS.C} fillOpacity={0.10} stroke={THEME_COLORS.C} strokeWidth="1.2" strokeOpacity={0.4} />

      <text x={36} y={48} textAnchor="middle" fontSize="10" fontFamily='"DM Sans",sans-serif' fontWeight="600" fill={THEME_COLORS.A} fillOpacity={0.8}>
        {themesRevealed ? themes.A : 'A'}
      </text>
      <text x={124} y={48} textAnchor="middle" fontSize="10" fontFamily='"DM Sans",sans-serif' fontWeight="600" fill={THEME_COLORS.B} fillOpacity={0.8}>
        {themesRevealed ? themes.B : 'B'}
      </text>
      <text x={80} y={118} textAnchor="middle" fontSize="10" fontFamily='"DM Sans",sans-serif' fontWeight="600" fill={THEME_COLORS.C} fillOpacity={0.8}>
        {themesRevealed ? themes.C : 'C'}
      </text>
    </svg>
  );
}

export function TrisectApp() {
  const {
    puzzle,
    state,
    bankWords,
    allPlaced,
    shaking,
    selectZone,
    placeWord,
    removeWord,
    submitSolution,
    revealThemes,
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
        <DecorativeVenn themesRevealed={state.themesRevealed} themes={puzzle.themes} />
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
    </div>
  );
}
