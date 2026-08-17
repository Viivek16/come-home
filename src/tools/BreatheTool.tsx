import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';
import ExitButton from '../ui/ExitButton';
import ReflectionPrompt from '../ui/ReflectionPrompt';
import { nav } from '../nav/history';
import { setDepth } from '../store/water';
import { useReducedMotion } from '../lib/motion';
import { PATTERNS, patternById } from '../breath/patterns';
import { toolPrefsStore, useToolPrefs } from '../store/toolPrefs';

const DURATIONS = [1, 2, 3, 0]; // minutes; 0 = open-ended (§Phase E)
const durationLabel = (m: number) => (m === 0 ? 'Open' : `${m} min`);
const SMALL = 0.62;
const LARGE = 1;
const STILL = 0.82; // reduced-motion resting size

type Phase = 'setup' | 'running' | 'done';

export default function BreatheTool() {
  const saved = useToolPrefs();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('setup');
  const [patternId, setPatternId] = useState(saved.breathePattern);
  const [minutes, setMinutes] = useState(() => (DURATIONS.includes(saved.breatheMinutes) ? saved.breatheMinutes : 3));

  const pattern = patternById(patternId);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [scale, setScale] = useState(SMALL);
  const [count, setCount] = useState(1);

  useEffect(() => {
    setDepth('checkin');
  }, []);

  // Phase machine: a chain of setTimeouts (NOT a rAF loop) driving both the orb
  // target and the text cue. The orb animates via a CSS transition whose duration
  // is the phase length — so the growth IS the timing. Reduced motion holds it.
  useEffect(() => {
    if (phase !== 'running') return;
    let idx = 0;
    let cancelled = false;
    let stepId: ReturnType<typeof setTimeout>;

    const applyPhase = () => {
      if (cancelled) return;
      setPhaseIdx(idx);
      const ph = pattern.phases[idx];
      if (!reduce) {
        if (ph.kind === 'in') setScale(LARGE);
        else if (ph.kind === 'out') setScale(SMALL);
      }
      stepId = setTimeout(() => {
        idx = (idx + 1) % pattern.phases.length;
        applyPhase();
      }, ph.seconds * 1000);
    };
    applyPhase();

    // Open-ended (minutes === 0) → no auto-end; the user finishes when ready.
    const endId =
      minutes > 0
        ? setTimeout(() => {
            cancelled = true;
            clearTimeout(stepId);
            setPhase('done');
          }, minutes * 60 * 1000)
        : undefined;

    return () => {
      cancelled = true;
      clearTimeout(stepId);
      if (endId) clearTimeout(endId);
    };
  }, [phase, pattern, reduce, minutes]);

  // Per-phase counter: 1→N seconds, restarting each phase (box → "1 2 3 4" in,
  // "1 2 3 4" hold, and so on). Runs off wall-clock seconds so it holds up under
  // reduced motion too — the numbers guide the breath even when the orb is still.
  useEffect(() => {
    if (phase !== 'running') return;
    setCount(1);
    const secs = pattern.phases[phaseIdx]?.seconds ?? 0;
    const id = setInterval(() => setCount((c) => (c < secs ? c + 1 : c)), 1000);
    return () => clearInterval(id);
  }, [phase, phaseIdx, pattern]);

  const begin = () => {
    toolPrefsStore.patch({ breathePattern: patternId, breatheMinutes: minutes });
    setPhaseIdx(0);
    setScale(SMALL);
    setCount(1);
    setPhase('running');
  };

  const cue = pattern.phases[phaseIdx];
  const orbSeconds = cue ? cue.seconds : 4;

  return (
    <div className="screen items-center">
      <ExitButton onExit={() => nav.back()} />

      {phase === 'setup' && (
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <Reveal delay={0.05}>
            <div className="eyebrow">Breathe</div>
            <h1 className="serif" style={{ fontSize: 'var(--t-2xl)', marginTop: 8, marginBottom: 4 }}>
              Follow the light.
            </h1>
            <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-md)', marginBottom: 22 }}>
              Let the orb set the pace. In as it grows, out as it softens.
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              Pattern
            </div>
            <div className="flex flex-col gap-2">
              {PATTERNS.map((p) => {
                const on = patternId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPatternId(p.id)}
                    aria-pressed={on}
                    className={`glass ${on ? 'glass-gold' : ''} flex items-center justify-between px-5 py-3.5 text-left transition-transform duration-300 active:scale-[0.99]`}
                    style={{ borderRadius: 'var(--radius-chip)', transitionTimingFunction: 'var(--ease-calm)' }}
                  >
                    <span style={{ color: 'var(--ink)', fontSize: 'var(--t-md)' }}>{p.name}</span>
                    <span className="eyebrow" style={{ color: on ? 'var(--gold)' : 'var(--ink-muted)' }}>
                      {p.note}
                    </span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.28}>
            <div className="eyebrow" style={{ marginTop: 20, marginBottom: 10 }}>
              For how long
            </div>
            <div className="flex gap-2">
              {DURATIONS.map((m) => {
                const on = minutes === m;
                return (
                  <button
                    key={m}
                    onClick={() => setMinutes(m)}
                    aria-pressed={on}
                    className={`glass ${on ? 'glass-gold' : ''} flex-1 px-4 py-3 transition-transform duration-300 active:scale-[0.97]`}
                    style={{
                      borderRadius: 'var(--radius-chip)',
                      color: on ? 'var(--gold)' : 'var(--ink)',
                      fontSize: 'var(--t-md)',
                      transitionTimingFunction: 'var(--ease-calm)',
                    }}
                  >
                    {durationLabel(m)}
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.4} className="mt-8 flex justify-center">
            <Button onClick={begin}>Begin</Button>
          </Reveal>
        </div>
      )}

      {phase === 'running' && (
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
          <div style={{ position: 'relative', width: 240, height: 240, display: 'grid', placeItems: 'center' }}>
            {/* Ambient aura keeps the breath feeling alive even through a hold. */}
            <div className="breath-aura" aria-hidden style={{ width: 220, height: 220, position: 'absolute' }} />
            {/* The orb grows on the in-breath and softens on the out-breath — the
                growth IS the timing (transition length = the phase seconds). It also
                brightens as it fills, so an inhale feels like drawing light in. */}
            <div
              className="breath-orb"
              aria-hidden
              style={{
                width: 220,
                height: 220,
                transform: `scale(${reduce ? STILL : scale})`,
                filter: reduce ? 'none' : `brightness(${0.8 + ((scale - SMALL) / (LARGE - SMALL)) * 0.55})`,
                transition: reduce ? 'none' : `transform ${orbSeconds}s var(--ease-calm), filter ${orbSeconds}s var(--ease-calm)`,
              }}
            />
            {/* Count 1→N inside the orb, with the cue beneath it. */}
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span className="breath-count" role="status" aria-live="polite" aria-label={`${cue?.label}, ${count}`}>
                {count}
              </span>
              <span className="breath-cue" aria-hidden>
                {cue?.label}
              </span>
            </div>
          </div>
          <p className="serif-italic" style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-md)', marginTop: 40 }}>
            {pattern.name} · {minutes > 0 ? `${minutes} min` : 'open'}
          </p>
          {/* Finish gently → the soft close (esp. for the open-ended option). */}
          <Button variant="ghost" onClick={() => setPhase('done')} className="mt-3">
            Finish
          </Button>
        </div>
      )}

      {phase === 'done' && (
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-10 text-center">
          <Reveal delay={0.1}>
            <h2 className="serif" style={{ fontSize: 'var(--t-2xl)' }}>
              Well breathed.
            </h2>
          </Reveal>
          <Reveal delay={0.32}>
            <p style={{ color: 'var(--ink-muted)', marginTop: 12, fontSize: 'var(--t-md)' }}>
              This breath is always here when you need it.
            </p>
          </Reveal>
          <Reveal delay={0.5} className="mt-8 w-full">
            <ReflectionPrompt />
          </Reveal>
          <Reveal delay={0.75} className="mt-8 flex flex-col items-center gap-2">
            <Button onClick={() => setPhase('setup')}>Again</Button>
            <Button variant="ghost" onClick={() => nav.back()}>
              I’m done
            </Button>
          </Reveal>
        </div>
      )}
    </div>
  );
}
