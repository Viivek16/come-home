import Button from '../../ui/Button';
import Reveal from '../../ui/Reveal';
import CheckInSlider from '../../ui/CheckInSlider';
import { session, type Emotion } from '../../store/session';
import { feelingLabel } from '../../data/feelings';
import { saveLastArrival } from '../../lib/storage';

/** §6.2 Arrival — meet the person where they are. A connected 5-state slider for
 *  the felt-states (§Phase C); the two situational options stay as gentle entries
 *  below so no state or crisis path is lost. Ghost exit is always present. */
const SITUATIONAL: Emotion[] = ['treatment', 'specific'];

export default function Arrival({ onExit }: { onExit: () => void }) {
  // Record the arrival locally (recommendation / reflection trail seam) and advance.
  const choose = (id: Emotion) => {
    saveLastArrival(id);
    session.pickEmotion(id);
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

        <Reveal delay={0.34} className="mt-10">
          <div className="eyebrow" style={{ textAlign: 'center', marginBottom: 10 }}>
            Or, if it's more specific
          </div>
          <div className="flex flex-col gap-2">
            {SITUATIONAL.map((id) => (
              <button
                key={id}
                onClick={() => choose(id)}
                className="glass px-5 py-3 text-left transition-transform duration-300 active:scale-[0.99]"
                style={{ borderRadius: 'var(--radius-chip)', color: 'var(--ink)', fontSize: 'var(--t-md)', transitionTimingFunction: 'var(--ease-calm)' }}
              >
                {feelingLabel(id)}
              </button>
            ))}
          </div>
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
