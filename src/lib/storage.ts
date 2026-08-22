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
const FAVS_KEY = 'come-home:favorites';
const LIBFILTER_KEY = 'come-home:libFilter';
const PROGRAMME_KEY = 'come-home:programmes';

const local = (): Storage | null => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

/**
 * A gentle, opt-in daily reminder (§Phase G). Off by default; when on, a single
 * supportive local notification at `time` (HH:mm). Never a streak nudge, never
 * pressure — just a soft invitation the user can turn off in one tap.
 */
export type Reminder = { enabled: boolean; time: string };
/** Onboarding answers (§6 onboarding flow). Collected once, then kept for gentle
 *  personalisation later. All optional — a skipped question stays at its default. */
export type Onboarding = {
  triedBefore: boolean | null; // "Have you tried meditating before?"
  frequency: string; // "How regularly do you meditate?" — '' | daily | weekly | rarely | never
  struggling: string[]; // "Are you struggling with something?" — feeling ids
};
export type Prefs = {
  name: string;
  reduceMotion: boolean;
  voice: string;
  ambientMuted: boolean;
  reminder: Reminder;
  onboarding: Onboarding;
};
// ambientMuted defaults true → "Background music" is OFF by default (§FIX2). It
// stays inert until a distinct ambient asset is configured (see audio/ambient.ts).
// reminder defaults OFF — the user opts in (§Phase G).
export const DEFAULT_PREFS: Prefs = {
  name: '',
  reduceMotion: false,
  voice: 'default',
  ambientMuted: true,
  reminder: { enabled: false, time: '21:00' },
  onboarding: { triedBefore: null, frequency: '', struggling: [] },
};

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

/**
 * Saved / favorites (§Phase3), on-device only. Stored as prefixed keys
 * (`lib:<id>` | `path:<id>`) so both library items and session paths can be
 * saved and re-found.
 */
export function loadFavorites(): string[] {
  try {
    const v = JSON.parse(local()?.getItem(FAVS_KEY) ?? '[]');
    return Array.isArray(v) ? (v as string[]) : [];
  } catch {
    return [];
  }
}
export function saveFavorites(list: string[]): void {
  local()?.setItem(FAVS_KEY, JSON.stringify(list));
}

/** Last-used Library filter (§Phase3), persisted so it's calm across visits. */
export type LibraryFilter = { time: 'all' | 'lte5' | 'mid' | 'gte15'; feeling: string };
export const DEFAULT_LIB_FILTER: LibraryFilter = { time: 'all', feeling: 'all' };
export function loadLibFilter(): LibraryFilter {
  try {
    return { ...DEFAULT_LIB_FILTER, ...JSON.parse(local()?.getItem(LIBFILTER_KEY) ?? '{}') };
  } catch {
    return { ...DEFAULT_LIB_FILTER };
  }
}
export function saveLibFilter(f: LibraryFilter): void {
  local()?.setItem(LIBFILTER_KEY, JSON.stringify(f));
}

/**
 * Programme progress (§Phase4), on-device only: completed day indices per
 * programme id. A plain record of what was done — never a streak or a count to
 * live up to. Missing days simply aren't in the list.
 */
export type ProgrammeProgress = Record<string, number[]>;
export function loadProgrammeProgress(): ProgrammeProgress {
  try {
    const v = JSON.parse(local()?.getItem(PROGRAMME_KEY) ?? '{}');
    return v && typeof v === 'object' ? (v as ProgrammeProgress) : {};
  } catch {
    return {};
  }
}
export function saveProgrammeProgress(p: ProgrammeProgress): void {
  local()?.setItem(PROGRAMME_KEY, JSON.stringify(p));
}

/**
 * Last arrival state (§Phase C), on-device. Written when someone checks in, so a
 * session recommendation / the reflection trail can read it later. A quiet record
 * of the most recent arrival — never a streak or a count.
 */
const LAST_ARRIVAL_KEY = 'come-home:lastArrival';
export function saveLastArrival(e: Emotion): void {
  local()?.setItem(LAST_ARRIVAL_KEY, e);
}
export function loadLastArrival(): Emotion | null {
  return (local()?.getItem(LAST_ARRIVAL_KEY) as Emotion | null) ?? null;
}

