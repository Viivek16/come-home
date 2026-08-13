import { useSyncExternalStore } from 'react';

/**
 * Top-level view (§11). first-run (once) → session loop ↔ hub. Kept tiny; Phase 5
 * seeds the initial value from the persisted first-run flag.
 */
export type View = 'first-run' | 'session' | 'hub';

let view: View = 'session';
const listeners = new Set<() => void>();

export const app = {
  setView(v: View) {
    if (v === view) return;
    view = v;
    listeners.forEach((l) => l());
  },
  get view() {
    return view;
  },
};

export function useView(): View {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => view,
    () => view,
  );
}
