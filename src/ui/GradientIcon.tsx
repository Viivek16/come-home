import { useId, type ReactNode } from 'react';

/**
 * Soft-gradient category icons (§Phase G). Line icons stroked with a gentle
 * teal→champagne gradient, staying inside the Still Water palette (cool water to
 * warm gold, never a second hue). Used consistently for sections and states.
 *
 * Each instance mints a unique gradient id (useId) so multiple icons on one screen
 * never collide.
 */
export type GradientIconName = 'moon' | 'sun' | 'waves' | 'star' | 'wind';

const PATHS: Record<GradientIconName, ReactNode> = {
  moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </>
  ),
  waves: (
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 1.3 0 1.9-.5 2.5-1M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11c2.6 0 2.4 2 5 2 1.3 0 1.9-.5 2.5-1M2 18c.6.5 1.2 1 2.5 1C7 19 7 17 9.5 17c2.6 0 2.4 2 5 2 1.3 0 1.9-.5 2.5-1" />
  ),
  star: <path d="M12 3l2.6 5.27 5.82.85-4.21 4.1.99 5.8L12 16.9l-5.2 2.73.99-5.8-4.21-4.1 5.82-.85L12 3z" />,
  wind: <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2M9.6 4.6A2 2 0 1 1 11 8H2M12.6 19.4A2 2 0 1 0 14 16H2" />,
};

export default function GradientIcon({
  name,
  size = 22,
  strokeWidth = 1.5,
}: {
  name: GradientIconName;
  size?: number;
  strokeWidth?: number;
}) {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={`url(#${id})`}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7FB0B3" />
          <stop offset="55%" stopColor="#C9BFA8" />
          <stop offset="100%" stopColor="#E8C99B" />
        </linearGradient>
      </defs>
      {PATHS[name]}
    </svg>
  );
}
