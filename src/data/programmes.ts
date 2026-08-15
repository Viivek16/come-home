import type { PathId } from '../store/session';

/**
 * Multi-day programmes (§Phase4). A programme is just an ORDERED list of existing
 * sessions — each day points at a real session path (data/paths), so the whole
 * thing reuses the existing player and audio. New programmes are added by data
 * alone. Copy is light connective text only: no fabricated meditation content and
 * no invented author/teacher.
 */
export type ProgrammeDay = { title: string; note: string; session: PathId };
export type Programme = { id: string; title: string; intro: string; days: ProgrammeDay[] };

export const PROGRAMMES: Programme[] = [
  {
    id: 'seven-days-home',
    title: 'Seven days home',
    intro: 'A quiet week of coming back to yourself — one small sitting a day. Take the days in any order, or miss a few. Nothing is lost.',
    days: [
      { title: 'Arriving', note: 'Just be here. Nothing to fix today.', session: 'grounding-2' },
      { title: 'Settling', note: 'A little longer with your own breath.', session: 'grounding-2' },
      { title: 'Staying', note: 'Let the moment be a bit wider.', session: 'stay-5' },
      { title: 'Softening', note: 'Nowhere else to be right now.', session: 'stay-5' },
      { title: 'Steadying', note: 'The same quiet, becoming familiar.', session: 'stay-5' },
      { title: 'Resting', note: 'More time, if you have it. No rush.', session: 'more-15' },
      { title: 'Home', note: 'You already know the way back.', session: 'more-15' },
    ],
  },
];

export const programmeById = (id: string): Programme | undefined => PROGRAMMES.find((p) => p.id === id);
