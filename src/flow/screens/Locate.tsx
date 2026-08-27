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

// Which part of the body the figure lights for each disease, and its quiet label.
// Voice rule (data/flows.ts): companionship, never causation — labels name where
// we rest attention, they never diagnose. 'flow' runs the travelling light.
const REGION: Record<string, { region: string; label: string }> = {
  cancer: { region: 'flow', label: 'Whole body' },
  dialysis: { region: 'kidneys', label: 'Lower back' },
  digestion: { region: 'belly', label: 'The belly' },
  breathing: { region: 'lungs', label: 'Chest · lungs' },
  skin: { region: 'aura', label: 'Whole body' },
  sexual: { region: 'pelvis', label: 'Low body' },
  joint: { region: 'joints', label: 'The joints' },
  psychological: { region: 'brain', label: 'The mind' },
};
const DEFAULT_REGION = { region: 'flow', label: 'Whole body' };

// Subscribes to the shared breath clock in isolation so only the figure
// re-renders each frame. Passes the value into BodyMesh so the glow breathes on
// the same ~4s-in / 6s-out rhythm as the water and mark.
function BreathingFigure({ anchor, region }: { anchor: BodyAnchor; region: string }) {
  const breath = useBreath();
  const fallback = <BodyGlow anchor={anchor} size={220} />;
  return (
    <div style={{ width: 260, height: 338, display: 'grid', placeItems: 'center' }}>
      <Suspense fallback={fallback}>
        <BodyMesh breath={breath} color={FIGURE_COLOR} quadThresholdDeg={5} region={region} fallback={fallback} />
      </Suspense>
    </div>
  );
}

/**
 * Screen 2 — Locate and release (disease only; folded into Practice for feelings).
 * An interactive glowing wireframe human the user can rotate and zoom freely. The
 * figure lights the body area the entry speaks to (or runs the travelling light
 * for whole-body entries), breathing on the shared clock, with the `locate` copy.
 */
export default function Locate({ entry }: { entry: FlowEntry }) {
  const mapped = REGION[entry.id] ?? DEFAULT_REGION;

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
          <BreathingFigure anchor={entry.anchor} region={mapped.region} />
        </Reveal>

        <Reveal delay={0.3}>
          <p style={{ color: 'var(--accent, #E3C08D)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.75, marginTop: 6 }}>
            {mapped.label}
          </p>
        </Reveal>

        <Reveal delay={0.45}>
          <p style={{ color: 'var(--ink)', fontSize: 'var(--t-md)', lineHeight: 1.6, marginTop: 10 }}>
            {entry.locate}
          </p>
        </Reveal>

        <Reveal delay={0.75} className="mt-10">
          <Button onClick={() => flow.next()}>Continue</Button>
        </Reveal>
      </div>
    </div>
  );
}
