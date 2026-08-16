import { useEffect, useState } from 'react';
import Reveal from '../ui/Reveal';
import ExitButton from '../ui/ExitButton';
import Transport from '../audio/Transport';
import { nav } from '../nav/history';
import { setMood } from '../store/scene';
import { setDepth } from '../store/water';
import { audioControls } from '../audio/audioStore';
import { player } from '../store/player';
import { useSleepItem } from '../store/sleep';

const SLEEP_TIMERS = [0, 15, 30, 45]; // minutes; 0 = off

/**
 * Full-screen sleep player (§Phase6). Reuses the shared Transport, so a null-src
 * item shows the calm "coming soon" state and a real src plays with no code
 * change (soundscapes loop). Dark + minimal, with an optional fade-out timer.
 */
export default function SleepPlayer() {
  const item = useSleepItem();
  const [timerMin, setTimerMin] = useState(0);

  useEffect(() => {
    setMood('night');
    setDepth('checkin');
    return () => {
      setMood(null);
      audioControls.stop(); // leaving the sleep player always silences it
    };
  }, []);

  // Load this item's source (soundscapes loop). A null src → Transport shows
  // "coming soon"; a real src later just plays. No code change needed.
  // The sleep player takes over the single shared audio element, so end any
  // collapsed session player first (ponytail: single-audio design → one owner).
  useEffect(() => {
    if (!item) return;
    player.end();
    audioControls.ensureLoaded(item.src, { loop: item.type === 'soundscape' });
  }, [item]);

  // Optional sleep timer — gently fade the audio out near the end.
  useEffect(() => {
    if (!timerMin) return;
    const fadeSecs = 8;
    const delay = Math.max(0, timerMin * 60 - fadeSecs) * 1000;
    const id = setTimeout(() => audioControls.fadeOutStop(fadeSecs), delay);
    return () => clearTimeout(id);
  }, [timerMin]);

  if (!item) {
    return (
      <div className="screen">
        <ExitButton onExit={() => nav.back()} />
      </div>
    );
  }

  return (
    <div className="screen items-center">
      <ExitButton onExit={() => nav.back()} />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
        <Reveal delay={0.05}>
          <div className="eyebrow">{item.kind}</div>
          <h1 className="serif" style={{ fontSize: 'var(--t-xl)', marginTop: 6 }}>
            {item.title}
          </h1>
        </Reveal>

        <Reveal delay={0.3} className="mt-10 w-full">
          <Transport />
        </Reveal>

        <Reveal delay={0.5} className="mt-10">
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Sleep timer
          </div>
          <div className="flex justify-center gap-2">
            {SLEEP_TIMERS.map((m) => {
              const on = timerMin === m;
              return (
                <button
                  key={m}
                  onClick={() => setTimerMin(m)}
                  aria-pressed={on}
                  className="transition-transform duration-300 active:scale-[0.96]"
                  style={{
                    padding: '8px 16px',
                    borderRadius: 999,
                    fontSize: 'var(--t-sm)',
                    color: on ? 'var(--gold)' : 'var(--ink-muted)',
                    background: on ? 'rgba(232,201,155,0.14)' : 'transparent',
                    border: `1px solid ${on ? 'rgba(232,201,155,0.4)' : 'var(--hairline)'}`,
                    transitionTimingFunction: 'var(--ease-calm)',
                  }}
                >
                  {m === 0 ? 'Off' : `${m}m`}
                </button>
              );
            })}
          </div>
          {timerMin > 0 && (
            <p className="serif-italic" style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)', marginTop: 12 }}>
              The sound will fade softly after {timerMin} minutes.
            </p>
          )}
        </Reveal>
      </div>
    </div>
  );
}
