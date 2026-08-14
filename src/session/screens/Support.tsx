import { useEffect } from 'react';
import { session, useSessionState } from '../../store/session';
import { pathTitle } from '../../data/paths';
import { audioControls, SESSION_AUDIO } from '../../audio/audioStore';
import Transport from '../../audio/Transport';
import Reveal from '../../ui/Reveal';
import Button from '../../ui/Button';

const LINES = ['Feel your feet.', 'Feel this breath.', "You're safe here."];

/** §6.4 Support (player). Guided lines fade in over the dusk scene; transport below. */
export default function Support() {
  const { path } = useSessionState();

  useEffect(() => {
    audioControls.ensureLoaded(SESSION_AUDIO.musicTrack);
  }, []);

  return (
    <div className="screen">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <Reveal delay={0.05} className="pt-1">
          <div className="eyebrow">Guided · now</div>
          <div className="serif" style={{ fontSize: 'var(--t-xl)', marginTop: 2 }}>
            {pathTitle(path)}
          </div>
        </Reveal>

        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
          {LINES.map((l, i) => (
            <p
              key={l}
              className="guided-line serif-italic"
              style={{ fontSize: 'var(--t-lg)', animationDelay: `${0.5 + i * 1.6}s` }}
            >
              {l}
            </p>
          ))}
        </div>

        <Reveal delay={0.3}>
          <Transport />
          <p style={{ color: 'var(--ink-muted)', textAlign: 'center', fontSize: 'var(--t-sm)', marginTop: 16 }}>
            Music continues after voice.
          </p>
          <div className="mt-5 flex justify-center">
            <Button variant="ghost" onClick={() => session.go('music')}>
              Stay with the sound →
            </Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
