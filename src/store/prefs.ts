import { useSyncExternalStore } from 'react';
import { loadPrefs, savePrefs, type Prefs, type Reminder } from '../lib/storage';

/** Reactive user prefs (§8), persisted to localStorage on every change. */
let prefs = loadPrefs();
const listeners = new Set<() => void>();

function commit(patch: Partial<Prefs>) {
  prefs = { ...prefs, ...patch };
  savePrefs(prefs);
  listeners.forEach((l) => l());
}

export const prefsStore = {
  get: () => prefs,
  setName: (name: string) => commit({ name }),
  setReduceMotion: (reduceMotion: boolean) => commit({ reduceMotion }),
  setVoice: (voice: string) => commit({ voice }),
  setAmbientMuted: (ambientMuted: boolean) => commit({ ambientMuted }),
  setReminder: (reminder: Reminder) => commit({ reminder }),
};

export function usePrefs(): Prefs {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => prefs,
    () => prefs,
  );
}
