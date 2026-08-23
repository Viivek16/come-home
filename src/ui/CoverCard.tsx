import type { CSSProperties, ReactNode } from 'react';

/**
 * Atmospheric, full-bleed cover card (§Phase C). Cover area (a Still-Water tint,
 * typically tied to the current time band — no stock photos) + tag + title + sub
 * overlaid over a legibility scrim. Reusable: Home, Library and Sanctuary all use
 * it. `accent` gives the one gold-lit primary card per screen (§5); `corner` is an
 * optional top-right slot (e.g. the Sanctuary remove-heart) that sits above the card.
 */
export default function CoverCard({
  cover,
  tag,
  title,
  sub,
  onClick,
  accent = false,
  center = false,
  minHeight = 132,
  corner,
  style,
}: {
  cover: string; // CSS background for the cover (e.g. a band-tinted gradient)
  tag?: string;
  title: string;
  sub?: string;
  onClick: () => void;
  accent?: boolean;
  center?: boolean; // centre the tag/title/sub within the tile (§task3, Home cards)
  minHeight?: number;
  corner?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div style={{ position: 'relative' }}>
    <button
      onClick={onClick}
      className={`glass ${accent ? 'glass-strong glass-gold' : ''} w-full text-left transition-transform duration-300 active:scale-[0.99]`}
      style={{
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        padding: 0,
        transitionTimingFunction: 'var(--ease-calm)',
        ...style,
      }}
    >
      <div style={{ position: 'relative', minHeight, background: cover, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {/* soft champagne glint in a corner — the "still water" catching light */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(120% 90% at 88% 12%, rgba(232,201,155,0.22), transparent 55%)',
            opacity: accent ? 1 : 0.7,
          }}
        />
        {/* bottom scrim so text always reads over any band palette */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, transparent 30%, rgba(5,13,18,0.5) 72%, rgba(5,13,18,0.72) 100%)',
          }}
        />
        <div style={{ position: 'relative', padding: '18px 20px 16px', textAlign: center ? 'center' : undefined }}>
          {tag && (
            <div className="eyebrow" style={{ color: accent ? 'var(--gold)' : 'var(--ink-muted)' }}>
              {tag}
            </div>
          )}
          <div className="serif" style={{ fontSize: 'var(--t-xl)', marginTop: 6, lineHeight: 1.05 }}>
            {title}
          </div>
          {sub && (
            <div style={{ color: 'var(--ink-muted)', marginTop: 4, fontSize: 'var(--t-sm)' }}>
              {sub}
            </div>
          )}
        </div>
      </div>
    </button>
      {/* corner slot (e.g. remove-heart) — a sibling, not nested in the button */}
      {corner && <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>{corner}</div>}
    </div>
  );
}
