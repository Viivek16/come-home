/**
 * Soft, built-in tones for the timer (§Phase2). Synthesized with Web Audio — no
 * audio asset, works fully offline. These are one-shot envelopes (not a loop), so
 * they never compete with the breath clock or the water's render loop.
 *
 * The context is created / resumed from the user's "Begin" gesture, so a later
 * end tone still sounds even with the screen off (autoplay policy is satisfied).
 */
const AC: typeof AudioContext | undefined =
  typeof window !== 'undefined'
    ? window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    : undefined;

let ctx: AudioContext | null = null;

/** Call from a user gesture to unlock audio so later tones can sound. */
export function unlockTones() {
  if (!AC) return;
  if (!ctx) {
    try {
      ctx = new AC();
    } catch {
      return;
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
}

/** A single soft sine bell with a gentle attack + long decay. */
function bell(freq: number, dur: number, peak: number) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.05); // soft attack
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur); // gentle decay
  o.connect(g);
  g.connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

// Warm, low, unobtrusive — never a sharp alert (§ethic: no alarm).
export const tones = {
  start() {
    unlockTones();
    bell(288, 1.8, 0.13);
  },
  end() {
    unlockTones();
    // two soft notes, a gentle rising resolve
    bell(288, 2.2, 0.14);
    setTimeout(() => bell(384, 2.6, 0.12), 240);
  },
  interval() {
    unlockTones();
    bell(432, 1.2, 0.08);
  },
};
