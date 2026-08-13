import { useState } from 'react';
import { session } from '../../store/session';
import { app } from '../../store/app';
import { LIBRARY_ITEMS } from '../../data/library';

/** §6 Library. Browse by feeling · length · voice. Offline download is stubbed. */
export default function LibraryTab() {
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const openPlayer = () => {
    session.reset();
    session.pickPath('more-15');
    app.setView('session');
  };

  return (
    <div className="screen">
      <div className="mx-auto w-full max-w-md py-10">
        <div className="eyebrow">Library</div>
        <h1 className="serif" style={{ fontSize: 'var(--t-xl)', marginTop: 8, marginBottom: 20 }}>
          Find what you need.
        </h1>
        <div className="flex flex-col gap-3">
          {LIBRARY_ITEMS.map((l) => (
            <div
              key={l.id}
              className="glass flex items-center justify-between gap-3 px-5 py-4"
              style={{ borderRadius: 'var(--radius-card)' }}
            >
              <button onClick={openPlayer} className="flex-1 text-left">
                <span style={{ color: 'var(--ink)', fontSize: 'var(--t-md)' }}>{l.title}</span>
                <span className="eyebrow" style={{ display: 'block', marginTop: 4 }}>
                  {l.feeling} · {l.length} · {l.voice}
                </span>
              </button>
              <button
                onClick={() => setSaved((s) => ({ ...s, [l.id]: true }))}
                aria-label={saved[l.id] ? 'Saved for offline' : 'Save for offline'}
                className="shrink-0 px-2 py-1 text-right"
                style={{ color: saved[l.id] ? 'var(--gold)' : 'var(--ink-muted)', fontSize: 'var(--t-xs)' }}
              >
                {saved[l.id] ? 'Saved ✓' : 'Save offline'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
