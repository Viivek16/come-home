import { useSyncExternalStore } from 'react';
import { app } from './app';
import { hub } from './hub';
import { nav } from '../nav/history';
import { audioControls } from '../audio/audioStore';
import { addHistory, type FlowVisit } from '../lib/storage';
import { getFlowById } from '../data/flows';

/**
 * Companion-flow state machine (§Phase A). Modelled explicitly here (never
 * scattered across useState), like the session store. Carries the current flow
 * id, the step index within it, and the soft close check-in selection.
 *
 * Forward step moves don't touch the view, so they don't add history levels —
 * only entering the flow (a view change) pushes one, and the exit pops it. This
 * mirrors the session flow's single-history-level behaviour.
 */
let id: string | null = null;
let step = 0;
let checkin: string | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export const flow = {
  get id() {
    return id;
  },
  get step() {
    return step;
  },
  get checkin() {
    return checkin;
  },
  /** Next screen in the flow. */
  next() {
    step += 1;
    notify();
  },
  /** Previous screen (clamped — the always-visible exit handles leaving). */
  back() {
    if (step === 0) return;
    step -= 1;
    notify();
  },
  /** Record the close check-in. Cannot be failed — every option lands soft. */
  pickCheckin(c: string) {
    checkin = c;
    notify();
  },
  /** Leave the flow. Pops the entry pushed on enter, so Back stays in sync. */
  exit() {
    nav.back();
  },
  /** Close → Home (§Phase C): record the visit through the existing profile
   *  arrival path (the tapped entry + its soft close check-in), end the sound, and
   *  land on the Home tab. Presence is registered when the close screen is reached.
   *  No streak or counter is ever shown — this is silent history only. */
  home() {
    const entry = id ? getFlowById(id) : null;
    if (entry && checkin) {
      void addHistory({
        ts: Date.now(),
        emotion: null,
        checkins: [],
        flow: { id: entry.id, kind: entry.kind, title: entry.title, left: checkin as FlowVisit['left'] },
      });
    }
    audioControls.stop();
    id = null;
    step = 0;
    checkin = null;
    hub.setTab('home');
    app.setView('hub');
    notify();
  },
};

/** Enter a flow by its Support-tile id (a forward navigation). Starts fresh. */
export function enterFlow(flowId: string): void {
  if (!getFlowById(flowId)) return;
  id = flowId;
  step = 0;
  checkin = null;
  app.setView('flow');
  notify();
}

// Stable snapshot so useSyncExternalStore doesn't loop (same ref when unchanged).
let cache: { id: string | null; step: number; checkin: string | null } = { id, step, checkin };
function snap() {
  if (cache.id !== id || cache.step !== step || cache.checkin !== checkin) cache = { id, step, checkin };
  return cache;
}

export function useFlow(): { id: string | null; step: number; checkin: string | null } {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    snap,
    snap,
  );
}
