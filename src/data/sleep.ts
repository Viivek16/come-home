/** Sleep & Rest list (§6 hub). Neutral placeholders, data-driven (§15). */
export type SleepItem = { id: string; title: string; kind: string; length: string };

export const SLEEP_ITEMS: SleepItem[] = [
  { id: 's1', title: 'Placeholder wind-down', kind: 'Wind-down', length: '10 min' },
  { id: 's2', title: 'Placeholder night soundscape', kind: 'Soundscape', length: '45 min' },
  { id: 's3', title: 'Placeholder sleep meditation', kind: 'Sleep', length: '20 min' },
];
