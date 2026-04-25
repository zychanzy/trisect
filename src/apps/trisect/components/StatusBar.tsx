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
      <div className="animate-fade-in-up mt-8 text-center">
        <p className="text-[22px] font-extralight tracking-wide2 uppercase text-ink font-sans">
          Trisected
        </p>
        <p className="text-[12px] text-stone-600 mt-[6px] tracking-[0.03em] font-sans">
          Return tomorrow for a new puzzle
        </p>
      </div>
    );
  }

  if (status === 'revealed') {
    return (
      <div className="animate-fade-in-up mt-8 text-center">
        <p className="text-[13px] font-normal text-stone-800 tracking-[0.03em] font-sans">
          Themes revealed — try again tomorrow
        </p>
      </div>
    );
  }

  return (
    <div className="mt-7 flex flex-col items-center gap-[13px]">
      <button
        onClick={onSubmit}
        disabled={!allPlaced}
        className={[
          'w-full py-[13px] rounded-full border-none text-[12px] font-semibold tracking-wide3 uppercase',
          'font-sans transition-all duration-[180ms] ease-in-out outline-none',
          allPlaced
            ? 'bg-ink text-parchment cursor-pointer hover:bg-[#333]'
            : 'bg-stone-300 text-stone-600 cursor-not-allowed',
        ].join(' ')}
      >
        Check solution
      </button>

      <button
        onClick={onReveal}
        className="bg-transparent border-none text-[11.5px] text-stone-500 cursor-pointer font-sans tracking-[0.04em] underline underline-offset-[3px] transition-colors duration-150 outline-none hover:text-stone-800"
      >
        Reveal themes
      </button>
    </div>
  );
}
