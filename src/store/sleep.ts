import { useSyncExternalStore } from 'react';
import { app } from './app';
import { sleepTimer } from '../audio/sleepTimer';
import type { SleepItem } from '../data/sleep';

/**
 * The sleep item currently open in the full-screen sleep player (§Phase6). A
 * separate full-screen view (not a nav tab) — surfaced from the Sleep hub tab.
 * It can be MINIMIZED to a docked mini bar (`collapsed`) so the loop keeps playing
 * while the user moves around the app (§task-sleep).
 */
let active: SleepItem | null = null;
let collapsed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export const sleep = {
  get active() {
    return active;
  },
  get collapsed() {
    return collapsed;
  },
  set(item: SleepItem) {
    active = item;
    collapsed = false;
    notify();
  },
  /** Minimize to the docked mini bar — audio keeps playing. */
  collapse() {
    if (collapsed) return;
    collapsed = true;
    notify();
  },
  /** Re-expand the full player from the mini bar. */
  expand() {
    collapsed = false;
    app.setView('sleep');
    notify();
  },
  /** Clear the sleep player WITHOUT touching audio — used when a guided session
   *  takes over the single shared audio element. */
  dismiss() {
    if (!active && !collapsed) return;
    active = null;
    collapsed = false;
    notify();
  },
};

/** Open the sleep player for an item (a forward navigation). A fresh item starts
 *  with a fresh timer. */
export function openSleep(item: SleepItem) {
  sleepTimer.cancel();
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

// Stable snapshot so useSyncExternalStore doesn't loop (same ref when unchanged).
let cache: { item: SleepItem | null; collapsed: boolean } = { item: active, collapsed };
function snap() {
  if (cache.item !== active || cache.collapsed !== collapsed) cache = { item: active, collapsed };
  return cache;
}

export function useSleepState(): { item: SleepItem | null; collapsed: boolean } {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    snap,
    snap,
  );
}
