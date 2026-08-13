import Chip from '../../ui/Chip';
import Button from '../../ui/Button';
import { session } from '../../store/session';
import { FEELINGS } from '../../data/feelings';

/** §6.2 Arrival — meet the person where they are. Selecting a chip carries the
 *  emotion into the session. Ghost exit is always present (§2). */
export default function Arrival({ onExit }: { onExit: () => void }) {
  return (
    <div className="screen">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
        <h2 className="serif" style={{ fontSize: 'var(--t-xl)' }}>
          How are you arriving today?
        </h2>
        <p style={{ color: 'var(--ink-muted)', marginTop: 6, marginBottom: 22, fontSize: 'var(--t-md)' }}>
          There's no right answer.
        </p>
        <div className="flex flex-col gap-3">
          {FEELINGS.map((f) => (
            <Chip key={f.id} onClick={() => session.pickEmotion(f.id)}>
              {f.label}
            </Chip>
          ))}
        </div>
        <div className="mt-9 flex justify-center">
          <Button variant="ghost" onClick={onExit}>
            I'm okay, just exploring
          </Button>
        </div>
      </div>
    </div>
  );
}
