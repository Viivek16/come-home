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
    'inline-flex items-center justify-center min-h-[52px] px-8 select-none font-medium transition-[transform,box-shadow,opacity] duration-300 active:scale-[0.97]';
  const styles: React.CSSProperties =
    variant === 'primary'
      ? {
          background: 'linear-gradient(180deg, #F0D6AA, var(--gold-deep))',
          color: '#11242d',
          borderRadius: 999,
          boxShadow: '0 10px 30px rgba(232,201,155,0.28), inset 0 1px 0 rgba(255,255,255,0.5)',
        }
      : { color: 'var(--ink-muted)', background: 'transparent', borderRadius: 999 };
  return (
    <button
      className={`${base} ${variant === 'ghost' ? 'hover:opacity-80' : 'hover:brightness-[1.04]'} ${className}`}
      style={{ transitionTimingFunction: 'var(--ease-calm)', ...styles }}
      {...rest}
    >
      {children}
    </button>
  );
}
