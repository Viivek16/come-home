import Mark from '../../ui/Mark';
import Button from '../../ui/Button';
import { session } from '../../store/session';
import { PATHS } from '../../data/paths';

/** §6.3 Response — "make this moment smaller". One recommended path (gold) + two
 *  alternates. Ghost "Not now" exit (§2). */
export default function Response({ onExit }: { onExit: () => void }) {
  return (
    <div className="screen">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10 text-center">
        <div className="flex justify-center">
          <Mark size={72} variant="heart" />
        </div>
        <h2 className="serif" style={{ fontSize: 'var(--t-xl)', marginTop: 18 }}>
          I'm here with you.
        </h2>
        <p style={{ color: 'var(--ink-muted)', marginTop: 6, marginBottom: 26, fontSize: 'var(--t-md)' }}>
          Let's make this moment smaller.
        </p>

        <div className="flex flex-col gap-3 text-left">
          {PATHS.map((p) => (
            <button
              key={p.id}
              onClick={() => session.pickPath(p.id)}
              className="glass w-full px-5 py-4 transition-[border-color,background-color,transform] duration-300 active:scale-[0.99]"
              style={{
                borderRadius: 'var(--radius-chip)',
                transitionTimingFunction: 'var(--ease-calm)',
                borderColor: p.recommended ? 'var(--gold)' : 'var(--hairline)',
                background: p.recommended ? 'var(--surface-strong)' : 'var(--surface)',
              }}
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
          ))}
        </div>

        <div className="mt-9 flex justify-center">
          <Button variant="ghost" onClick={onExit}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
