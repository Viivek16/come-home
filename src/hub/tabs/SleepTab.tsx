import { useEffect } from 'react';
import { Moon, Waves, Wind } from 'lucide-react';
import Reveal from '../../ui/Reveal';
import { session } from '../../store/session';
import { app } from '../../store/app';
import { setMood } from '../../store/scene';
import { SLEEP_ITEMS } from '../../data/sleep';

const KIND_ICON = [Wind, Waves, Moon];

/** §6 Sleep & Rest — pinned to the night scene. */
export default function SleepTab() {
  useEffect(() => {
    setMood('night');
    return () => setMood(null);
  }, []);

  const openPlayer = () => {
    session.reset();
    session.pickPath('more-15');
    app.setView('session');
  };

  return (
    <div className="screen">
      <div className="mx-auto w-full max-w-md py-10">
        <Reveal delay={0.05}>
          <div className="eyebrow">Sleep &amp; rest</div>
          <h1 className="serif" style={{ fontSize: 'var(--t-2xl)', marginTop: 8, marginBottom: 22 }}>
            Let the night be soft.
          </h1>
        </Reveal>
        <div className="flex flex-col gap-3">
          {SLEEP_ITEMS.map((s, i) => {
            const Icon = KIND_ICON[i % KIND_ICON.length];
            return (
              <Reveal key={s.id} delay={0.14 + i * 0.07}>
                <button
                  onClick={openPlayer}
                  className="glass flex w-full items-center gap-4 px-5 py-4 text-left transition-transform duration-300 active:scale-[0.99]"
                  style={{ borderRadius: 'var(--radius-card)', transitionTimingFunction: 'var(--ease-calm)' }}
                >
                  <span className="glass grid place-items-center" style={{ width: 44, height: 44, borderRadius: 14 }}>
                    <Icon size={20} strokeWidth={1.4} color="var(--gold)" />
                  </span>
                  <span className="flex-1">
                    <span style={{ color: 'var(--ink)', fontSize: 'var(--t-md)', display: 'block' }}>{s.title}</span>
                    <span className="eyebrow" style={{ display: 'block', marginTop: 4 }}>
                      {s.kind} · {s.length}
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
