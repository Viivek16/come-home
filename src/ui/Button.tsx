import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'ghost';

/**
 * One clear primary action per screen (§2). `primary` = gold, means "safe / go".
 * `ghost` = the low-pressure exit that every screen must have (§2).
 * Min height 44px tap target (§10). Calm easing, no bounce (§2).
 */
export default function Button({
  variant = 'primary',
  children,
  className = '',
  ...rest
}: { variant?: Variant; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    'inline-flex items-center justify-center min-h-[48px] px-7 select-none font-medium transition-[transform,background-color,opacity] duration-300 active:scale-[0.985]';
  const styles =
    variant === 'primary'
      ? { background: 'var(--gold)', color: '#10222b', borderRadius: 999 }
      : { color: 'var(--ink-muted)', background: 'transparent', borderRadius: 999 };
  return (
    <button
      className={`${base} ${variant === 'ghost' ? 'hover:opacity-80' : 'hover:brightness-[1.03]'} ${className}`}
      style={{ transitionTimingFunction: 'var(--ease-calm)', ...styles }}
      {...rest}
    >
      {children}
    </button>
  );
}
