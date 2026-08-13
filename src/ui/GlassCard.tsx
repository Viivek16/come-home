import type { HTMLAttributes, ReactNode } from 'react';

/**
 * Glass over the water (§3): --surface + backdrop blur + 1px hairline.
 * `strong` bumps the fill for the recommended/active card.
 */
export default function GlassCard({
  children,
  strong = false,
  className = '',
  ...rest
}: { children: ReactNode; strong?: boolean } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`glass ${strong ? 'glass-strong' : ''} ${className}`} {...rest}>
      {children}
    </div>
  );
}
