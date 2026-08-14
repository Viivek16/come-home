import type { Mood } from '../store/scene';

/**
 * Time-of-day greeting + scene mood (§ user request). Derived from the local
 * clock so opening the app at 6am reads "Good morning" over a rising-sun scene,
 * and at night over the moonlit one.
 */
export type Phase = 'morning' | 'afternoon' | 'evening' | 'night';

export function phaseFor(hour: number = new Date().getHours()): Phase {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export const PHASE: Record<Phase, { hi: string; sub: string; mood: Mood }> = {
  morning: { hi: 'Good morning', sub: 'A soft start to the day.', mood: 'dawn' },
  afternoon: { hi: 'Good afternoon', sub: 'A breath in the middle of it all.', mood: 'day' },
  evening: { hi: 'Good evening', sub: 'Let the day settle.', mood: 'dusk' },
  night: { hi: 'Good night', sub: 'May the night be gentle with you.', mood: 'night' },
};

export const phaseMood = (): Mood => PHASE[phaseFor()].mood;
