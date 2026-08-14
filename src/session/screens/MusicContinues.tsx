import { useEffect } from 'react';
import { session } from '../../store/session';
import { audioControls, SESSION_AUDIO } from '../../audio/audioStore';
import Transport from '../../audio/Transport';
import BreathWave from '../../audio/BreathWave';
import Reveal from '../../ui/Reveal';
import Button from '../../ui/Button';

/** §6.5 Music continues — the cinematic ambient moment. */
export default function MusicContinues() {
  useEffect(() => {
    audioControls.ensureLoaded(SESSION_AUDIO.musicTrack);
  }, []);

  return (
    <div className="screen">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
        <Reveal delay={0.05}>
          <div className="eyebrow">Ambient</div>
          <p className="serif" style={{ fontSize: 'var(--t-2xl)', marginTop: 6 }}>
            Let the sound hold you.
          </p>
          <p className="serif-italic" style={{ fontSize: 'var(--t-lg)', color: 'var(--ink-muted)', marginTop: 6 }}>
            Let yourself be here.
          </p>
        </Reveal>

        <Reveal delay={0.25} className="my-9 w-full">
          <BreathWave />
        </Reveal>

        <Reveal delay={0.4} className="w-full">
          <Transport bigTime />
        </Reveal>

        <Reveal delay={0.6} className="mt-9">
          <Button onClick={() => session.go('checkin')}>Continue</Button>
        </Reveal>
      </div>
    </div>
  );
}
