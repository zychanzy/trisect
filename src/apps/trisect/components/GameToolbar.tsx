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
  { number: 1, text: "Look for a word that could belong to two categories at once." },
  { number: 2, text: "One zone contains only words that appear in all three circles." },
  { number: 3, text: "Start with the zones you're most confident about first." },
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

const toolbarBtnClass =
  "flex items-center gap-[6px] px-[14px] py-[6px] rounded-full border border-stone-300 bg-stone-100 text-stone-900 text-[12px] font-sans font-medium tracking-[0.01em] cursor-pointer transition-[background,border-color] duration-150 select-none hover:bg-stone-200 hover:border-stone-500";

function ToolbarButton({
  onClick,
  children,
  label,
  asChild,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  label: string;
  asChild?: boolean;
}) {
  const Tag = asChild ? "div" : "button";
  return (
    <Tag onClick={onClick} aria-label={label} className={toolbarBtnClass}>
      {children}
    </Tag>
  );
}

export function GameToolbar() {
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);

  return (
    <>
      <div className="flex justify-center gap-[10px] mb-5">
        {/* Hint dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button aria-label="Hints" className={toolbarBtnClass}>
              <Lightbulb size={14} strokeWidth={1.8} />
              Hint
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
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

        {/* How to play button */}
        <ToolbarButton label="How to play" onClick={() => setHowToPlayOpen(true)}>
          <HelpCircle size={14} strokeWidth={1.8} />
          How to play
        </ToolbarButton>
      </div>

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
