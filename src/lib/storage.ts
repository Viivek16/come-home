import { get, set } from 'idb-keyval';
import type { Checkin, Emotion } from '../store/session';

/**
 * On-device storage seam (§8). localStorage for prefs + first-run flag; IndexedDB
 * (idb-keyval) for check-in history. No Supabase writes yet — swap the impls here
 * to migrate history to Supabase later and the screens don't change.
 */
const PREFS_KEY = 'come-home:prefs';
const FIRSTRUN_KEY = 'come-home:firstRunDone';
const HISTORY_KEY = 'come-home:history';
const TOOLS_KEY = 'come-home:tools';

const local = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export type Prefs = { name: string; reduceMotion: boolean; voice: string; ambientMuted: boolean };
// ambientMuted defaults true → "Background music" is OFF by default (§FIX2). It
// stays inert until a distinct ambient asset is configured (see audio/ambient.ts).
export const DEFAULT_PREFS: Prefs = { name: '', reduceMotion: false, voice: 'default', ambientMuted: true };

export function loadPrefs(): Prefs {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(local()?.getItem(PREFS_KEY) ?? '{}') };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}
export function savePrefs(p: Prefs): void {
  local()?.setItem(PREFS_KEY, JSON.stringify(p));
}

/**
 * Self-directed tool settings (§Phase2), on-device only. Interval bells default
 * OFF (0). End tone defaults on so an eyes-closed sit knows when it's complete.
 */
export type ToolPrefs = {
  timerMinutes: number;
  timerStartTone: boolean;
  timerEndTone: boolean;
  timerIntervalMin: number; // 0 = off
  breathePattern: string;
  breatheMinutes: number;
};
export const DEFAULT_TOOL_PREFS: ToolPrefs = {
  timerMinutes: 5,
  timerStartTone: true,
  timerEndTone: true,
  timerIntervalMin: 0,
  breathePattern: 'coherent',
  breatheMinutes: 3,
};
export function loadToolPrefs(): ToolPrefs {
  try {
    return { ...DEFAULT_TOOL_PREFS, ...JSON.parse(local()?.getItem(TOOLS_KEY) ?? '{}') };
  } catch {
    return { ...DEFAULT_TOOL_PREFS };
  }
}
export function saveToolPrefs(p: ToolPrefs): void {
  local()?.setItem(TOOLS_KEY, JSON.stringify(p));
}

export function firstRunDone(): boolean {
  return local()?.getItem(FIRSTRUN_KEY) === '1';
}
export function markFirstRunDone(): void {
  local()?.setItem(FIRSTRUN_KEY, '1');
}

export type HistoryEntry = { ts: number; emotion: Emotion | null; checkins: Checkin[] };

// Best-effort — a failed IDB op never blocks or breaks a session.
export async function addHistory(e: HistoryEntry): Promise<void> {
  try {
    const list = (await get<HistoryEntry[]>(HISTORY_KEY)) ?? [];
    await set(HISTORY_KEY, [e, ...list].slice(0, 200)); // ponytail: cap 200 entries
  } catch {
    /* ignore */
  }
}
export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    return (await get<HistoryEntry[]>(HISTORY_KEY)) ?? [];
  } catch {
    return [];
  }
}
export async function clearHistory(): Promise<void> {
  try {
    await set(HISTORY_KEY, []);
  } catch {
    /* ignore */
  }
}
