import { useEffect, useRef, useState } from 'react';
import { useBreath } from '../breath/useBreath';
import { prefersReduced } from '../lib/motion';
import { useMood, type Mood } from '../store/scene';
import { useView } from '../store/app';
import { useSessionState } from '../store/session';
import { MOODS, STAR_FIELD, CLOUD_FIELD, FIREFLY_FIELD, type Palette } from './moods';

// Foreground reeds at the shoreline (L6). Clustered at the edges so the centre —
// where the breath ring / session copy sits — stays open. This is the one layer
// that breathes with the app (§7).
const REEDS = ['M6 16 Q5 8 7 2', 'M9 16 Q10 7 8 3', 'M12 16 Q11 9 13 4', 'M88 16 Q89 8 87 2', 'M91 16 Q90 7 92 3', 'M94 16 Q95 9 93 4'];

// Deterministic drift tables so birds/leaves never jump between renders.
const BIRD_FIELD = [
  { y: 15, dur: 26, delay: 0 },
  { y: 22, dur: 34, delay: -12 },
  { y: 12, dur: 30, delay: -22 },
];
const LEAF_FIELD = [
  { x: 12, dur: 15, delay: 0 },
  { x: 34, dur: 19, delay: -6 },
  { x: 58, dur: 17, delay: -11 },
  { x: 76, dur: 21, delay: -3 },
  { x: 90, dur: 16, delay: -14 },
];

/**
 * Illustrated scene (§ redesign). Layered SVG landscape — sky glow, sun/moon,
 * stars, drifting clouds, mountain + pine silhouettes — framing the Living Water
 * as the lake. Mood shifts dawn→day→dusk→night and crossfades over ~1.2s.
 */
function SceneArt({ palette }: { palette: Palette }) {
  const b = useBreath();
  const p = palette;
  const glow = 0.5 + b * 0.5;
  const sway = 1 + b * 0.015; // §7 L6 — inhale lifts the reeds, exhale releases

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }} aria-hidden>
      {/* sky — three stops for real depth from zenith to horizon */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${p.skyTop} 0%, ${p.skyMid} 34%, ${p.skyHorizon} 56%, transparent 66%)`,
        }}
      />
      {/* horizon glow behind the ridge */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '44%',
          height: '24%',
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
      {/* a single shooting star crossing the night */}
      {p.shooting && <span className="scene-shoot" style={{ left: '14%', top: '10%' }} />}
      {/* clouds — layered puffs drifting at different speeds/opacities */}
      {CLOUD_FIELD.slice(0, p.clouds).map((c, i) => (
        <span
          key={i}
          className="scene-cloud"
          style={{ top: `${c.top}%`, width: c.w, height: c.h, opacity: c.op, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }}
        />
      ))}
      {/* birds — drift across the sky, wings flapping (morning/day) */}
      {p.birds > 0 &&
        BIRD_FIELD.slice(0, p.birds).map((bd, i) => (
          <span key={i} className="scene-bird" style={{ top: `${bd.y}%`, animationDuration: `${bd.dur}s`, animationDelay: `${bd.delay}s` }}>
            <svg width="18" height="8" viewBox="0 0 18 8" className="scene-bird-wing" aria-hidden>
              <path d="M1 6 Q5 1 9 6 Q13 1 17 6" stroke="rgba(234,242,242,0.5)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </svg>
          </span>
        ))}
      {/* sun / moon + glow */}
      <div
        style={{
          position: 'absolute',
          left: `${p.body.x}%`,
          top: `${p.body.y}%`,
          transform: 'translate(-50%,-50%)',
        }}
      >
        {/* slow-turning ray fan behind the sun (morning/afternoon) */}
        {p.rays && (
          <div
            className="scene-rays"
            style={{
              width: p.body.r * 16,
              height: p.body.r * 16,
              background: `repeating-conic-gradient(from 0deg at 50% 50%, ${p.body.color}22 0deg 3deg, transparent 3deg 15deg)`,
              WebkitMaskImage: 'radial-gradient(circle, #000 6%, transparent 60%)',
              maskImage: 'radial-gradient(circle, #000 6%, transparent 60%)',
              opacity: glow * 0.55,
            }}
          />
        )}
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
      {/* mountains + pines — three parallax ridges for real depth */}
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        style={{ position: 'absolute', left: 0, top: '40%', width: '100%', height: '24%' }}
      >
        <path d="M0 24 L16 8 L30 19 L46 5 L60 20 L76 7 L90 18 L100 9 L100 40 L0 40 Z" fill={p.ridgeFar} />
        <path d="M0 40 L0 26 L20 16 L38 27 L54 14 L72 26 L88 17 L100 27 L100 40 Z" fill={p.ridgeMid} />
        <path d="M0 40 L0 32 L22 23 L40 32 L58 21 L78 31 L100 25 L100 40 Z" fill={p.ridgeNear} />
        {/* pines along the shoreline */}
        {[6, 12, 20, 78, 86, 93].map((x, i) => (
          <path key={i} d={`M${x} 40 L${x - 2} 34 L${x} 30 L${x + 2} 34 Z`} fill={p.tree} />
        ))}
      </svg>
      {/* L6 foreground reeds at the shoreline — the single breath-synced layer
          (transform-origin: bottom, scaleY on the shared clock). Frozen under
          reduced motion for free, since the breath value holds at 0.5 there. */}
      <div className="scene-reeds" style={{ transform: `scaleY(${sway})` }}>
        <svg viewBox="0 0 100 16" preserveAspectRatio="none" width="100%" height="100%" aria-hidden>
          {REEDS.map((d, i) => (
            <path key={i} d={d} stroke={p.tree} strokeWidth={0.7} fill="none" strokeLinecap="round" />
          ))}
        </svg>
      </div>
      {/* the body reflected on the waterline — a soft swaying shimmer */}
      {p.reflect && (
        <span
          className="scene-reflection"
          style={{ left: `${p.body.x}%`, top: '60%', width: p.body.r * 3.4, height: p.body.r * 1.2, background: p.body.color }}
        />
      )}
      {/* fireflies / gold motes drifting near the water (dusk/night) */}
      {p.fireflies > 0 &&
        FIREFLY_FIELD.slice(0, p.fireflies).map((ff, i) => (
          <span key={i} className="scene-firefly" style={{ left: `${ff.x}%`, top: `${ff.y}%`, animationDelay: `${ff.delay}s` }} />
        ))}
      {/* falling leaves — drift down toward the water (day/dusk) */}
      {p.leaves > 0 &&
        LEAF_FIELD.slice(0, p.leaves).map((lf, i) => (
          <span key={i} className="scene-leaf" style={{ left: `${lf.x}%`, animationDuration: `${lf.dur}s`, animationDelay: `${lf.delay}s` }} />
        ))}
    </div>
  );
}

type Layer = { id: number; mood: Mood };

export default function Scene() {
  const mood = useMood();
  const [layers, setLayers] = useState<Layer[]>([{ id: 0, mood }]);
  const idRef = useRef(0);
  const reduced = prefersReduced();
  // §9 player variant: the full session player (the `music` step) shapes the same
  // global backdrop into a 60vh top band that melts into the controls (CSS mask).
  const view = useView();
  const { step } = useSessionState();
  const player = view === 'session' && step === 'music';

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
    <div className={`time-scene${player ? ' time-scene--player' : ''}`} aria-hidden>
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
