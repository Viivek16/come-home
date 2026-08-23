import { useEffect, useRef, useState, type ComponentType } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../lib/motion';

export type TabItem = { id: string; label: string; Icon: ComponentType<{ size?: number; strokeWidth?: number }> };

/**
 * Minimalist floating nav (§1/§2). Four options floating over a soft scroll-edge
 * scrim, no container; the active one lights up gold (styled in index.css via
 * aria-current). It auto-hides on scroll-down and springs back on scroll-up, always
 * visible near the top or when the page can't scroll, so navigation is never
 * stranded. Portaled to <body> so it's anchored to the viewport, never captured by
 * an ancestor transform/filter.
 */
function useAutoHide(): boolean {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const evaluate = () => {
      ticking = false;
      const y = window.scrollY;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight > 80;
      const delta = y - last;
      if (!scrollable || y < 24) {
        setVisible(true); // near the top, or nothing to scroll → always reachable
      } else if (delta > 6) {
        setVisible(false); // scrolling down → get out of the way
      } else if (delta < -6) {
        setVisible(true); // scrolling up → return
      }
      last = y;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(evaluate);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return visible;
}

export default function TabBar({
  items,
  active,
  onChange,
}: {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
}) {
  const visible = useAutoHide();
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);

  // Slide distance = the nav's own height + its bottom offset, so it tucks fully
  // off-screen. Measured, with a safe fallback before first layout.
  const hidden = (wrapRef.current?.offsetHeight ?? 96) + 12;

  return createPortal(
    <>
      <div className="tabbar-scrim" aria-hidden />
      <motion.div
        ref={wrapRef}
        className="tabbar-wrap"
        initial={false}
        animate={reduce ? { opacity: visible ? 1 : 0 } : { y: visible ? 0 : hidden, opacity: visible ? 1 : 0 }}
        transition={reduce ? { duration: 0.2 } : { type: 'spring', bounce: 0, duration: 0.4 }}
      >
        <nav className="tabbar" aria-label="Sections">
          {items.map(({ id, label, Icon }) => {
            const on = id === active;
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                aria-current={on ? 'page' : undefined}
                className="tabbar-btn"
                style={{ color: on ? 'var(--gold)' : 'var(--ink-muted)', transitionTimingFunction: 'var(--ease-calm)' }}
              >
                <span className="tabbar-btn-inner">
                  <Icon size={23} strokeWidth={on ? 2 : 1.6} />
                  <span style={{ fontSize: 10, letterSpacing: '0.08em' }}>{label}</span>
                </span>
              </button>
            );
          })}
        </nav>
      </motion.div>
    </>,
    document.body,
  );
}
