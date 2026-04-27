import { useEffect, useState } from "react";
import { Share2, Check } from "lucide-react";
import type { GameStatus, AttemptResult, ZoneId } from "../types";

const MAX_MISTAKES = 4;
const ZONES_ORDERED: ZoneId[] = ["A", "B", "C", "AB", "AC", "BC", "ABC"];

function buildShareText(
  puzzleId: number,
  status: GameStatus,
  attempts: AttemptResult[],
): string {
  const score = status === "solved" ? `${attempts.length}/${MAX_MISTAKES}` : `X/${MAX_MISTAKES}`;
  const rows = attempts
    .map((attempt) =>
      ZONES_ORDERED.map((z) => (attempt[z] ? "🟩" : "🟥")).join(""),
    )
    .join("\n");
  return `Trisect ${puzzleId} ${score}\n\n${rows}`;
}

interface StatusBarProps {
  status: GameStatus;
  allPlaced: boolean;
  mistakesUsed: number;
  attempts: AttemptResult[];
  puzzleId: number;
  onSubmit: () => void;
  /** Wait this many ms after `solved` before the celebration plays. */
  celebrationDelayMs?: number;
  /** Wait this many ms after `failed` before the failure message appears. */
  failedDelayMs?: number;
}

export function StatusBar({
  status,
  allPlaced,
  mistakesUsed,
  attempts,
  puzzleId,
  onSubmit,
  celebrationDelayMs = 0,
  failedDelayMs = 0,
}: StatusBarProps) {
  const [celebrate, setCelebrate] = useState(false);
  const [showBetterLuck, setShowBetterLuck] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const text = buildShareText(puzzleId, status, attempts);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  useEffect(() => {
    if (status !== "solved") {
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

  useEffect(() => {
    if (status !== "failed") {
      setShowBetterLuck(false);
      setShowThanks(false);
      return;
    }
    const id1 = setTimeout(() => setShowBetterLuck(true), failedDelayMs);
    const id2 = setTimeout(() => setShowThanks(true), failedDelayMs + 600);
    return () => { clearTimeout(id1); clearTimeout(id2); };
  }, [status, failedDelayMs]);

  if (status === "solved") {
    const word = "TRISECTED";
    const letterColors = [
      "#3D9E7F",
      "#3D9E7F",
      "#3D9E7F",
      "#7060D0",
      "#7060D0",
      "#7060D0",
      "#C85836",
      "#C85836",
      "#C85836",
    ];
    return (
      <div className="mt-8 text-center flex flex-col items-center gap-4" style={{ minHeight: 88 }}>
        {celebrate && (
          <>
            <div className="relative inline-block overflow-hidden px-2 py-1">
              <span className="trisected-sheen" aria-hidden="true" />
              <p
                aria-label={word}
                className="relative text-[26px] font-extralight tracking-wide2 uppercase font-sans m-0"
              >
                {word.split("").map((ch, i) => (
                  <span
                    key={i}
                    className="trisected-letter"
                    style={{
                      animationDelay: `${i * 80}ms`,
                      color: letterColors[i],
                    }}
                  >
                    {ch}
                  </span>
                ))}
              </p>
            </div>
            <p className="trisected-subtitle text-[15px] text-stone-600 tracking-[0.03em] font-sans">
              Congratulations, return tomorrow for a new puzzle!
            </p>
            <button
              onClick={handleShare}
              className="trisected-subtitle flex items-center gap-2 px-5 py-[10px] rounded-full bg-stone-900 text-parchment text-[14px] font-semibold tracking-wide cursor-pointer border-none hover:bg-stone-700 transition-colors duration-150"
            >
              {copied ? <Check size={15} /> : <Share2 size={15} />}
              {copied ? "Copied!" : "Share"}
            </button>
          </>
        )}
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="mt-8 text-center flex flex-col items-center gap-2">
        {showBetterLuck && (
          <p className="animate-fade-in-up text-[17px] font-semibold text-stone-800 tracking-[0.01em] font-sans">
            Better luck next time!
          </p>
        )}
        {showThanks && (
          <p className="animate-fade-in-up text-[14px] text-stone-700 tracking-[0.03em] font-sans">
            Thanks for playing, return tomorrow for a new puzzle!
          </p>
        )}
        {showThanks && (
          <button
            onClick={handleShare}
            className="animate-fade-in-up flex items-center gap-2 px-5 py-[10px] rounded-full bg-stone-900 text-parchment text-[14px] font-semibold tracking-wide cursor-pointer border-none hover:bg-stone-700 transition-colors duration-150 mt-1"
          >
            {copied ? <Check size={15} /> : <Share2 size={15} />}
            {copied ? "Copied!" : "Share"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-7 flex flex-col items-center gap-[13px]">
      <button
        onClick={onSubmit}
        disabled={!allPlaced}
        className={[
          "w-full py-[13px] rounded-full border-none text-[15px] font-semibold tracking-wide3 uppercase",
          "font-sans transition-all duration-[180ms] ease-in-out outline-none",
          allPlaced
            ? "bg-stone-900 text-parchment cursor-pointer hover:bg-stone-800"
            : "bg-stone-300 text-stone-600 cursor-not-allowed",
        ].join(" ")}
      >
        Check solution
      </button>

      {/* Mistake pips */}
      <div
        className="flex items-center gap-[6px]"
        aria-label={`${mistakesUsed} of ${MAX_MISTAKES} mistakes used`}
      >
        <span className="text-[13px] text-stone-900 tracking-[0.03em] font-sans mr-1">
          Mistakes remaining:
        </span>
        {Array.from({ length: MAX_MISTAKES - mistakesUsed }).map((_, i) => (
          <span
            key={i}
            className="w-[10px] h-[10px] rounded-full bg-stone-900"
          />
        ))}
      </div>
    </div>
  );
}
