import { useState } from 'react';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';
import { app } from '../store/app';
import { prefsStore, usePrefs } from '../store/prefs';
import { markOnboardingDone } from '../lib/storage';
import { FEELINGS } from '../data/feelings';

/**
 * Onboarding questions (§6 flow) — the three cards that run once after sign-up/
 * login and before Home: tried before? → how regularly? → struggling with what?
 * All optional and low-pressure; answers are stored for gentle personalisation.
 * A separate view (store/app) so it doesn't tangle with the login screen.
 */
const FREQUENCIES: { value: string; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'A few times a week' },
  { value: 'rarely', label: 'Rarely' },
  { value: 'never', label: 'Never' },
];

const LAST = 2; // three question cards: 0, 1, 2

export default function Onboarding() {
  const prefs = usePrefs();
  const [card, setCard] = useState(0);
  const [triedBefore, setTriedBefore] = useState<boolean | null>(prefs.onboarding.triedBefore);
  const [frequency, setFrequency] = useState(prefs.onboarding.frequency);
  const [struggling, setStruggling] = useState<string[]>(prefs.onboarding.struggling);

  const toggleStruggle = (id: string) =>
    setStruggling((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const finish = () => {
    prefsStore.setOnboarding({ triedBefore, frequency, struggling });
    markOnboardingDone();
    app.setView('hub');
  };

  return (
    <div className="screen">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <Reveal delay={0.1}>
          <div className="glass glass-strong" style={{ padding: 28, minHeight: 236 }}>
            {card === 0 && (
              <>
                <p className="serif" style={{ fontSize: 'var(--t-xl)' }}>
                  Have you tried meditating before?
                </p>
                <div className="mt-6 flex gap-3">
                  <Chip on={triedBefore === true} onClick={() => setTriedBefore(true)}>Yes</Chip>
                  <Chip on={triedBefore === false} onClick={() => setTriedBefore(false)}>No</Chip>
                </div>
              </>
            )}
            {card === 1 && (
              <>
                <p className="serif" style={{ fontSize: 'var(--t-xl)' }}>
                  How regularly do you meditate?
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {FREQUENCIES.map((f) => (
                    <Chip key={f.value} on={frequency === f.value} onClick={() => setFrequency(f.value)}>
                      {f.label}
                    </Chip>
                  ))}
                </div>
              </>
            )}
            {card === 2 && (
              <>
                <p className="serif" style={{ fontSize: 'var(--t-xl)' }}>
                  Are you struggling with something?
                </p>
                <p style={{ color: 'var(--ink-muted)', marginTop: 8, fontSize: 'var(--t-sm)' }}>
                  Optional — pick any that fit.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {FEELINGS.map((f) => (
                    <Chip key={f.id} on={struggling.includes(f.id)} onClick={() => toggleStruggle(f.id)}>
                      {f.label}
                    </Chip>
                  ))}
                </div>
              </>
            )}
          </div>
        </Reveal>

        {/* progress dots */}
        <div className="mt-6 flex justify-center gap-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{ width: 6, height: 6, borderRadius: 999, background: i === card ? 'var(--gold)' : 'var(--hairline)' }}
            />
          ))}
        </div>

        <div className="mt-7 flex flex-col items-center gap-2">
          {card < LAST ? (
            <Button onClick={() => setCard((c) => c + 1)}>Continue</Button>
          ) : (
            <Button onClick={finish}>Continue</Button>
          )}
          <Button variant="ghost" onClick={finish}>
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}

/** A soft selectable pill for the onboarding answers. */
function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className="transition-transform duration-300 active:scale-[0.97]"
      style={{
        padding: '9px 16px',
        borderRadius: 999,
        fontSize: 'var(--t-sm)',
        color: on ? 'var(--gold)' : 'var(--ink)',
        background: on ? 'rgba(232,201,155,0.14)' : 'transparent',
        border: `1px solid ${on ? 'rgba(232,201,155,0.45)' : 'var(--hairline)'}`,
        transitionTimingFunction: 'var(--ease-calm)',
      }}
    >
      {children}
    </button>
  );
}
