import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Liquid-glass feeling chip (§6). Full-width, calm. `selected` gets the gold-lit
 * glass + a soft check — never a loud fill. Min height 52px tap target (§10).
 */
export default function Chip({
  children,
  selected = false,
  className = '',
  ...rest
}: { children: ReactNode; selected?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`glass ${selected ? 'glass-strong glass-gold' : ''} flex w-full min-h-[54px] items-center justify-between gap-3 px-5 py-3 text-left transition-[transform,border-color] duration-300 active:scale-[0.99] ${className}`}
      style={{
        borderRadius: 'var(--radius-chip)',
        transitionTimingFunction: 'var(--ease-calm)',
        color: 'var(--ink)',
        fontSize: 'var(--t-md)',
      }}
      {...rest}
    >
      <span>{children}</span>
      <span
        aria-hidden
        style={{
          flexShrink: 0,
          width: 18,
          height: 18,
          borderRadius: 999,
          border: `1.5px solid ${selected ? 'var(--gold)' : 'var(--hairline)'}`,
          background: selected ? 'var(--gold)' : 'transparent',
          display: 'grid',
          placeItems: 'center',
          transition: 'all .3s var(--ease-calm)',
        }}
      >
        {selected && (
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6.5L5 9L9.5 3.5" stroke="#11242d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
    </button>
  );
}
