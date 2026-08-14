import Mark from '../../ui/Mark';
import Button from '../../ui/Button';
import Reveal from '../../ui/Reveal';
import { session } from '../../store/session';

/** §6.1 Opening — the arrival. Staged reveal over the dawn scene. */
export default function Opening() {
  return (
    <div className="screen items-center justify-center text-center">
      <Reveal delay={0.05}>
        <Mark size={112} />
      </Reveal>
      <Reveal delay={0.25}>
        <h1 className="serif tracked" style={{ fontSize: 'var(--t-2xl)', marginTop: 24 }}>
          COME HOME
        </h1>
      </Reveal>
      <Reveal delay={0.45}>
        <p style={{ color: 'var(--ink-muted)', marginTop: 14, fontSize: 'var(--t-md)' }}>
          You don't have to be anywhere else.
        </p>
      </Reveal>
      <Reveal delay={0.6}>
        <p className="serif-italic" style={{ marginTop: 6, fontSize: 'var(--t-lg)' }}>
          Let's be here, right now.
        </p>
      </Reveal>
      <Reveal delay={0.85} style={{ marginTop: 40 }}>
        <Button onClick={() => session.go('arrival')}>Begin</Button>
      </Reveal>
    </div>
  );
}
