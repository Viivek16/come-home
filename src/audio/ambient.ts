/**
 * Ambient bed — a soft, soothing synthesized pad that plays quietly under the
 * whole app (§ user request). Web Audio, so it's offline + copyright-free.
 * Starts on the first user gesture (autoplay policy), ducks under the session
 * audio, mutes via the persisted pref, and suspends when the tab is hidden.
 */
const BASE = 0.075; // resting volume — present but gentle
const DUCK = 0.02; // while the meditation audio is playing

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

  // Soft filtered-noise wash — a distant water/air texture beneath the pad, its
  // band slowly swept so it flows rather than hisses.
  const noiseLen = Math.floor(ctx.sampleRate * 4);
  const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  let brown = 0;
  for (let i = 0; i < noiseLen; i++) {
    brown = (brown + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    nd[i] = brown * 3.2;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf;
  noise.loop = true;
  const nFilter = ctx.createBiquadFilter();
  nFilter.type = 'bandpass';
  nFilter.frequency.value = 470;
  nFilter.Q.value = 0.7;
  const nGain = ctx.createGain();
  nGain.gain.value = 0.16;
  noise.connect(nFilter);
  nFilter.connect(nGain);
  nGain.connect(master);

  const nLfo = ctx.createOscillator();
  nLfo.type = 'sine';
  nLfo.frequency.value = 0.06;
  const nLfoGain = ctx.createGain();
  nLfoGain.gain.value = 190;
  nLfo.connect(nLfoGain);
  nLfoGain.connect(nFilter.frequency);
  noise.start();
  nLfo.start();
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
