import { useSyncExternalStore } from 'react';
import { firstRunDone } from '../lib/storage';

/**
 * Top-level view (§11). first-run (once) → session loop ↔ hub. Returning users
 * land on the hub; new users see first-run.
 */
export type View = 'first-run' | 'session' | 'hub';

let view: View = firstRunDone() ? 'hub' : 'first-run';
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
