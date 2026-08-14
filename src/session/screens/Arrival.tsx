import Chip from '../../ui/Chip';
import Button from '../../ui/Button';
import Reveal from '../../ui/Reveal';
import { session } from '../../store/session';
import { FEELINGS } from '../../data/feelings';

/** §6.2 Arrival — meet the person where they are. Staggered chips. Ghost exit. */
export default function Arrival({ onExit }: { onExit: () => void }) {
  return (
    <div className="screen">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
        <Reveal delay={0.05}>
          <h2 className="serif" style={{ fontSize: 'var(--t-xl)' }}>
            How are you arriving today?
          </h2>
          <p style={{ color: 'var(--ink-muted)', marginTop: 6, marginBottom: 22, fontSize: 'var(--t-md)' }}>
            There's no right answer.
          </p>
        </Reveal>
        <div className="flex flex-col gap-3">
          {FEELINGS.map((f, i) => (
            <Reveal key={f.id} delay={0.14 + i * 0.06}>
              <Chip onClick={() => session.pickEmotion(f.id)}>{f.label}</Chip>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.14 + FEELINGS.length * 0.06 + 0.1} className="mt-9 flex justify-center">
          <Button variant="ghost" onClick={onExit}>
            I'm okay, just exploring
          </Button>
        </Reveal>
      </div>
    </div>
  );
}
