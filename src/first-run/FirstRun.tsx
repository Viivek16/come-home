import { useEffect, useState } from 'react';
import Mark from '../ui/Mark';
import Button from '../ui/Button';
import { app } from '../store/app';
import { session } from '../store/session';
import { prefsStore, usePrefs } from '../store/prefs';
import { markFirstRunDone } from '../lib/storage';

/**
 * First run (§6). Once, then skipped. Splash → welcome cards → into the session.
 * Local-only: no account, no paywall. "Sign in later" is a ghost link (§0).
 */
export default function FirstRun() {
  const [stage, setStage] = useState<'splash' | 'welcome'>('splash');

  // Splash: breathing mark on full water ~1.2s, then advance. Tap skips.
  useEffect(() => {
    if (stage !== 'splash') return;
    const t = setTimeout(() => setStage('welcome'), 1200);
    return () => clearTimeout(t);
  }, [stage]);

  if (stage === 'splash') {
    return (
      <button
        onClick={() => setStage('welcome')}
        aria-label="Continue"
        className="screen items-center justify-center"
        style={{ width: '100%' }}
      >
        <Mark size={120} />
      </button>
    );
  }
  return <Welcome />;
}

function Welcome() {
  const prefs = usePrefs();
  const [card, setCard] = useState(0);
  const [name, setName] = useState(prefs.name);

  const complete = () => {
    prefsStore.setName(name.trim());
    markFirstRunDone();
    session.reset();
    app.setView('session');
  };

  return (
    <div className="screen">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="glass" style={{ padding: 26, minHeight: 232 }}>
          {card === 0 && (
            <p className="serif" style={{ fontSize: 'var(--t-xl)' }}>
              You don't have to be anywhere else.
            </p>
          )}
          {card === 1 && (
            <>
              <p className="serif" style={{ fontSize: 'var(--t-xl)' }}>
                Private, always.
              </p>
              <p style={{ color: 'var(--ink-muted)', marginTop: 10, fontSize: 'var(--t-md)' }}>
                What you share stays on your device.
              </p>
            </>
          )}
          {card === 2 && (
            <>
              <label htmlFor="name" className="serif" style={{ fontSize: 'var(--t-xl)', display: 'block' }}>
                What should we call you?
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Optional"
                autoComplete="off"
                className="glass mt-5 w-full px-4 py-3"
                style={{ borderRadius: 'var(--radius-chip)', color: 'var(--ink)', fontSize: 'var(--t-md)' }}
              />
            </>
          )}
        </div>

        {/* progress dots */}
        <div className="mt-6 flex justify-center gap-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: i === card ? 'var(--gold)' : 'var(--hairline)',
              }}
            />
          ))}
        </div>

        <div className="mt-7 flex flex-col items-center gap-2">
          {card < 2 ? (
            <Button onClick={() => setCard((c) => c + 1)}>Continue</Button>
          ) : (
            <>
              <Button onClick={complete}>Continue</Button>
              <Button variant="ghost" onClick={complete}>
                Sign in later
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
