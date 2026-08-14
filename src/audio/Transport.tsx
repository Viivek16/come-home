import { useAudio, audioControls } from './audioStore';

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

function SkipButton({ dir, onClick }: { dir: 'back' | 'fwd'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === 'back' ? 'Back 10 seconds' : 'Forward 10 seconds'}
      className="glass grid place-items-center transition-transform duration-300 active:scale-[0.94]"
      style={{ width: 52, height: 52, borderRadius: 999, color: 'var(--ink)', transitionTimingFunction: 'var(--ease-calm)' }}
    >
      <span style={{ position: 'relative', display: 'grid', placeItems: 'center', width: 24, height: 24 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden style={{ transform: dir === 'fwd' ? 'scaleX(-1)' : undefined }}>
          <path d="M9 5L4 9l5 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 9h9a6 6 0 1 1-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ position: 'absolute', fontSize: 8, fontWeight: 500, top: 9, color: 'var(--ink-muted)' }}>10</span>
      </span>
    </button>
  );
}

/** Shared transport (§6.4/§6.5). Cinematic: optional big time, gold play with
 *  glow, circular glass ±10s, thin gold seek. Native range = keyboard seek (§10). */
export default function Transport({ bigTime = false }: { bigTime?: boolean }) {
  const { playing, position, duration, error } = useAudio();

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {bigTime && (
        <div
          className="serif"
          style={{ fontSize: '3rem', fontWeight: 300, letterSpacing: '0.02em', color: 'var(--ink)' }}
        >
          {fmt(position)}
        </div>
      )}

      <div className="flex items-center gap-8">
        <SkipButton dir="back" onClick={() => audioControls.skip(-10)} />

        <button
          onClick={() => audioControls.toggle()}
          aria-label={playing ? 'Pause' : 'Play'}
          className="grid place-items-center transition-transform duration-300 active:scale-[0.96]"
          style={{
            width: 78,
            height: 78,
            borderRadius: 999,
            background: 'linear-gradient(180deg, #F0D6AA, var(--gold-deep))',
            color: '#11242d',
            boxShadow: '0 12px 36px rgba(232,201,155,0.34), inset 0 1px 0 rgba(255,255,255,0.55)',
            transitionTimingFunction: 'var(--ease-calm)',
          }}
        >
          {playing ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <rect x="6" y="5" width="4" height="14" rx="1.3" />
              <rect x="14" y="5" width="4" height="14" rx="1.3" />
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5Z" />
            </svg>
          )}
        </button>

        <SkipButton dir="fwd" onClick={() => audioControls.skip(10)} />
      </div>

      <div className="w-full">
        <input
          type="range"
          className="seek"
          min={0}
          max={duration || 0}
          step={1}
          value={Math.min(position, duration || 0)}
          onChange={(e) => audioControls.seek(Number(e.target.value))}
          aria-label="Seek"
          aria-valuetext={`${fmt(position)} of ${fmt(duration)}`}
          disabled={!duration}
        />
        <div className="mt-1 flex justify-between eyebrow">
          <span>{fmt(position)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {error && (
        <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)', textAlign: 'center' }}>
          The sound isn't here yet. Add public/audio/track.mp3 to hear it.
        </p>
      )}
    </div>
  );
}
