import type { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Glass feeling chip (§6 Arrival / check-in). Full-width, left-aligned, calm.
 * `selected` gives the gold hairline + lift — never a loud fill.
 * Min height 48px tap target (§10).
 */
export default function Chip({
  children,
  selected = false,
  className = '',
  ...rest
}: { children: ReactNode; selected?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`glass w-full min-h-[52px] px-5 py-3 text-left transition-[background-color,border-color,transform] duration-300 active:scale-[0.99] ${className}`}
      style={{
        borderRadius: 'var(--radius-chip)',
        transitionTimingFunction: 'var(--ease-calm)',
        color: 'var(--ink)',
        fontSize: 'var(--t-md)',
        borderColor: selected ? 'var(--gold)' : 'var(--hairline)',
        background: selected ? 'var(--surface-strong)' : 'var(--surface)',
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
