import type { Emotion } from '../store/session';

/** Arrival feeling chips (§6.2). Reused by the hub Support grid (§6 hub). */
export type Feeling = { id: Emotion; label: string };

export const FEELINGS: Feeling[] = [
  { id: 'stress', label: 'Stress' },
  { id: 'afraid', label: 'Afraid' },
  { id: 'depressed', label: 'Depressed' },
  { id: 'angry', label: 'Angry' },
  { id: 'sleep-deprived', label: 'Sleep deprived' },
  { id: 'overwhelmed', label: 'Overwhelmed' },
];

export const feelingLabel = (id: Emotion | null) =>
  FEELINGS.find((f) => f.id === id)?.label ?? 'this moment';
