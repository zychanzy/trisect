interface WordBankProps {
  words: string[];
  onWordClick: (word: string) => void;
  hasSelectedZone: boolean;
  isDisabled: boolean;
}

export function WordBank({ words, onWordClick, hasSelectedZone, isDisabled }: WordBankProps) {
  const canPlace = hasSelectedZone && !isDisabled;

  return (
    <div className="mt-4">
      <p className="text-xs text-center text-gray-400 mb-3">
        {isDisabled
          ? ''
          : hasSelectedZone
          ? 'Tap a word to place it'
          : 'Tap a zone, then tap a word'}
      </p>

      {words.length === 0 && !isDisabled ? (
        <p className="text-center text-sm text-gray-400 italic">All words placed</p>
      ) : (
        <div className="flex flex-wrap gap-2 justify-center">
          {words.map(word => (
            <button
              key={word}
              onClick={() => canPlace && onWordClick(word)}
              disabled={!canPlace}
              className={`
                px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150
                ${canPlace
                  ? 'border-gray-300 bg-white text-gray-800 hover:bg-gray-100 active:scale-95 cursor-pointer'
                  : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60'
                }
              `}
            >
              {word}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
