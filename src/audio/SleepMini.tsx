import { createPortal } from 'react-dom';
import { useAudio, audioControls } from './audioStore';
import { sleepTimer } from './sleepTimer';
import { useBreath } from '../breath/useBreath';
import { sleep, useSleepState } from '../store/sleep';
import { usePlayer } from '../store/player';

/**
 * Docked mini-bar for a minimized sleep loop (§task-sleep). Sibling of the session
 * MiniPlayer; shown whenever the sleep player is collapsed. Tapping re-expands it,
 * the play/pause toggles the loop, and × stops and dismisses. A session owning the
 * audio wins (single shared element), so it hides while a session is active.
 */
export default function SleepMini() {
  const { item, collapsed } = useSleepState();
  const { active } = usePlayer();
  const show = !!item && collapsed && !active;
  return createPortal(show ? <SleepBar /> : null, document.body);
}

function SleepBar() {
  const { playing, hasSource, error } = useAudio();
  const { item } = useSleepState();
  const b = useBreath();
  const unavailable = !hasSource || error;

  const close = () => {
    audioControls.stop();
    sleepTimer.cancel();
    sleep.dismiss();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${item?.title ?? 'Sleep sound'} — open player`}
      onClick={() => sleep.expand()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && sleep.expand()}
      className="glass glass-strong mini-in"
      style={{
        position: 'fixed',
        left: 16,
        right: 16,
        bottom: 'calc(var(--safe-bottom) + 92px)',
        zIndex: 51,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '9px 12px',
        borderRadius: 16,
        cursor: 'pointer',
      }}
    >
      <span
        aria-hidden
        style={{
          flexShrink: 0,
          width: 34,
          height: 34,
          borderRadius: 999,
          background: 'radial-gradient(circle at 50% 40%, rgba(232,201,155,0.9), var(--gold-deep))',
          opacity: 0.75 + b * 0.25,
          boxShadow: '0 0 14px rgba(232,201,155,0.3)',
          transition: 'opacity 120ms linear',
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="serif"
          style={{ fontSize: 'var(--t-md)', color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {item?.title}
        </div>
        <div className="eyebrow" style={{ marginTop: 1 }}>
          {playing ? 'Playing' : 'Paused'}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          audioControls.toggle();
        }}
        disabled={unavailable}
        aria-label={playing ? 'Pause' : 'Play'}
        className="grid place-items-center transition-transform duration-300 active:scale-[0.92]"
        style={{ width: 40, height: 40, borderRadius: 999, color: 'var(--gold)', opacity: unavailable ? 0.4 : 1, transitionTimingFunction: 'var(--ease-calm)' }}
      >
        {playing ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <rect x="6" y="5" width="4" height="14" rx="1.3" />
            <rect x="14" y="5" width="4" height="14" rx="1.3" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5Z" />
          </svg>
        )}
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          close();
        }}
        aria-label="Stop and close player"
        className="grid place-items-center transition-transform duration-300 active:scale-[0.92]"
        style={{ width: 40, height: 40, borderRadius: 999, color: 'var(--ink-muted)', transitionTimingFunction: 'var(--ease-calm)' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
