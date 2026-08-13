import type { Emotion } from '../store/session';

/** Hub Support grid (§6 hub). Hard-moment categories mapping to Arrival feelings.
 *  Placeholder set, data-driven — tapping one starts a session in that emotion. */
export type SupportCategory = { id: string; label: string; emotion: Emotion };

export const SUPPORT_CATEGORIES: SupportCategory[] = [
  { id: 'panic', label: 'Panic & anxiety', emotion: 'overwhelmed' },
  { id: 'grief', label: 'Grief', emotion: 'sad' },
  { id: 'sleep', label: "Can't sleep", emotion: 'cant-sleep' },
  { id: 'treatment', label: 'In treatment', emotion: 'treatment' },
  { id: 'anger', label: 'Anger', emotion: 'overwhelmed' },
  { id: 'numb', label: 'Feeling numb', emotion: 'sad' },
  { id: 'specific', label: 'Something specific', emotion: 'specific' },
];
