import { useEffect } from 'react';
import { session, useSessionState } from '../../store/session';
import { pathTitle } from '../../data/paths';
import { audioControls, SESSION_AUDIO } from '../../audio/audioStore';
import Transport from '../../audio/Transport';
import Button from '../../ui/Button';

// Guided voice layer drops in later (§7); the music track carries the session now.
const LINES = ['Feel your feet.', 'Feel this breath.', "You're safe here."];

/** §6.4 Support (player). Guided lines fade in over the water; transport below. */
export default function Support() {
  const { path } = useSessionState();

  // Load once on entry (no autoplay — Android policy: playback starts on the
  // user's tap in Transport). Position is preserved into the Music screen.
  useEffect(() => {
    audioControls.ensureLoaded(SESSION_AUDIO.musicTrack);
  }, []);

  return (
    <div className="screen">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="pt-1">
          <div className="eyebrow">Session</div>
          <div className="serif" style={{ fontSize: 'var(--t-lg)' }}>
            {pathTitle(path)}
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
          {LINES.map((l, i) => (
            <p
              key={l}
              className="guided-line serif-italic"
              style={{ fontSize: 'var(--t-lg)', animationDelay: `${0.4 + i * 1.6}s` }}
            >
              {l}
            </p>
          ))}
        </div>

        <Transport />
        <p style={{ color: 'var(--ink-muted)', textAlign: 'center', fontSize: 'var(--t-sm)', marginTop: 14 }}>
          Music continues after voice.
        </p>
        <div className="mt-5 flex justify-center">
          <Button variant="ghost" onClick={() => session.go('music')}>
            Stay with the sound →
          </Button>
        </div>
      </div>
    </div>
  );
}
