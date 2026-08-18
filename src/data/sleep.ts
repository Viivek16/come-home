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

// Titles are the in-app user flow's Sleep lists, verbatim. length is 'Loops' for
// soundscapes and blank elsewhere until real assets carry a real duration.
export const SLEEP_ITEMS: SleepItem[] = [
  { id: 's-rain', title: 'Rain on still water', kind: 'Soundscape', length: 'Loops', type: 'soundscape', src: null },
  { id: 's-shore', title: 'Night by the shore', kind: 'Soundscape', length: 'Loops', type: 'soundscape', src: null },
  { id: 's-bonfire', title: 'Cozy bonfire', kind: 'Soundscape', length: 'Loops', type: 'soundscape', src: null },
  { id: 's-galaxy', title: 'Stargazing galaxy', kind: 'Soundscape', length: 'Loops', type: 'soundscape', src: null },
  { id: 's-windy', title: 'Windy night', kind: 'Soundscape', length: 'Loops', type: 'soundscape', src: null },
  { id: 'w-classical', title: 'Classical music', kind: 'Wind-down', length: '', type: 'wind-down', src: null },
  { id: 'w-basuri', title: 'Playful basuri', kind: 'Wind-down', length: '', type: 'wind-down', src: null },
  { id: 'w-piano', title: 'Classical piano', kind: 'Wind-down', length: '', type: 'wind-down', src: null },
  { id: 'w-bowls', title: 'Singing bowls', kind: 'Wind-down', length: '', type: 'wind-down', src: null },
  { id: 'w-om', title: 'Chanting Om', kind: 'Wind-down', length: '', type: 'wind-down', src: null },
  { id: 'm-binaural', title: 'Binaural beats', kind: 'Sleep', length: '', type: 'meditation', src: null },
  { id: 'm-delta', title: 'Delta waves', kind: 'Sleep', length: '', type: 'meditation', src: null },
  { id: 'm-solfeggio', title: 'Solfeggio frequencies', kind: 'Sleep', length: '', type: 'meditation', src: null },
  { id: 'm-astral', title: 'Astral music', kind: 'Sleep', length: '', type: 'meditation', src: null },
];

export const SLEEP_TYPES: { type: SleepType; heading: string; blurb: string }[] = [
  { type: 'soundscape', heading: 'Soundscapes', blurb: 'Soft sound to rest inside — plays on gently.' },
  { type: 'wind-down', heading: 'Wind-downs', blurb: 'A short path toward sleep.' },
  { type: 'meditation', heading: 'Sleep meditations', blurb: 'Longer, for drifting off.' },
];

export const sleepItemsOfType = (t: SleepType): SleepItem[] => SLEEP_ITEMS.filter((s) => s.type === t);
export const sleepItemById = (id: string): SleepItem | undefined => SLEEP_ITEMS.find((s) => s.id === id);