export function firstRunDone(): boolean {
  return local()?.getItem(FIRSTRUN_KEY) === '1';
}
export function markFirstRunDone(): void {
  local()?.setItem(FIRSTRUN_KEY, '1');
}

// The 3 onboarding questions run once after sign-up/login, before Home. Separate
// from firstRunDone so the login screen and the questionnaire are independent.
const ONBOARDING_KEY = 'come-home:onboardingDone';
export function onboardingDone(): boolean {
  return local()?.getItem(ONBOARDING_KEY) === '1';
}
export function markOnboardingDone(): void {
  local()?.setItem(ONBOARDING_KEY, '1');
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

/**
 * Presence (§Phase A). The days you came home, independent of whether a session
 * was finished. Written on app open and on the first play of any sitting, so just
 * showing up counts. A plain day-key list, deduped; never a count or a streak. The
 * key format matches HomeTab/ReflectionTrail's dayKey so the dots union cleanly.
 */
const PRESENCE_KEY = 'come-home:presence';
const presenceKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
export async function markPresence(): Promise<void> {
  try {
    const key = presenceKey(new Date());
    const list = (await get<string[]>(PRESENCE_KEY)) ?? [];
    if (list.includes(key)) return; // one entry per day
    await set(PRESENCE_KEY, [key, ...list].slice(0, 400)); // ponytail: cap ~13 months
  } catch {
    /* ignore */
  }
}
export async function getPresence(): Promise<string[]> {
  try {
    return (await get<string[]>(PRESENCE_KEY)) ?? [];
  } catch {
    return [];
  }
}

/**
 * Reflection trail (§Phase5) — optional one-word moments gathered after a sitting.
 * A gentle qualitative record, never a streak or a count. On-device (IndexedDB).
 */
const REFLECT_KEY = 'come-home:reflections';
export type Reflection = { ts: number; word: string };
export async function addReflection(word: string): Promise<void> {
  try {
    const list = (await get<Reflection[]>(REFLECT_KEY)) ?? [];
    await set(REFLECT_KEY, [{ ts: Date.now(), word }, ...list].slice(0, 200)); // ponytail: cap 200
  } catch {
    /* ignore */
  }
}
export async function getReflections(): Promise<Reflection[]> {
  try {
    return (await get<Reflection[]>(REFLECT_KEY)) ?? [];
  } catch {
    return [];
  }
}
export async function clearReflections(): Promise<void> {
  try {
    await set(REFLECT_KEY, []);
  } catch {
    /* ignore */
  }
}

/**
 * Journal (§Phase F) — longer private writing, prompted or blank. On-device only
 * (IndexedDB); never shared, never uploaded. Entries are gently editable and
 * deletable. A quiet page, never a log to keep up — no counter, no streak.
 */
const JOURNAL_KEY = 'come-home:journal';
export type JournalEntry = { id: string; ts: number; prompt?: string; text: string };

const newId = (): string =>
  (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);

export async function getJournal(): Promise<JournalEntry[]> {
  try {
    const list = (await get<JournalEntry[]>(JOURNAL_KEY)) ?? [];
    return [...list].sort((a, b) => b.ts - a.ts); // newest first
  } catch {
    return [];
  }
}

/** Create or update an entry (upsert by id). Returns the saved entry. */
export async function saveJournalEntry(
  draft: { id?: string; prompt?: string; text: string },
): Promise<JournalEntry> {
  const entry: JournalEntry = {
    id: draft.id ?? newId(),
    ts: Date.now(),
    prompt: draft.prompt,
    text: draft.text,
  };
  try {
    const list = (await get<JournalEntry[]>(JOURNAL_KEY)) ?? [];
    const rest = list.filter((e) => e.id !== entry.id);
    await set(JOURNAL_KEY, [entry, ...rest].slice(0, 300)); // ponytail: cap 300 entries
  } catch {
    /* ignore — a failed write never blocks the writer */
  }
  return entry;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  try {
    const list = (await get<JournalEntry[]>(JOURNAL_KEY)) ?? [];
    await set(JOURNAL_KEY, list.filter((e) => e.id !== id));
  } catch {
    /* ignore */
  }
}
