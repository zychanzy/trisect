import { useTrisect } from './hooks/useTrisect';
import { ZoneGrid } from './components/ZoneGrid';
import { WordBank } from './components/WordBank';
import { StatusBar } from './components/StatusBar';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function TrisectApp() {
  const {
    puzzle,
    state,
    bankWords,
    allPlaced,
    selectZone,
    placeWord,
    removeWord,
    submitSolution,
    revealThemes,
  } = useTrisect();

  const isGameOver = state.status !== 'playing';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Trisect</h1>
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(puzzle.date)}</p>
          <p className="text-sm text-gray-500 mt-2">
            Place each word in its Venn diagram zone.
          </p>
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
        />

        {/* Word bank */}
        <WordBank
          words={bankWords}
          onWordClick={placeWord}
          hasSelectedZone={state.selectedZone !== null}
          isDisabled={isGameOver}
        />

        {/* Status / actions */}
        <StatusBar
          status={state.status}
          allPlaced={allPlaced}
          onSubmit={submitSolution}
          onReveal={revealThemes}
        />
      </div>
    </div>
  );
}
