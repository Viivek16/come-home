import { useSyncExternalStore } from 'react';
import { loadToolPrefs, saveToolPrefs, type ToolPrefs } from '../lib/storage';

/** Reactive tool settings (§Phase2), persisted to localStorage on every change —
 *  so the last-used duration / pattern is remembered on the next visit. */
let prefs = loadToolPrefs();
const listeners = new Set<() => void>();

export const toolPrefsStore = {
  get: () => prefs,
  patch(next: Partial<ToolPrefs>) {
    prefs = { ...prefs, ...next };
    saveToolPrefs(prefs);
    listeners.forEach((l) => l());
  },
};

export function useToolPrefs(): ToolPrefs {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => prefs,
    () => prefs,
  );
}
