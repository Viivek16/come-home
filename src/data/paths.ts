import type { PathId } from '../store/session';

/** Response paths (§6.3). One recommended (gold) + two alternates. */
export type PathOption = {
  id: PathId;
  title: string;
  duration: string;
  note?: string;
  recommended?: boolean;
};

export const PATHS: PathOption[] = [
  { id: 'grounding-2', title: 'Start grounding', duration: '2 min', note: 'Recommended for right now', recommended: true },
  { id: 'stay-5', title: 'Stay with me', duration: '5 min' },
  { id: 'more-15', title: 'I have more time', duration: '15 min' },
];

export const pathTitle = (id: PathId | null) => PATHS.find((p) => p.id === id)?.title ?? 'This moment';
