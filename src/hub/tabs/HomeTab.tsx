import { useEffect, useState, type ComponentType } from 'react';
import { Timer, Wind, HeartHandshake, Flower2 } from 'lucide-react';
import Reveal from '../../ui/Reveal';
import PracticeCard from '../../ui/PracticeCard';
import CoverCard from '../../ui/CoverCard';
import { usePrefs } from '../../store/prefs';
import { session } from '../../store/session';
import { app } from '../../store/app';
import { openTool } from '../../store/tool';
import { programme, useProgrammeProgress } from '../../store/programme';
import { PROGRAMMES } from '../../data/programmes';
import { PATHS } from '../../data/paths';
import { getHistory, getReflections, getJournal, getPresence, type HistoryEntry } from '../../lib/storage';
import { feelingLabel } from '../../data/feelings';
import { BAND_GREETING, useTimeBand } from '../../lib/timeBand';
import { stillWaterGradient } from '../../store/water';
import { TODAY } from '../../data/today';
import { dailyLine } from '../../data/dailyLines';

const today = () =>
  new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Only the first name greets on Home — "Viivek", not "Viivek Mehata". */
const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? '';

/** §6 Home (§Phase C). A calm launchpad: quick actions, a rich arrival check-in
 *  entry, editorial serif, atmospheric band-tinted cards, one warm daily line.
 *  No streaks, no counts, one clear primary action. */
export default function HomeTab() {
  const prefs = usePrefs();
  const band = useTimeBand(); // single time source (§Phase B/C) — greeting, cards, cover tint
  const [recent, setRecent] = useState<HistoryEntry | null>(null);
  const [activeDays, setActiveDays] = useState<Set<string>>(new Set());
  useProgrammeProgress();
  const prog = PROGRAMMES[0];
  const progStarted = programme.isStarted(prog.id);
  const progComplete = programme.isComplete(prog);
  const progNext = programme.nextDayIndex(prog);

  useEffect(() => {
    getHistory().then((h) => setRecent(h[0] ?? null));
    // Weekly Spine activity, days you came home: presence (app open / first play)
    // unioned with the days a moment was gathered (sessions, reflections, journal).
    Promise.all([getHistory(), getReflections(), getJournal(), getPresence()]).then(([h, r, j, p]) => {
      const set = new Set<string>();
      for (const x of [...h, ...r, ...j]) set.add(dayKey(new Date(x.ts)));
      for (const k of p) set.add(k);
      setActiveDays(set);
    });
  }, []);

  // Meditate → the full arrival → duration → player flow.
  const meditate = () => {
    session.reset();
    app.setView('session');
  };
  // Check-in → straight to the arrival check-in (the richer slider).
  const checkIn = () => {
    session.reset();
    session.go('arrival');
    app.setView('session');
  };
  // The daily card → one tap into a fitting session (skips ahead to the guided path).
  const todayCard = TODAY[band];
  const todayDuration = PATHS.find((p) => p.id === todayCard.session)?.duration ?? '';
  const startToday = () => {
    session.reset();
    session.pickPath(todayCard.session);
    app.setView('session');
  };

  const cover = stillWaterGradient(band); // atmospheric tint tied to the time band
  const progTag = progComplete ? 'Your week · complete' : progStarted ? `Continue · day ${progNext + 1}` : 'A gentle week · 7 days';

  return (
    <div className="screen">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-start pt-4 pb-6">
        <Reveal delay={0.05}>
          <div className="eyebrow">{today()}</div>
          <h1 className="serif" style={{ fontSize: 'var(--t-xl)', marginTop: 4, lineHeight: 1.08 }}>
            {BAND_GREETING[band].hi}{firstName(prefs.name) ? `, ${firstName(prefs.name)}` : ''}
          </h1>
          <p style={{ color: 'var(--ink-muted)', marginTop: 4, fontSize: 'var(--t-sm)' }}>
            {BAND_GREETING[band].sub}
          </p>
        </Reveal>

        {/* Quick actions — three one-tap shortcuts (§Phase C). */}
        <Reveal delay={0.16} className="mt-6">
          <div className="grid grid-cols-3 gap-3">
            <QuickAction Icon={Wind} label="Breathe" onClick={() => openTool('breathe')} />
            <QuickAction Icon={HeartHandshake} label="Check-in" onClick={checkIn} />
            <QuickAction Icon={Flower2} label="Meditate" onClick={meditate} />
          </div>
        </Reveal>

        {/* The one gold-lit primary — a fitting session for right now. */}
        <Reveal delay={0.28} className="mt-6">
          <CoverCard
            accent
            cover={cover}
            tag={`${todayCard.eyebrow} · ${todayDuration}`}
            title={todayCard.title}
            sub={todayCard.sub}
            onClick={startToday}
          />
        </Reveal>

        {recent && (
          <Reveal delay={0.4}>
            <button
              onClick={meditate}
              className="glass mt-4 w-full px-5 py-4 text-left transition-opacity duration-300 hover:opacity-90"
              style={{ borderRadius: 'var(--radius-card)' }}
            >
              <div className="eyebrow">Return to</div>
              <div className="serif" style={{ fontSize: 'var(--t-lg)', marginTop: 4 }}>
                Last time, you arrived {feelingLabel(recent.emotion)}.
              </div>
            </button>
          </Reveal>
        )}

        {/* Multi-day programme — an atmospheric cover card, reusing the component. */}
        <Reveal delay={0.46} className="mt-4">
          <CoverCard
            cover={cover}
            tag={progTag}
            title={prog.title}
            sub="Seven small sittings — one a day, in any order."
            onClick={() => programme.open(prog.id)}
          />
        </Reveal>

        {/* Weekly Spine (§6 flow) — the days you came home this week. */}
        <Reveal delay={0.5} className="mt-4">
          <WeekSpine active={activeDays} />
        </Reveal>

        {/* One warm line for today (§Phase C) — rotates by the day, never a task. */}
        <Reveal delay={0.54} className="mt-7">
          <p className="serif-italic" style={{ textAlign: 'center', color: 'var(--ink-muted)', fontSize: 'var(--t-md)' }}>
            {dailyLine()}
          </p>
        </Reveal>

        {/* A quiet, self-directed timer — Breathe now lives in Quick Actions above. */}
        <Reveal delay={0.62}>
          <div className="eyebrow" style={{ marginTop: 24, marginBottom: 10 }}>
            Or take a quiet moment
          </div>
          <PracticeCard Icon={Timer} title="Quiet Timer" sub="Silent · your pace" onClick={() => openTool('timer')} />
        </Reveal>
      </div>
    </div>
  );
}

