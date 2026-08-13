import type { ReactNode } from 'react';

/** Eyebrow label — Inter 400, .14em tracked, uppercase, muted (§3). */
export default function Label({ children }: { children: ReactNode }) {
  return <span className="eyebrow">{children}</span>;
}
