import { useMemo } from 'react';
import { useBreath } from '../breath/useBreath';
import type { BodyAnchor } from '../data/flows';

/**
 * A luminous 3D wireframe figure (§Phase-polish v2). The body is a volume of
 * revolution drawn as foreshortened cross-section rings threaded by longitudinal
 * contour lines, with a wireframe-sphere head — a glowing "mesh" that reads three
 * dimensional rather than a flat silhouette. A champagne bloom sits at the entry's
 * anchor and breathes on the shared clock (4s in / 6s out), sending slow rings of
 * light outward; the whole mesh swells gently with the same breath. Pure SVG +
 * gradients, no blur filter, no Three.js, no second WebGL context — so it never
 * competes with the water shader. Reduced motion holds the clock at rest.
 */

const CX = 120;
// Half-width of the seated figure at height y (neck → shoulders → waist → lap).
const PROFILE: [number, number][] = [
  [78, 9],
  [92, 34],
  [116, 40],
  [148, 33],
  [180, 41],
  [212, 55],
  [250, 74],
  [274, 70],
  [296, 40],
];
function widthAt(y: number): number {
  if (y <= PROFILE[0][0]) return PROFILE[0][1];
  for (let i = 1; i < PROFILE.length; i++) {
    const [y0, w0] = PROFILE[i - 1];
    const [y1, w1] = PROFILE[i];
    if (y <= y1) return w0 + (w1 - w0) * ((y - y0) / (y1 - y0));
  }
  return PROFILE[PROFILE.length - 1][1];
}

const POINTS: Record<Exclude<BodyAnchor, 'whole' | 'hands'>, [number, number]> = {
  head: [120, 52],
  throat: [120, 88],
  chest: [120, 120],
  solarPlexus: [120, 148],
  belly: [120, 178],
  sacral: [120, 208],
  lowerBack: [120, 226],
};
const HANDS: [number, number][] = [
  [82, 248],
  [158, 248],
];

const MOTES: { x: number; y: number; r: number; dur: number; delay: number }[] = [
  { x: 60, y: 130, r: 1.5, dur: 6.5, delay: 0 },
  { x: 182, y: 160, r: 1.3, dur: 8, delay: 1.4 },
  { x: 52, y: 220, r: 1.4, dur: 7, delay: 2.6 },
  { x: 190, y: 230, r: 1.2, dur: 9, delay: 0.8 },
  { x: 96, y: 66, r: 1.3, dur: 7.5, delay: 3.2 },
  { x: 150, y: 74, r: 1.4, dur: 6.8, delay: 2 },
  { x: 120, y: 288, r: 1.4, dur: 8.5, delay: 4 },
];

function pointsFor(anchor: BodyAnchor): [number, number][] {
  if (anchor === 'whole') return [];
  if (anchor === 'hands') return HANDS;
  return [POINTS[anchor]];
}

// A longitudinal contour line down the mesh at fractional width k (k = ±1 is the
// silhouette edge, 0 is the centre).
function longPath(k: number): string {
  let d = '';
  for (let y = 78; y <= 296; y += 6) {
    const x = CX + k * widthAt(y);
    d += `${y === 78 ? 'M' : 'L'}${x.toFixed(1)} ${y} `;
  }
  return d;
}

// The closed silhouette, for a faint volume fill behind the wireframe.
function silhouettePath(): string {
  let d = `M${(CX - widthAt(78)).toFixed(1)} 78 `;
  for (let y = 84; y <= 296; y += 6) d += `L${(CX - widthAt(y)).toFixed(1)} ${y} `;
  for (let y = 296; y >= 78; y -= 6) d += `L${(CX + widthAt(y)).toFixed(1)} ${y} `;
  return d + 'Z';
}

