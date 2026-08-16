import { useSyncExternalStore } from 'react';
import { audioControls } from './audioStore';

/**
 * Session sleep timer (Phase A) as a module singleton so it survives collapsing
 * the player to the mini bar (component state would unmount). Wall-clock based:
 * an absolute deadline, so it's correct across seeks and re-renders. On expiry it
 * gently fades the audio out (over FADE_SECS) then pauses — never a hard stop.
 */
const FADE_SECS = 6;

let minutes = 0; // 0 = off / play to the end of the session
let deadline: number | null = null;
let fadeId: ReturnType<typeof setTimeout> | null = null;
let endId: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function clearTimers() {
  if (fadeId) clearTimeout(fadeId);
  if (endId) clearTimeout(endId);
  fadeId = endId = null;
}

export const sleepTimer = {
  get minutes() {
    return minutes;
  },
  /** ms remaining, or 0 when not armed. */
  remaining() {
    return deadline == null ? 0 : Math.max(0, deadline - Date.now());
  },
  /** Arm for `min` minutes (0 cancels). Fade begins FADE_SECS before the mark. */
  set(min: number) {
    clearTimers();
    minutes = min;
    if (!min) {
      deadline = null;
      notify();
      return;
    }
    const ms = min * 60_000;
    deadline = Date.now() + ms;
    fadeId = setTimeout(() => audioControls.fadeOutStop(FADE_SECS), Math.max(0, ms - FADE_SECS * 1000));
    endId = setTimeout(() => {
      minutes = 0;
      deadline = null;
      notify();
    }, ms);
    notify();
  },
  cancel() {
    clearTimers();
    minutes = 0;
    deadline = null;
    notify();
  },
};

/** Reactive minutes (re-renders on arm/cancel/expiry; use remaining() for the tick). */
export function useSleepTimerMinutes(): number {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => minutes,
    () => minutes,
  );
}