/** Weekly Spine (§6 flow) — a compact current-week strip; gold dots mark the days
 *  a moment was gathered. A mirror, never a streak. The fuller month view lives in
 *  Profile (journey/ReflectionTrail). */
function WeekSpine({ active }: { active: Set<string> }) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay()); // back to Sunday
  const todayKey = dayKey(now);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  return (
    <div className="glass px-5 py-4" style={{ borderRadius: 'var(--radius-card)' }}>
      <div className="eyebrow">Weekly spine</div>
      <div className="mt-3 grid grid-cols-7 gap-y-2" aria-hidden>
        {DOW.map((d, i) => (
          <span key={`h${i}`} className="eyebrow" style={{ fontSize: 9, textAlign: 'center' }}>
            {d}
          </span>
        ))}
        {days.map((d) => {
          const on = active.has(dayKey(d));
          const isToday = dayKey(d) === todayKey;
          return (
            <span key={dayKey(d)} className="grid place-items-center" style={{ height: 24 }}>
              <span
                style={{
                  width: on ? 11 : 5,
                  height: on ? 11 : 5,
                  borderRadius: 999,
                  background: on ? 'var(--gold)' : 'rgba(157,178,181,0.22)',
                  boxShadow: on ? '0 0 12px rgba(232,201,155,0.5)' : 'none',
                  outline: isToday ? '1px solid rgba(232,201,155,0.45)' : 'none',
                  outlineOffset: 3,
                  transition: 'all .3s var(--ease-calm)',
                }}
              />
            </span>
          );
        })}
      </div>
      <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-xs)', marginTop: 10, lineHeight: 1.5 }}>
        The days you came home this week.
      </p>
    </div>
  );
}

/** A single Still-Water quick-action shortcut (§Phase C). */
function QuickAction({
  Icon,
  label,
  onClick,
}: {
  Icon: ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="glass flex flex-col items-center gap-2 py-4 transition-transform duration-300 active:scale-[0.97]"
      style={{ borderRadius: 'var(--radius-card)', transitionTimingFunction: 'var(--ease-calm)' }}
    >
      <Icon size={21} strokeWidth={1.5} color="var(--gold)" />
      <span style={{ color: 'var(--ink)', fontSize: 'var(--t-sm)' }}>{label}</span>
    </button>
  );
}
