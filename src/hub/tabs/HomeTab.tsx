import { useEffect, useState } from 'react';
import { Timer, Wind } from 'lucide-react';
import Reveal from '../../ui/Reveal';
import PracticeCard from '../../ui/PracticeCard';
import { usePrefs } from '../../store/prefs';
import { session } from '../../store/session';
import { app } from '../../store/app';
import { openTool } from '../../store/tool';
import { programme, useProgrammeProgress } from '../../store/programme';
import { PROGRAMMES } from '../../data/programmes';
import { getHistory, type HistoryEntry } from '../../lib/storage';
import { feelingLabel } from '../../data/feelings';
import { PHASE, phaseFor } from '../../lib/greeting';

const today = () =>
  new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

/** §6 Home. Editorial welcome + big CTA + a soft recent card. No streaks/counts. */
export default function HomeTab() {
  const prefs = usePrefs();
  const [recent, setRecent] = useState<HistoryEntry | null>(null);
  useProgrammeProgress();
  const prog = PROGRAMMES[0];
  const progStarted = programme.isStarted(prog.id);
  const progComplete = programme.isComplete(prog);
  const progNext = programme.nextDayIndex(prog);

  useEffect(() => {
    getHistory().then((h) => setRecent(h[0] ?? null));
  }, []);

  const comeHome = () => {
    session.reset();
    app.setView('session');
  };

  return (
    <div className="screen">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
        <Reveal delay={0.05}>
          <div className="eyebrow">{today()}</div>
          <h1 className="serif" style={{ fontSize: 'var(--t-2xl)', marginTop: 8, lineHeight: 1.05, whiteSpace: 'pre-line' }}>
            {PHASE[phaseFor()].hi}{prefs.name ? `,\n${prefs.name}` : ''}
          </h1>
          <p style={{ color: 'var(--ink-muted)', marginTop: 10, fontSize: 'var(--t-md)' }}>
            {PHASE[phaseFor()].sub}
          </p>
        </Reveal>

        <Reveal delay={0.25} className="mt-8">
          <button
            onClick={comeHome}
            className="glass glass-strong glass-gold w-full px-6 py-6 text-left transition-transform duration-300 active:scale-[0.99]"
            style={{ borderRadius: 'var(--radius-card)', transitionTimingFunction: 'var(--ease-calm)' }}
          >
            <div className="eyebrow" style={{ color: 'var(--gold)' }}>
              A moment for you
            </div>
            <div className="serif" style={{ fontSize: 'var(--t-xl)', marginTop: 8 }}>
              Come home now
            </div>
            <div style={{ color: 'var(--ink-muted)', marginTop: 4, fontSize: 'var(--t-sm)' }}>
              One breath. Two minutes. Right here.
            </div>
          </button>
        </Reveal>

        {recent && (
          <Reveal delay={0.4}>
            <button
              onClick={comeHome}
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

        {/* Multi-day programme — offer it, and let people continue where they left off. */}
        <Reveal delay={0.45}>
          <button
            onClick={() => programme.open(prog.id)}
            className="glass mt-4 w-full px-5 py-4 text-left transition-transform duration-300 active:scale-[0.99]"
            style={{ borderRadius: 'var(--radius-card)', transitionTimingFunction: 'var(--ease-calm)' }}
          >
            <div className="eyebrow" style={{ color: 'var(--gold)' }}>
              {progComplete ? 'Your week · complete' : progStarted ? `Continue · day ${progNext + 1}` : 'A gentle week'}
            </div>
            <div className="serif" style={{ fontSize: 'var(--t-lg)', marginTop: 4 }}>
              {prog.title}
            </div>
            <div style={{ color: 'var(--ink-muted)', marginTop: 4, fontSize: 'var(--t-sm)' }}>
              Seven small sittings — one a day, in any order.
            </div>
          </button>
        </Reveal>

        {/* Quiet, self-directed practices — secondary to the one clear action above. */}
        <Reveal delay={0.55}>
          <div className="eyebrow" style={{ marginTop: 24, marginBottom: 10 }}>
            Or take a quiet moment
          </div>
          <div className="grid grid-cols-2 gap-3">
            <PracticeCard Icon={Timer} title="Quiet timer" sub="Silent · your pace" onClick={() => openTool('timer')} />
            <PracticeCard Icon={Wind} title="Breathe" sub="Guided · visual" onClick={() => openTool('breathe')} />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
