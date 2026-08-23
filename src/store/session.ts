import { useSyncExternalStore } from 'react';

/**
 * Session state machine (§6, §8, §11). The core loop is modelled explicitly here
 * — never scattered across useState. Carries the arriving emotion → path → private
 * check-ins through one sitting.
 */
// The six felt-states from the in-app user flow. This is the single emotion
// vocabulary across Arrival, Support, Library and stored history.
export type Emotion =
  | 'stress'
  | 'afraid'
  | 'depressed'
  | 'angry'
  | 'sleep-deprived'
  | 'overwhelmed';
export type PathId = 'grounding-2' | 'stay-5' | 'more-15';
export type Checkin = 'calmer' | 'better' | 'same' | 'struggling' | 'prefer-not';
export type Step = 'opening' | 'arrival' | 'response' | 'support' | 'music' | 'checkin' | 'return';

export type SessionState = {
  step: Step;
  emotion: Emotion | null;
  path: PathId | null;
  checkins: Checkin[];
};

const FRESH: SessionState = { step: 'opening', emotion: null, path: null, checkins: [] };
let state: SessionState = FRESH;
const listeners = new Set<() => void>();

function set(patch: Partial<SessionState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const session = {
  reset: () => set(FRESH),
  go: (step: Step) => set({ step }),
  pickEmotion: (emotion: Emotion) => set({ emotion, step: 'response' }),
  /** Meditate flow (§task2): record the arrival (if any) and go straight to the
   *  player — no duration/support detour. */
  beginMeditation: (emotion: Emotion | null) => set({ emotion, step: 'music' }),
  pickPath: (path: PathId) => set({ path, step: 'support' }),
  /** Record a check-in privately. Does NOT advance — the screen may reveal the
   *  soft crisis row first (§6.6), then the user chooses to continue. */
  recordCheckin: (c: Checkin) => set({ checkins: [...state.checkins, c] }),
};

/**
 * Soft, opt-in crisis-support reveal (§6.6): "Still struggling" twice in a
 * session, OR arriving in a heavier state. Never alarmist, never forced.
 * ponytail: heavier arrivals = depressed/overwhelmed, mapped from the old
 * treatment/can't-sleep triggers when the emotion set was replaced.
 */
export function shouldOfferSupport(s: SessionState): boolean {
  const struggling = s.checkins.filter((c) => c === 'struggling').length;
  return struggling >= 2 || s.emotion === 'depressed' || s.emotion === 'overwhelmed';
}

export function useSessionState(): SessionState {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => state,
    () => state,
  );
}
