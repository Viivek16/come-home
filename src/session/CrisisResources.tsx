import { useEffect } from 'react';
import Button from '../ui/Button';
import { CRISIS_RESOURCES } from '../data/resources';

/** §6.6 soft, opt-in crisis-support panel. Never alarmist, always dismissible.
 *  Content is a neutral placeholder, data-driven (§15). */
export default function CrisisResources({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Support options"
      style={{ position: 'fixed', inset: 0, zIndex: 20, display: 'flex' }}
    >
      <div
        onClick={onClose}
        aria-hidden
        style={{ position: 'absolute', inset: 0, background: 'rgba(4,12,17,0.6)', backdropFilter: 'blur(6px)' }}
      />
      <div className="mx-auto my-auto w-full max-w-md" style={{ position: 'relative', padding: '0 22px' }}>
        <div className="glass" style={{ padding: 22 }}>
          <div className="eyebrow">Support options</div>
          <p className="serif" style={{ fontSize: 'var(--t-lg)', marginTop: 6 }}>
            You don't have to hold this alone.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {CRISIS_RESOURCES.map((r) => (
              <div key={r.id} className="glass" style={{ padding: '14px 16px' }}>
                <div style={{ color: 'var(--ink)', fontSize: 'var(--t-md)' }}>{r.label}</div>
                <div style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)', marginTop: 2 }}>{r.detail}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-center">
            <Button variant="ghost" onClick={onClose}>
              I'm okay for now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
