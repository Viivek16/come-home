import { useState } from 'react';
import { Play, Download, Check } from 'lucide-react';
import Reveal from '../../ui/Reveal';
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
        <Reveal delay={0.05}>
          <div className="eyebrow">Library</div>
          <h1 className="serif" style={{ fontSize: 'var(--t-2xl)', marginTop: 8, marginBottom: 22 }}>
            Find what you need.
          </h1>
        </Reveal>
        <div className="flex flex-col gap-3">
          {LIBRARY_ITEMS.map((l, i) => (
            <Reveal key={l.id} delay={0.14 + i * 0.06}>
              <div
                className="glass flex items-center gap-4 px-4 py-4"
                style={{ borderRadius: 'var(--radius-card)' }}
              >
                <button
                  onClick={openPlayer}
                  aria-label={`Play ${l.title}`}
                  className="glass grid shrink-0 place-items-center transition-transform duration-300 active:scale-[0.94]"
                  style={{ width: 46, height: 46, borderRadius: 999, transitionTimingFunction: 'var(--ease-calm)' }}
                >
                  <Play size={18} strokeWidth={1.6} color="var(--gold)" fill="var(--gold)" />
                </button>
                <button onClick={openPlayer} className="flex-1 text-left">
                  <span style={{ color: 'var(--ink)', fontSize: 'var(--t-md)' }}>{l.title}</span>
                  <span className="eyebrow" style={{ display: 'block', marginTop: 4 }}>
                    {l.feeling} · {l.length} · {l.voice}
                  </span>
                </button>
                <button
                  onClick={() => setSaved((s) => ({ ...s, [l.id]: true }))}
                  aria-label={saved[l.id] ? 'Saved for offline' : 'Save for offline'}
                  className="shrink-0 p-2"
                  style={{ color: saved[l.id] ? 'var(--gold)' : 'var(--ink-muted)' }}
                >
                  {saved[l.id] ? <Check size={18} strokeWidth={1.8} /> : <Download size={18} strokeWidth={1.5} />}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
