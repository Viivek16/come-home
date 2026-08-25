import { useState } from 'react';
import Button from '../../ui/Button';
import Reveal from '../../ui/Reveal';
import ExitButton from '../../ui/ExitButton';
import { flow } from '../../store/flow';
import { CHECK_IN, type FlowEntry } from '../../data/flows';

/**
 * Screen 4 — Close and check-in (§Phase B). A gentle ask of how it is sitting now,
 * using the shared CHECK_IN options. None of them reads as failure. The soft note
 * back is the entry's own words; on a disease flow that still feels heavy, one
 * quiet, skippable offer to sit longer. Then a brief gratitude beat and a single
 * way Home. (The richer Home transition is Phase C.)
 */
export default function Close({ entry }: { entry: FlowEntry }) {
  const [choice, setChoice] = useState<(typeof CHECK_IN)[number]['id'] | null>(null);

  const pick = (id: (typeof CHECK_IN)[number]['id']) => {
    flow.pickCheckin(id);
    setChoice(id);
  };

  const heavy = choice === 'still-heavy';
  const note = heavy ? entry.closeHeavy : entry.closeLighter;
  const offerMore = heavy && entry.kind === 'disease';

  return (
    <div className="screen">
      <ExitButton />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
        <Reveal>
          <h2 className="serif" style={{ fontSize: 'var(--t-lg)', lineHeight: 1.3 }}>
            How is it sitting now?
          </h2>
        </Reveal>

        <Reveal delay={0.15} className="mt-8 flex w-full flex-col gap-3">
          {CHECK_IN.map((c) => {
            const on = choice === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => pick(c.id)}
                aria-pressed={on}
                className={`glass ${on ? 'glass-gold' : ''} px-5 py-4 transition-transform duration-300 active:scale-[0.98]`}
                style={{
                  borderRadius: 'var(--radius-card)',
                  color: on ? 'var(--gold)' : 'var(--ink)',
                  fontSize: 'var(--t-md)',
                  transitionTimingFunction: 'var(--ease-calm)',
                }}
              >
                {c.label}
              </button>
            );
          })}
        </Reveal>

        {choice && (
          <div className="mt-9 flex flex-col items-center">
            <Reveal>
              <p className="serif-italic" style={{ color: 'var(--ink)', fontSize: 'var(--t-md)', lineHeight: 1.6, maxWidth: 340 }}>
                {note}
              </p>
            </Reveal>

            {offerMore && (
              <Reveal delay={0.15} className="mt-5">
                <Button variant="ghost" onClick={() => flow.back()}>
                  Sit a little longer
                </Button>
              </Reveal>
            )}

            <Reveal delay={0.25} className="mt-8 flex flex-col items-center gap-1">
              <p className="eyebrow" style={{ marginBottom: 6 }}>
                Thank you for staying with yourself
              </p>
              <Button onClick={() => flow.home()}>Return home</Button>
            </Reveal>
          </div>
        )}
      </div>
    </div>
  );
}
