import { useSyncExternalStore } from 'react';

/**
 * Reduced-motion, one source of truth (§2, §10). Effective = system preference
 * OR the user's in-app override (Profile → Reduce motion). Honored by the breath
 * clock, the water, screen transitions, and CSS (via the data-reduced attribute).
 */
let forced = false;
const listeners = new Set<() => void>();
const mq = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;

export function prefersReduced(): boolean {
  return (mq?.matches ?? false) || forced;
}

function syncAttr() {
  if (typeof document !== 'undefined') document.documentElement.toggleAttribute('data-reduced', prefersReduced());
}
function notify() {
  syncAttr();
  listeners.forEach((l) => l());
}

mq?.addEventListener?.('change', notify);
syncAttr();

/** Apply the user override (from persisted prefs). */
export function setReduceMotionPref(on: boolean) {
  if (forced === on) return;
  forced = on;
  notify();
}

export function subscribeMotion(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Reactive hook — re-renders when system pref or the override changes. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeMotion, prefersReduced, () => false);
}
