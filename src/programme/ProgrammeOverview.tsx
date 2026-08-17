import { useEffect, useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';
import ExitButton from '../ui/ExitButton';
import { nav } from '../nav/history';
import { setDepth } from '../store/water';
import { useReducedMotion } from '../lib/motion';
import { programme, useProgrammeProgress } from '../store/programme';
import { programmeById } from '../data/programmes';
import { PATHS } from '../data/paths';
import type { PathId } from '../store/session';

// Programmes whose "ready" reveal has already played this session — so it's a
// one-time welcome, not a gate you sit through every visit.
const revealedThisSession = new Set<string>();

/** §Phase4/§Phase F — a programme's intro, a calm "what's inside" bento, and its
 *  days. Guilt-free: soft language, a gentle dot path, no streaks, no counts to
 *  live up to. Real days play the existing player; a not-yet-made programme shows a
 *  calm "in the making" shell instead of a broken item. */
export default function ProgrammeOverview() {
  useProgrammeProgress(); // re-render when a day is completed
  const p = programmeById(programme.openId ?? '');
  const reduce = useReducedMotion();
  const soon = !!p?.comingSoon;

  // A brief "Your program is ready" welcome — once per programme per session, and
  // never when motion is reduced or the programme is only a shell.
  const [reveal, setReveal] = useState<'in' | 'out' | 'gone'>(() =>
    !p || soon || reduce || revealedThisSession.has(p.id) ? 'gone' : 'in',
  );

  useEffect(() => {
    setDepth('checkin');
  }, []);

  // Mark the programme as "welcomed" only once the reveal has actually played
  // through (not on mount) — otherwise StrictMode's remount would see it already
  // marked and skip the welcome entirely.
  useEffect(() => {
    if (reveal !== 'in' || !p) return;
    const t = setTimeout(() => {
      revealedThisSession.add(p.id);
      setReveal('out');
    }, 1500);
    return () => clearTimeout(t);
  }, [reveal, p]);

  useEffect(() => {
    if (reveal !== 'out') return;
    const t = setTimeout(() => setReveal('gone'), 560);
    return () => clearTimeout(t);
  }, [reveal]);

  if (!p) {
    return (
      <div className="screen">
        <ExitButton onExit={() => nav.back()} />
      </div>
    );
  }

  const done = new Set(programme.completed(p.id));
  const next = programme.nextDayIndex(p);
  const complete = programme.isComplete(p);
  const started = done.size > 0;

  // "What's inside" — the distinct sittings this journey draws on (§Phase F bento).
  const uniqueSessions: PathId[] = [...new Set(p.days.map((d) => d.session).filter((s): s is PathId => !!s))];
  const inside = uniqueSessions
    .map((id) => PATHS.find((x) => x.id === id))
    .filter((x): x is (typeof PATHS)[number] => !!x);

  return (
    <div className="screen">
      <ExitButton onExit={() => nav.back()} />

      {/* One-time "ready" welcome. Tap anywhere to continue. */}
      {reveal !== 'gone' && (
        <div
          onClick={() => {
            revealedThisSession.add(p.id);
            setReveal('out');
          }}
          className="fixed inset-0 z-30 grid place-items-center px-8 text-center"
          style={{
            background: 'rgba(6,17,24,0.74)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            opacity: reveal === 'in' ? 1 : 0,
            transition: 'opacity .55s var(--ease-calm)',
          }}
        >
          <div>
            <Sparkles size={22} strokeWidth={1.4} color="var(--gold)" style={{ margin: '0 auto 14px' }} />
            <div className="eyebrow" style={{ color: 'var(--gold)' }}>
              Your program is ready
            </div>
            <div className="serif" style={{ fontSize: 'var(--t-2xl)', marginTop: 10, lineHeight: 1.1 }}>
              {p.title}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-md py-10">
        <Reveal delay={0.05}>
          <div className="eyebrow">Programme</div>
          <h1 className="serif" style={{ fontSize: 'var(--t-2xl)', marginTop: 8, marginBottom: 10 }}>
            {p.title}
          </h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-md)', lineHeight: 1.55 }}>{p.intro}</p>
        </Reveal>

        {/* Dot path — filled for days visited, a soft ring on where you are.
            (Only meaningful for a real, playable journey.) */}
        {!soon && (
          <Reveal delay={0.14}>
            <div className="mt-6 flex items-center justify-center gap-2" aria-hidden>
              {p.days.map((_, i) => {
                const isDone = done.has(i);
                const isNext = i === next && !complete;
                return (
                  <span
                    key={i}
                    style={{
                      width: isNext ? 11 : 8,
                      height: isNext ? 11 : 8,
                      borderRadius: 999,
                      background: isDone ? 'var(--gold)' : 'transparent',
                      border: `1px solid ${isDone || isNext ? 'var(--gold)' : 'var(--hairline)'}`,
                      transition: 'all .3s var(--ease-calm)',
                    }}
                  />
                );
              })}
            </div>
          </Reveal>
        )}

        {/* Primary action — resume, never a demand — OR a calm shell if not made yet. */}
        <Reveal delay={0.2}>
          {soon ? (
            <div className="glass mt-6 px-5 py-5" style={{ borderRadius: 'var(--radius-card)' }}>
              <div className="eyebrow" style={{ color: 'var(--ink-muted)' }}>
                In the making
              </div>
              <div className="serif" style={{ fontSize: 'var(--t-lg)', marginTop: 6, lineHeight: 1.2 }}>
                On its way, with care
              </div>
              <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)', marginTop: 8, lineHeight: 1.5 }}>
                We’d rather make this gently than rush it. You’ll find it here when it’s ready — nothing to wait up for.
              </p>
            </div>
          ) : (
            <div className="glass glass-strong glass-gold mt-6 px-5 py-5" style={{ borderRadius: 'var(--radius-card)' }}>
              <div className="eyebrow" style={{ color: 'var(--gold)' }}>
                {complete ? 'Come back any time' : started ? 'Continue where you left off' : "Start when you're ready"}
              </div>
              <div className="serif" style={{ fontSize: 'var(--t-lg)', marginTop: 6 }}>
                Day {next + 1} · {p.days[next].title}
              </div>
              <div className="mt-4">
                <Button onClick={() => programme.startDay(p.id, next)}>{started ? 'Continue' : 'Begin'}</Button>
              </div>
            </div>
          )}
        </Reveal>

        {/* What's inside — a calm bento of the sittings this journey draws on. */}
        {inside.length > 0 && (
          <>
            <Reveal delay={0.26}>
              <div className="eyebrow" style={{ marginTop: 30, marginBottom: 12 }}>
                What’s inside
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="grid grid-cols-2 gap-2.5">
                {inside.map((s) => (
                  <div key={s.id} className="glass px-4 py-4" style={{ borderRadius: 'var(--radius-card)' }}>
                    <div className="eyebrow" style={{ color: 'var(--gold)' }}>{s.duration}</div>
                    <div className="serif" style={{ fontSize: 'var(--t-md)', marginTop: 4, lineHeight: 1.2 }}>
                      {s.title}
                    </div>
                  </div>
                ))}
                <div className="glass px-4 py-4" style={{ borderRadius: 'var(--radius-card)' }}>
                  <div className="eyebrow" style={{ color: 'var(--gold)' }}>Any time</div>
                  <div className="serif" style={{ fontSize: 'var(--t-md)', marginTop: 4, lineHeight: 1.2 }}>
                    Breath at your pace
                  </div>
                </div>
              </div>
            </Reveal>
          </>
        )}

        {/* The days — take them in any order, or not at all. */}
        <div className="mt-7 flex flex-col gap-2">
          {p.days.map((d, i) => {
            const isDone = done.has(i);
            const isNext = i === next && !complete && !soon;
            const playable = !soon && !!d.session;
            return (
              <Reveal key={i} delay={0.34 + i * 0.04}>
                <button
                  onClick={() => playable && programme.startDay(p.id, i)}
                  disabled={!playable}
                  className={`glass ${isNext ? 'glass-gold' : ''} flex w-full items-center gap-4 px-5 py-4 text-left transition-transform duration-300 ${playable ? 'active:scale-[0.99]' : ''}`}
                  style={{
                    borderRadius: 'var(--radius-card)',
                    transitionTimingFunction: 'var(--ease-calm)',
                    opacity: soon ? 0.78 : 1,
                    cursor: playable ? 'pointer' : 'default',
                  }}
                >
                  <span
                    className="grid shrink-0 place-items-center"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 999,
                      border: `1px solid ${isDone || isNext ? 'var(--gold)' : 'var(--hairline)'}`,
                      background: isDone ? 'rgba(232,201,155,0.14)' : 'transparent',
                      color: 'var(--gold)',
                    }}
                  >
                    {isDone ? (
                      <Check size={15} strokeWidth={2} />
                    ) : (
                      <span className="eyebrow" style={{ color: isNext ? 'var(--gold)' : 'var(--ink-muted)' }}>
                        {i + 1}
                      </span>
                    )}
                  </span>
                  <span className="flex-1">
                    <span style={{ color: 'var(--ink)', fontSize: 'var(--t-md)', display: 'block' }}>{d.title}</span>
                    <span className="eyebrow" style={{ display: 'block', marginTop: 3, textTransform: 'none', letterSpacing: 0 }}>
                      {d.note}
                    </span>
                  </span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
