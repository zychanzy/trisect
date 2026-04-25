import type { GameStatus } from '../types';

interface StatusBarProps {
  status: GameStatus;
  allPlaced: boolean;
  onSubmit: () => void;
  onReveal: () => void;
}

export function StatusBar({ status, allPlaced, onSubmit, onReveal }: StatusBarProps) {
  if (status === 'solved') {
    return (
      <div className="animate-fade-in-up" style={{ marginTop: 32, textAlign: 'center' }}>
        <p style={{
          fontSize: 22,
          fontWeight: 200,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#1C1B19',
          fontFamily: '"DM Sans", sans-serif',
        }}>
          Trisected
        </p>
        <p style={{
          fontSize: 12,
          color: '#AAA7A0',
          marginTop: 6,
          letterSpacing: '0.03em',
          fontFamily: '"DM Sans", sans-serif',
        }}>
          Return tomorrow for a new puzzle
        </p>
      </div>
    );
  }

  if (status === 'revealed') {
    return (
      <div className="animate-fade-in-up" style={{ marginTop: 32, textAlign: 'center' }}>
        <p style={{
          fontSize: 13,
          fontWeight: 400,
          color: '#888',
          letterSpacing: '0.03em',
          fontFamily: '"DM Sans", sans-serif',
        }}>
          Themes revealed — try again tomorrow
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 13 }}>
      <button
        onClick={onSubmit}
        disabled={!allPlaced}
        style={{
          width: '100%',
          padding: '13px 0',
          borderRadius: 100,
          border: 'none',
          background: allPlaced ? '#1C1B19' : '#E5E2DC',
          color: allPlaced ? '#F7F5F2' : '#AAA7A0',
          fontSize: 12,
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 600,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          cursor: allPlaced ? 'pointer' : 'not-allowed',
          transition: 'all 0.18s ease',
          outline: 'none',
        }}
        onMouseEnter={e => {
          if (allPlaced) (e.currentTarget as HTMLButtonElement).style.background = '#333';
        }}
        onMouseLeave={e => {
          if (allPlaced) (e.currentTarget as HTMLButtonElement).style.background = '#1C1B19';
        }}
      >
        Check solution
      </button>

      <button
        onClick={onReveal}
        style={{
          background: 'none',
          border: 'none',
          fontSize: 11.5,
          color: '#C0BCB6',
          cursor: 'pointer',
          fontFamily: '"DM Sans", sans-serif',
          letterSpacing: '0.04em',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
          transition: 'color 0.15s',
          outline: 'none',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#888'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#C0BCB6'; }}
      >
        Reveal themes
      </button>
    </div>
  );
}
