import { useEffect } from 'react';
import { ChevronDown, Check, AudioLines } from 'lucide-react';
import { session, useSessionState } from '../../store/session';
import { PATHS, pathTitle } from '../../data/paths';
import { audioControls, SESSION_AUDIO } from '../../audio/audioStore';
import { player } from '../../store/player';
import { nav } from '../../nav/history';
import Transport from '../../audio/Transport';
import BreathRing from '../../audio/BreathRing';
import SessionSleepTimer from '../../audio/SessionSleepTimer';
import HeartButton from '../../ui/HeartButton';
import Reveal from '../../ui/Reveal';

/**
 * §6.5 — the premium session player (Phase A). Full-screen, cover-forward but
 * calm: the live water breathes behind it, the breath-ring is the hero (tap to
 * play/pause), and gold marks only the active thing. The top-left control
 * collapses to the docked mini bar WITHOUT stopping audio (§ always an exit).
 */
export default function MusicContinues() {
  const { path } = useSessionState();
  const meta = PATHS.find((p) => p.id === path);
  const title = meta?.title ?? pathTitle(path);
  const tag = `Guided · ${meta?.duration ?? 'session'}`;

  useEffect(() => {
    audioControls.ensureLoaded(SESSION_AUDIO.musicTrack);
    player.begin();
  }, []);

  // Minimise → mini bar; audio keeps playing (nav skips the stop while collapsed).
  const collapse = () => {
    player.collapse();
    nav.back();
  };
  // Complete → the gentle close (how do you feel now?). No streak, no score.
  const complete = () => {
    player.end();
    session.go('checkin');
  };

  return (
    <div className="screen">
      {/* Top bar: collapse (left) + title/tag. Player owns its chrome here, so the
          generic top-right exit is hidden for this step (see SessionFlow). */}
      <div className="flex items-center" style={{ gap: 12, minHeight: 44 }}>
        <button
          onClick={collapse}
          aria-label="Minimize player"
          className="glass grid place-items-center transition-transform duration-300 active:scale-[0.94]"
          style={{ width: 44, height: 44, borderRadius: 999, color: 'var(--ink-muted)', transitionTimingFunction: 'var(--ease-calm)' }}
        >
          <ChevronDown size={20} strokeWidth={1.6} />
        </button>
        <div style={{ flex: 1, textAlign: 'center', paddingRight: 44 }}>
          <div className="serif" style={{ fontSize: 'var(--t-lg)', color: 'var(--ink)', lineHeight: 1.1 }}>
            {title}
          </div>
          <div className="eyebrow" style={{ marginTop: 3 }}>
            {tag}
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center">
        <Reveal delay={0.05} className="flex justify-center">
          <BreathRing />
        </Reveal>

        <Reveal delay={0.28} className="mt-10 w-full">
          <Transport skip={15} remaining />
        </Reveal>

        <Reveal delay={0.44} className="mt-9">
          <div className="flex items-center justify-center" style={{ gap: 22 }}>
            <HeartButton favKey={`path:${path ?? 'session'}`} label="this session" />
            <SessionSleepTimer />
            <AmbientToggle />
            <button
              onClick={complete}
              aria-label="Complete session"
              className="grid place-items-center transition-transform duration-300 active:scale-[0.92]"
              style={{ width: 44, height: 44, borderRadius: 999, color: 'var(--ink-muted)', transitionTimingFunction: 'var(--ease-calm)' }}
            >
              <Check size={20} strokeWidth={1.6} />
            </button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/** Ambient bed toggle — wired-but-inert until a distinct ambient asset exists
 *  (§3 stubbed). Visible so the player's shape is final; disabled with a quiet
 *  "soon" so it never pretends to work. */
function AmbientToggle() {
  return (
    <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
      <button
        disabled
        aria-label="Ambient sound (coming soon)"
        aria-disabled
        className="grid place-items-center"
        style={{ width: 44, height: 44, borderRadius: 999, color: 'var(--ink-muted)', opacity: 0.4, cursor: 'default' }}
      >
        <AudioLines size={20} strokeWidth={1.6} />
      </button>
      <span className="eyebrow" aria-hidden style={{ position: 'absolute', top: '100%', marginTop: 2, fontSize: 9 }}>
        soon
      </span>
    </div>
  );
}
