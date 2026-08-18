import { useEffect, useRef, useState } from 'react';
import { useBreath } from '../breath/useBreath';
import { prefersReduced } from '../lib/motion';
import { useMood, type Mood } from '../store/scene';
import { useView } from '../store/app';
import { useSessionState } from '../store/session';
import { MOODS, STAR_FIELD, type Palette } from './moods';

// Bucket order — used to prefetch the *next* backdrop at low priority (§4).
const ORDER: Mood[] = ['dawn', 'day', 'dusk', 'night'];

/**
 * Illustrated backdrops + procedural motion (§Phase5). The image is a static
 * asset; every bit of movement is generated at runtime (transform/opacity only):
 *  L0 backdrop image   L1 cloud drift   L2 star twinkle   L3 light bloom
 *  L4 water shimmer (the global WebGL water, revealed through a masked base)
 *  L5 legibility scrim (L6 grain + vignette come from <Atmosphere/>, unchanged).
 * Reuses the Phase 4 bucket resolver (useMood) and crossfade as-is.
 */

/** L3 — light bloom. The one breath-synced layer: opacity 0.92→1.00 and scale
 *  1.00→1.02 across the inhale on the shared breath clock, so it matches the
 *  meditation ring exactly (§6). Isolated so only this node re-renders per frame. */
function Bloom({ bloom }: { bloom: Palette['bloom'] }) {
  const b = useBreath();
  return (
    <div
      className="backdrop-bloom"
      style={{
        background: `radial-gradient(circle at ${bloom.x}% ${bloom.y}%, ${bloom.color}, transparent ${bloom.size}%)`,
        opacity: 0.92 + b * 0.08,
        transform: `scale(${1 + b * 0.02})`,
      }}
    />
  );
}

/** One backdrop bucket: static image + the procedural layers on top of it. */
function Backdrop({ palette }: { palette: Palette }) {
  const [shown, setShown] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Fade the image in over 400ms once it decodes (§9). On failure the skyTop
  // solid + procedural layers remain — never a broken-image icon or spinner.
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    let alive = true;
    const reveal = () => alive && setShown(true);
    if (img.complete && img.naturalWidth) reveal();
    else img.decode?.().then(reveal).catch(() => {});
    return () => {
      alive = false;
    };
  }, [palette.src]);

  return (
    <>
      {/* L0 — immediate skyTop solid carrying the image. Masked at the base so
          the living water behind the scene shows through the lower band (= L4). */}
      <div className="backdrop-media" style={{ background: palette.skyTop }}>
        <img
          ref={imgRef}
          className="backdrop-img"
          src={palette.src}
          alt=""
          aria-hidden
          decoding="async"
          style={{ opacity: shown ? 1 : 0 }}
        />
      </div>
      {/* L1 — cloud drift (all buckets) */}
      <div className="backdrop-clouds" />
      {/* L2 — star twinkle (dawn + night only) */}
      {palette.stars > 0 && (
        <div className="backdrop-stars">
          {STAR_FIELD.slice(0, palette.stars).map((s, i) => (
            <span
              key={i}
              className="backdrop-star"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: s.r * 2,
                height: s.r * 2,
                animationDuration: `${s.dur}s`,
                animationDelay: `${-s.delay}s`,
              }}
            />
          ))}
        </div>
      )}
      {/* L3 — breath-synced light bloom */}
      <Bloom bloom={palette.bloom} />
      {/* L5 — legibility scrim, tuned per bucket (§7) */}
      <div className="backdrop-scrim" style={{ opacity: palette.scrim }} />
    </>
  );
}

type Layer = { id: number; mood: Mood };

export default function Scene() {
  const mood = useMood();
  const [layers, setLayers] = useState<Layer[]>([{ id: 0, mood }]);
  const idRef = useRef(0);
  const reduced = prefersReduced();
  // §8 player variant: the session `music` step shapes the same backdrop into a
  // 60vh top band that melts into the controls (CSS mask).
  const view = useView();
  const { step } = useSessionState();
  const player = view === 'session' && step === 'music';

  // §6 lifecycle — freeze procedural CSS motion while hidden/backgrounded, resume
  // on return. The breath clock + water already self-pause; this covers L1/L2.
  const [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden);
  useEffect(() => {
    const on = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);

  // Crossfade (reused from Phase 4): a new bucket mounts on top and fades in over
  // 8s; collapse to it once the fade settles. Robust to rapid transitions.
  useEffect(() => {
    if (layers[layers.length - 1]?.mood === mood) return;
    const id = ++idRef.current;
    setLayers((ls) => [...ls, { id, mood }]);
    const t = setTimeout(() => setLayers((ls) => (ls.length > 1 ? ls.slice(-1) : ls)), reduced ? 20 : 8300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood]);

  // Prefetch the next bucket at low priority after 10s idle (§4). Only the active
  // bucket is fetched on load (it's the one in the DOM); this warms the next.
  useEffect(() => {
    const idle = (cb: () => void) =>
      'requestIdleCallback' in window
        ? (window as unknown as { requestIdleCallback: (cb: () => void, o?: object) => void }).requestIdleCallback(cb, { timeout: 2000 })
        : setTimeout(cb, 0);
    const t = setTimeout(
      () =>
        idle(() => {
          const next = ORDER[(ORDER.indexOf(mood) + 1) % ORDER.length];
          const img = new Image();
          img.decoding = 'async';
          img.src = MOODS[next].src;
        }),
      10_000,
    );
    return () => clearTimeout(t);
  }, [mood]);

  return (
    <div className={`time-scene${player ? ' time-scene--player' : ''}${hidden ? ' is-hidden' : ''}`} aria-hidden>
      {layers.map((l, i) => (
        <div
          key={l.id}
          className="scene-layer"
          style={{ animation: i === 0 ? undefined : `scene-in ${reduced ? '0.02s' : '8s'} var(--ease-calm) forwards` }}
        >
          <Backdrop palette={MOODS[l.mood]} />
        </div>
      ))}
    </div>
  );
}
