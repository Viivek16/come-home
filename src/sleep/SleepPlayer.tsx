import { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import Reveal from '../ui/Reveal';
import ExitButton from '../ui/ExitButton';
import Transport from '../audio/Transport';
import { nav } from '../nav/history';
import { setMood } from '../store/scene';
import { setDepth } from '../store/water';
import { audioControls, useAudio } from '../audio/audioStore';
import { player } from '../store/player';
import { sleep, useSleepItem } from '../store/sleep';
import { sleepTimer, useSleepTimerMinutes } from '../audio/sleepTimer';

const SLEEP_TIMERS = [0, 15, 30, 45]; // minutes; 0 = off (loop until paused)

/**
 * Full-screen sleep player (§Phase6). Every sleep track LOOPS by default and plays
 * on until the user pauses it or a timer fades it out (§task-sleep) — so there is
 * no track slider, just play/pause. It can be minimized to a docked mini bar so the
 * sound keeps playing while the user moves around the app.
 */
export default function SleepPlayer() {
  const item = useSleepItem();
  const timerMin = useSleepTimerMinutes();

  useEffect(() => {
    setMood('night');
    setDepth('checkin');
    return () => {
      setMood(null);
      // A real exit silences; a minimize keeps the loop playing under the mini bar.
      if (!sleep.collapsed) {
        audioControls.stop();
        sleepTimer.cancel();
      }
    };
  }, []);

  // Load this item's source, always looping. The sleep player takes over the single
  // shared audio element, so end any collapsed session player first.
  const { ready } = useAudio();
  const autoplayedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!item) return;
    player.end();
    autoplayedFor.current = null; // arm autoplay for this item
    audioControls.ensureLoaded(item.src, { loop: true });
  }, [item]);

  // Start playing once the track is ready. Best-effort: a blocked autoplay stays
  // paused with the play control right there. Fires once per opened item.
  useEffect(() => {
    if (item?.src && ready && autoplayedFor.current !== item.id) {
      autoplayedFor.current = item.id;
      void audioControls.play();
    }
  }, [ready, item]);

  const minimize = () => {
    sleep.collapse();
    nav.back();
  };

  if (!item) {
    return (
      <div className="screen">
        <ExitButton onExit={() => nav.back()} />
      </div>
    );
  }

  return (
    <div className="screen items-center">
      {/* Minimize (left) keeps the sound playing; close (right) stops and leaves. */}
      <button
        onClick={minimize}
        aria-label="Minimize player"
        className="glass grid place-items-center transition-transform duration-200 active:scale-[0.96]"
        style={{
          position: 'fixed',
          top: 'calc(var(--safe-top) + 10px)',
          left: 'calc(env(safe-area-inset-left, 0px) + 14px)',
          zIndex: 15,
          width: 44,
          height: 44,
          borderRadius: 999,
          color: 'var(--ink-muted)',
          transitionTimingFunction: 'var(--ease-calm)',
        }}
      >
        <ChevronDown size={20} strokeWidth={1.6} />
      </button>
      <ExitButton onExit={() => nav.back()} />

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
        <Reveal delay={0.05}>
          <div className="eyebrow">{item.kind}</div>
          <h1 className="serif" style={{ fontSize: 'var(--t-xl)', marginTop: 6 }}>
            {item.title}
          </h1>
        </Reveal>

        <Reveal delay={0.3} className="mt-10 w-full">
          <Transport playOnly />
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
                  onClick={() => sleepTimer.set(m)}
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
