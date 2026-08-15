import { useEffect, useRef, useState } from 'react';
import { Minus, Plus, Pause, Play } from 'lucide-react';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';
import ExitButton from '../ui/ExitButton';
import ReflectionPrompt from '../ui/ReflectionPrompt';
import { nav } from '../nav/history';
import { setDepth } from '../store/water';
import { useBreath } from '../breath/useBreath';
import { toolPrefsStore, useToolPrefs } from '../store/toolPrefs';
import { tones, unlockTones } from '../audio/tones';

const PRESETS = [3, 5, 10, 15, 20];
const INTERVALS = [0, 2, 5, 10]; // minutes; 0 = off
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** A soft halo that breathes with the shared clock (§5) — the one element that
 *  "aligns with the breath clock". Isolated so only it re-renders per frame. */
function BreathHalo() {
  const b = useBreath(); // 0..1 shared clock; constant 0.5 under reduced motion
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: -18,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(232,201,155,0.20), transparent 70%)',
        transform: `scale(${0.94 + b * 0.1})`,
        opacity: 0.5 + b * 0.4,
      }}
    />
  );
}

type Phase = 'setup' | 'running' | 'done';

export default function TimerTool() {
  const saved = useToolPrefs();
  const [phase, setPhase] = useState<Phase>('setup');
  const [minutes, setMinutes] = useState(saved.timerMinutes);
  const [startTone, setStartTone] = useState(saved.timerStartTone);
  const [endTone, setEndTone] = useState(saved.timerEndTone);
  const [intervalMin, setIntervalMin] = useState(saved.timerIntervalMin);

  const total = minutes * 60;
  const [remaining, setRemaining] = useState(total);
  const [paused, setPaused] = useState(false);

  // Timekeeping from wall-clock so background throttling never drifts the sit.
  const endAtRef = useRef(0);
  const nextBellRef = useRef(0);

  useEffect(() => {
    setDepth('checkin'); // the calmest water preset
  }, []);

  // The countdown — a 1s interval (NOT a rAF loop). Computes remaining from
  // Date.now() so it stays accurate across tab-hide.
  useEffect(() => {
    if (phase !== 'running' || paused) return;
    const tick = () => {
      const left = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (intervalMin > 0 && nextBellRef.current && Date.now() >= nextBellRef.current && left > 1) {
        tones.interval();
        nextBellRef.current += intervalMin * 60 * 1000;
      }
      if (left <= 0) {
        if (endTone) tones.end();
        setPhase('done');
      }
    };
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [phase, paused, intervalMin, endTone]);

  const begin = () => {
    toolPrefsStore.patch({
      timerMinutes: minutes,
      timerStartTone: startTone,
      timerEndTone: endTone,
      timerIntervalMin: intervalMin,
    });
    unlockTones(); // this tap satisfies autoplay so the end tone can sound later
    const now = Date.now();
    endAtRef.current = now + total * 1000;
    nextBellRef.current = intervalMin > 0 ? now + intervalMin * 60 * 1000 : 0;
    setRemaining(total);
    setPaused(false);
    setPhase('running');
    if (startTone) tones.start();
  };

  const togglePause = () => {
    if (paused) {
      endAtRef.current = Date.now() + remaining * 1000;
      // Re-anchor the next bell relative to now.
      if (intervalMin > 0) {
        const elapsed = total - remaining;
        const sinceBell = elapsed % (intervalMin * 60);
        nextBellRef.current = Date.now() + (intervalMin * 60 - sinceBell) * 1000;
      }
      setPaused(false);
    } else {
      setPaused(true);
    }
  };

  // ---- Progress ring geometry (remaining depletes the gold arc) ----
  const R = 118;
  const C = 2 * Math.PI * R;
  const elapsedFrac = total > 0 ? (total - remaining) / total : 0;
  const dashoffset = C * elapsedFrac;

  return (
    <div className="screen items-center">
      <ExitButton onExit={() => nav.back()} />

      {phase === 'setup' && (
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <Reveal delay={0.05}>
            <div className="eyebrow">Quiet timer</div>
            <h1 className="serif" style={{ fontSize: 'var(--t-2xl)', marginTop: 8, marginBottom: 4 }}>
              Sit for a while.
            </h1>
            <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-md)', marginBottom: 22 }}>
              No voice, no counting. Just time held for you.
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((m) => {
                const on = minutes === m;
                return (
                  <button
                    key={m}
                    onClick={() => setMinutes(m)}
                    aria-pressed={on}
                    className={`glass ${on ? 'glass-gold' : ''} px-4 py-3 transition-transform duration-300 active:scale-[0.97]`}
                    style={{
                      borderRadius: 'var(--radius-chip)',
                      color: on ? 'var(--gold)' : 'var(--ink)',
                      fontSize: 'var(--t-md)',
                      transitionTimingFunction: 'var(--ease-calm)',
                      minWidth: 64,
                    }}
                  >
                    {m} min
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="glass mt-3 flex items-center justify-between px-4 py-3" style={{ borderRadius: 'var(--radius-chip)' }}>
              <span style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)' }}>Custom</span>
              <div className="flex items-center gap-4">
                <Stepper label="Fewer minutes" onClick={() => setMinutes((m) => Math.max(1, m - 1))}>
                  <Minus size={18} strokeWidth={1.8} />
                </Stepper>
                <span className="serif" style={{ fontSize: 'var(--t-lg)', color: 'var(--ink)', minWidth: 74, textAlign: 'center' }}>
                  {minutes} min
                </span>
                <Stepper label="More minutes" onClick={() => setMinutes((m) => Math.min(90, m + 1))}>
                  <Plus size={18} strokeWidth={1.8} />
                </Stepper>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.32}>
            <div className="glass mt-4" style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
              <SettingRow label="Soft start tone">
                <Switch on={startTone} label="Soft start tone" onToggle={() => setStartTone((v) => !v)} />
              </SettingRow>
              <SettingRow label="Soft end tone">
                <Switch on={endTone} label="Soft end tone" onToggle={() => setEndTone((v) => !v)} />
              </SettingRow>
              <SettingRow label="Interval bell" last>
                <div className="flex gap-1">
                  {INTERVALS.map((iv) => {
                    const on = intervalMin === iv;
                    return (
                      <button
                        key={iv}
                        onClick={() => setIntervalMin(iv)}
                        aria-pressed={on}
                        className="px-3 py-1.5 transition-transform duration-300 active:scale-[0.96]"
                        style={{
                          borderRadius: 999,
                          fontSize: 'var(--t-sm)',
                          color: on ? 'var(--gold)' : 'var(--ink-muted)',
                          background: on ? 'rgba(232,201,155,0.14)' : 'transparent',
                          transitionTimingFunction: 'var(--ease-calm)',
                        }}
                      >
                        {iv === 0 ? 'Off' : `${iv}m`}
                      </button>
                    );
                  })}
                </div>
              </SettingRow>
            </div>
          </Reveal>

          <Reveal delay={0.42} className="mt-8 flex justify-center">
            <Button onClick={begin}>Begin</Button>
          </Reveal>
        </div>
      )}

      {phase === 'running' && (
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-10 text-center">
          <div style={{ position: 'relative', width: 260, height: 260, display: 'grid', placeItems: 'center' }}>
            <BreathHalo />
            <svg width="260" height="260" viewBox="0 0 260 260" aria-hidden style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="130" cy="130" r={R} fill="none" stroke="var(--hairline)" strokeWidth="2.5" />
              <circle
                cx="130"
                cy="130"
                r={R}
                fill="none"
                stroke="var(--gold)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={dashoffset}
                style={{ transition: 'stroke-dashoffset 0.95s linear' }}
              />
            </svg>
            <div className="serif" style={{ fontSize: '3.4rem', fontWeight: 300, letterSpacing: '0.02em', color: 'var(--ink)' }} aria-live="off">
              {fmt(remaining)}
            </div>
          </div>

          <p className="serif-italic" role="status" style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-md)', marginTop: 26, minHeight: 24 }}>
            {paused ? 'Paused. Come back when you’re ready.' : 'Let yourself be here.'}
          </p>

          <button
            onClick={togglePause}
            aria-label={paused ? 'Resume' : 'Pause'}
            className="glass grid place-items-center transition-transform duration-300 active:scale-[0.96]"
            style={{ width: 60, height: 60, borderRadius: 999, color: 'var(--ink)', marginTop: 12, transitionTimingFunction: 'var(--ease-calm)' }}
          >
            {paused ? <Play size={22} strokeWidth={1.6} /> : <Pause size={22} strokeWidth={1.6} />}
          </button>
        </div>
      )}

      {phase === 'done' && (
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-10 text-center">
          <Reveal delay={0.1}>
            <h2 className="serif" style={{ fontSize: 'var(--t-2xl)' }}>
              You stayed.
            </h2>
          </Reveal>
          <Reveal delay={0.32}>
            <p className="serif" style={{ color: 'var(--gold)', marginTop: 10, fontSize: 'var(--t-lg)' }}>
              That’s enough.
            </p>
          </Reveal>
          <Reveal delay={0.5}>
            <p style={{ color: 'var(--ink-muted)', marginTop: 12, fontSize: 'var(--t-md)' }}>
              Take the quiet with you.
            </p>
          </Reveal>
          <Reveal delay={0.6} className="mt-8 w-full">
            <ReflectionPrompt />
          </Reveal>
          <Reveal delay={0.85} className="mt-8 flex flex-col items-center gap-2">
            <Button onClick={() => setPhase('setup')}>Sit again</Button>
            <Button variant="ghost" onClick={() => nav.back()}>
              I’m done
            </Button>
          </Reveal>
        </div>
      )}
    </div>
  );
}

function Stepper({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="glass grid place-items-center transition-transform duration-300 active:scale-[0.94]"
      style={{ width: 44, height: 44, borderRadius: 999, color: 'var(--ink)', transitionTimingFunction: 'var(--ease-calm)' }}
    >
      {children}
    </button>
  );
}

function SettingRow({ label, children, last = false }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderBottom: last ? 'none' : '1px solid var(--hairline)', minHeight: 54 }}
    >
      <span style={{ color: 'var(--ink)', fontSize: 'var(--t-md)' }}>{label}</span>
      {children}
    </div>
  );
}

function Switch({ on, label, onToggle }: { on: boolean; label: string; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      style={{ width: 46, height: 28, borderRadius: 999, background: on ? 'var(--gold)' : 'var(--hairline)', position: 'relative', transition: 'background-color .3s var(--ease-calm)' }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 21 : 3,
          width: 22,
          height: 22,
          borderRadius: 999,
          background: '#10222b',
          transition: 'left .3s var(--ease-calm)',
        }}
      />
    </button>
  );
}
