import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import Reveal from '../../ui/Reveal';
import { openSanctuary } from '../../sanctuary/Sanctuary';
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

        {/* Sanctuary — the saved collection, also reachable here (§Phase D). */}
        <Reveal delay={0.15}>
          <button
            onClick={openSanctuary}
            className="glass mb-5 flex w-full items-center gap-3 px-5 py-4 text-left transition-transform duration-300 active:scale-[0.99]"
            style={{ borderRadius: 'var(--radius-card)', transitionTimingFunction: 'var(--ease-calm)' }}
          >
            <span className="grid shrink-0 place-items-center" style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(232,201,155,0.14)' }}>
              <Heart size={18} strokeWidth={1.6} color="var(--gold)" fill="var(--gold)" />
            </span>
            <span className="flex-1">
              <span style={{ display: 'block', color: 'var(--ink)', fontSize: 'var(--t-md)' }}>Sanctuary</span>
              <span className="eyebrow" style={{ display: 'block', marginTop: 2 }}>What you’ve kept close</span>
            </span>
            <span aria-hidden style={{ color: 'var(--ink-muted)' }}>→</span>
          </button>
        </Reveal>

        {/* Weekly rhythm — a gentle habit nudge that encourages daily practice,
            never a streak to break or a guilt count (§8). */}
        <Reveal delay={0.18}>
          <WeekTracker history={history} reflections={reflections} />
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

const DAY_MS = 86_400_000;
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const dateKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** Encouragement scaled to how many days this week held a moment (§8). */
function weekMessage(count: number): string {
  if (count >= 7) return 'Seven for seven — you’re doing beautifully.';
  if (count >= 5) return 'You’re building a lovely rhythm this week.';
  if (count >= 3) return 'You’re finding your rhythm — keep it going.';
  if (count >= 1) return 'A gentle start. You can still pick up.';
  return 'Whenever you’re ready — one breath is enough.';
}

/**
 * Minimalist weekly habit tracker (§8). Seven dots for the last seven days; a
 * day lights up gold when it holds any moment (a check-in or a reflection). It
 * encourages daily practice with a warm line — never a streak, never guilt.
 */
function WeekTracker({ history, reflections }: { history: HistoryEntry[]; reflections: Reflection[] }) {
  const active = new Set<string>();
  for (const h of history) active.add(dateKey(new Date(h.ts)));
  for (const r of reflections) active.add(dateKey(new Date(r.ts)));

  const now = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * DAY_MS);
    return { letter: DOW[d.getDay()], on: active.has(dateKey(d)), isToday: i === 6 };
  });
  const count = days.filter((d) => d.on).length;

  return (
    <div className="glass mb-5 px-5 py-5" style={{ borderRadius: 'var(--radius-card)' }}>
      <div className="flex items-baseline justify-between">
        <div className="eyebrow">This week</div>
        <div className="eyebrow" style={{ color: 'var(--gold)' }}>
          {count}/7 days
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between" aria-hidden>
        {days.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 999,
                background: d.on ? 'var(--gold)' : 'transparent',
                border: `1px solid ${d.on ? 'var(--gold)' : 'var(--hairline)'}`,
                boxShadow: d.on ? '0 0 12px rgba(232,201,155,0.45)' : 'none',
                outline: d.isToday ? '1px solid rgba(232,201,155,0.5)' : 'none',
                outlineOffset: 3,
              }}
            />
            <span className="eyebrow" style={{ fontSize: 9, color: d.isToday ? 'var(--ink)' : 'var(--ink-muted)' }}>
              {d.letter}
            </span>
          </div>
        ))}
      </div>
      <p className="serif-italic" style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)', marginTop: 16 }}>
        {weekMessage(count)}
      </p>
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
