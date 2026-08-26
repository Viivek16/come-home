import { lazy, Suspense } from 'react';
import Button from '../../ui/Button';
import Reveal from '../../ui/Reveal';
import ExitButton from '../../ui/ExitButton';
import BodyGlow from '../BodyGlow';
import { flow } from '../../store/flow';
import type { FlowEntry } from '../../data/flows';

// three.js lives in its own chunk, fetched only when this screen opens — the
// initial bundle and every other screen are untouched. The SVG figure shows while
// it loads and if WebGL is unavailable.
const BodyMesh3D = lazy(() => import('../BodyMesh3D'));

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
          <Suspense fallback={<BodyGlow anchor={entry.anchor} size={220} />}>
            <BodyMesh3D anchor={entry.anchor} size={240} />
          </Suspense>
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
