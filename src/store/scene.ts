import { useSyncExternalStore } from 'react';
import { useDepth, type DepthGroup } from './water';

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

const FROM_DEPTH: Record<DepthGroup, Mood> = {
  opening: 'dawn',
  response: 'dusk',
  checkin: 'dusk',
  hub: 'day',
};

/** Resolved mood for the current screen (override wins, else derived from depth). */
export function useMood(): Mood {
  const depth = useDepth();
  const o = useOverride();
  return o ?? FROM_DEPTH[depth];
}
