import { useSyncExternalStore } from 'react';

/**
 * Living Water depth store (§4). Holds the TARGET params for the current route
 * group; <LivingWater /> eases its own current values toward this target over
 * ~1.2s so route changes never hard-cut.
 */
export type WaterParams = {
  intensity: number;
  deep: [number, number, number];
  top: [number, number, number];
  speed: number;
};

export type DepthGroup = 'opening' | 'response' | 'checkin' | 'hub';

// Per-route-group params, verbatim from §4.
const PRESETS: Record<DepthGroup, WaterParams> = {
  opening: { intensity: 1.0, deep: [0.024, 0.075, 0.102], top: [0.071, 0.208, 0.251], speed: 1.0 },
  response: { intensity: 0.7, deep: [0.012, 0.05, 0.07], top: [0.05, 0.16, 0.2], speed: 0.6 },
  checkin: { intensity: 0.45, deep: [0.028, 0.094, 0.125], top: [0.063, 0.2, 0.239], speed: 0.4 },
  hub: { intensity: 0.55, deep: [0.02, 0.07, 0.095], top: [0.06, 0.18, 0.22], speed: 0.5 },
};

let group: DepthGroup = 'opening';
const listeners = new Set<() => void>();

export function setDepth(next: DepthGroup) {
  if (next === group) return;
  group = next;
  listeners.forEach((l) => l());
}

/** Imperative read for the render loop (no React re-render). */
export const targetParams = (): WaterParams => PRESETS[group];

export function useDepth(): DepthGroup {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => group,
    () => group,
  );
}
