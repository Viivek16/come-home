import { useEffect } from 'react';
import Reveal from '../../ui/Reveal';
import GradientIcon, { type GradientIconName } from '../../ui/GradientIcon';
import { setMood } from '../../store/scene';
import { openSleep } from '../../store/sleep';
import { SLEEP_TYPES, sleepItemsOfType, type SleepType } from '../../data/sleep';

const TYPE_ICON: Record<SleepType, GradientIconName> = {
  soundscape: 'waves',
  'wind-down': 'wind',
  meditation: 'moon',
};

/** §6 Sleep & Rest (§Phase6/§Phase G) — data-driven, grouped by type, pinned to the
 *  night scene, with soft-gradient category icons. Cards are always visible; without
 *  a real asset they read "coming soon" (never a broken player). */
export default function SleepTab() {
  useEffect(() => {
    setMood('night'); // tie the whole surface to the Night band (§Phase G)
    return () => setMood(null);
  }, []);

  return (
    <div className="screen">
      <div className="mx-auto w-full max-w-md py-10">
        <Reveal delay={0.05}>
          <div className="flex items-center gap-3">
            <span className="glass grid place-items-center" style={{ width: 42, height: 42, borderRadius: 14 }}>
              <GradientIcon name="moon" size={22} />
            </span>
            <div>
              <div className="eyebrow">Sleep &amp; rest</div>
              <h1 className="serif" style={{ fontSize: 'var(--t-xl)', marginTop: 2, lineHeight: 1.1 }}>
                Let the night be soft.
              </h1>
            </div>
          </div>
        </Reveal>

        {SLEEP_TYPES.map((group, gi) => {
          const items = sleepItemsOfType(group.type);
          if (!items.length) return null;
          return (
            <div key={group.type} style={{ marginTop: gi === 0 ? 24 : 30 }}>
              <Reveal delay={0.12 + gi * 0.06}>
                <div className="flex items-center gap-2">
                  <GradientIcon name={TYPE_ICON[group.type]} size={16} />
                  <div className="eyebrow">{group.heading}</div>
                </div>
                <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)', marginTop: 4 }}>{group.blurb}</p>
              </Reveal>
              <div className="mt-3 flex flex-col gap-3">
                {items.map((s, i) => (
                  <Reveal key={s.id} delay={0.16 + gi * 0.06 + i * 0.05}>
                    <button
                      onClick={() => openSleep(s)}
                      className="glass flex w-full items-center gap-4 px-5 py-4 text-left transition-transform duration-300 active:scale-[0.99]"
                      style={{ borderRadius: 'var(--radius-card)', transitionTimingFunction: 'var(--ease-calm)' }}
                    >
                      <span className="glass grid shrink-0 place-items-center" style={{ width: 44, height: 44, borderRadius: 14 }}>
                        <GradientIcon name={TYPE_ICON[group.type]} size={20} />
                      </span>
                      <span className="flex-1">
                        <span style={{ color: 'var(--ink)', fontSize: 'var(--t-md)', display: 'block' }}>{s.title}</span>
                        <span className="eyebrow" style={{ display: 'block', marginTop: 4 }}>
                          {s.kind} · {s.length}
                        </span>
                      </span>
                      {!s.src && (
                        <span className="eyebrow shrink-0" style={{ color: 'var(--gold)' }}>
                          Coming soon
                        </span>
                      )}
                    </button>
                  </Reveal>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
