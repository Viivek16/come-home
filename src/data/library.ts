/** Library list (§6 hub) — browse by feeling · length · voice. Neutral
 *  placeholders, data-driven (§15). Offline download is stubbed for now. */
export type LibraryItem = { id: string; title: string; feeling: string; length: string; voice: string };

// Feelings are drawn from the shared six (data/feelings) so the Library selector
// and the rest of the app speak one vocabulary.
export const LIBRARY_ITEMS: LibraryItem[] = [
  { id: 'l1', title: 'Placeholder Grounding', feeling: 'Overwhelmed', length: '2 min', voice: 'Default' },
  { id: 'l2', title: 'Placeholder Stillness', feeling: 'Afraid', length: '5 min', voice: 'Default' },
  { id: 'l3', title: 'Placeholder Rest', feeling: 'Sleep Deprived', length: '15 min', voice: 'Default' },
  { id: 'l4', title: 'Placeholder Calm', feeling: 'Stress', length: '20 min', voice: 'Default' },
];

// ---- Filter helpers (§Phase3), derived from the REAL item data — no new taxonomy.
export const lengthMinutes = (l: LibraryItem): number => parseInt(l.length, 10) || 0;

export type TimeBucket = 'all' | 'lte5' | 'mid' | 'gte15';
export const TIME_BUCKETS: { id: TimeBucket; label: string }[] = [
  { id: 'all', label: 'Any length' },
  { id: 'lte5', label: '≤ 5 min' },
  { id: 'mid', label: '~ 10 min' },
  { id: 'gte15', label: '15+ min' },
];
export const inTimeBucket = (l: LibraryItem, b: TimeBucket): boolean => {
  if (b === 'all') return true;
  const m = lengthMinutes(l);
  if (b === 'lte5') return m <= 5;
  if (b === 'mid') return m > 5 && m < 15;
  return m >= 15;
};
