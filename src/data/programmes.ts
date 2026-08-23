import type { PathId } from '../store/session';

/**
 * Multi-day programmes (§Phase4/§Phase F). A programme is an ORDERED list of
 * existing sessions — each day points at a real session path (data/paths), so the
 * whole thing reuses the existing player and audio. New programmes are added by
 * data alone. Copy is light connective text only: no fabricated meditation content
 * and no invented author/teacher.
 *
 * Programmes are resumable with no obligation: take the days in any order, miss a
 * few, come back any time. Nothing here counts a streak or marks a day as missed.
 *
 * Where real guided content doesn't exist yet, a programme is marked `comingSoon`
 * and its days carry no `session` — the overview renders a calm "in the making"
 * shell instead of a broken player (§Phase F).
 */
export type ProgrammeDay = { title: string; note: string; session?: PathId };
export type Programme = {
  id: string;
  title: string;
  /** One warm line for the carousel card. */
  blurb: string;
  /** Fuller opening paragraph on the overview. */
  intro: string;
  comingSoon?: boolean;
  days: ProgrammeDay[];
};

export const PROGRAMMES: Programme[] = [
  {
    id: 'seven-days-home',
    title: 'Seven Days Home',
    blurb: 'A quiet week of coming back to yourself.',
    intro:
      'A quiet week of coming back to yourself — one small sitting a day. Take the days in any order, or miss a few. Nothing is lost.',
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
  {
    id: 'three-quiet-days',
    title: 'Three Quiet Days',
    blurb: 'A gentle first step — just three sittings.',
    intro:
      'A small beginning, whenever a whole week feels like a lot. Three unhurried sittings — start with any of them, and stop whenever you like.',
    days: [
      { title: 'Arriving', note: 'A soft place to begin.', session: 'grounding-2' },
      { title: 'Staying', note: 'A little more time with yourself.', session: 'stay-5' },
      { title: 'Resting', note: 'Longer, if it feels kind today.', session: 'more-15' },
    ],
  },
  {
    id: 'nights-of-rest',
    title: 'Nights of Rest',
    blurb: 'Wind-downs for the harder nights.',
    intro:
      'A series of gentle wind-downs for the nights that feel long. These are still in the making — the shape is here, the sound is on its way.',
    comingSoon: true,
    days: [
      { title: 'Letting the day go', note: 'Setting down what today asked of you.' },
      { title: 'Softer breathing', note: 'A slower rhythm as the room quiets.' },
      { title: 'Into the dark', note: 'Nothing to hold on to now.' },
    ],
  },
  {
    id: 'meeting-hard-feelings',
    title: 'Meeting Hard Feelings',
    blurb: 'Staying with what’s tender, gently.',
    intro:
      'A slow, kind way to sit beside the feelings that are harder to hold. These sittings are still being made with care — they’ll arrive when they’re ready.',
    comingSoon: true,
    days: [
      { title: 'Naming it', note: 'Just noticing what’s here.' },
      { title: 'Making room', note: 'Letting the feeling take up space.' },
      { title: 'Being with', note: 'You don’t have to fix it to be okay.' },
    ],
  },
];

export const programmeById = (id: string): Programme | undefined => PROGRAMMES.find((p) => p.id === id);
