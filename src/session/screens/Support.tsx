import { session, useSessionState } from '../../store/session';
import { pathTitle } from '../../data/paths';
import Button from '../../ui/Button';

// Phase 3 stub: header + guided lines + caption are permanent; the audio transport
// (play/pause, ±10s, progress) is wired in Phase 4 (§7).
const LINES = ['Feel your feet.', 'Feel this breath.', "You're safe here."];

/** §6.4 Support (player). Guided lines fade in over the water. */
export default function Support() {
  const { path } = useSessionState();
  return (
    <div className="screen">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <header className="pt-1">
          <div className="eyebrow">Session</div>
          <div className="serif" style={{ fontSize: 'var(--t-lg)' }}>
            {pathTitle(path)}
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          {LINES.map((l, i) => (
            <p
              key={l}
              className="guided-line serif-italic"
              style={{ fontSize: 'var(--t-lg)', animationDelay: `${0.4 + i * 1.6}s` }}
            >
              {l}
            </p>
          ))}
        </div>

        <p style={{ color: 'var(--ink-muted)', textAlign: 'center', fontSize: 'var(--t-sm)' }}>
          Music continues after voice.
        </p>
        <div className="mt-6 flex justify-center">
          <Button onClick={() => session.go('music')}>Continue</Button>
        </div>
      </div>
    </div>
  );
}
