import { useSyncExternalStore } from 'react';
import { prefersReduced, subscribeMotion } from '../lib/motion';

/**
 * Global breath clock (§5). ONE shared clock for the whole app so the water,
 * the mark, the breathe-with-me ring and every glow pulse breathe together.
 * 4s inhale / 6s exhale (10s cycle), eased. Returns 0..1.
 *
 * - prefers-reduced-motion → constant 0.5, no requestAnimationFrame (§2, §10).
 * - document hidden / backgrounded → RAF cancelled, resumes on focus (§4).
 * - Single RAF loop shared by all subscribers; stops when none remain.
 */
const INHALE = 4;
const EXHALE = 6;
const CYCLE = INHALE + EXHALE;

// easeOutCubic — a calm approximation of cubic-bezier(.22,.61,.36,1).
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

function breathAt(seconds: number): number {
  const t = seconds % CYCLE;
  return t < INHALE ? ease(t / INHALE) : 1 - ease((t - INHALE) / EXHALE);
}

let value = 0.5;
let raf = 0;
const start = typeof performance !== 'undefined' ? performance.now() : 0;
const listeners = new Set<() => void>();

function tick(now: number) {
  value = breathAt((now - start) / 1000);
  listeners.forEach((l) => l());
  raf = requestAnimationFrame(tick);
}

function ensureRunning() {
  if (raf || prefersReduced() || (typeof document !== 'undefined' && document.hidden)) return;
  raf = requestAnimationFrame(tick);
}

function stop() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (listeners.size) ensureRunning();
  });
}

// React to a reduced-motion change (system or in-app override): freeze at rest,
// or resume the shared clock.
subscribeMotion(() => {
  if (prefersReduced()) {
    stop();
    value = 0.5;
    listeners.forEach((l) => l());
  } else if (listeners.size) {
    ensureRunning();
  }
});

function subscribe(cb: () => void) {
  listeners.add(cb);
  ensureRunning();
  return () => {
    listeners.delete(cb);
    if (!listeners.size) stop();
  };
}

/** Current breath value 0..1. Re-renders the caller each frame while breathing. */
export function useBreath(): number {
  return useSyncExternalStore(subscribe, () => value, () => 0.5);
}

/** Non-reactive read (for imperative consumers like the water shader). */
export const breathValue = () => value;
