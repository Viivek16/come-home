import type { ComponentType } from 'react';

export type TabItem = { id: string; label: string; Icon: ComponentType<{ size?: number; strokeWidth?: number }> };

/**
 * Glass bottom tab bar (§6). Gold active state, NO badges, no guilt dots (§2).
 * Controlled — the hub wires `active`/`onChange` to routing.
 */
export default function TabBar({
  items,
  active,
  onChange,
}: {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <nav
      className="glass app-layer"
      aria-label="Sections"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5,
        borderRadius: 0,
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        paddingBottom: 'var(--safe-bottom)',
        display: 'flex',
      }}
    >
      {items.map(({ id, label, Icon }) => {
        const on = id === active;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            aria-current={on ? 'page' : undefined}
            className="flex flex-1 flex-col items-center gap-1 py-2.5 transition-opacity duration-300"
            style={{
              color: on ? 'var(--gold)' : 'var(--ink-muted)',
              opacity: on ? 1 : 0.75,
              minHeight: 56,
              transitionTimingFunction: 'var(--ease-calm)',
            }}
          >
            <Icon size={22} strokeWidth={1.5} />
            <span style={{ fontSize: 10, letterSpacing: '0.06em' }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
