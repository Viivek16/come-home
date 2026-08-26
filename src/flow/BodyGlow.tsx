import { useMemo } from 'react';
import { useBreath } from '../breath/useBreath';
import { CX, HEAD_CY, HEAD_R, widthAt, anchorPoints, anchorY } from './figure';
import type { BodyAnchor } from '../data/flows';

/**
 * SVG figure — the WebGL-unavailable fallback for the 3D figure (§Phase-polish).
 * A luminous wireframe: the body as foreshortened cross-section rings threaded by
 * longitudinal contour lines, with a wireframe-sphere head. Breathes on the shared
 * clock, with a champagne bloom at the anchor. Pure SVG, no WebGL — safe anywhere.
 */

const MOTES: { x: number; y: number; r: number; dur: number; delay: number }[] = [
  { x: 60, y: 130, r: 1.5, dur: 6.5, delay: 0 },
  { x: 182, y: 160, r: 1.3, dur: 8, delay: 1.4 },
  { x: 52, y: 220, r: 1.4, dur: 7, delay: 2.6 },
  { x: 190, y: 230, r: 1.2, dur: 9, delay: 0.8 },
  { x: 96, y: 66, r: 1.3, dur: 7.5, delay: 3.2 },
  { x: 150, y: 74, r: 1.4, dur: 6.8, delay: 2 },
  { x: 120, y: 288, r: 1.4, dur: 8.5, delay: 4 },
];

function longPath(k: number): string {
  let d = '';
  for (let y = 78; y <= 296; y += 6) d += `${y === 78 ? 'M' : 'L'}${(CX + k * widthAt(y)).toFixed(1)} ${y} `;
  return d;
}
function silhouettePath(): string {
  let d = `M${(CX - widthAt(78)).toFixed(1)} 78 `;
  for (let y = 84; y <= 296; y += 6) d += `L${(CX - widthAt(y)).toFixed(1)} ${y} `;
  for (let y = 296; y >= 78; y -= 6) d += `L${(CX + widthAt(y)).toFixed(1)} ${y} `;
  return d + 'Z';
}

export default function BodyGlow({ anchor, size = 220, className = '' }: { anchor: BodyAnchor; size?: number; className?: string }) {
  const b = useBreath();
  const points = anchorPoints(anchor);

  const geo = useMemo(() => {
    const ay = anchorY(anchor);
    const rings: { y: number; rx: number; ry: number; o: number }[] = [];
    for (let y = 84; y <= 292; y += 14) {
      const w = widthAt(y);
      const o = ay === null ? 0.5 : 0.24 + 0.42 * Math.exp(-((y - ay) ** 2) / (2 * 34 * 34));
      rings.push({ y, rx: w, ry: Math.max(2.4, w * 0.16), o });
    }
    const longs = [-1, -0.55, 0, 0.55, 1].map((k) => ({ d: longPath(k), edge: Math.abs(k) === 1 }));
    const lat = [-15, -5, 6, 15].map((dy) => {
      const r = Math.sqrt(Math.max(0, HEAD_R * HEAD_R - dy * dy));
      return { cy: HEAD_CY + dy, rx: r, ry: r * 0.32 };
    });
    const lon = [24, 17, 9].map((rx) => ({ rx, ry: HEAD_R }));
    return { rings, longs, lat, lon, silhouette: silhouettePath(), headBright: anchor === 'head' || anchor === 'whole' };
  }, [anchor]);

  const meshScale = 1 + b * 0.03;
  const bloomScale = 1 + b * 0.14;
  const bloomOpacity = 0.55 + b * 0.45;
  const auraOpacity = 0.32 + b * 0.24;
  const groundOpacity = 0.38 + b * 0.16;
  const gold = 'rgba(232,201,155,';

  return (
    <svg className={className} width={size} height={size * (340 / 240)} viewBox="0 0 240 340" fill="none" aria-hidden style={{ display: 'block', overflow: 'visible' }}>
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

      <ellipse cx="120" cy="308" rx="76" ry="14" fill="url(#bg-ground)" opacity={groundOpacity} />
      <ellipse cx="120" cy="180" rx="116" ry="158" fill="url(#bg-aura)" opacity={auraOpacity} />

      {MOTES.map((m, i) => (
        <circle key={i} cx={m.x} cy={m.y} r={m.r} fill="rgba(240,220,180,0.9)" style={{ animation: `mote-twinkle ${m.dur}s ease-in-out ${m.delay}s infinite` }} />
      ))}

      <g transform={`translate(120 190) scale(${meshScale}) translate(-120 -190)`} style={{ mixBlendMode: 'screen' }}>
        <path d={geo.silhouette} fill="url(#bg-vol)" />
        {geo.longs.map((l, i) => (
          <path key={`ln${i}`} d={l.d} fill="none" stroke={`${gold}${l.edge ? 0.42 : 0.2})`} strokeWidth={l.edge ? 1.1 : 0.8} strokeLinecap="round" />
        ))}
        {geo.rings.map((r, i) => (
          <ellipse key={`r${i}`} cx={CX} cy={r.y} rx={r.rx} ry={r.ry} fill="none" stroke={`${gold}${r.o.toFixed(3)})`} strokeWidth={1} />
        ))}
        <g stroke={`${gold}${geo.headBright ? 0.5 : 0.34})`} strokeWidth={1} fill="none">
          {geo.lat.map((e, i) => (
            <ellipse key={`la${i}`} cx={CX} cy={e.cy} rx={e.rx} ry={e.ry} />
          ))}
          {geo.lon.map((e, i) => (
            <ellipse key={`lo${i}`} cx={CX} cy={HEAD_CY} rx={e.rx} ry={e.ry} />
          ))}
        </g>
      </g>

      {anchor === 'whole' && (
        <ellipse cx="120" cy="150" rx="86" ry="150" fill="url(#bg-glow)" opacity={0.16 + b * 0.22} style={{ mixBlendMode: 'screen' }} />
      )}

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
