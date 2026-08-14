import type { CSSProperties, ReactNode } from 'react';

/**
 * Staged reveal. Content lifts in on enter (opacity + translateY, ease-out).
 * Use incremental `delay` to stagger a sequence. Reduced-motion snaps it in.
 */
export default function Reveal({
  delay = 0,
  children,
  className = '',
  style,
}: {
  delay?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`reveal ${className}`} style={{ animationDelay: `${delay}s`, ...style }}>
      {children}
    </div>
  );
}
