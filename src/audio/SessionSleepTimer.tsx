import { useEffect, useState } from 'react';
import { Moon } from 'lucide-react';
import { sleepTimer, useSleepTimerMinutes } from './sleepTimer';

/**
 * Sleep-timer control for the session player (Phase A). A thin UI over the
 * sleepTimer singleton so the countdown survives collapsing to the mini bar.
 * Options fade the audio out gently then pause; "End" = play to the natural
 * close. Cancellable; shows the remaining time subtly.
 */
const OPTIONS = [5, 10, 15, 30] as const; // minutes; "End" (0) = play to the end

const fmt = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export default function SessionSleepTimer({ disabled = false }: { disabled?: boolean }) {
  const minutes = useSleepTimerMinutes();
  const active = minutes > 0;
  const [open, setOpen] = useState(false);
  const [, tick] = useState(0);

  // Re-render each second only while a timer is armed (drives the readout).
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [active]);

  const pick = (m: number) => {
    sleepTimer.set(m);
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
      {open && (
        <div
          className="glass"
          role="menu"
          aria-label="Sleep timer"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 12px)',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 6,
            padding: 8,
            borderRadius: 999,
            whiteSpace: 'nowrap',
            zIndex: 5,
          }}
        >
          {OPTIONS.map((m) => (
            <TimerChip key={m} label={`${m}m`} on={minutes === m} onClick={() => pick(m)} />
          ))}
          <TimerChip label="End" on={minutes === 0} onClick={() => pick(0)} />
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        disabled={disabled}
        aria-label={active ? `Sleep timer, ${fmt(sleepTimer.remaining())} remaining` : 'Sleep timer'}
        aria-expanded={open}
        className="grid place-items-center transition-transform duration-300 active:scale-[0.92]"
        style={{
          width: 44,
          height: 44,
          borderRadius: 999,
          color: active ? 'var(--gold)' : 'var(--ink-muted)',
          opacity: disabled ? 0.4 : 1,
          transitionTimingFunction: 'var(--ease-calm)',
        }}
      >
        <Moon size={20} strokeWidth={1.6} fill={active ? 'var(--gold)' : 'none'} />
      </button>

      {active && (
        <span
          className="eyebrow"
          aria-hidden
          style={{ position: 'absolute', top: '100%', marginTop: 2, color: 'var(--gold)', fontSize: 9 }}
        >
          {fmt(sleepTimer.remaining())}
        </span>
      )}
    </div>
  );
}

function TimerChip({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="menuitemradio"
      aria-checked={on}
      className="transition-transform duration-300 active:scale-[0.95]"
      style={{
        padding: '6px 12px',
        borderRadius: 999,
        fontSize: 'var(--t-sm)',
        color: on ? 'var(--gold)' : 'var(--ink-muted)',
        background: on ? 'rgba(232,201,155,0.14)' : 'transparent',
        border: `1px solid ${on ? 'rgba(232,201,155,0.4)' : 'var(--hairline)'}`,
        transitionTimingFunction: 'var(--ease-calm)',
      }}
    >
      {label}
    </button>
  );
}
