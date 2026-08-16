import { useBreath } from '../breath/useBreath';
import { useAudio, audioControls } from './audioStore';

/**
 * The breath-ring (Phase A) — the visual + interactive heart of the session
 * player. It breathes on the shared clock (§5, same primitive as the water and
 * the mark), and tapping it toggles play/pause. Instead of an audio waveform
 * (noise for spoken guidance) a soft water-ripple pulses outward on the breath.
 * Reduced motion → the clock holds at rest, so the ring simply sits still.
 */
export default function BreathRing({ size = 264 }: { size?: number }) {
  const b = useBreath(); // 0..1 shared clock
  const { playing, error, hasSource } = useAudio();
  const unavailable = !hasSource || error;

  const scale = 1 + b * 0.05;
  const glow = 0.24 + b * 0.3;

  return (
    <div style={{ width: size, height: size, position: 'relative', display: 'grid', placeItems: 'center' }}>
      {/* water-ripple pulses — expand + fade outward on the inhale */}
      {[0, 1].map((i) => {
        const p = (b + i * 0.5) % 1; // two rings, half a breath apart
        return (
          <span
            key={i}
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '1px solid var(--gold)',
              transform: `scale(${0.82 + p * 0.26})`,
              opacity: (1 - p) * 0.18,
            }}
          />
        );
      })}

      {/* breathing champagne glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '6%',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 42%, rgba(232,201,155,0.32), rgba(232,201,155,0.06) 60%, transparent 78%)',
          opacity: glow,
          filter: 'blur(4px)',
          transition: 'opacity 120ms linear',
        }}
      />

      {/* the ring itself — tap to toggle play/pause */}
      <button
        onClick={() => audioControls.toggle()}
        disabled={unavailable}
        aria-label={playing ? 'Pause' : 'Play'}
        className="glass grid place-items-center"
        style={{
          width: '78%',
          height: '78%',
          borderRadius: '50%',
          borderColor: 'rgba(232,201,155,0.4)',
          color: 'var(--gold)',
          opacity: unavailable ? 0.5 : 1,
          transform: `scale(${scale})`,
          transition: 'transform 120ms linear',
          boxShadow: 'inset 0 0 46px rgba(232,201,155,0.1), 0 12px 40px rgba(0,0,0,0.3)',
        }}
      >
        {playing ? (
          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <rect x="6" y="5" width="4" height="14" rx="1.3" />
            <rect x="14" y="5" width="4" height="14" rx="1.3" />
          </svg>
        ) : (
          <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5Z" />
          </svg>
        )}
      </button>
    </div>
  );
}
