import { session } from '../../store/session';
import { app } from '../../store/app';
import { SLEEP_ITEMS } from '../../data/sleep';

/** §6 Sleep & Rest. Placeholder list; tapping opens the player. */
export default function SleepTab() {
  const openPlayer = () => {
    session.reset();
    session.pickPath('more-15'); // jump straight to the player (§7 music track)
    app.setView('session');
  };

  return (
    <div className="screen">
      <div className="mx-auto w-full max-w-md py-10">
        <div className="eyebrow">Sleep &amp; rest</div>
        <h1 className="serif" style={{ fontSize: 'var(--t-xl)', marginTop: 8, marginBottom: 20 }}>
          Let the night be soft.
        </h1>
        <div className="flex flex-col gap-3">
          {SLEEP_ITEMS.map((s) => (
            <button
              key={s.id}
              onClick={openPlayer}
              className="glass flex items-center justify-between px-5 py-4 text-left"
              style={{ borderRadius: 'var(--radius-card)' }}
            >
              <span>
                <span style={{ color: 'var(--ink)', fontSize: 'var(--t-md)' }}>{s.title}</span>
                <span className="eyebrow" style={{ display: 'block', marginTop: 4 }}>
                  {s.kind} · {s.length}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
