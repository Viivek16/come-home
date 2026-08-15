import type { ComponentType } from 'react';

/** A calm entry card for a self-directed tool (§Phase2). Surfaced inside the
 *  existing IA (Home / Library) — never a new bottom-nav tab. */
export default function PracticeCard({
  Icon,
  title,
  sub,
  onClick,
}: {
  Icon: ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="glass flex flex-col items-start gap-3 px-4 py-4 text-left transition-transform duration-300 active:scale-[0.98]"
      style={{ borderRadius: 'var(--radius-card)', transitionTimingFunction: 'var(--ease-calm)' }}
    >
      <span className="glass grid place-items-center" style={{ width: 40, height: 40, borderRadius: 12 }}>
        <Icon size={18} strokeWidth={1.5} color="var(--gold)" />
      </span>
      <span>
        <span style={{ color: 'var(--ink)', fontSize: 'var(--t-md)', display: 'block' }}>{title}</span>
        <span className="eyebrow" style={{ display: 'block', marginTop: 2 }}>
          {sub}
        </span>
      </span>
    </button>
  );
}
