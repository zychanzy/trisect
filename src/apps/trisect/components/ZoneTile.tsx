import { useEffect, useRef, useState } from "react";
import type { ZoneId, Puzzle } from "../types";
import { ZONE_META, THEME_COLORS } from "../data/zones";
import { useDrag } from "../context/DragContext";

interface ZoneTileProps {
  zoneId: ZoneId;
  word?: string;
  isSelected: boolean;
  themesRevealed: boolean;
  puzzle: Puzzle;
  onSelect: (zoneId: ZoneId) => void;
  onRemove: (zoneId: ZoneId) => void;
  onDrop: (word: string, zoneId: ZoneId) => void;
  isDisabled: boolean;
}

export function ZoneTile({
  zoneId,
  word,
  isSelected,
  themesRevealed,
  puzzle,
  onSelect,
  onRemove,
  onDrop,
  isDisabled,
}: ZoneTileProps) {
  const meta = ZONE_META[zoneId];
  const isABC = zoneId === "ABC";
  const { dragging, startDrag, endDrag, ghostRef } = useDrag();
  const [isDragOver, setIsDragOver] = useState(false);
  const tileRef = useRef<HTMLButtonElement | null>(null);

  const isBeingDragged =
    dragging?.word === word && dragging?.sourceZone === zoneId;

  // Listen for custom touch-drop events dispatched by word chips
  useEffect(() => {
    const el = tileRef.current;
    if (!el || isDisabled) return;
    function handleWordDrop(e: Event) {
      const { word: droppedWord } = (e as CustomEvent).detail;
      endDrag();
      onDrop(droppedWord, zoneId);
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

  // HTML5 drag-and-drop handlers
  function handleDragOver(e: React.DragEvent) {
    if (isDisabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (isDisabled) return;
    const droppedWord = e.dataTransfer.getData("text/plain");
    if (droppedWord) {
      endDrag();
      onDrop(droppedWord, zoneId);
    }
  }

  // Touch drag: allow words placed on tiles to be dragged
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

  function handleTouchMove(e: React.TouchEvent) {
    if (!ghostRef.current || ghostRef.current.style.display === "none") return;
    e.preventDefault();
    const touch = e.touches[0];
    ghostRef.current.style.left = touch.clientX - 40 + "px";
    ghostRef.current.style.top = touch.clientY - 20 + "px";
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!dragging) return;
    if (ghostRef.current) ghostRef.current.style.display = "none";
    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const zoneEl = el?.closest("[data-zone-id]");
    if (zoneEl) {
      zoneEl.dispatchEvent(
        new CustomEvent("word-drop", {
          bubbles: false,
          detail: { word: dragging.word },
        }),
      );
    }
    endDrag();
  }

  const themeLabel = themesRevealed
    ? meta.themes.map((t) => puzzle.themes[t]).join(" · ")
    : null;

  const dots = meta.themes.map((t) => THEME_COLORS[t]);

  const showDropHighlight = isDragOver && !isDisabled && dragging !== null;

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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        width: "100%",
        height: isABC ? 60 : 72,
        borderRadius: 14,
        border: `1.5px solid ${word ? "#D8D5CF" : isSelected || showDropHighlight ? "#C8C5BF" : "#E5E2DC"}`,
        background: word
          ? "#FFFFFF"
          : isSelected || showDropHighlight
            ? "#F4F2EE"
            : "#FAFAF8",
        boxShadow:
          (isSelected || showDropHighlight) && !word
            ? "0 2px 8px rgba(0,0,0,0.08)"
            : word
              ? "0 1px 4px rgba(0,0,0,0.07)"
              : "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        padding: "8px 6px",
        cursor: isDisabled && !word ? "not-allowed" : word ? "grab" : "pointer",
        transition:
          "border-color 0.15s, background 0.15s, box-shadow 0.15s, transform 0.1s",
        transform: "scale(1)",
        opacity: isDisabled && !word ? 0.45 : isBeingDragged ? 0.3 : 1,
        outline: "none",
        fontFamily: '"DM Sans", sans-serif',
        touchAction: word ? "none" : "auto",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {/* Membership dots */}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {dots.map((color, i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: color,
              opacity: word ? 0.5 : 0.7,
            }}
          />
        ))}
      </div>

      {/* Word */}
      {word && (
        <span
          className="tile-word-appear"
          style={{
            fontSize: isABC ? 13 : 12,
            fontWeight: 600,
            color: "#1C1B19",
            letterSpacing: "0.01em",
            lineHeight: 1.2,
            textAlign: "center",
            wordBreak: "break-word",
          }}
        >
          {word}
        </span>
      )}

      {/* Theme label when revealed */}
      {themeLabel && (
        <span
          style={{
            fontSize: 8.5,
            fontWeight: 400,
            color: "#A09D98",
            letterSpacing: "0.03em",
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          {themeLabel}
        </span>
      )}
    </button>
  );
}
