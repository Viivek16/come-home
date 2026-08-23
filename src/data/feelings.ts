import type { Emotion } from '../store/session';
import type { GradientIconName } from '../ui/GradientIcon';

/** Arrival feeling chips (§6.2). Reused by the hub Support grid and the Library
 *  filter (§6 hub). Each carries a soft-gradient glyph, shared across both. */
export type Feeling = { id: Emotion; label: string; icon: GradientIconName };

export const FEELINGS: Feeling[] = [
  { id: 'stress', label: 'Stress', icon: 'spark' },
  { id: 'afraid', label: 'Afraid', icon: 'cloud' },
  { id: 'depressed', label: 'Depressed', icon: 'rain' },
  { id: 'angry', label: 'Angry', icon: 'flame' },
  { id: 'sleep-deprived', label: 'Sleep deprived', icon: 'moon' },
  { id: 'overwhelmed', label: 'Overwhelmed', icon: 'waves' },
];

export const feelingLabel = (id: Emotion | null) =>
  FEELINGS.find((f) => f.id === id)?.label ?? 'this moment';
