import { useEffect, useRef, useState } from 'react';
import { useBreath } from '../breath/useBreath';
import { prefersReduced } from '../lib/motion';
import { useMood, type Mood } from '../store/scene';
import { MOODS, STAR_FIELD, type Palette } from './moods';

/**
 * Illustrated scene (§ redesign). Layered SVG landscape — sky glow, sun/moon,
 * stars, drifting clouds, mountain + pine silhouettes — framing the Living Water
 * as the lake. Mood shifts dawn→day→dusk→night and crossfades over ~1.2s.
 */
function SceneArt({ palette }: { palette: Palette }) {
  const b = useBreath();
  const p = palette;
  const glow = 0.5 + b * 0.5;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }} aria-hidden>
      {/* sky */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${p.skyTop} 0%, ${p.skyHorizon} 48%, transparent 63%)`,
        }}
      />
      {/* horizon glow behind the ridge */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '46%',
          height: '22%',
          background: `radial-gradient(120% 100% at 50% 100%, ${p.glow}, transparent 70%)`,
          opacity: glow,
        }}
      />
      {/* stars */}
      {p.stars > 0 &&
        STAR_FIELD.slice(0, p.stars).map((s, i) => (
          <span
            key={i}
            className="scene-star"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.r * 2,
              height: s.r * 2,
              animationDelay: `${s.d}s`,
            }}
          />
        ))}
      {/* clouds */}
      {p.clouds && (
        <>
          <span className="scene-cloud" style={{ top: '18%', width: 150, height: 30, animationDuration: '90s' }} />
          <span className="scene-cloud" style={{ top: '30%', width: 100, height: 22, animationDuration: '120s', animationDelay: '-40s', opacity: 0.5 }} />
        </>
      )}
      {/* sun / moon + glow */}
      <div
        style={{
          position: 'absolute',
          left: `${p.body.x}%`,
          top: `${p.body.y}%`,
          transform: 'translate(-50%,-50%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: p.body.r * 10,
            height: p.body.r * 10,
            transform: 'translate(-50%,-50%)',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${p.body.color}55, transparent 62%)`,
            opacity: glow,
          }}
        />
        {p.body.kind === 'moon' ? (
          <svg width={p.body.r * 2} height={p.body.r * 2} viewBox="0 0 24 24" style={{ position: 'relative' }}>
            <defs>
              <mask id="crescent">
                <rect width="24" height="24" fill="#fff" />
                <circle cx="16" cy="10" r="10" fill="#000" />
              </mask>
            </defs>
            <circle cx="12" cy="12" r="10" fill={p.body.color} mask="url(#crescent)" />
          </svg>
        ) : (
          <div
            style={{
              position: 'relative',
              width: p.body.r * 2,
              height: p.body.r * 2,
              borderRadius: '50%',
              background: p.body.color,
              boxShadow: `0 0 ${p.body.r * 2}px ${p.body.color}`,
            }}
          />
        )}
      </div>
      {/* mountains + pines */}
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        style={{ position: 'absolute', left: 0, top: '40%', width: '100%', height: '24%' }}
      >
        <path d="M0 26 L14 10 L26 21 L40 6 L55 22 L70 9 L84 20 L100 8 L100 40 L0 40 Z" fill={p.ridgeFar} />
        <path d="M0 40 L0 30 L18 18 L34 30 L50 16 L66 29 L82 19 L100 31 L100 40 Z" fill={p.ridgeNear} />
        {/* pines along the shoreline */}
        {[6, 12, 20, 78, 86, 93].map((x, i) => (
          <path key={i} d={`M${x} 40 L${x - 2} 34 L${x} 30 L${x + 2} 34 Z`} fill={p.tree} />
        ))}
      </svg>
    </div>
  );
}

type Layer = { id: number; mood: Mood };

export default function Scene() {
  const mood = useMood();
  const [layers, setLayers] = useState<Layer[]>([{ id: 0, mood }]);
  const idRef = useRef(0);
  const reduced = prefersReduced();

  useEffect(() => {
    if (layers[layers.length - 1]?.mood === mood) return;
    const id = ++idRef.current;
    setLayers((ls) => [...ls, { id, mood }]);
    // Collapse to the newest layer once the crossfade settles (robust to rapid
    // transitions — never prunes back to a stale layer).
    const t = setTimeout(() => setLayers((ls) => (ls.length > 1 ? ls.slice(-1) : ls)), reduced ? 20 : 1300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} aria-hidden>
      {layers.map((l, i) => (
        <div
          key={l.id}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: i === 0 ? 1 : undefined,
            animation: i === 0 ? undefined : `scene-in ${reduced ? '0.02s' : '1.2s'} var(--ease-calm) forwards`,
          }}
        >
          <SceneArt palette={MOODS[l.mood]} />
        </div>
      ))}
    </div>
  );
}
