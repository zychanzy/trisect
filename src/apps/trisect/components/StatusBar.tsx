import type { GameStatus } from '../types';

interface StatusBarProps {
  status: GameStatus;
  allPlaced: boolean;
  onSubmit: () => void;
  onReveal: () => void;
}

export function StatusBar({ status, allPlaced, onSubmit, onReveal }: StatusBarProps) {
  if (status === 'solved') {
    return (
      <div className="mt-6 text-center">
        <p className="text-green-600 font-semibold text-lg">You solved it!</p>
        <p className="text-sm text-gray-400 mt-1">Come back tomorrow for a new puzzle.</p>
      </div>
    );
  }

  if (status === 'revealed') {
    return (
      <div className="mt-6 text-center">
        <p className="text-gray-600 font-medium">Themes revealed.</p>
        <p className="text-sm text-gray-400 mt-1">Try again tomorrow!</p>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <button
        onClick={onSubmit}
        disabled={!allPlaced}
        className={`
          w-full max-w-xs py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
          ${allPlaced
            ? 'bg-gray-900 text-white hover:bg-gray-700 active:scale-95 cursor-pointer'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        Check solution
      </button>
      <button
        onClick={onReveal}
        className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 cursor-pointer"
      >
        Reveal themes
      </button>
    </div>
  );
}
