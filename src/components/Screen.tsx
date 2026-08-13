import type { ReactNode } from 'react';

// Plain screen wrapper. Page transitions live on the keyed motion.div in App so
// AnimatePresence tracks a single element (robust under StrictMode).
export default function Screen({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <main className={`min-h-full ${className}`}>{children}</main>;
}
