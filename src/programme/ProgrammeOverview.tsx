import { useEffect } from 'react';
import { Check } from 'lucide-react';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';
import ExitButton from '../ui/ExitButton';
import { nav } from '../nav/history';
import { setDepth } from '../store/water';
import { programme, useProgrammeProgress } from '../store/programme';
import { programmeById } from '../data/programmes';

/** §Phase4 — a programme's intro + day list. Guilt-free: soft language, a gentle
 *  dot path, no streaks, no counts to live up to. Days play the existing player. */
export default function ProgrammeOverview() {
  useProgrammeProgress(); // re-render when a day is completed
  const p = programmeById(programme.openId ?? '');

  useEffect(() => {
    setDepth('checkin');
  }, []);

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

  return (
    <div className="screen">
      <ExitButton onExit={() => nav.back()} />
      <div className="mx-auto w-full max-w-md py-10">
        <Reveal delay={0.05}>
          <div className="eyebrow">Programme</div>
          <h1 className="serif" style={{ fontSize: 'var(--t-2xl)', marginTop: 8, marginBottom: 10 }}>
            {p.title}
          </h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-md)', lineHeight: 1.55 }}>{p.intro}</p>
        </Reveal>

        {/* Gentle dot path — filled for days visited, a soft ring on where you are. */}
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

        {/* One clear action — resume, never a demand. */}
        <Reveal delay={0.2}>
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
        </Reveal>

        {/* The days — take them in any order, or not at all. */}
        <div className="mt-7 flex flex-col gap-2">
          {p.days.map((d, i) => {
            const isDone = done.has(i);
            const isNext = i === next && !complete;
            return (
              <Reveal key={i} delay={0.28 + i * 0.04}>
                <button
                  onClick={() => programme.startDay(p.id, i)}
                  className={`glass ${isNext ? 'glass-gold' : ''} flex w-full items-center gap-4 px-5 py-4 text-left transition-transform duration-300 active:scale-[0.99]`}
                  style={{ borderRadius: 'var(--radius-card)', transitionTimingFunction: 'var(--ease-calm)' }}
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
                    {isDone ? <Check size={15} strokeWidth={2} /> : <span className="eyebrow" style={{ color: isNext ? 'var(--gold)' : 'var(--ink-muted)' }}>{i + 1}</span>}
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
