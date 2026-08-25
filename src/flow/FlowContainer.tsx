import ExitButton from '../ui/ExitButton';
import { useFlow } from '../store/flow';
import { getFlowById } from '../data/flows';

/**
 * Companion-flow container (§Phase A) — a minimal placeholder that proves the
 * wiring: it reads the current flow entry and shows its title + affirmation, with
 * the always-visible exit. The real 4-screen (disease) / 3-screen (feeling)
 * experience is Phase B; this is intentionally unstyled beyond the base tokens.
 */
export default function FlowContainer() {
  const { id } = useFlow();
  const entry = id ? getFlowById(id) : null;

  return (
    <div className="screen">
      <ExitButton />
      {entry && (
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <div className="eyebrow">{entry.title}</div>
          <p className="serif" style={{ fontSize: 'var(--t-lg)', lineHeight: 1.3, marginTop: 12 }}>
            {entry.affirmation}
          </p>
        </div>
      )}
    </div>
  );
}
