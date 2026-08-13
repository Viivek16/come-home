import Mark from '../../ui/Mark';
import Button from '../../ui/Button';
import { session } from '../../store/session';

/** §6.1 Opening — the arrival. Mark + wordmark + gold Begin. */
export default function Opening() {
  return (
    <div className="screen items-center justify-center text-center">
      <Mark size={108} />
      <h1 className="serif tracked" style={{ fontSize: 'var(--t-2xl)', marginTop: 22 }}>
        COME HOME
      </h1>
      <p style={{ color: 'var(--ink-muted)', marginTop: 14, fontSize: 'var(--t-md)' }}>
        You don't have to be anywhere else.
      </p>
      <p className="serif-italic" style={{ marginTop: 6, fontSize: 'var(--t-lg)' }}>
        Let's be here, right now.
      </p>
      <div style={{ marginTop: 38 }}>
        <Button onClick={() => session.go('arrival')}>Begin</Button>
      </div>
    </div>
  );
}
