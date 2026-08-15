import { useEffect, useState } from 'react';
import Reveal from '../../ui/Reveal';
import { usePrefs, prefsStore } from '../../store/prefs';
import {
  getHistory,
  clearHistory,
  getReflections,
  clearReflections,
  type HistoryEntry,
  type Reflection,
} from '../../lib/storage';
import { feelingLabel } from '../../data/feelings';
import type { Checkin } from '../../store/session';
import { programme, useProgrammeProgress } from '../../store/programme';
import { PROGRAMMES } from '../../data/programmes';

const CHECKIN_PHRASE: Record<Checkin, string> = {
  calmer: 'felt calmer',
  better: 'felt a little better',
  same: 'stayed with it',
  struggling: 'were still struggling',
  'prefer-not': 'kept it private',
};

/** §6 Profile. Gentle private journey + settings. No streaks, no stats guilt. */
export default function ProfileTab() {
  const prefs = usePrefs();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);
  useProgrammeProgress();
  const prog = PROGRAMMES[0];
  const progDone = new Set(programme.completed(prog.id));
  const progNext = programme.nextDayIndex(prog);
  const progComplete = programme.isComplete(prog);
  const progStarted = progDone.size > 0;

  useEffect(() => {
    getHistory().then(setHistory);
    getReflections().then(setReflections);
  }, []);

  const doClear = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    await clearHistory();
    await clearReflections();
    setHistory([]);
    setReflections([]);
    setConfirmClear(false);
  };

  // The journey = check-ins + reflections, gathered into one gentle time-line.
  type Moment = { ts: number; text: string };
  const moments: Moment[] = [
    ...history.map((h): Moment => {
      const last = h.checkins[h.checkins.length - 1];
      return {
        ts: h.ts,
        text: `You arrived ${feelingLabel(h.emotion)}${last && last !== 'prefer-not' ? `, and ${CHECKIN_PHRASE[last]}.` : '.'}`,
      };
    }),
    ...reflections.map((r): Moment => ({ ts: r.ts, text: `You felt ${r.word.toLowerCase()}.` })),
  ].sort((a, b) => b.ts - a.ts);

  return (
    <div className="screen">
      <div className="mx-auto w-full max-w-md py-10">
        <Reveal delay={0.05}>
          <div className="eyebrow">Profile</div>
          <h1 className="serif" style={{ fontSize: 'var(--t-2xl)', marginTop: 8, marginBottom: 20 }}>
            Your journey
          </h1>
        </Reveal>

        {/* The programme gives the journey a spine, even before any check-ins (§Phase4). */}
        <Reveal delay={0.12}>
          <button
            onClick={() => programme.open(prog.id)}
            className="glass glass-gold mb-5 w-full px-5 py-4 text-left transition-transform duration-300 active:scale-[0.99]"
            style={{ borderRadius: 'var(--radius-card)', transitionTimingFunction: 'var(--ease-calm)' }}
          >
            <div className="eyebrow" style={{ color: 'var(--gold)' }}>
              {progComplete ? 'Your week · complete' : progStarted ? 'Continue where you left off' : 'A gentle week'}
            </div>
            <div className="serif" style={{ fontSize: 'var(--t-lg)', marginTop: 4, marginBottom: 12 }}>
              {prog.title}
            </div>
            <div className="flex items-center gap-2" aria-hidden>
              {prog.days.map((_, i) => {
                const isDone = progDone.has(i);
                const isNext = i === progNext && !progComplete;
                return (
                  <span
                    key={i}
                    style={{
                      width: isNext ? 10 : 8,
                      height: isNext ? 10 : 8,
                      borderRadius: 999,
                      background: isDone ? 'var(--gold)' : 'transparent',
                      border: `1px solid ${isDone || isNext ? 'var(--gold)' : 'var(--hairline)'}`,
                    }}
                  />
                );
              })}
            </div>
          </button>
        </Reveal>

        {moments.length === 0 ? (
          <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-md)' }}>
            When you come home, your moments will gather here — just for you.
          </p>
        ) : (
          <>
            <div className="eyebrow" style={{ marginBottom: 10 }}>
              The moments you’ve gathered
            </div>
            <div className="flex flex-col gap-3">
              {moments.map((m) => (
                <div key={m.ts} className="glass px-5 py-4" style={{ borderRadius: 'var(--radius-card)' }}>
                  <div className="eyebrow">{new Date(m.ts).toLocaleDateString()}</div>
                  <div style={{ color: 'var(--ink)', fontSize: 'var(--t-md)', marginTop: 4 }}>{m.text}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Settings */}
        <div className="eyebrow" style={{ marginTop: 34 }}>
          Settings
        </div>
        <div className="glass mt-3" style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
          <Row label="Background music">
            <Switch
              on={!prefs.ambientMuted}
              label="Background music"
              onToggle={() => prefsStore.setAmbientMuted(!prefs.ambientMuted)}
            />
          </Row>
          <Row label="Reduce motion">
            <Switch
              on={prefs.reduceMotion}
              label="Reduce motion"
              onToggle={() => prefsStore.setReduceMotion(!prefs.reduceMotion)}
            />
          </Row>
          <Row label="Voice">
            <span style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)' }}>Default</span>
          </Row>
          <Row label="Theme">
            <span style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)' }}>Still water</span>
          </Row>
          <Row label="Your data" last>
            <button
              onClick={doClear}
              style={{ color: confirmClear ? 'var(--gold)' : 'var(--ink-muted)', fontSize: 'var(--t-sm)' }}
            >
              {confirmClear ? 'Tap again to clear' : 'Clear history'}
            </button>
          </Row>
        </div>

        <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-xs)', marginTop: 12 }}>
          Everything you share stays on this device.
        </p>

        <button
          disabled
          className="mt-6 w-full"
          aria-disabled="true"
          style={{
            minHeight: 48,
            borderRadius: 999,
            border: '1px solid var(--hairline)',
            color: 'var(--ink-muted)',
            opacity: 0.55,
            fontSize: 'var(--t-md)',
          }}
        >
          Continue with Google · coming later
        </button>
      </div>
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
      style={{
        width: 46,
        height: 28,
        borderRadius: 999,
        background: on ? 'var(--gold)' : 'var(--hairline)',
        position: 'relative',
        transition: 'background-color .3s var(--ease-calm)',
      }}
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

function Row({ label, children, last = false }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4"
      style={{ borderBottom: last ? 'none' : '1px solid var(--hairline)', minHeight: 56 }}
    >
      <span style={{ color: 'var(--ink)', fontSize: 'var(--t-md)' }}>{label}</span>
      {children}
    </div>
  );
}
