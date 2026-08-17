import type { PathId } from '../store/session';
import type { TimeBand } from '../lib/timeBand';

/**
 * The Home "A moment for you" card, by time band (§Phase B). Reads the single
 * time source (lib/timeBand) — no separate clock. Category-free at the surface:
 * one tap opens a fitting session. Rotates across the day; never mentions missed
 * days. Each variant points at an existing session path (data/paths).
 */
export type TodayCard = { eyebrow: string; title: string; sub: string; session: PathId };

export const TODAY: Record<TimeBand, TodayCard> = {
  dawn: { eyebrow: 'Before the day begins', title: 'Meet the morning', sub: 'One quiet breath before anything else.', session: 'grounding-2' },
  morning: { eyebrow: 'This morning', title: 'Begin gently', sub: 'One quiet breath to start the day.', session: 'grounding-2' },
  midday: { eyebrow: 'Right now', title: 'A pause in the middle', sub: 'Set it down for a few minutes.', session: 'stay-5' },
  golden: { eyebrow: 'As the light turns', title: 'Ease off the day', sub: 'Let the effort go for a while.', session: 'stay-5' },
  dusk: { eyebrow: 'This evening', title: 'Let the day settle', sub: 'Nothing left to carry now.', session: 'stay-5' },
  night: { eyebrow: 'Tonight', title: 'Toward sleep', sub: 'Let everything grow quiet.', session: 'more-15' },
};
