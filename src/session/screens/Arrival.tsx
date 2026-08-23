import Button from '../../ui/Button';
import Reveal from '../../ui/Reveal';
import CheckInSlider from '../../ui/CheckInSlider';
import { session, type Emotion } from '../../store/session';
import { saveLastArrival } from '../../lib/storage';
import { audioControls, SESSION_AUDIO } from '../../audio/audioStore';

/** §6.2 Arrival — meet the person where they are. A connected slider over the six
 *  felt-states (§Phase C). Ghost exit is always present. */
export default function Arrival({ onExit }: { onExit: () => void }) {
  // Begin (§task2): record the arrival if one was chosen, start the default track
  // on this tap (a user gesture — required by mobile autoplay policy), then open
  // the player. An untouched slider means no presumed feeling → null.
  const choose = (id: Emotion | null) => {
    if (id) saveLastArrival(id);
    audioControls.ensureLoaded(SESSION_AUDIO.musicTrack);
    void audioControls.play();
    session.beginMeditation(id);
  };

  return (
    <div className="screen">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
        <Reveal delay={0.05}>
          <h2 className="serif" style={{ fontSize: 'var(--t-xl)' }}>
            How are you arriving today?
          </h2>
          <p style={{ color: 'var(--ink-muted)', marginTop: 6, fontSize: 'var(--t-md)' }}>
            There's no right answer.
          </p>
        </Reveal>

        <Reveal delay={0.2} className="mt-9">
          <CheckInSlider onChoose={choose} />
        </Reveal>

        <Reveal delay={0.5} className="mt-9 flex justify-center">
          <Button variant="ghost" onClick={onExit}>
            I'm okay, just exploring
          </Button>
        </Reveal>
      </div>
    </div>
  );
}
