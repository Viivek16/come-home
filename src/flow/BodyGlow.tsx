import { useBreath } from '../breath/useBreath';
import type { BodyAnchor } from '../data/flows';

/**
 * A luminous figure (§Phase-polish). A serene form drawn in one gentle line, given
 * depth by a vertical fill gradient, a champagne rim-light on its upper edge, and
 * an inner glow so it reads lit from within — resting in a soft pool of warmth with
 * faint motes in the air. A champagne bloom sits at the entry's body anchor and
 * breathes on the shared clock (4s in / 6s out), sending slow rings of light
 * outward. Pure SVG + gradients — no blur filter, no Three.js, no second WebGL
 * context, so it never competes with the water shader. Reduced motion holds the
 * clock at rest, so it settles still.
 */

// Anchor → point on the 240×320 figure. `hands` lights both; `whole` relights the
// whole silhouette instead of a single point.
const POINTS: Record<Exclude<BodyAnchor, 'whole' | 'hands'>, [number, number]> = {
  head: [120, 50],
  throat: [120, 84],
  chest: [120, 112],
  solarPlexus: [120, 140],
  belly: [120, 168],
  sacral: [120, 196],
  lowerBack: [120, 218],
};
const HANDS: [number, number][] = [
  [90, 236],
  [150, 236],
];

// The figure: an elegant vessel-like silhouette, head joined by a neck (no floating gap).
const BODY =
  'M120 66 C105 66 94 74 89 90 C83 112 79 150 78 190 C77 226 70 262 80 284 C90 300 150 300 160 284 C170 262 163 226 162 190 C161 150 157 112 151 90 C146 74 135 66 120 66 Z';

// Faint motes drifting in the figure's light (opacity twinkle only).
const MOTES: { x: number; y: number; r: number; dur: number; delay: number }[] = [
  { x: 66, y: 120, r: 1.6, dur: 6.5, delay: 0 },
  { x: 176, y: 150, r: 1.3, dur: 8, delay: 1.4 },
  { x: 58, y: 206, r: 1.4, dur: 7, delay: 2.6 },
  { x: 184, y: 214, r: 1.2, dur: 9, delay: 0.8 },
  { x: 92, y: 70, r: 1.3, dur: 7.5, delay: 3.2 },
  { x: 152, y: 78, r: 1.5, dur: 6.8, delay: 2 },
  { x: 120, y: 262, r: 1.4, dur: 8.5, delay: 4 },
];

function pointsFor(anchor: BodyAnchor): [number, number][] {
  if (anchor === 'whole') return [];
  if (anchor === 'hands') return HANDS;
  return [POINTS[anchor]];
}

export default function BodyGlow({ anchor, size = 220, className = '' }: { anchor: BodyAnchor; size?: number; className?: string }) {
  const b = useBreath(); // 0..1 shared breath clock
  const points = pointsFor(anchor);

  const bloomScale = 1 + b * 0.14;
  const bloomOpacity = 0.55 + b * 0.45;
  const innerOpacity = 0.4 + b * 0.4;
  const auraOpacity = 0.34 + b * 0.26;
  const wholeOpacity = 0.16 + b * 0.26;
  const groundOpacity = 0.4 + b * 0.16;

  return (
    <svg
      className={className}
      width={size}
      height={size * (320 / 240)}
      viewBox="0 0 240 320"
      fill="none"
      aria-hidden
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="bg-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(246,224,184,0.30)" />
          <stop offset="30%" stopColor="rgba(232,201,155,0.18)" />
          <stop offset="65%" stopColor="rgba(232,201,155,0.09)" />
          <stop offset="100%" stopColor="rgba(232,201,155,0.035)" />
        </linearGradient>
        {/* rim light — bright on the upper-left edge, fading around the form */}
        <linearGradient id="bg-rim" x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="rgba(255,242,214,0.9)" />
          <stop offset="35%" stopColor="rgba(232,201,155,0.34)" />
          <stop offset="72%" stopColor="rgba(232,201,155,0.05)" />
          <stop offset="100%" stopColor="rgba(232,201,155,0)" />
        </linearGradient>
        <radialGradient id="bg-inner" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,238,206,0.5)" />
          <stop offset="45%" stopColor="rgba(255,238,206,0.14)" />
          <stop offset="100%" stopColor="rgba(255,238,206,0)" />
        </radialGradient>
        {/* anchor bloom — #E3C08D-family core fading to nothing */}
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
        <clipPath id="bg-fig">
          <ellipse cx="120" cy="48" rx="18" ry="20" />
          <path d={BODY} />
        </clipPath>
      </defs>

      {/* soft pool the figure rests in */}
      <ellipse cx="120" cy="298" rx="74" ry="14" fill="url(#bg-ground)" opacity={groundOpacity} />

      {/* outer aura */}
      <ellipse cx="120" cy="168" rx="112" ry="150" fill="url(#bg-aura)" opacity={auraOpacity} />

      {/* motes in the light */}
      {MOTES.map((m, i) => (
        <circle
          key={i}
          cx={m.x}
          cy={m.y}
          r={m.r}
          fill="rgba(240,220,180,0.9)"
          style={{ animation: `mote-twinkle ${m.dur}s ease-in-out ${m.delay}s infinite` }}
        />
      ))}

      {/* the figure: gradient body + inner glow (clipped) + rim light */}
      <g fill="url(#bg-body)">
        <ellipse cx="120" cy="48" rx="18" ry="20" />
        <path d={BODY} />
      </g>
      <g clipPath="url(#bg-fig)">
        <ellipse cx="120" cy="126" rx="62" ry="112" fill="url(#bg-inner)" opacity={innerOpacity} style={{ mixBlendMode: 'screen' }} />
        {anchor === 'whole' && (
          <ellipse cx="120" cy="150" rx="120" ry="160" fill="url(#bg-glow)" opacity={wholeOpacity} style={{ mixBlendMode: 'screen' }} />
        )}
      </g>
      <g fill="none" stroke="url(#bg-rim)" strokeWidth={1.4}>
        <ellipse cx="120" cy="48" rx="18" ry="20" />
        <path d={BODY} />
      </g>

      {/* anchor bloom: slow rings of light + halo + bright core, breathing */}
      {points.map(([x, y], i) => (
        <g key={i} style={{ mixBlendMode: 'screen' }}>
          {[0, 1].map((k) => {
            const p = (b + k * 0.5) % 1; // two rings, half a breath apart
            return <circle key={k} cx={x} cy={y} r={18 + p * 40} fill="none" stroke="rgba(232,201,155,0.9)" strokeWidth={1} opacity={(1 - p) * 0.34} />;
          })}
          <circle cx="0" cy="0" r="46" fill="url(#bg-glow)" opacity={bloomOpacity} transform={`translate(${x} ${y}) scale(${bloomScale})`} />
          <circle cx="0" cy="0" r="15" fill="url(#bg-core)" opacity={bloomOpacity} transform={`translate(${x} ${y}) scale(${1 + b * 0.2})`} />
        </g>
      ))}
    </svg>
  );
}
