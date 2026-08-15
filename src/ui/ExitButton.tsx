import { nav } from '../nav/history';

/**
 * A gentle, always-present way out (§FIX3). Top corner, safe-area aware, ≥44px
 * tap target, still-water styling, never red or alarming. Defaults to browser/OS
 * Back so the hardware Back button and this control stay in sync — leaving a
 * session returns Home (audio stop + session reset happen in the history layer).
 * Sits below the crisis dialog (z 20) so a focused modal always covers it.
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
      className="glass grid place-items-center transition-transform duration-200 active:scale-[0.96]"
      style={{
        position: 'fixed',
        top: 'calc(var(--safe-top) + 10px)',
        right: 'calc(env(safe-area-inset-right, 0px) + 14px)',
        zIndex: 15,
        width: 44,
        height: 44,
        borderRadius: 999,
        color: 'var(--ink-muted)',
        transitionTimingFunction: 'var(--ease-calm)',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </button>
  );
}
