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

const HINTS = [
  {
    number: 1,
    text: "Look for a word that could belong to two categories at once.",
  },
  {
    number: 2,
    text: "One zone contains only words that appear in all three circles.",
  },
  {
    number: 3,
    text: "Start with the zones you're most confident about first.",
  },
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
  "flex items-center justify-center w-8 h-8 rounded-full text-stone-600 hover:bg-stone-200 hover:text-ink transition-[background,color] duration-150 cursor-pointer border-none bg-transparent";

interface GameToolbarProps {
  title: string;
  date: string;
}

export function GameToolbar({ title, date }: GameToolbarProps) {
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);

  return (
    <>
      <nav className="w-full flex items-center justify-between px-5 py-3 border-b border-stone-300 mb-6">
        {/* Left: title + date on the same row */}
        <div className="flex items-baseline gap-3">
          <span className="text-[22px] font-extralight tracking-[0.35em] uppercase text-ink leading-none">
            {title}
          </span>
          <span className="text-[11px] text-stone-500 tracking-[0.04em]">
            {date}
          </span>
        </div>

        {/* Right: icon buttons */}
        <div className="flex items-center gap-1">
          {/* Hint dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label="Hints" className={iconBtnClass}>
                <Lightbulb size={26} strokeWidth={1.8} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {HINTS.map((hint) => (
                <DropdownMenuItem key={hint.number} disabled>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-stone-200 text-stone-800 text-[10px] font-semibold shrink-0 mt-[1px]">
                    {hint.number}
                  </span>
                  <span className="text-ink leading-[1.4]">{hint.text}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* How to play */}
          <button
            aria-label="How to play"
            className={iconBtnClass}
            onClick={() => setHowToPlayOpen(true)}
          >
            <HelpCircle size={26} strokeWidth={1.8} />
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
