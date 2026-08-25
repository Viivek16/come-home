import { nav } from '../nav/history';

/**
 * A gentle, always-present way out (§FIX3, minimal redesign). No glass disc — just
 * a quiet, thin mark in the top corner, kept legible over any backdrop by a soft
 * drop-shadow rather than a surface. Safe-area aware, 44px tap target (§10), never
 * red or alarming. Defaults to browser/OS Back so the hardware Back button and this
 * control stay in sync. Sits below the crisis dialog (z 20).
 */
export default function ExitButton({
  onExit = () => nav.back(),
  label = 'Leave',
}: {
  onExit?: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onExit}
      aria-label={label}
      className="grid place-items-center transition-[opacity,transform] duration-300 hover:opacity-100 active:scale-90"
      style={{
        position: 'fixed',
        top: 'calc(var(--safe-top) + 14px)',
        right: 'calc(env(safe-area-inset-right, 0px) + 16px)',
        zIndex: 15,
        width: 44,
        height: 44,
        color: 'var(--ink-muted)',
        opacity: 0.75,
        filter: 'drop-shadow(0 1px 4px rgba(0, 0, 0, 0.55))',
        transitionTimingFunction: 'var(--ease-calm)',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}
