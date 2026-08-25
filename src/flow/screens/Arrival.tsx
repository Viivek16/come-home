import Button from '../../ui/Button';
import Reveal from '../../ui/Reveal';
import ExitButton from '../../ui/ExitButton';
import { useBreath } from '../../breath/useBreath';
import { flow } from '../../store/flow';
import type { FlowEntry } from '../../data/flows';

/**
 * Screen 1 — Arrival (§Phase B). Full-bleed calm: the affirmation as one large
 * serif line, centred, fading in slowly. A soft halo breathes on the shared clock
 * behind it. One action to continue. No intake, no questions.
 */
export default function Arrival({ entry }: { entry: FlowEntry }) {
  const b = useBreath();

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
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(232,201,155,0.14), transparent 68%)',
              transform: `scale(${1 + b * 0.12})`,
              opacity: 0.45 + b * 0.4,
              pointerEvents: 'none',
            }}
          />
          <Reveal style={{ animationDuration: '1.8s' }}>
            <p className="serif" style={{ fontSize: 'var(--t-xl)', lineHeight: 1.3, position: 'relative' }}>
              {entry.affirmation}
            </p>
          </Reveal>
        </div>

        <Reveal delay={1.1} className="mt-12">
          <Button onClick={() => flow.next()}>Begin</Button>
        </Reveal>
      </div>
    </div>
  );
}
