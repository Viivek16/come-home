/**
 * Sleep & Rest content (§6 hub, §Phase6). Data-driven and content-ready: three
 * types — looping soundscapes, wind-downs, and sleep meditations. Each item's
 * audio `src` is null until real assets are supplied; the player then shows a
 * calm "coming soon" state. Add a real `src` (and nothing else) and it plays —
 * soundscapes loop, the rest play through once.
 */
export type SleepType = 'soundscape' | 'wind-down' | 'meditation';
export type SleepItem = {
  id: string;
  title: string;
  kind: string; // display label
  length: string;
  type: SleepType;
  src: string | null; // real asset URL later; null → coming soon
};

export const SLEEP_ITEMS: SleepItem[] = [
  { id: 's1', title: 'Placeholder wind-down', kind: 'Wind-down', length: '10 min', type: 'wind-down', src: null },
  { id: 's2', title: 'Placeholder night soundscape', kind: 'Soundscape', length: 'Loops', type: 'soundscape', src: null },
  { id: 's3', title: 'Placeholder sleep meditation', kind: 'Sleep', length: '20 min', type: 'meditation', src: null },
];

export const SLEEP_TYPES: { type: SleepType; heading: string; blurb: string }[] = [
  { type: 'soundscape', heading: 'Soundscapes', blurb: 'Soft sound to rest inside — plays on gently.' },
  { type: 'wind-down', heading: 'Wind-downs', blurb: 'A short path toward sleep.' },
  { type: 'meditation', heading: 'Sleep meditations', blurb: 'Longer, for drifting off.' },
];

export const sleepItemsOfType = (t: SleepType): SleepItem[] => SLEEP_ITEMS.filter((s) => s.type === t);
export const sleepItemById = (id: string): SleepItem | undefined => SLEEP_ITEMS.find((s) => s.id === id);
