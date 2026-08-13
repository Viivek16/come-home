import { session } from '../../store/session';
import Button from '../../ui/Button';

/** §6.5 Music continues. Voice done, ambient only. Waveform + transport wired in
 *  Phase 4; the calm copy is permanent. */
export default function MusicContinues() {
  return (
    <div className="screen items-center justify-center text-center">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <p className="serif" style={{ fontSize: 'var(--t-xl)' }}>
          Let the sound hold you.
        </p>
        <p className="serif-italic" style={{ fontSize: 'var(--t-lg)', color: 'var(--ink-muted)', marginTop: 6 }}>
          Let yourself be here.
        </p>
        <div className="mt-10">
          <Button onClick={() => session.go('checkin')}>Continue</Button>
        </div>
      </div>
    </div>
  );
}
