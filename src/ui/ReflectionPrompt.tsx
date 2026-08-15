import { useState } from 'react';
import { addReflection } from '../lib/storage';

// A soft spread — room to feel light, tender, or tired. Never forced positivity.
const WORDS = ['Lighter', 'Calmer', 'Present', 'Tender', 'Tired', 'Okay'];

/**
 * Optional, skippable one-tap reflection (§Phase5). Records a single word locally
 * and gently confirms. Never required — the screen's own action is the skip. No
 * counter, no streak. Once a word is kept, the prompt settles into a quiet note.
 */
export default function ReflectionPrompt() {
  const [saved, setSaved] = useState<string | null>(null);

  const pick = (w: string) => {
    if (saved) return;
    void addReflection(w);
    setSaved(w);
  };

  if (saved) {
    return (
      <p className="serif-italic" role="status" style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-md)', textAlign: 'center' }}>
        “{saved}” — kept, just for you.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)' }}>If you’d like, name how you feel.</p>
      <div className="flex flex-wrap justify-center gap-2">
        {WORDS.map((w) => (
          <button
            key={w}
            onClick={() => pick(w)}
            className="transition-transform duration-300 active:scale-[0.96]"
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              fontSize: 'var(--t-sm)',
              color: 'var(--ink)',
              background: 'transparent',
              border: '1px solid var(--hairline)',
              transitionTimingFunction: 'var(--ease-calm)',
            }}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}
