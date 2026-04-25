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
    <Tag
      onClick={onClick}
      aria-label={label}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 100,
        border: "1px solid #E5E2DC",
        background: "#F7F5F2",
        color: "#666360",
        fontSize: 12,
        fontFamily: '"DM Sans", sans-serif',
        fontWeight: 500,
        letterSpacing: "0.01em",
        cursor: "pointer",
        transition: "background 0.15s, border-color 0.15s",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#F0EDE8";
        (e.currentTarget as HTMLElement).style.borderColor = "#C0BCB6";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "#F7F5F2";
        (e.currentTarget as HTMLElement).style.borderColor = "#E5E2DC";
      }}
    >
      {children}
    </Tag>
  );
}

export function GameToolbar() {
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {/* Hint dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Hints"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 100,
                border: "1px solid #E5E2DC",
                background: "#F7F5F2",
                color: "#666360",
                fontSize: 12,
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 500,
                letterSpacing: "0.01em",
                cursor: "pointer",
                transition: "background 0.15s, border-color 0.15s",
              }}
            >
              <Lightbulb size={14} strokeWidth={1.8} />
              Hint
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {HINTS.map((hint) => (
              <DropdownMenuItem key={hint.number} disabled>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#F0EDE8",
                    color: "#8A8880",
                    fontSize: 10,
                    fontWeight: 600,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {hint.number}
                </span>
                <span style={{ color: "#1C1B19", lineHeight: 1.4 }}>{hint.text}</span>
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
            <DialogTitle style={{ fontSize: 15, letterSpacing: "0.01em" }}>
              How to play Trisect
            </DialogTitle>
            <DialogDescription style={{ marginTop: 4 }}>
              Sort words into the three overlapping categories.
            </DialogDescription>
          </DialogHeader>

          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            {HOW_TO_PLAY_STEPS.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    flexShrink: 0,
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#F7F5F2",
                    background: Object.values(THEME_COLORS)[i % 3],
                    marginTop: 1,
                  }}
                >
                  {i + 1}
                </span>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#1C1B19",
                      lineHeight: 1.4,
                    }}
                  >
                    {step.title}
                  </p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 12,
                      color: "#8A8880",
                      lineHeight: 1.5,
                    }}
                  >
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
