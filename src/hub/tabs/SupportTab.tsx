import Reveal from '../../ui/Reveal';
import GradientIcon, { type GradientIconName } from '../../ui/GradientIcon';
import { SUPPORT_DISEASES } from '../../data/supportCategories';
import { FEELINGS } from '../../data/feelings';

/** §6 Support (in-app user flow). Two option blocks as calm tile grids: a disease
 *  list and the six felt-states, each feeling carrying a soft-gradient line icon. */
export default function SupportTab() {
  return (
    <div className="screen">
      <div className="mx-auto w-full max-w-md pt-6 pb-10">
        <Reveal delay={0.05}>
          <div className="eyebrow">Support</div>
          <h1 className="serif" style={{ fontSize: 'var(--t-xl)', lineHeight: 1.1, marginTop: 6, marginBottom: 22 }}>
            What's here right now?
          </h1>
        </Reveal>

        <TileGrid
          delay={0.12}
          title="Are you dealing with some disease?"
          tiles={SUPPORT_DISEASES.map((label) => ({ key: label, label }))}
        />
        <TileGrid
          delay={0.22}
          title="How are you feeling today?"
          tiles={FEELINGS.map((f) => ({ key: f.id, label: f.label, icon: f.icon }))}
        />
      </div>
    </div>
  );
}

type Tile = { key: string; label: string; icon?: GradientIconName };

/** A titled 2-column grid of even-height glass tiles with gentle press feedback. */
function TileGrid({ title, tiles, delay }: { title: string; tiles: Tile[]; delay: number }) {
  return (
    <div style={{ marginTop: 26 }}>
      <Reveal delay={delay}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>
          {title}
        </div>
      </Reveal>
      <Reveal delay={delay + 0.04}>
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((t) => (
            <button
              key={t.key}
              type="button"
              className="glass flex flex-col items-center justify-center gap-2 px-3 py-4 text-center transition-transform duration-300 active:scale-[0.98]"
              style={{ minHeight: 88, borderRadius: 'var(--radius-card)', transitionTimingFunction: 'var(--ease-calm)' }}
            >
              {t.icon && <GradientIcon name={t.icon} size={24} />}
              <span style={{ color: 'var(--ink)', fontSize: 'var(--t-sm)', lineHeight: 1.25 }}>{t.label}</span>
            </button>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
