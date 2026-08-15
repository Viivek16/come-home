/** Library list (§6 hub) — browse by feeling · length · voice. Neutral
 *  placeholders, data-driven (§15). Offline download is stubbed for now. */
export type LibraryItem = { id: string; title: string; feeling: string; length: string; voice: string };

export const LIBRARY_ITEMS: LibraryItem[] = [
  { id: 'l1', title: 'Placeholder grounding', feeling: 'Overwhelmed', length: '2 min', voice: 'Default' },
  { id: 'l2', title: 'Placeholder stillness', feeling: 'Afraid', length: '5 min', voice: 'Default' },
  { id: 'l3', title: 'Placeholder rest', feeling: 'Exhausted', length: '15 min', voice: 'Default' },
  { id: 'l4', title: 'Placeholder night', feeling: "Can't sleep", length: '20 min', voice: 'Default' },
];

// ---- Filter helpers (§Phase3), derived from the REAL item data — no new taxonomy.
export const lengthMinutes = (l: LibraryItem): number => parseInt(l.length, 10) || 0;

/** The emotional categories actually present in the library, in first-seen order. */
export const libraryFeelings = (): string[] => [...new Set(LIBRARY_ITEMS.map((l) => l.feeling))];

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
