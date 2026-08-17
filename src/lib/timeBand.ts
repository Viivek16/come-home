import { useSyncExternalStore } from 'react';
import type { Mood } from '../store/scene';

/**
 * Time of day — the SINGLE source of truth (§Phase B). Six bands. Everything
 * time-aware (shader tint in store/water, greeting + Home card in HomeTab, the
 * illustrated scene mood in store/scene) derives from getTimeBand, so they can
 * never disagree.
 */
export type TimeBand = 'dawn' | 'morning' | 'midday' | 'golden' | 'dusk' | 'night';

export function getTimeBand(d: Date = new Date()): TimeBand {
  const h = d.getHours();
  if (h >= 5 && h < 8) return 'dawn';
  if (h >= 8 && h < 12) return 'morning';
  if (h >= 12 && h < 16) return 'midday';
  if (h >= 16 && h < 19) return 'golden';
  if (h >= 19 && h < 21) return 'dusk';
  return 'night'; // 21–05
}

/** Greeting copy per band — hi line (a name may be appended) + a gentle sub. */
export const BAND_GREETING: Record<TimeBand, { hi: string; sub: string }> = {
  dawn: { hi: 'A gentle start', sub: 'The day is still soft. No rush.' },
  morning: { hi: 'Good morning', sub: 'A soft start to the day.' },
  midday: { hi: 'A pause in your day', sub: 'A breath in the middle of it all.' },
  golden: { hi: 'Winding down', sub: 'The light is going gold. Ease off.' },
  dusk: { hi: 'Easing into evening', sub: 'Let the day settle behind you.' },
  night: { hi: 'Good night', sub: 'May the night be gentle with you.' },
};

/**
 * Six bands → the scene's four illustrated moods. The illustrated horizon is a
 * separate layer (out of scope this phase), but it must stay consistent with the
 * band so the sky and the water never disagree.
 */
export function bandMood(b: TimeBand): Mood {
  switch (b) {
    case 'dawn':
    case 'morning':
      return 'dawn';
    case 'midday':
      return 'day';
    case 'golden':
    case 'dusk':
      return 'dusk';
    case 'night':
      return 'night';
  }
}

// Reactive current band, refreshed each minute so an app left open crosses a
// boundary on its own. One clock, shared by the water, the scene and the hub.
let current = getTimeBand();
const listeners = new Set<() => void>();
if (typeof window !== 'undefined') {
  setInterval(() => {
    const next = getTimeBand();
    if (next === current) return;
    current = next;
    listeners.forEach((l) => l());
  }, 60_000);
}

/** Imperative read for the water render loop (no React re-render). */
export const currentBand = (): TimeBand => current;

/** Reactive current band — re-renders on a boundary crossing. */
export function useTimeBand(): TimeBand {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => current,
    () => current,
  );
}

// Dev-only clock mock (the spec asks to "test by mocking the clock to each band").
// Guarded by import.meta.env.DEV, so it is stripped from production builds. The
// interval corrects `current` on the next tick, so a mock never sticks.
export function __setBandForTest(b: TimeBand | null) {
  current = b ?? getTimeBand();
  listeners.forEach((l) => l());
}
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  const w = window as unknown as Record<string, unknown>;
  w.__setBand = __setBandForTest;
  w.__getTimeBand = getTimeBand;
}
