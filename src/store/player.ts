import { useSyncExternalStore } from 'react';
import { sleepTimer } from '../audio/sleepTimer';

/**
 * Player surface state (Phase A). Decouples the *player chrome* (full-screen vs.
 * docked mini) from the session flow, so leaving the player collapses to a mini
 * bar WITHOUT stopping playback — the whole point of "always an exit, never kill
 * the audio". One session owns the single audio element at a time (see lib/audio),
 * so this is one small global flag pair, not a queue.
 *
 *  - active    → a guided session currently owns the transport (mini may show).
 *  - collapsed → the full player is minimised to the docked mini bar.
 *
 * Title/tag/favKey are NOT stored here: they derive from the (un-reset) session
 * store while collapsed, so there is a single source of truth (§ no duplication).
 */
let active = false;
let collapsed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export const player = {
  get active() {
    return active;
  },
  get collapsed() {
    return collapsed;
  },
  /** The full session player mounted — a session now owns the transport. */
  begin() {
    if (active && !collapsed) return;
    active = true;
    collapsed = false;
    notify();
  },
  /** Minimise to the docked mini bar (audio keeps playing). */
  collapse() {
    if (collapsed) return;
    collapsed = true;
    notify();
  },
  /** Re-expand to the full player. */
  expand() {
    if (!collapsed) return;
    collapsed = false;
    notify();
  },
  /** Session finished, stopped, or left for good — hide the mini, drop any timer. */
  end() {
    sleepTimer.cancel();
    if (!active && !collapsed) return;
    active = false;
    collapsed = false;
    notify();
  },
};

/** Reactive { active, collapsed }. */
export function usePlayer(): { active: boolean; collapsed: boolean } {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => snap(),
    () => snap(),
  );
}

// Stable snapshot so useSyncExternalStore doesn't loop (same ref when unchanged).
let cache = { active, collapsed };
function snap() {
  if (cache.active !== active || cache.collapsed !== collapsed) cache = { active, collapsed };
  return cache;
}
