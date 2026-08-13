/** Library list (§6 hub) — browse by feeling · length · voice. Neutral
 *  placeholders, data-driven (§15). Offline download is stubbed for now. */
export type LibraryItem = { id: string; title: string; feeling: string; length: string; voice: string };

export const LIBRARY_ITEMS: LibraryItem[] = [
  { id: 'l1', title: 'Placeholder grounding', feeling: 'Overwhelmed', length: '2 min', voice: 'Default' },
  { id: 'l2', title: 'Placeholder stillness', feeling: 'Afraid', length: '5 min', voice: 'Default' },
  { id: 'l3', title: 'Placeholder rest', feeling: 'Exhausted', length: '15 min', voice: 'Default' },
  { id: 'l4', title: 'Placeholder night', feeling: "Can't sleep", length: '20 min', voice: 'Default' },
];
