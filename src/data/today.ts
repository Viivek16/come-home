import type { PathId } from '../store/session';
import type { Phase } from '../lib/greeting';

/**
 * The Home "A moment for you" card, by time of day (§Phase5). Reuses the existing
 * time-aware phase (lib/greeting) — no new clock. Category-free at the surface:
 * one tap opens a fitting session. Rotates across the day; never mentions missed
 * days. Each variant points at an existing session path (data/paths).
 */
export type TodayCard = { eyebrow: string; title: string; sub: string; session: PathId };

export const TODAY: Record<Phase, TodayCard> = {
  morning: { eyebrow: 'This morning', title: 'Begin gently', sub: 'One quiet breath to start the day.', session: 'grounding-2' },
  afternoon: { eyebrow: 'This afternoon', title: 'A pause in the middle', sub: 'Set it down for a few minutes.', session: 'stay-5' },
  evening: { eyebrow: 'This evening', title: 'Let the day settle', sub: 'Nothing left to carry now.', session: 'stay-5' },
  night: { eyebrow: 'Tonight', title: 'Toward sleep', sub: 'Let everything grow quiet.', session: 'more-15' },
};
