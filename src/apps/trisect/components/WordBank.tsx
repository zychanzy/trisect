import { useRef, useEffect, useState } from "react";
import { useDrag } from "../context/DragContext";
import type { HintState } from "../types";

interface WordBankProps {
  allWords: string[];
  placedWords: Set<string>;
  onWordClick: (word: string) => void;
  onReturnWord: (word: string) => void;
  hasSelectedZone: boolean;
  isDisabled: boolean;
  hints: HintState;
}

export function WordBank({
  allWords,
  placedWords,
  onWordClick,
  onReturnWord,
  hasSelectedZone,
  isDisabled,
  hints,
}: WordBankProps) {
  const canPlace = hasSelectedZone && !isDisabled;
  const { startDrag, endDrag, dragging, ghostRef, setTouchTargetZone } =
    useDrag();
  const [isDragOver, setIsDragOver] = useState(false);
  const bankRef = useRef<HTMLDivElement | null>(null);

  const revealedSet = new Map(
    hints.revealedWords.map((r) => [r.word, r.categories]),
  );

  // Listen for touch-drop events on the word bank area
  useEffect(() => {
    const el = bankRef.current;
    if (!el || isDisabled) return;
    function handleWordDrop(e: Event) {
      const { word } = (e as CustomEvent).detail;
      endDrag();
      onReturnWord(word);
      setIsDragOver(false);
    }
    el.addEventListener("word-drop", handleWordDrop);
    return () => el.removeEventListener("word-drop", handleWordDrop);
  }, [isDisabled, endDrag, onReturnWord]);

  function handleDragOver(e: React.DragEvent) {
    if (isDisabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    // Only clear if leaving the bank container entirely
    if (!bankRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (isDisabled) return;
    const word = e.dataTransfer.getData("text/plain");
    if (word) {
      endDrag();
      onReturnWord(word);
    }
  }

  return (
    <div className="mt-[22px]">
      <hr className="border-0 border-t border-stone-300 mb-3 relative left-1/2 -translate-x-1/2 w-screen" />
      <div
        ref={bankRef}
        data-wordbank="true"
        className={[
          "flex flex-wrap gap-2 justify-center rounded-[14px] transition-colors duration-150 py-2 px-2",
          isDragOver ? "bg-stone-200" : "",
        ].join(" ")}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {allWords.map((word) => {
          const isPlaced = placedWords.has(word);
          return (
            <WordSlot
              key={word}
              word={word}
              isPlaced={isPlaced}
              canPlace={canPlace}
              isDisabled={isDisabled}
              categories={revealedSet.get(word) ?? null}
              onClick={() => !isPlaced && canPlace && onWordClick(word)}
              onDragStart={() => startDrag(word, null)}
              onDragEnd={endDrag}
              isDragging={
                dragging?.word === word && dragging?.sourceZone === null
              }
              ghostRef={ghostRef}
              setTouchTargetZone={setTouchTargetZone}
            />
          );
        })}
      </div>
    </div>
  );
}

interface WordSlotProps {
  word: string;
  isPlaced: boolean;
  canPlace: boolean;
  isDisabled: boolean;
  categories: 1 | 2 | 3 | null;
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
  ghostRef: React.RefObject<HTMLDivElement | null>;
  setTouchTargetZone: (z: import("../types").ZoneId | null) => void;
}

function WordSlot({
  word,
  isPlaced,
  canPlace,
  isDisabled,
  categories,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
  ghostRef,
  setTouchTargetZone,
}: WordSlotProps) {
  const elementRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el || isPlaced) return;
    function handleTouchMove(e: TouchEvent) {
      if (!ghostRef.current || ghostRef.current.style.display === "none")
        return;
      e.preventDefault();
      const touch = e.touches[0];
      ghostRef.current.style.left = touch.clientX - 40 + "px";
      ghostRef.current.style.top = touch.clientY - 20 + "px";
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      const zoneEl = target?.closest("[data-zone-id]");
      setTouchTargetZone(
        zoneEl
          ? (zoneEl.getAttribute("data-zone-id") as import("../types").ZoneId)
          : null,
      );
    }
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", handleTouchMove);
  }, [ghostRef, setTouchTargetZone, isPlaced]);

  function handleTouchStart(e: React.TouchEvent) {
    if (isDisabled || isPlaced) return;
    onDragStart();
    const touch = e.touches[0];
    if (ghostRef.current) {
      ghostRef.current.textContent = word;
      ghostRef.current.style.display = "block";
      ghostRef.current.style.left = touch.clientX - 40 + "px";
      ghostRef.current.style.top = touch.clientY - 20 + "px";
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (ghostRef.current) ghostRef.current.style.display = "none";
    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const zoneEl = el?.closest("[data-zone-id]");
    if (zoneEl) {
      zoneEl.dispatchEvent(
        new CustomEvent("word-drop", { bubbles: false, detail: { word } }),
      );
    }
    onDragEnd();
  }

  const isRevealed = categories !== null;

  // Ghost base: the reserved slot when the word is placed in the grid
  if (isPlaced) {
    return (
      <div
        className={[
          "relative px-[18px] py-2 rounded-full text-[16px] font-semibold tracking-[0.01em]",
          "border-[1.5px] border-stone-400 bg-stone-100 text-transparent",
          "select-none",
        ].join(" ")}
        aria-hidden="true"
      >
        {word}
        {isRevealed && <span className="absolute -top-2 -right-2 w-4 h-4" />}
      </div>
    );
  }

  const borderStyle = isDisabled
    ? "border-stone-300 bg-stone-200 text-stone-500 cursor-not-allowed shadow-none"
    : isRevealed
      ? "border-[2px] border-stone-800 bg-white text-ink cursor-grab shadow-[0_1px_3px_rgba(0,0,0,0.10)]"
      : "border-stone-500 bg-white text-ink cursor-grab shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:bg-stone-200 hover:border-stone-600";

  return (
    <button
      ref={elementRef}
      onClick={onClick}
      disabled={!canPlace && isDisabled}
      draggable={!isDisabled}
      className={[
        "relative px-[18px] py-2 rounded-full text-[16px] font-semibold tracking-[0.01em]",
        "transition-all duration-150 ease-in-out outline-none",
        "touch-none select-none border-[1.5px]",
        borderStyle,
        isDragging ? "opacity-35" : "opacity-100",
      ].join(" ")}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", word);
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {word}
      {isRevealed && (
        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-stone-800 text-white text-[9px] font-bold leading-none">
          {categories}
        </span>
      )}
    </button>
  );
}
