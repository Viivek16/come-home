import { useBreath } from '../breath/useBreath';

/**
 * The breathing mark (§5): a gold lotus on still water. Scales 1.0→1.1 and its
 * glow brightens on the shared breath clock, so splash / opening / return all
 * breathe as one organism. Decorative → aria-hidden.
 */
export default function Mark({ size = 88 }: { size?: number }) {
  const b = useBreath(); // 0..1
  const scale = 1 + b * 0.1;
  const glow = 0.28 + b * 0.32;

  return (
    <div
      aria-hidden
      style={{ width: size, height: size, position: 'relative', display: 'grid', placeItems: 'center' }}
    >
      {/* soft champagne glow, breathing */}
      <div
        style={{
          position: 'absolute',
          inset: '-40%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,201,155,0.55) 0%, transparent 65%)',
          opacity: glow,
          filter: 'blur(6px)',
          transition: 'opacity 120ms linear',
        }}
      />
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        style={{ transform: `scale(${scale})`, transition: 'transform 120ms linear', position: 'relative' }}
      >
        {/* still-water line */}
        <path d="M18 68 Q50 74 82 68" stroke="var(--gold)" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
        {/* lotus petals */}
        <g stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M50 66 C50 44 50 34 50 24 C50 34 50 44 50 66Z" opacity="0.95" />
          <path d="M50 66 C42 48 36 40 30 34 C34 44 40 56 50 66Z" opacity="0.85" />
          <path d="M50 66 C58 48 64 40 70 34 C66 44 60 56 50 66Z" opacity="0.85" />
          <path d="M50 66 C36 54 26 50 18 48 C28 56 38 62 50 66Z" opacity="0.7" />
          <path d="M50 66 C64 54 74 50 82 48 C72 56 62 62 50 66Z" opacity="0.7" />
        </g>
      </svg>
    </div>
  );
}
