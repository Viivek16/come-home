/**
 * Sleep & Rest content (§6 hub, §Phase6). Data-driven, three types: looping
 * soundscapes, wind-downs, and sleep meditations. Each item points at a real audio
 * asset in public/audio; the player loops soundscapes and plays the rest through
 * once. A null `src` would fall back to the calm unavailable state.
 */
export type SleepType = 'soundscape' | 'wind-down' | 'meditation';
export type SleepItem = {
  id: string;
  title: string;
  kind: string; // display label
  length: string;
  type: SleepType;
  src: string | null; // real asset URL later; null → calm unavailable state
};

// length is 'Loops' for soundscapes and blank elsewhere. src maps each item to its
// track in public/audio (served at /audio/*.mp3).
export const SLEEP_ITEMS: SleepItem[] = [
  { id: 's-rain', title: 'Rain on Still Water', kind: 'Soundscape', length: 'Loops', type: 'soundscape', src: '/audio/rain.mp3' },
  { id: 's-shore', title: 'Ocean Waves', kind: 'Soundscape', length: 'Loops', type: 'soundscape', src: '/audio/ocean.mp3' },
  { id: 's-bonfire', title: 'Cozy Bonfire', kind: 'Soundscape', length: 'Loops', type: 'soundscape', src: '/audio/bonfire.mp3' },
  { id: 's-galaxy', title: 'Cosmos', kind: 'Soundscape', length: 'Loops', type: 'soundscape', src: '/audio/stargazing.mp3' },
  { id: 's-windy', title: 'Windy Night', kind: 'Soundscape', length: 'Loops', type: 'soundscape', src: '/audio/wind.mp3' },
  { id: 'w-classical', title: 'Classical Music', kind: 'Wind-down', length: '', type: 'wind-down', src: '/audio/classical.mp3' },
  { id: 'w-basuri', title: 'Flute', kind: 'Wind-down', length: '', type: 'wind-down', src: '/audio/flute.mp3' },
  { id: 'w-piano', title: 'Classical Piano', kind: 'Wind-down', length: '', type: 'wind-down', src: '/audio/piano.mp3' },
  { id: 'w-bowls', title: 'Singing Bowls', kind: 'Wind-down', length: '', type: 'wind-down', src: '/audio/singing-bowl.mp3' },
  { id: 'w-om', title: 'Chanting Om', kind: 'Wind-down', length: '', type: 'wind-down', src: '/audio/om.mp3' },
  { id: 'm-binaural', title: 'Binaural Beats', kind: 'Sleep', length: '', type: 'meditation', src: '/audio/binaural.mp3' },
  { id: 'm-delta', title: 'Delta Waves', kind: 'Sleep', length: '', type: 'meditation', src: '/audio/delta-waves.mp3' },
  { id: 'm-solfeggio', title: 'Solfeggio Frequencies', kind: 'Sleep', length: '', type: 'meditation', src: '/audio/solfeggio.mp3' },
  { id: 'm-astral', title: 'Astral Music', kind: 'Sleep', length: '', type: 'meditation', src: '/audio/astral.mp3' },
];

export const SLEEP_TYPES: { type: SleepType; heading: string; blurb: string }[] = [
  { type: 'soundscape', heading: 'Soundscapes', blurb: 'Soft sound to rest inside — plays on gently.' },
  { type: 'wind-down', heading: 'Wind-downs', blurb: 'A short path toward sleep.' },
  { type: 'meditation', heading: 'Sleep meditations', blurb: 'Longer, for drifting off.' },
];

export const sleepItemsOfType = (t: SleepType): SleepItem[] => SLEEP_ITEMS.filter((s) => s.type === t);
export const sleepItemById = (id: string): SleepItem | undefined => SLEEP_ITEMS.find((s) => s.id === id);