export default function BodyGlow({ anchor, size = 220, className = '' }: { anchor: BodyAnchor; size?: number; className?: string }) {
  const b = useBreath(); // 0..1 shared breath clock
  const points = pointsFor(anchor);

  // Static geometry + per-ring brightness (brighter near the anchor). Computed once.
  const geo = useMemo(() => {
    const anchorY = anchor === 'whole' ? null : anchor === 'hands' ? 248 : POINTS[anchor][1];
    const rings: { y: number; rx: number; ry: number; o: number }[] = [];
    for (let y = 84; y <= 292; y += 14) {
      const w = widthAt(y);
      const o = anchorY === null ? 0.5 : 0.24 + 0.42 * Math.exp(-((y - anchorY) ** 2) / (2 * 34 * 34));
      rings.push({ y, rx: w, ry: Math.max(2.4, w * 0.16), o });
    }
    const longs = [-1, -0.55, 0, 0.55, 1].map((k) => ({ d: longPath(k), edge: Math.abs(k) === 1 }));
    // Wireframe head sphere at (120, 52), r = 24.
    const R = 24;
    const cyH = 52;
    const lat = [-15, -5, 6, 15].map((dy) => {
      const r = Math.sqrt(Math.max(0, R * R - dy * dy));
      return { cy: cyH + dy, rx: r, ry: r * 0.32 };
    });
    const lon = [24, 17, 9].map((rx) => ({ rx, ry: R }));
    const headBright = anchor === 'head' || anchor === 'whole';
    return { rings, longs, lat, lon, cyH, silhouette: silhouettePath(), headBright };
  }, [anchor]);

  const meshScale = 1 + b * 0.03;
  const bloomScale = 1 + b * 0.14;
  const bloomOpacity = 0.55 + b * 0.45;
  const auraOpacity = 0.32 + b * 0.24;
  const groundOpacity = 0.38 + b * 0.16;
  const gold = 'rgba(232,201,155,';

  return (
    <svg
      className={className}
      width={size}
      height={size * (340 / 240)}
      viewBox="0 0 240 340"
      fill="none"
      aria-hidden
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,236,200,0.92)" />
          <stop offset="30%" stopColor="rgba(232,201,155,0.5)" />
          <stop offset="60%" stopColor="rgba(232,201,155,0.14)" />
          <stop offset="100%" stopColor="rgba(232,201,155,0)" />
        </radialGradient>
        <radialGradient id="bg-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,248,232,1)" />
          <stop offset="40%" stopColor="rgba(255,236,200,0.7)" />
          <stop offset="100%" stopColor="rgba(255,236,200,0)" />
        </radialGradient>
        <radialGradient id="bg-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(232,201,155,0.13)" />
          <stop offset="60%" stopColor="rgba(232,201,155,0.04)" />
          <stop offset="100%" stopColor="rgba(232,201,155,0)" />
        </radialGradient>
        <radialGradient id="bg-ground" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(232,201,155,0.22)" />
          <stop offset="100%" stopColor="rgba(232,201,155,0)" />
        </radialGradient>
        <radialGradient id="bg-vol" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="rgba(232,201,155,0.10)" />
          <stop offset="100%" stopColor="rgba(232,201,155,0)" />
        </radialGradient>
      </defs>

      {/* pool the figure rests in + outer aura */}
      <ellipse cx="120" cy="308" rx="76" ry="14" fill="url(#bg-ground)" opacity={groundOpacity} />
      <ellipse cx="120" cy="180" rx="116" ry="158" fill="url(#bg-aura)" opacity={auraOpacity} />

      {/* motes in the light */}
      {MOTES.map((m, i) => (
        <circle key={i} cx={m.x} cy={m.y} r={m.r} fill="rgba(240,220,180,0.9)" style={{ animation: `mote-twinkle ${m.dur}s ease-in-out ${m.delay}s infinite` }} />
      ))}

      {/* the wireframe mesh — swells gently on the breath */}
      <g transform={`translate(120 190) scale(${meshScale}) translate(-120 -190)`} style={{ mixBlendMode: 'screen' }}>
        <path d={geo.silhouette} fill="url(#bg-vol)" />
        {/* longitudinal contour lines */}
        {geo.longs.map((l, i) => (
          <path key={`ln${i}`} d={l.d} fill="none" stroke={`${gold}${l.edge ? 0.42 : 0.2})`} strokeWidth={l.edge ? 1.1 : 0.8} strokeLinecap="round" />
        ))}
        {/* cross-section rings (the volume) */}
        {geo.rings.map((r, i) => (
          <ellipse key={`r${i}`} cx={CX} cy={r.y} rx={r.rx} ry={r.ry} fill="none" stroke={`${gold}${r.o.toFixed(3)})`} strokeWidth={1} />
        ))}
        {/* wireframe head sphere */}
        <g stroke={`${gold}${geo.headBright ? 0.5 : 0.34})`} strokeWidth={1} fill="none">
          {geo.lat.map((e, i) => (
            <ellipse key={`la${i}`} cx={CX} cy={e.cy} rx={e.rx} ry={e.ry} />
          ))}
          {geo.lon.map((e, i) => (
            <ellipse key={`lo${i}`} cx={CX} cy={geo.cyH} rx={e.rx} ry={e.ry} />
          ))}
        </g>
      </g>

      {/* whole-body relight: a soft central bloom that breathes */}
      {anchor === 'whole' && (
        <ellipse cx="120" cy="150" rx="86" ry="150" fill="url(#bg-glow)" opacity={0.16 + b * 0.22} style={{ mixBlendMode: 'screen' }} />
      )}

      {/* anchor bloom: slow rings of light + halo + bright core, breathing */}
      {points.map(([x, y], i) => (
        <g key={i} style={{ mixBlendMode: 'screen' }}>
          {[0, 1].map((k) => {
            const p = (b + k * 0.5) % 1;
            return <circle key={k} cx={x} cy={y} r={16 + p * 38} fill="none" stroke="rgba(232,201,155,0.9)" strokeWidth={1} opacity={(1 - p) * 0.34} />;
          })}
          <circle cx="0" cy="0" r="44" fill="url(#bg-glow)" opacity={bloomOpacity} transform={`translate(${x} ${y}) scale(${bloomScale})`} />
          <circle cx="0" cy="0" r="13" fill="url(#bg-core)" opacity={bloomOpacity} transform={`translate(${x} ${y}) scale(${1 + b * 0.2})`} />
        </g>
      ))}
    </svg>
  );
}
