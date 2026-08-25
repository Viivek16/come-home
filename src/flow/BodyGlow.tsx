import { useBreath } from '../breath/useBreath';
import type { BodyAnchor } from '../data/flows';

/**
 * A calm luminous figure (§Phase B). A soft seated silhouette drawn in one gentle
 * SVG stroke, lit from within, with a champagne glow at the entry's body anchor
 * that breathes on the shared clock (4s in / 6s out). Pure SVG + gradients — no
 * blur filter, no Three.js, no second WebGL context, so it never competes with
 * the water shader on a mid-range device. Reduced motion holds the clock at rest,
 * so the glow simply sits still.
 */

// Anchor → point on the 200×340 figure. `hands` glows both; `whole` lights the
// whole silhouette instead of a single point.
const POINTS: Record<Exclude<BodyAnchor, 'whole' | 'hands'>, [number, number]> = {
  head: [100, 58],
  throat: [100, 92],
  chest: [100, 124],
  solarPlexus: [100, 150],
  belly: [100, 178],
  sacral: [100, 205],
  lowerBack: [100, 224],
};

const HANDS: [number, number][] = [
  [60, 244],
  [140, 244],
];

// The seated figure: a soft bell body under a round head, one closed path each.
const BODY =
  'M100 84 C78 84 66 96 62 118 C56 150 48 210 44 262 C42 292 52 308 74 314 C88 318 112 318 126 314 C148 308 158 292 156 262 C152 210 144 150 138 118 C134 96 122 84 100 84 Z';

function pointsFor(anchor: BodyAnchor): [number, number][] {
  if (anchor === 'whole') return [];
  if (anchor === 'hands') return HANDS;
  return [POINTS[anchor]];
}

export default function BodyGlow({ anchor, size = 220, className = '' }: { anchor: BodyAnchor; size?: number; className?: string }) {
  const b = useBreath(); // 0..1 shared breath clock
  const points = pointsFor(anchor);

  // Breathe: bloom a little on the inhale, settle on the exhale.
  const scale = 1 + b * 0.16;
  const glowOpacity = 0.5 + b * 0.5;
  const wholeOpacity = 0.14 + b * 0.24;

  return (
    <svg
      className={className}
      width={size}
      height={size * (340 / 200)}
      viewBox="0 0 200 340"
      fill="none"
      aria-hidden
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <radialGradient id="bg-fill" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="rgba(232,201,155,0.22)" />
          <stop offset="55%" stopColor="rgba(232,201,155,0.08)" />
          <stop offset="100%" stopColor="rgba(232,201,155,0.02)" />
        </radialGradient>
        {/* The point glow — #E3C08D core fading to nothing (soft without a blur filter). */}
        <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(227,192,141,0.95)" />
          <stop offset="30%" stopColor="rgba(227,192,141,0.5)" />
          <stop offset="62%" stopColor="rgba(227,192,141,0.14)" />
          <stop offset="100%" stopColor="rgba(227,192,141,0)" />
        </radialGradient>
        <radialGradient id="bg-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(227,192,141,0.12)" />
          <stop offset="100%" stopColor="rgba(227,192,141,0)" />
        </radialGradient>
      </defs>

      {/* faint outer halo for depth (breathes very subtly) */}
      <ellipse cx="100" cy="180" rx="92" ry="150" fill="url(#bg-halo)" opacity={0.35 + b * 0.2} />

      {/* the figure: lit-from-within fill + a gentle champagne stroke */}
      <g stroke="rgba(232,201,155,0.30)" strokeWidth={1.2} fill="url(#bg-fill)">
        <circle cx="100" cy="52" r="26" />
        <path d={BODY} />
      </g>

      {/* whole-body glow: relight the silhouette softly, breathing */}
      {anchor === 'whole' && (
        <g fill="url(#bg-glow)" opacity={wholeOpacity} style={{ mixBlendMode: 'screen' }}>
          <circle cx="100" cy="52" r="26" />
          <path d={BODY} />
        </g>
      )}

      {/* point glow(s): a champagne bloom that breathes at each anchor */}
      {points.map(([x, y], i) => (
        <circle
          key={i}
          cx="0"
          cy="0"
          r="42"
          fill="url(#bg-glow)"
          opacity={glowOpacity}
          transform={`translate(${x} ${y}) scale(${scale})`}
          style={{ mixBlendMode: 'screen' }}
        />
      ))}
    </svg>
  );
}
