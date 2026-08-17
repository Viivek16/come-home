import { useSyncExternalStore } from 'react';
import { useDepth, type DepthGroup } from './water';
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

// The guided session keeps its own dawn→dusk emotional arc; only the hub tracks
// the wall clock (that's where "Good morning" lives).
const FROM_DEPTH: Record<DepthGroup, Mood> = {
  opening: 'dawn',
  response: 'dusk',
  checkin: 'dusk',
  hub: 'day', // overridden by the clock in useMood
};

/** Resolved mood (override wins → hub follows the time band → else the depth arc).
 *  The band comes from the shared clock (lib/timeBand), so the illustrated sky and
 *  the water/greeting never disagree (§Phase B). */
export function useMood(): Mood {
  const depth = useDepth();
  const o = useOverride();
  const clock = bandMood(useTimeBand());
  if (o) return o;
  if (depth === 'hub') return clock;
  return FROM_DEPTH[depth];
}
