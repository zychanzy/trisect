import { useEffect, useState } from 'react';
import type { GameStatus } from '../types';

interface StatusBarProps {
  status: GameStatus;
  allPlaced: boolean;
  onSubmit: () => void;
  onReveal: () => void;
  /** Wait this many ms after `solved` before the celebration plays. */
  celebrationDelayMs?: number;
}

export function StatusBar({
  status,
  allPlaced,
  onSubmit,
  onReveal,
  celebrationDelayMs = 0,
}: StatusBarProps) {
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (status !== 'solved') {
      setCelebrate(false);
      return;
    }
    if (celebrationDelayMs <= 0) {
      setCelebrate(true);
      return;
    }
    const id = setTimeout(() => setCelebrate(true), celebrationDelayMs);
    return () => clearTimeout(id);
  }, [status, celebrationDelayMs]);

  if (status === 'solved') {
    const word = 'TRISECTED';
    return (
      <div className="mt-8 text-center" style={{ minHeight: 88 }}>
        {celebrate && (
          <>
            <div className="relative inline-block overflow-hidden px-2 py-1">
              <span className="trisected-sheen" aria-hidden="true" />
              <p
                aria-label={word}
                className="relative text-[26px] font-extralight tracking-wide2 uppercase text-ink font-sans m-0"
              >
                {word.split('').map((ch, i) => (
                  <span
                    key={i}
                    className="trisected-letter"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {ch}
                  </span>
                ))}
              </p>
            </div>
            <p className="trisected-subtitle text-[12px] text-stone-600 mt-[10px] tracking-[0.03em] font-sans">
              Return tomorrow for a new puzzle
            </p>
          </>
        )}
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
