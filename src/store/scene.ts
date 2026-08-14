import { useSyncExternalStore } from 'react';
import { useDepth, type DepthGroup } from './water';
import { phaseMood } from '../lib/greeting';

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

// Wall-clock phase, refreshed each minute so an open app crosses dawn/dusk on its
// own. useSyncExternalStore keeps it out of every component's render path.
let clockPhaseMood: Mood = phaseMood();
const clockListeners = new Set<() => void>();
if (typeof window !== 'undefined') {
  setInterval(() => {
    const next = phaseMood();
    if (next === clockPhaseMood) return;
    clockPhaseMood = next;
    clockListeners.forEach((l) => l());
  }, 60_000);
}
function useClockMood(): Mood {
  return useSyncExternalStore(
    (l) => (clockListeners.add(l), () => clockListeners.delete(l)),
    () => clockPhaseMood,
    () => clockPhaseMood,
  );
}

/** Resolved mood (override wins → hub follows the clock → else the depth arc). */
export function useMood(): Mood {
  const depth = useDepth();
  const o = useOverride();
  const clock = useClockMood();
  if (o) return o;
  if (depth === 'hub') return clock;
  return FROM_DEPTH[depth];
}
