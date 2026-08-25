import Button from '../../ui/Button';
import Reveal from '../../ui/Reveal';
import ExitButton from '../../ui/ExitButton';
import BodyGlow from '../BodyGlow';
import { flow } from '../../store/flow';
import type { FlowEntry } from '../../data/flows';

/**
 * Screen 2 — Locate and release (disease only; folded into Practice for feelings).
 * The luminous figure with a champagne glow at the entry's anchor, breathing on
 * the shared clock, and the `locate` copy below. One action onward to the practice.
 */
export default function Locate({ entry }: { entry: FlowEntry }) {
  return (
    <div className="screen">
      <ExitButton />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
        <Reveal className="flex justify-center">
          <BodyGlow anchor={entry.anchor} size={220} />
        </Reveal>

        <Reveal delay={0.35}>
          <p style={{ color: 'var(--ink)', fontSize: 'var(--t-md)', lineHeight: 1.6, marginTop: 22 }}>
            {entry.locate}
          </p>
        </Reveal>

        <Reveal delay={0.7} className="mt-10">
          <Button onClick={() => flow.next()}>Continue</Button>
        </Reveal>
      </div>
    </div>
  );
}
