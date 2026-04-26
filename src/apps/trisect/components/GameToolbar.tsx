import { useState } from "react";
import { Lightbulb, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { THEME_COLORS } from "../data/zones";
import type { HintState } from "../types";

const HINT_DESCRIPTIONS = [
  "Reveal a word that belongs to 1 category",
  "Reveal a word that belongs to 2 categories",
  "Reveal a word that belongs to 3 categories",
];

const HOW_TO_PLAY_STEPS = [
  {
    title: "Three categories",
    body: "Each puzzle has three hidden themes — A, B, and C — shown as overlapping circles.",
  },
  {
    title: "Place each word",
    body: "Tap a zone to select it, then tap a word to place it there. Words can only be placed in one zone.",
  },
  {
    title: "Overlaps matter",
    body: "Some words belong to two categories (e.g. AB, BC) or even all three (ABC). Pick the zone that best fits.",
  },
  {
    title: "Submit when ready",
    body: "Once all words are placed, hit Submit. Reveal Themes shows the category labels if you get stuck.",
  },
];

const iconBtnClass =
  "flex items-center justify-center w-10 h-10 rounded-full text-stone-700 hover:bg-stone-300 hover:text-ink transition-[background,color] duration-150 cursor-pointer border-none bg-transparent";

interface GameToolbarProps {
  title: string;
  date: string;
  hints: HintState;
  onUseHint: () => void;
  isGameOver: boolean;
}

export function GameToolbar({ title, date, hints, onUseHint, isGameOver }: GameToolbarProps) {
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);

  const canUseHint = !isGameOver && hints.hintsUsed < 3;

  function hintLabel(index: number): string {
    const revealed = hints.revealedWords[index];
    if (revealed) return `"${revealed.word}" — ${revealed.categories} ${revealed.categories === 1 ? 'category' : 'categories'}`;
    return HINT_DESCRIPTIONS[index];
  }

  return (
    <>
      <nav className="w-full flex items-center justify-between px-5 py-3 border-b border-stone-300 mb-6">
        <div className="flex items-baseline gap-3">
          <span className="text-[22px] font-light tracking-[0.35em] uppercase text-ink leading-none">
            {title}
          </span>
          <span className="text-[11px] text-stone-500 tracking-[0.04em]">
            {date}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Hint dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label="Hints" className={iconBtnClass}>
                <Lightbulb size={33} strokeWidth={1.3} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {HINT_DESCRIPTIONS.map((_, i) => {
                const used = i < hints.hintsUsed;
                const isNext = i === hints.hintsUsed;
                return (
                  <DropdownMenuItem
                    key={i}
                    disabled={used || !isNext || !canUseHint}
                    onClick={isNext && canUseHint ? onUseHint : undefined}
                    className="flex items-start gap-2 py-2 cursor-pointer"
                  >
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold shrink-0 mt-[1px] text-white"
                      style={{ background: used ? THEME_COLORS.A : '#a8a29e' }}
                    >
                      {i + 1}
                    </span>
                    <span className={`leading-[1.4] text-[13px] ${used ? 'text-stone-500 italic' : isNext && canUseHint ? 'text-ink font-medium' : 'text-stone-400'}`}>
                      {hintLabel(i)}
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* How to play */}
          <button
            aria-label="How to play"
            className={iconBtnClass}
            onClick={() => setHowToPlayOpen(true)}
          >
            <HelpCircle size={33} strokeWidth={1.3} />
          </button>
        </div>
      </nav>

      {/* How to play modal */}
      <Dialog open={howToPlayOpen} onOpenChange={setHowToPlayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[15px] tracking-[0.01em]">
              How to play Trisect
            </DialogTitle>
            <DialogDescription className="mt-1">
              Sort words into the three overlapping categories.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 flex flex-col gap-[14px]">
            {HOW_TO_PLAY_STEPS.map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full shrink-0 text-[11px] font-semibold text-parchment mt-[1px]"
                  style={{ background: Object.values(THEME_COLORS)[i % 3] }}
                >
                  {i + 1}
                </span>
                <div>
                  <p className="m-0 text-[13px] font-semibold text-ink leading-[1.4]">
                    {step.title}
                  </p>
                  <p className="mt-[2px] mb-0 text-[12px] text-stone-800 leading-[1.5]">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
