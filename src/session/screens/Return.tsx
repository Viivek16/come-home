import Button from '../../ui/Button';
import Reveal from '../../ui/Reveal';
import ReflectionPrompt from '../../ui/ReflectionPrompt';

/** §6.7 Return — the soft landing. */
export default function Return({ onExit }: { onExit: () => void }) {
  return (
    <div className="screen items-center justify-center text-center">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <Reveal delay={0.1}>
          <h2 className="serif" style={{ fontSize: 'var(--t-2xl)' }}>
            You came home to yourself.
          </h2>
        </Reveal>
        <Reveal delay={0.35}>
          <p className="serif" style={{ color: 'var(--gold)', marginTop: 10, fontSize: 'var(--t-lg)' }}>
            That matters.
          </p>
        </Reveal>
        <Reveal delay={0.55}>
          <p style={{ color: 'var(--ink-muted)', marginTop: 12, fontSize: 'var(--t-md)' }}>
            Take what you need into the rest of your day.
          </p>
        </Reveal>
        <Reveal delay={0.7} className="mt-9 w-full">
          <ReflectionPrompt />
        </Reveal>
        <Reveal delay={0.95} className="mt-8">
          <Button onClick={onExit}>Return Home</Button>
        </Reveal>
      </div>
    </div>
  );
}
