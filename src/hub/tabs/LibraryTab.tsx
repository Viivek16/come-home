import { useState } from 'react';
import { Play, Download, Check, Timer, Wind } from 'lucide-react';
import Reveal from '../../ui/Reveal';
import PracticeCard from '../../ui/PracticeCard';
import HeartButton from '../../ui/HeartButton';
import { session, type PathId } from '../../store/session';
import { app } from '../../store/app';
import { openTool } from '../../store/tool';
import { useFavorites } from '../../store/favorites';
import { LIBRARY_ITEMS, libraryFeelings, inTimeBucket, TIME_BUCKETS, type TimeBucket } from '../../data/library';
import { PATHS } from '../../data/paths';
import { loadLibFilter, saveLibFilter, type LibraryFilter } from '../../lib/storage';

/** §6 Library (+§Phase3): Saved collection + calm filters over the real data. */
export default function LibraryTab() {
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<LibraryFilter>(() => loadLibFilter());
  const favs = useFavorites();

  const update = (f: Partial<LibraryFilter>) =>
    setFilter((cur) => {
      const next = { ...cur, ...f };
      saveLibFilter(next);
      return next;
    });
  const anyFilter = filter.time !== 'all' || filter.feeling !== 'all';
  const clear = () => update({ time: 'all', feeling: 'all' });

  const feelings = libraryFeelings();
  const filtered = LIBRARY_ITEMS.filter(
    (l) => inTimeBucket(l, filter.time as TimeBucket) && (filter.feeling === 'all' || l.feeling === filter.feeling),
  );

  const savedLib = LIBRARY_ITEMS.filter((l) => favs.has(`lib:${l.id}`));
  const savedPaths = PATHS.filter((p) => favs.has(`path:${p.id}`));
  const hasSaved = savedLib.length + savedPaths.length > 0;

  const openLibrary = () => {
    session.reset();
    session.pickPath('more-15');
    app.setView('session');
  };
  const openPath = (p: PathId) => {
    session.reset();
    session.pickPath(p);
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

        {/* Self-directed practices — no content, no narrator (§Phase2). */}
        <Reveal delay={0.1}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Practices
          </div>
          <div className="grid grid-cols-2 gap-3">
            <PracticeCard Icon={Timer} title="Quiet timer" sub="Silent · your pace" onClick={() => openTool('timer')} />
            <PracticeCard Icon={Wind} title="Breathe" sub="Guided · visual" onClick={() => openTool('breathe')} />
          </div>
        </Reveal>

        {/* Saved (§Phase3) — always present so it's easy to re-find; gentle when empty. */}
        <Reveal delay={0.16}>
          <div className="eyebrow" style={{ marginTop: 24, marginBottom: 10 }}>
            Saved
          </div>
          {hasSaved ? (
            <div className="flex flex-col gap-3">
              {savedLib.map((l) => (
                <SavedRow key={`lib-${l.id}`} title={l.title} meta={`${l.feeling} · ${l.length}`} favKey={`lib:${l.id}`} onPlay={openLibrary} />
              ))}
              {savedPaths.map((p) => (
                <SavedRow key={`path-${p.id}`} title={p.title} meta={`Guided · ${p.duration}`} favKey={`path:${p.id}`} onPlay={() => openPath(p.id)} />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)', lineHeight: 1.5 }}>
              Tap the heart on anything that helps. It’ll be here, waiting, whenever you come back.
            </p>
          )}
        </Reveal>

        {/* Filters (§Phase3) — quiet, additive, clearable. */}
        <Reveal delay={0.22}>
          <div className="flex items-center justify-between" style={{ marginTop: 26, marginBottom: 10 }}>
            <span className="eyebrow">Guided</span>
            {anyFilter && (
              <button onClick={clear} className="eyebrow" style={{ color: 'var(--gold)' }} aria-label="Clear filters">
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {TIME_BUCKETS.map((b) => (
              <FilterChip key={b.id} on={filter.time === b.id} onClick={() => update({ time: b.id })}>
                {b.label}
              </FilterChip>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <FilterChip on={filter.feeling === 'all'} onClick={() => update({ feeling: 'all' })}>
              Any feeling
            </FilterChip>
            {feelings.map((f) => (
              <FilterChip key={f} on={filter.feeling === f} onClick={() => update({ feeling: f })}>
                {f}
              </FilterChip>
            ))}
          </div>
        </Reveal>

        {/* Results */}
        {filtered.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3">
            {filtered.map((l, i) => (
              <Reveal key={l.id} delay={0.28 + i * 0.05}>
                <div className="glass flex items-center gap-3 px-4 py-4" style={{ borderRadius: 'var(--radius-card)' }}>
                  <button
                    onClick={openLibrary}
                    aria-label={`Play ${l.title}`}
                    className="glass grid shrink-0 place-items-center transition-transform duration-300 active:scale-[0.94]"
                    style={{ width: 46, height: 46, borderRadius: 999, transitionTimingFunction: 'var(--ease-calm)' }}
                  >
                    <Play size={18} strokeWidth={1.6} color="var(--gold)" fill="var(--gold)" />
                  </button>
                  <button onClick={openLibrary} className="flex-1 text-left">
                    <span style={{ color: 'var(--ink)', fontSize: 'var(--t-md)' }}>{l.title}</span>
                    <span className="eyebrow" style={{ display: 'block', marginTop: 4 }}>
                      {l.feeling} · {l.length}
                    </span>
                  </button>
                  <HeartButton favKey={`lib:${l.id}`} label={l.title} />
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
        ) : (
          <p className="mt-4" style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-md)', lineHeight: 1.5 }}>
            Nothing here for that just now. Try a longer time, or{' '}
            <button onClick={clear} style={{ color: 'var(--gold)' }}>
              see everything
            </button>
            .
          </p>
        )}
      </div>
    </div>
  );
}

function FilterChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className="transition-transform duration-300 active:scale-[0.97]"
      style={{
        padding: '7px 14px',
        borderRadius: 999,
        fontSize: 'var(--t-sm)',
        color: on ? 'var(--gold)' : 'var(--ink-muted)',
        background: on ? 'rgba(232,201,155,0.14)' : 'transparent',
        border: `1px solid ${on ? 'rgba(232,201,155,0.4)' : 'var(--hairline)'}`,
        transitionTimingFunction: 'var(--ease-calm)',
      }}
    >
      {children}
    </button>
  );
}

function SavedRow({ title, meta, favKey, onPlay }: { title: string; meta: string; favKey: string; onPlay: () => void }) {
  return (
    <div className="glass-strong glass flex items-center gap-3 px-4 py-3.5" style={{ borderRadius: 'var(--radius-card)' }}>
      <button
        onClick={onPlay}
        aria-label={`Play ${title}`}
        className="glass grid shrink-0 place-items-center transition-transform duration-300 active:scale-[0.94]"
        style={{ width: 42, height: 42, borderRadius: 999, transitionTimingFunction: 'var(--ease-calm)' }}
      >
        <Play size={16} strokeWidth={1.6} color="var(--gold)" fill="var(--gold)" />
      </button>
      <button onClick={onPlay} className="flex-1 text-left">
        <span style={{ color: 'var(--ink)', fontSize: 'var(--t-md)' }}>{title}</span>
        <span className="eyebrow" style={{ display: 'block', marginTop: 3 }}>
          {meta}
        </span>
      </button>
      <HeartButton favKey={favKey} label={title} />
    </div>
  );
}
