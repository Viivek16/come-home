import { useSyncExternalStore } from 'react';
import { useTimeBand, bandMood } from '../lib/timeBand';

/**
 * Scene mood (illustrated backdrop). Defaults to 'auto' — derived from the water
 * depth group — but a screen can pin a specific mood (e.g. Sleep → night).
 */
export type Mood = 'dawn' | 'day' | 'dusk' | 'night';

let override: Mood | null = null;
const listeners = new Set<() => void>();

export function setMood(m: Mood | null) {
  if (override === m) return;
  override = m;
  listeners.forEach((l) => l());
}

function useOverride(): Mood | null {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => override,
    () => override,
  );
}

/** Resolved mood (override wins → else the real time of day). Every screen now
 *  follows the wall clock, so a midday session shows the day sky, not a fixed
 *  dawn→dusk arc (§Phase A). Sleep still pins 'night' via the override. The band
 *  comes from the shared clock (lib/timeBand), so sky, water and greeting agree. */
export function useMood(): Mood {
  const o = useOverride();
  const clock = bandMood(useTimeBand());
  if (o) return o;
  return clock;
}
