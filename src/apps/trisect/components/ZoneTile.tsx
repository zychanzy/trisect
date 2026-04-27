import { useEffect, useRef, useState } from "react";
import type { ZoneId, Puzzle } from "../types";
import { ZONE_META, THEME_COLORS } from "../data/zones";
import { useDrag } from "../context/DragContext";

interface ZoneTileProps {
  zoneId: ZoneId;
  word?: string;
  isSelected: boolean;
  tileLabelsReady: boolean;
  isSwapping: boolean;
  swapGeneration: number;
  puzzle: Puzzle;
  onSelect: (zoneId: ZoneId) => void;
  onRemove: (zoneId: ZoneId) => void;
  onDrop: (word: string, zoneId: ZoneId, sourceZone?: ZoneId | null) => void;
  isDisabled: boolean;
  onHover: (zoneId: ZoneId | null) => void;
}

export function ZoneTile({
  zoneId,
  word,
  isSelected,
  tileLabelsReady,
  isSwapping,
  swapGeneration,
  puzzle,
  onSelect,
  onRemove,
  onDrop,
  isDisabled,
  onHover,
}: ZoneTileProps) {
  const meta = ZONE_META[zoneId];
  const isABC = zoneId === "ABC";
  const {
    dragging,
    startDrag,
    endDrag,
    ghostRef,
    touchTargetZone,
    setTouchTargetZone,
  } = useDrag();
  const [isDragOver, setIsDragOver] = useState(false);
  const tileRef = useRef<HTMLButtonElement | null>(null);

  const isBeingDragged =
    dragging?.word === word && dragging?.sourceZone === zoneId;

  useEffect(() => {
    const el = tileRef.current;
    if (!el || isDisabled) return;
    function handleWordDrop(e: Event) {
      const { word: droppedWord, sourceZone: src } = (e as CustomEvent).detail;
      endDrag();
      onDrop(droppedWord, zoneId, src ?? null);
      setIsDragOver(false);
    }
    el.addEventListener("word-drop", handleWordDrop);
    return () => el.removeEventListener("word-drop", handleWordDrop);
  }, [zoneId, onDrop, isDisabled, endDrag]);

  function handleClick() {
    if (isDisabled && !word) return;
    if (word) onRemove(zoneId);
    else onSelect(zoneId);
  }

  function handleDragOver(e: React.DragEvent) {
    if (isDisabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
    setTouchTargetZone(zoneId);
  }

  function handleDragLeave() {
    setIsDragOver(false);
    setTouchTargetZone(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    setTouchTargetZone(null);
    if (isDisabled) return;
    const droppedWord = e.dataTransfer.getData("text/plain");
    if (droppedWord) {
      const src = dragging?.sourceZone ?? null;
      endDrag();
      onDrop(droppedWord, zoneId, src);
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (!word || isDisabled) return;
    e.stopPropagation();
    startDrag(word, zoneId);
    const touch = e.touches[0];
    if (ghostRef.current) {
      ghostRef.current.textContent = word;
      ghostRef.current.style.display = "block";
      ghostRef.current.style.left = touch.clientX - 40 + "px";
      ghostRef.current.style.top = touch.clientY - 20 + "px";
    }
  }

  useEffect(() => {
    const el = tileRef.current;
    if (!el || !word || isDisabled) return;
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
        zoneEl ? (zoneEl.getAttribute("data-zone-id") as ZoneId) : null,
      );
    }
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => el.removeEventListener("touchmove", handleTouchMove);
  }, [word, isDisabled, ghostRef, setTouchTargetZone]);

  function handleTouchEnd(e: React.TouchEvent) {
    if (!dragging) return;
    if (ghostRef.current) ghostRef.current.style.display = "none";
    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const zoneEl = el?.closest("[data-zone-id]");
    const bankEl = el?.closest("[data-wordbank]");
    if (zoneEl) {
      zoneEl.dispatchEvent(
        new CustomEvent("word-drop", {
          bubbles: false,
          detail: { word: dragging.word, sourceZone: dragging.sourceZone },
        }),
      );
    } else if (bankEl) {
      bankEl.dispatchEvent(
        new CustomEvent("word-drop", {
          bubbles: false,
          detail: { word: dragging.word, sourceZone: dragging.sourceZone },
        }),
      );
    }
    endDrag();
  }

  const themeLabel = tileLabelsReady
    ? meta.themes.map((t) => puzzle.themes[t]).join(" · ")
    : null;

  const dots = meta.themes.map((t) => THEME_COLORS[t]);

  const showDropHighlight =
    !isDisabled &&
    dragging !== null &&
    (isDragOver || touchTargetZone === zoneId);
  const active = isSelected || showDropHighlight;

  return (
    <button
      ref={tileRef}
      data-zone-id={zoneId}
      onClick={handleClick}
      disabled={isDisabled && !word}
      draggable={!!word && !isDisabled}
      onDragStart={(e) => {
        if (!word) return;
        e.dataTransfer.setData("text/plain", word);
        e.dataTransfer.effectAllowed = "move";
        startDrag(word, zoneId);
      }}
      onDragEnd={endDrag}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={() => onHover(zoneId)}
      onMouseLeave={() => onHover(null)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={[
        "w-full rounded-[14px] flex flex-col items-center justify-center gap-[5px] px-[6px] py-2",
        "outline-none font-sans select-none transition-[border-color,background,box-shadow,transform] duration-150",
        isABC ? "h-[75px]" : "h-[90px]",
        word
          ? "border-[1.5px] border-stone-400 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.07)] cursor-grab"
          : active
            ? "border-[1.5px] border-stone-400 bg-stone-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)] cursor-pointer"
            : "border-[1.5px] border-stone-300 bg-stone-50 cursor-pointer",
        isDisabled && !word ? "opacity-45 cursor-not-allowed" : "",
        isBeingDragged ? "opacity-30" : "",
        word ? "touch-none" : "touch-auto",
      ].join(" ")}
    >
      <div
        key={isSwapping ? swapGeneration : 0}
        className="flex flex-col items-center gap-[5px]"
        style={
          isSwapping
            ? { animation: "tileSwap 0.6s cubic-bezier(0.25,0.8,0.25,1) both" }
            : undefined
        }
      >
        {/* Membership dots */}
        <div className="flex gap-1 items-center">
          {dots.map((color, i) => (
            <div
              key={i}
              style={{ background: color }}
              className={[
                "w-[9.5px] h-[9.5px] rounded-full",
                word ? "opacity-50" : "opacity-70",
              ].join(" ")}
            />
          ))}
        </div>

        {/* Word */}
        {word && (
          <span
            className={[
              "tile-word-appear font-semibold text-ink tracking-[0.01em] leading-[1.2] text-center break-words",
              "text-[16px]",
            ].join(" ")}
          >
            {word}
          </span>
        )}

        {/* Theme label when revealed */}
        {themeLabel && (
          <span className="text-[12.5px] font-normal text-stone-700 tracking-[0.03em] text-center leading-[1.2]">
            {themeLabel}
          </span>
        )}
      </div>
    </button>
  );
}
