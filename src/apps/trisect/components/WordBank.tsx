interface WordBankProps {
  words: string[];
  onWordClick: (word: string) => void;
  hasSelectedZone: boolean;
  isDisabled: boolean;
}

export function WordBank({ words, onWordClick, hasSelectedZone, isDisabled }: WordBankProps) {
  const canPlace = hasSelectedZone && !isDisabled;

  return (
    <div style={{ marginTop: 22 }}>
      <p
        style={{
          textAlign: 'center',
          fontSize: 10.5,
          letterSpacing: '0.09em',
          textTransform: 'uppercase',
          color: '#AEAAA4',
          marginBottom: 12,
          fontWeight: 500,
          minHeight: 14,
          fontFamily: '"DM Sans", sans-serif',
        }}
      >
        {isDisabled ? '' : canPlace ? 'Tap a word to place it' : 'Tap a zone · then a word'}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {words.map(word => (
          <button
            key={word}
            onClick={() => canPlace && onWordClick(word)}
            disabled={!canPlace}
            style={{
              padding: '8px 18px',
              borderRadius: 100,
              border: `1.5px solid ${canPlace ? '#C8C5BF' : '#E5E2DC'}`,
              background: canPlace ? '#FFFFFF' : '#F2F0ED',
              color: canPlace ? '#1C1B19' : '#B5B1AA',
              fontSize: 13,
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 500,
              cursor: canPlace ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s ease',
              letterSpacing: '0.01em',
              boxShadow: canPlace ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              outline: 'none',
            }}
            onMouseEnter={e => {
              if (canPlace) {
                (e.currentTarget as HTMLButtonElement).style.background = '#F4F2EE';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#AAA7A0';
              }
            }}
            onMouseLeave={e => {
              if (canPlace) {
                (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#C8C5BF';
              }
            }}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}
