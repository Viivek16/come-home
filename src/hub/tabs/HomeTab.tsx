import { useEffect, useState } from 'react';
import Button from '../../ui/Button';
import { usePrefs } from '../../store/prefs';
import { session } from '../../store/session';
import { app } from '../../store/app';
import { getHistory, type HistoryEntry } from '../../lib/storage';
import { feelingLabel } from '../../data/feelings';

/** §6 Home. Welcome + big CTA + a soft recent card. No streaks, no counts. */
export default function HomeTab() {
  const prefs = usePrefs();
  const [recent, setRecent] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    getHistory().then((h) => setRecent(h[0] ?? null));
  }, []);

  const comeHome = () => {
    session.reset();
    app.setView('session');
  };

  return (
    <div className="screen">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
        <div className="eyebrow">Home</div>
        <h1 className="serif" style={{ fontSize: 'var(--t-xl)', marginTop: 8 }}>
          Welcome back{prefs.name ? `, ${prefs.name}` : ''} ♡
        </h1>
        <p style={{ color: 'var(--ink-muted)', marginTop: 6, fontSize: 'var(--t-md)' }}>
          You're not alone in this.
        </p>

        <div className="mt-8">
          <Button onClick={comeHome}>Come Home now</Button>
        </div>

        {recent && (
          <button
            onClick={comeHome}
            className="glass mt-8 px-5 py-4 text-left transition-opacity duration-300 hover:opacity-90"
            style={{ borderRadius: 'var(--radius-card)' }}
          >
            <div className="eyebrow">A moment to return to</div>
            <div className="serif" style={{ fontSize: 'var(--t-lg)', marginTop: 6 }}>
              Last time, you arrived {feelingLabel(recent.emotion)}.
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
