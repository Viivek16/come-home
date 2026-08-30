import { Timer, Wind, Heart } from 'lucide-react';
import Reveal from '../../ui/Reveal';
import PracticeCard from '../../ui/PracticeCard';
import GradientIcon from '../../ui/GradientIcon';
import { enterFlow } from '../../store/flow';
import { openTool } from '../../store/tool';
import { openSanctuary } from '../../sanctuary/Sanctuary';
import { useFavorites } from '../../store/favorites';
import { LIBRARY_ITEMS } from '../../data/library';
import { FEELINGS } from '../../data/feelings';
import { PATHS } from '../../data/paths';

/**
 * §6 Library (§Phase D). Browse the real content by felt-state — our categories are
 * the arrival states (no invented empty categories). Tapping a feeling launches the
 * same companion flow as the Support tab. Saved sessions live in the Sanctuary view.
 */
export default function LibraryTab() {
  const favs = useFavorites();

  const savedCount = LIBRARY_ITEMS.filter((l) => favs.has(`lib:${l.id}`)).length + PATHS.filter((p) => favs.has(`path:${p.id}`)).length;

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

        {/* Browse by felt-state — the six arrival states as calm glass tiles, mirroring
            the Support grid. Tapping one launches the same companion flow. */}
        <div style={{ marginTop: 26 }}>
          <Reveal delay={0.22}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              How are you feeling today?
            </div>
          </Reveal>
          <Reveal delay={0.26}>
            <div className="grid grid-cols-2 gap-3">
              {FEELINGS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => enterFlow(f.id)}
                  className="glass flex flex-col items-center justify-center gap-2 px-3 py-4 text-center transition-transform duration-300 active:scale-[0.98]"
                  style={{ minHeight: 88, borderRadius: 'var(--radius-card)', transitionTimingFunction: 'var(--ease-calm)' }}
                >
                  <GradientIcon name={f.icon} size={24} />
                  <span style={{ color: 'var(--ink)', fontSize: 'var(--t-sm)', lineHeight: 1.25 }}>{f.label}</span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
