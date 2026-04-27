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

const EXAMPLE_WORDS = [
  {
    word: "Dog",
    dots: ["A"],
    label: "Land animal",
  },
  {
    word: "Turtle",
    dots: ["A", "B"],
    label: "Land + Sea animal",
  },
  {
    word: "Seagull",
    dots: ["A", "B", "C"],
    label: "Land + Sea + Sky animal",
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

export function GameToolbar({
  title,
  date,
  hints,
  onUseHint,
  isGameOver,
}: GameToolbarProps) {
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);

  const canUseHint = !isGameOver && hints.hintsUsed < 3;

  function hintLabel(index: number): string {
    const revealed = hints.revealedWords[index];
    if (revealed)
      return `${revealed.word} — ${revealed.categories} ${revealed.categories === 1 ? "category" : "categories"}`;
    return HINT_DESCRIPTIONS[index];
  }

  return (
    <>
      <nav className="w-full flex items-center justify-between px-5 py-3 border-b border-stone-300 mb-6">
        <div className="flex items-baseline gap-3">
          <span className="text-[22px] font-light tracking-[0.35em] uppercase text-ink leading-none">
            {title}
          </span>
          <span className="text-[13px] text-stone-700 tracking-[0.04em]">
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
                      style={{ background: used ? THEME_COLORS.A : "#a8a29e" }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={`leading-[1.4] text-[15px] ${used ? "text-stone-900" : isNext && canUseHint ? "text-ink font-medium" : "text-stone-400"}`}
                    >
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[20px] tracking-[0.01em] text-left">
              How to Play
            </DialogTitle>
            <DialogDescription className="text-[15px] leading-[1.2] text-stone-800 font-semibold text-left border-b pb-3">
              Sort each word into its category.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-4 text-[15px] leading-[1.6] text-stone-800">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.25rem 1fr",
                gap: "0.25rem 0",
                margin: 0,
              }}
            >
              <span>●</span>
              <span>There are three hidden categories.</span>
              <span>●</span>
              <span>
                Words that belong to two categories go in an overlap zone. There
                is one word that fits all three.
              </span>
            </div>

            <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 flex flex-col gap-2">
              <p className="m-0 text-[13px] font-semibold tracking-[0.08em] uppercase text-stone-800">
                Example
              </p>
              <p className="m-0 text-[15px] text-stone-700">
                If the themes are <strong>Land</strong>, <strong>Sea</strong>,
                and <strong>Sky</strong> animals:
              </p>
              <div className="flex flex-col gap-[6px] mt-1">
                {EXAMPLE_WORDS.map(({ word, dots, label }) => (
                  <div key={word} className="flex items-center gap-2">
                    <span className="flex items-center gap-[3px] shrink-0 w-[38px] justify-start">
                      {(["A", "B", "C"] as const)
                        .filter((zone) => dots.includes(zone))
                        .map((zone) => (
                          <span
                            key={zone}
                            className="w-[10px] h-[10px] rounded-full"
                            style={{ background: THEME_COLORS[zone] }}
                          />
                        ))}
                    </span>
                    <span className="text-[15px] text-stone-800">
                      <span className="font-medium inline-block w-[52px]">
                        {word}
                      </span>
                      {" → "}
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
