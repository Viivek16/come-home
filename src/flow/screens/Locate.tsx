import { lazy, Suspense, useEffect } from 'react';
import Button from '../../ui/Button';
import Reveal from '../../ui/Reveal';
import ExitButton from '../../ui/ExitButton';
import BodyGlow from '../BodyGlow';
import { useBreath } from '../../breath/useBreath';
import { requestWaterPause, releaseWaterPause } from '../../store/water';
import { flow } from '../../store/flow';
import type { BodyAnchor, FlowEntry } from '../../data/flows';

// three.js + the human GLB live in this screen's own lazy chunk — fetched only
// when the flow opens, so the initial bundle and every other screen are
// untouched. The SVG figure shows while it loads and if WebGL is unavailable.
const BodyMesh = lazy(() => import('../BodyMesh'));

// The figure's line colour. Flip to '#5FE3D8' for the cool cyan reference look.
const FIGURE_COLOR = '#E3C08D';

// Subscribes to the shared breath clock in isolation so only the figure
// re-renders each frame, not the whole screen. Passes the value into BodyMesh
// so the glow breathes on the same ~4s-in / 6s-out rhythm as the water and mark.
function BreathingFigure({ anchor }: { anchor: BodyAnchor }) {
  const breath = useBreath();
  const fallback = <BodyGlow anchor={anchor} size={220} />;
  return (
    <Suspense fallback={fallback}>
      {/* quadThresholdDeg=5 drops this mesh's triangle diagonals and leaves the
          clean quad grid (measured sweet spot for human.glb; 1 shows diagonals). */}
      <BodyMesh breath={breath} color={FIGURE_COLOR} quadThresholdDeg={5} size={260} fallback={fallback} />
    </Suspense>
  );
}

/**
 * Screen 2 — Locate and release (disease only; folded into Practice for feelings).
 * An interactive glowing wireframe human the user can rotate and zoom freely,
 * breathing on the shared clock, with the `locate` copy below. One action onward.
 */
export default function Locate({ entry }: { entry: FlowEntry }) {
  // Free the GPU for the interactive figure: pause the water shader while this
  // screen is mounted, restore it on exit.
  useEffect(() => {
    requestWaterPause();
    return () => releaseWaterPause();
  }, []);

  return (
    <div className="screen">
      <ExitButton />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
        <Reveal className="flex justify-center">
          <BreathingFigure anchor={entry.anchor} />
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
