import Button from '../../ui/Button';

/** §6.7 Return — the soft landing. */
export default function Return({ onExit }: { onExit: () => void }) {
  return (
    <div className="screen items-center justify-center text-center">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <h2 className="serif" style={{ fontSize: 'var(--t-2xl)' }}>
          You came home to yourself.
        </h2>
        <p style={{ color: 'var(--gold)', marginTop: 10, fontSize: 'var(--t-lg)' }} className="serif">
          That matters.
        </p>
        <p style={{ color: 'var(--ink-muted)', marginTop: 12, fontSize: 'var(--t-md)' }}>
          Take what you need into the rest of your day.
        </p>
        <div className="mt-10">
          <Button onClick={onExit}>Return Home</Button>
        </div>
      </div>
    </div>
  );
}
