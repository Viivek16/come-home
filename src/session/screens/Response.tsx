import Mark from '../../ui/Mark';
import Button from '../../ui/Button';
import Reveal from '../../ui/Reveal';
import { session } from '../../store/session';
import { PATHS } from '../../data/paths';

/** §6.3 Response — "make this moment smaller". Recommended path is gold-lit glass. */
export default function Response({ onExit }: { onExit: () => void }) {
  return (
    <div className="screen">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10 text-center">
        <Reveal delay={0.05} className="flex justify-center">
          <Mark size={76} variant="heart" />
        </Reveal>
        <Reveal delay={0.22}>
          <h2 className="serif" style={{ fontSize: 'var(--t-xl)', marginTop: 18 }}>
            I'm here with you.
          </h2>
          <p style={{ color: 'var(--ink-muted)', marginTop: 6, marginBottom: 26, fontSize: 'var(--t-md)' }}>
            Let's make this moment smaller.
          </p>
        </Reveal>

        <div className="flex flex-col gap-3 text-left">
          {PATHS.map((p, i) => (
            <Reveal key={p.id} delay={0.36 + i * 0.08}>
              <button
                onClick={() => session.pickPath(p.id)}
                className={`glass ${p.recommended ? 'glass-strong glass-gold' : ''} w-full px-5 py-4 transition-transform duration-300 active:scale-[0.99]`}
                style={{ borderRadius: 'var(--radius-chip)', transitionTimingFunction: 'var(--ease-calm)' }}
              >
                <div style={{ color: 'var(--ink)', fontSize: 'var(--t-md)' }}>
                  {p.title} <span style={{ color: 'var(--ink-muted)' }}>· {p.duration}</span>
                </div>
                {p.note && (
                  <div className="eyebrow" style={{ color: 'var(--gold)', marginTop: 6 }}>
                    {p.note}
                  </div>
                )}
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.36 + PATHS.length * 0.08 + 0.1} className="mt-9 flex justify-center">
          <Button variant="ghost" onClick={onExit}>
            Not now
          </Button>
        </Reveal>
      </div>
    </div>
  );
}
