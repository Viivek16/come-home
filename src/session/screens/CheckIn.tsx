import { useState } from 'react';
import { Heart } from 'lucide-react';
import Chip from '../../ui/Chip';
import Button from '../../ui/Button';
import Reveal from '../../ui/Reveal';
import CrisisResources from '../CrisisResources';
import { session, shouldOfferSupport, useSessionState, type Checkin } from '../../store/session';
import { favorites, useFavorites } from '../../store/favorites';

const OPTIONS: { id: Checkin; label: string }[] = [
  { id: 'calmer', label: 'Calmer' },
  { id: 'better', label: 'A little better' },
  { id: 'same', label: 'The same' },
  { id: 'struggling', label: 'Still struggling' },
];

/** §6.6 Gentle check-in. Stored privately. Soft crisis row when warranted. */
export default function CheckIn() {
  const state = useSessionState();
  const [selected, setSelected] = useState<Checkin | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [showResources, setShowResources] = useState(false);

  const offer = shouldOfferSupport(state) && !dismissed;

  // Save this session to the Sanctuary (favorites) — a quiet keepsake, never a
  // score. Same prefixed key the Library reads (§Phase3).
  const favKey = state.path ? `path:${state.path}` : null;
  const favs = useFavorites();
  const saved = favKey ? favs.has(favKey) : false;

  const pick = (c: Checkin) => {
    session.recordCheckin(c);
    setSelected(c);
  };
  const leave = () => session.go('return');
  const preferNot = () => {
    session.recordCheckin('prefer-not');
    leave();
  };

  return (
    <div className="screen">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
        <Reveal delay={0.05}>
          <h2 className="serif" style={{ fontSize: 'var(--t-xl)' }}>
            How are you feeling now?
          </h2>
          <p style={{ color: 'var(--ink-muted)', marginTop: 6, marginBottom: 22, fontSize: 'var(--t-md)' }}>
            There's no right answer.
          </p>
        </Reveal>

        <div className="flex flex-col gap-3">
          {OPTIONS.map((o, i) => (
            <Reveal key={o.id} delay={0.14 + i * 0.06}>
              <Chip selected={selected === o.id} onClick={() => pick(o.id)}>
                {o.label}
              </Chip>
            </Reveal>
          ))}
        </div>

        {favKey && (
          <Reveal delay={0.42} className="mt-5 flex justify-center">
            <button
              onClick={() => favorites.toggle(favKey)}
              aria-pressed={saved}
              className="flex items-center gap-2 transition-transform duration-300 active:scale-[0.97]"
              style={{
                padding: '9px 16px',
                borderRadius: 999,
                fontSize: 'var(--t-sm)',
                color: saved ? 'var(--gold)' : 'var(--ink-muted)',
                border: `1px solid ${saved ? 'rgba(232,201,155,0.4)' : 'var(--hairline)'}`,
                background: saved ? 'rgba(232,201,155,0.12)' : 'transparent',
                transitionTimingFunction: 'var(--ease-calm)',
              }}
            >
              <Heart size={16} strokeWidth={1.6} fill={saved ? 'var(--gold)' : 'none'} />
              {saved ? 'Saved to Sanctuary' : 'Save to Sanctuary'}
            </button>
          </Reveal>
        )}

        {offer && (
          <div className="glass glass-gold mt-5 flex items-center gap-3 px-5 py-4" style={{ borderRadius: 'var(--radius-chip)' }}>
            <button onClick={() => setShowResources(true)} className="flex-1 text-left">
              <div style={{ color: 'var(--ink)', fontSize: 'var(--t-md)' }}>If you need more than this right now</div>
              <div className="eyebrow" style={{ color: 'var(--gold)', marginTop: 6 }}>
                See support options →
              </div>
            </button>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss support options"
              className="shrink-0 px-2 py-1"
              style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)' }}
            >
              Not now
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-col items-center gap-2">
          {selected && <Button onClick={leave}>Take what you need</Button>}
          <Button variant="ghost" onClick={preferNot}>
            I prefer not to say
          </Button>
        </div>
      </div>

      {showResources && <CrisisResources onClose={() => setShowResources(false)} />}
    </div>
  );
}
