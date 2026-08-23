import { useState } from 'react';
import { Timer, Wind, Heart } from 'lucide-react';
import Reveal from '../../ui/Reveal';
import PracticeCard from '../../ui/PracticeCard';
import CoverCard from '../../ui/CoverCard';
import HeartButton from '../../ui/HeartButton';
import GradientIcon, { type GradientIconName } from '../../ui/GradientIcon';
import { session } from '../../store/session';
import { app } from '../../store/app';
import { openTool } from '../../store/tool';
import { openSanctuary } from '../../sanctuary/Sanctuary';
import { useFavorites } from '../../store/favorites';
import { LIBRARY_ITEMS, inTimeBucket, TIME_BUCKETS, type TimeBucket } from '../../data/library';
import { FEELINGS } from '../../data/feelings';
import { PATHS } from '../../data/paths';
import { loadLibFilter, saveLibFilter, type LibraryFilter } from '../../lib/storage';
import { stillWaterGradient } from '../../store/water';
import { useTimeBand } from '../../lib/timeBand';

/**
 * §6 Library (§Phase D). Browse the real content by felt-state (our categories are
 * the arrival states — no invented empty categories) and by length; both filters
 * combine over the real data with a calm empty state. Atmospheric cards throughout.
 * Saved sessions live in the Sanctuary view.
 */
export default function LibraryTab() {
  const [filter, setFilter] = useState<LibraryFilter>(() => loadLibFilter());
  const favs = useFavorites();
  const band = useTimeBand();
  const cover = stillWaterGradient(band);

  const update = (f: Partial<LibraryFilter>) =>
    setFilter((cur) => {
      const next = { ...cur, ...f };
      saveLibFilter(next);
      return next;
    });
  const anyFilter = filter.time !== 'all' || filter.feeling !== 'all';
  const clear = () => update({ time: 'all', feeling: 'all' });

  const filtered = LIBRARY_ITEMS.filter(
    (l) => inTimeBucket(l, filter.time as TimeBucket) && (filter.feeling === 'all' || l.feeling === filter.feeling),
  );

  const savedCount = LIBRARY_ITEMS.filter((l) => favs.has(`lib:${l.id}`)).length + PATHS.filter((p) => favs.has(`path:${p.id}`)).length;

  const openLibrary = () => {
    session.reset();
    session.pickPath('more-15');
    app.setView('session');
  };

  return (
    <div className="screen">
      <div className="mx-auto w-full max-w-md pt-6 pb-10">
        <Reveal delay={0.05}>
          <div className="eyebrow">Library</div>
          <h1 className="serif" style={{ fontSize: 'var(--t-2xl)', marginTop: 8, marginBottom: 20 }}>
            Find what you need.
          </h1>
        </Reveal>

        {/* Sanctuary — the saved collection lives in its own calm view. */}
        <Reveal delay={0.1}>
          <button
            onClick={openSanctuary}
            className="glass glass-gold flex w-full items-center gap-3 px-5 py-4 text-left transition-transform duration-300 active:scale-[0.99]"
            style={{ borderRadius: 'var(--radius-card)', transitionTimingFunction: 'var(--ease-calm)' }}
          >
            <span className="grid shrink-0 place-items-center" style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(232,201,155,0.14)' }}>
              <Heart size={18} strokeWidth={1.6} color="var(--gold)" fill="var(--gold)" />
            </span>
            <span className="flex-1">
              <span className="serif" style={{ display: 'block', color: 'var(--ink)', fontSize: 'var(--t-lg)' }}>
                Sanctuary
              </span>
              <span className="eyebrow" style={{ display: 'block', marginTop: 2, color: 'var(--gold)' }}>
                {savedCount > 0 ? `${savedCount} saved` : 'Your saved sessions'}
              </span>
            </span>
            <span aria-hidden style={{ color: 'var(--ink-muted)' }}>→</span>
          </button>
        </Reveal>

        {/* Self-directed practices — no content, no narrator (§Phase2). */}
        <Reveal delay={0.16}>
          <div className="eyebrow" style={{ marginTop: 24, marginBottom: 10 }}>
            Practices
          </div>
          <div className="grid grid-cols-2 gap-3">
            <PracticeCard Icon={Timer} title="Quiet Timer" sub="Silent · your pace" onClick={() => openTool('timer')} />
            <PracticeCard Icon={Wind} title="Breathe" sub="Guided · visual" onClick={() => openTool('breathe')} />
          </div>
        </Reveal>

        {/* Browse by felt-state — category chips with atmospheric cover thumbnails. */}
        <Reveal delay={0.22}>
          <div className="flex items-center justify-between" style={{ marginTop: 26, marginBottom: 10 }}>
            <span className="eyebrow">How are you feeling today?</span>
            {anyFilter && (
              <button onClick={clear} className="eyebrow" style={{ color: 'var(--gold)' }} aria-label="Clear filters">
                Clear
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            <CategoryChip label="All" icon="sun" cover={cover} on={filter.feeling === 'all'} onClick={() => update({ feeling: 'all' })} />
            {FEELINGS.map((f) => (
              <CategoryChip key={f.id} label={f.label} icon={f.icon} cover={cover} on={filter.feeling === f.label} onClick={() => update({ feeling: f.label })} />
            ))}
          </div>
        </Reveal>

        {/* Duration — combines with the feeling above. */}
        <Reveal delay={0.28}>
          <div className="eyebrow" style={{ marginTop: 22, marginBottom: 10 }}>
            How much time
          </div>
          <div className="flex flex-wrap gap-2">
            {TIME_BUCKETS.map((b) => (
              <FilterChip key={b.id} on={filter.time === b.id} onClick={() => update({ time: b.id })}>
                {b.label}
              </FilterChip>
            ))}
          </div>
        </Reveal>

        {/* Results — atmospheric cards; calm, non-judgmental empty state. */}
        {filtered.length > 0 ? (
          <div className="mt-5 flex flex-col gap-4">
            {filtered.map((l, i) => (
              <Reveal key={l.id} delay={0.32 + i * 0.05}>
                <CoverCard
                  cover={cover}
                  tag={`Guided · ${l.length}`}
                  title={l.title}
                  sub={l.feeling}
                  onClick={openLibrary}
                  corner={<HeartButton favKey={`lib:${l.id}`} label={l.title} />}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="mt-5" style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-md)', lineHeight: 1.5 }}>
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

function CategoryChip({ label, icon, cover, on, onClick }: { label: string; icon: GradientIconName; cover: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className="shrink-0 transition-transform duration-300 active:scale-[0.97]"
      style={{ width: 92, textAlign: 'center', transitionTimingFunction: 'var(--ease-calm)' }}
    >
      <span
        className="grid place-items-center"
        style={{
          height: 60,
          borderRadius: 14,
          background: cover,
          border: `1px solid ${on ? 'rgba(232,201,155,0.55)' : 'var(--hairline)'}`,
          boxShadow: on ? '0 0 0 1px rgba(232,201,155,0.35), 0 0 18px rgba(232,201,155,0.16)' : 'none',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span
          aria-hidden
          style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 80% 15%, rgba(232,201,155,0.22), transparent 55%)' }}
        />
        <GradientIcon name={icon} size={24} />
      </span>
      <span
        className="eyebrow"
        style={{ display: 'block', marginTop: 6, color: on ? 'var(--gold)' : 'var(--ink-muted)', textTransform: 'none', letterSpacing: 0, fontSize: 'var(--t-xs)' }}
      >
        {label}
      </span>
    </button>
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
