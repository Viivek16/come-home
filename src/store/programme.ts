import { useSyncExternalStore } from 'react';
import { app } from './app';
import { session } from './session';
import { programmeById, type Programme } from '../data/programmes';
import { loadProgrammeProgress, saveProgrammeProgress, type ProgrammeProgress } from '../lib/storage';

/**
 * Multi-day programme progress + the day currently playing (§Phase4). Progress is
 * a plain set of completed day indices per programme — no streaks, no penalty for
 * gaps. `activeDay` links a running session back to the day that launched it so it
 * can be marked done on completion.
 */
let progress: ProgrammeProgress = loadProgrammeProgress();
let openId: string | null = null; // programme showing in the overview
let activeDay: { programmeId: string; dayIndex: number } | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

const completedOf = (id: string): number[] => progress[id] ?? [];

/** First day index not yet completed (where "continue" resumes). Clamped to last. */
function nextDayIndex(p: Programme): number {
  const done = new Set(completedOf(p.id));
  for (let i = 0; i < p.days.length; i++) if (!done.has(i)) return i;
  return p.days.length - 1; // all done → rest on the final day
}

export const programme = {
  get openId() {
    return openId;
  },
  get activeDay() {
    return activeDay;
  },
  completed: completedOf,
  isDone: (id: string, day: number) => completedOf(id).includes(day),
  isComplete: (p: Programme) => completedOf(p.id).length >= p.days.length,
  nextDayIndex,
  /** True once at least one day is done — used to offer "continue" on Home. */
  isStarted: (id: string) => completedOf(id).length > 0,

  open(id: string) {
    openId = id;
    app.setView('programme');
    notify();
  },

  /** Play a specific day through the EXISTING player, remembering which day it is. */
  startDay(programmeId: string, dayIndex: number) {
    const p = programmeById(programmeId);
    if (!p) return;
    const day = p.days[dayIndex];
    if (!day) return;
    activeDay = { programmeId, dayIndex };
    session.reset();
    session.pickPath(day.session);
    app.setView('session');
    notify();
  },

  /** Called when a session finishes — records the day if it was a programme day. */
  completeActiveDay() {
    if (!activeDay) return;
    const { programmeId, dayIndex } = activeDay;
    const done = new Set(completedOf(programmeId));
    done.add(dayIndex);
    progress = { ...progress, [programmeId]: [...done].sort((a, b) => a - b) };
    saveProgrammeProgress(progress);
    activeDay = null;
    notify();
  },

  /** Leaving a session without finishing carries no penalty — just forget the link. */
  clearActiveDay() {
    if (!activeDay) return;
    activeDay = null;
    notify();
  },
};

export function useProgrammeProgress(): ProgrammeProgress {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => progress,
    () => progress,
  );
}
