import { useSyncExternalStore } from 'react';
import { app } from './app';
import type { SleepItem } from '../data/sleep';

/**
 * The sleep item currently open in the full-screen sleep player (§Phase6). A
 * separate full-screen view (not a nav tab) — surfaced from the Sleep hub tab.
 */
let active: SleepItem | null = null;
const listeners = new Set<() => void>();

export const sleep = {
  get active() {
    return active;
  },
  set(item: SleepItem) {
    active = item;
    listeners.forEach((l) => l());
  },
};

/** Open the sleep player for an item (a forward navigation). */
export function openSleep(item: SleepItem) {
  sleep.set(item);
  app.setView('sleep');
}

export function useSleepItem(): SleepItem | null {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => active,
    () => active,
  );
}
