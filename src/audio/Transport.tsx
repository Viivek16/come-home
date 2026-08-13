import { useAudio, audioControls } from './audioStore';

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

/** Shared transport (§6.4/§6.5): gold circular play/pause, ±10s, thin gold seek
 *  bar, current / duration. Native range = keyboard-accessible seek (§10). */
export default function Transport() {
  const { playing, position, duration, error } = useAudio();

  return (
    <div className="flex w-full flex-col items-center gap-5">
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

      <div className="flex items-center gap-7">
        <button
          onClick={() => audioControls.skip(-10)}
          aria-label="Back 10 seconds"
          className="min-h-[44px] min-w-[44px]"
          style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)' }}
        >
          −10s
        </button>

        <button
          onClick={() => audioControls.toggle()}
          aria-label={playing ? 'Pause' : 'Play'}
          className="grid place-items-center transition-transform duration-300 active:scale-[0.97]"
          style={{
            width: 68,
            height: 68,
            borderRadius: 999,
            background: 'var(--gold)',
            color: '#10222b',
            transitionTimingFunction: 'var(--ease-calm)',
          }}
        >
          {playing ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5Z" />
            </svg>
          )}
        </button>

        <button
          onClick={() => audioControls.skip(10)}
          aria-label="Forward 10 seconds"
          className="min-h-[44px] min-w-[44px]"
          style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)' }}
        >
          +10s
        </button>
      </div>

      {error && (
        <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)', textAlign: 'center' }}>
          The sound isn't here yet. Add public/audio/track.mp3 to hear it.
        </p>
      )}
    </div>
  );
}
