/**
 * Ambient bed — a soft, soothing synthesized pad that plays quietly under the
 * whole app (§ user request). Web Audio, so it's offline + copyright-free.
 * Starts on the first user gesture (autoplay policy), ducks under the session
 * audio, mutes via the persisted pref, and suspends when the tab is hidden.
 */
const BASE = 0.055; // resting volume — deliberately very low
const DUCK = 0.012; // while the meditation audio is playing

const AC: typeof AudioContext | undefined =
  typeof window !== 'undefined' ? window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext : undefined;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let started = false;
let muted = false;
let ducked = false;

const target = () => (muted ? 0 : ducked ? DUCK : BASE);
function ramp(fast = false) {
  if (!ctx || !master) return;
  master.gain.setTargetAtTime(target(), ctx.currentTime, fast ? 0.15 : 0.9);
}

function build() {
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 640;
  filter.Q.value = 0.5;
  filter.connect(master);

  // A soft low chord (root, fifth, octave), each lightly detuned for warmth.
  const chord = [110, 164.81, 220];
  chord.forEach((f, i) => {
    [-2.5, 2.5].forEach((det) => {
      const o = ctx!.createOscillator();
      o.type = 'sine';
      o.frequency.value = f;
      o.detune.value = det;
      const g = ctx!.createGain();
      g.gain.value = i === 0 ? 0.5 : 0.3;
      o.connect(g);
      g.connect(filter);
      o.start();
    });
  });

  // Slow LFO drifts the filter cutoff so the pad breathes (≈24s cycle).
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.042;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 170;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();
}

export const ambient = {
  /** Call from a user gesture. Builds + starts the pad unless muted. */
  enable() {
    if (muted) return;
    if (!started) {
      started = true;
      try {
        build();
      } catch {
        return;
      }
    }
    if (ctx?.state === 'suspended') void ctx.resume();
    ramp();
  },
  setMuted(m: boolean) {
    muted = m;
    if (!m) this.enable();
    else ramp(true);
  },
  setDucked(d: boolean) {
    ducked = d;
    ramp(true);
  },
};

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) void ctx.suspend();
    else if (!muted) void ctx.resume();
  });
}
