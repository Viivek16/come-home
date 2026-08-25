import Button from '../../ui/Button';
import Reveal from '../../ui/Reveal';
import ExitButton from '../../ui/ExitButton';
import RevealText from '../RevealText';
import { useBreath } from '../../breath/useBreath';
import { flow } from '../../store/flow';
import type { FlowEntry } from '../../data/flows';

/**
 * Screen 1 — Arrival (§Phase B, polished). Full-bleed calm: the affirmation
 * surfaces word by word out of a soft mist (RevealText), over a champagne halo
 * that breathes on the shared clock. One quiet action to continue. No questions.
 */
export default function Arrival({ entry }: { entry: FlowEntry }) {
  const b = useBreath();
  // Words finish arriving before the action fades in.
  const wordCount = entry.affirmation.split(' ').length;
  const buttonDelay = 0.15 + wordCount * 0.085 + 0.5;

  return (
    <div className="screen">
      <ExitButton />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
        <div className="relative flex flex-col items-center">
          {/* breathing halo behind the line — motion feels like breath, not busy */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              width: 360,
              height: 360,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(232,201,155,0.16), rgba(232,201,155,0.04) 45%, transparent 70%)',
              transform: `scale(${1 + b * 0.12})`,
              opacity: 0.4 + b * 0.4,
              pointerEvents: 'none',
            }}
          />
          <RevealText
            key={entry.id}
            text={entry.affirmation}
            className="serif"
            style={{ fontSize: 'var(--t-xl)', lineHeight: 1.35, position: 'relative' }}
          />
        </div>

        <Reveal delay={buttonDelay} className="mt-14">
          <Button onClick={() => flow.next()}>Begin</Button>
        </Reveal>
      </div>
    </div>
  );
}
