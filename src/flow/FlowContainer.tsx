import ExitButton from '../ui/ExitButton';
import { useFlow } from '../store/flow';
import { getFlowById } from '../data/flows';
import Arrival from './screens/Arrival';
import Locate from './screens/Locate';
import Practice from './screens/Practice';
import Close from './screens/Close';

/**
 * Companion-flow container (§Phase B). Drives the screen set from the entry's kind:
 * a disease flow runs 4 screens (arrival → locate → practice → close), a feeling
 * flow runs 3 (the locate step folds into the practice, keeping it lighter). The
 * step index lives in the flow store; each screen advances with flow.next().
 */
const STEPS = {
  disease: ['arrival', 'locate', 'practice', 'close'],
  feeling: ['arrival', 'practice', 'close'],
} as const;

export default function FlowContainer() {
  const { id, step } = useFlow();
  const entry = id ? getFlowById(id) : null;

  if (!entry) {
    return (
      <div className="screen">
        <ExitButton />
      </div>
    );
  }

  const screens = STEPS[entry.kind];
  const screen = screens[Math.min(step, screens.length - 1)];

  switch (screen) {
    case 'arrival':
      return <Arrival entry={entry} />;
    case 'locate':
      return <Locate entry={entry} />;
    case 'practice':
      return <Practice entry={entry} />;
    case 'close':
      return <Close entry={entry} />;
  }
}
