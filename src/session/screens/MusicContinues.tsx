import { useEffect } from 'react';
import { session } from '../../store/session';
import { audioControls, SESSION_AUDIO } from '../../audio/audioStore';
import Transport from '../../audio/Transport';
import BreathWave from '../../audio/BreathWave';
import Button from '../../ui/Button';

/** §6.5 Music continues. Voice done, ambient only. The audio keeps playing from
 *  the Support screen (same element). Waveform reacts to the breath clock. */
export default function MusicContinues() {
  useEffect(() => {
    audioControls.ensureLoaded(SESSION_AUDIO.musicTrack); // no-op if already loaded
  }, []);

  return (
    <div className="screen">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
        <p className="serif" style={{ fontSize: 'var(--t-xl)' }}>
          Let the sound hold you.
        </p>
        <p className="serif-italic" style={{ fontSize: 'var(--t-lg)', color: 'var(--ink-muted)', marginTop: 6 }}>
          Let yourself be here.
        </p>

        <div className="my-10 w-full">
          <BreathWave />
        </div>

        <div className="w-full">
          <Transport />
        </div>

        <div className="mt-10">
          <Button onClick={() => session.go('checkin')}>Continue</Button>
        </div>
      </div>
    </div>
  );
}
