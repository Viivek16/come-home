import type { Emotion } from '../store/session';

/** Arrival feeling chips (§6.2). Reused by the hub Support grid (§6 hub). */
export type Feeling = { id: Emotion; label: string };

export const FEELINGS: Feeling[] = [
  { id: 'afraid', label: "I'm afraid" },
  { id: 'overwhelmed', label: "I'm overwhelmed" },
  { id: 'sad', label: "I'm sad" },
  { id: 'exhausted', label: "I'm exhausted" },
  { id: 'cant-sleep', label: "I can't sleep" },
  { id: 'treatment', label: "I'm receiving treatment" },
  { id: 'specific', label: 'I need support for something specific' },
];

export const feelingLabel = (id: Emotion | null) =>
  FEELINGS.find((f) => f.id === id)?.label ?? 'this moment';
