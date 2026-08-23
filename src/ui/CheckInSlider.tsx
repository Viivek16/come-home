import { useState, type CSSProperties } from 'react';
import type { Emotion } from '../store/session';
import { FEELINGS } from '../data/feelings';
import Button from './Button';

/**
 * Connected arrival slider (§Phase C). A calm track with the six felt-states and a
 * sliding thumb — inspired by a mood slider, over the app's shared feeling set.
 *
 * Reuses the accessible `.seek` range (keyboard + focus for free). Nothing is
 * committed until the user actively moves the thumb, so there's never a presumed
 * default feeling — then one clear primary action confirms (§5).
 */
const STATE_IDS: Emotion[] = ['stress', 'afraid', 'depressed', 'angry', 'sleep-deprived', 'overwhelmed'];
const labelOf = (id: Emotion) => FEELINGS.find((f) => f.id === id)?.label ?? '';

export default function CheckInSlider({ onChoose }: { onChoose: (id: Emotion | null) => void }) {
  const [idx, setIdx] = useState(2); // centred, but not committed until touched
  const [touched, setTouched] = useState(false);
  const pct = (idx / (STATE_IDS.length - 1)) * 100;
  const currentId = STATE_IDS[idx];

  return (
    <div className="flex flex-col items-center gap-7">
      {/* the felt-state — a gentle prompt until the thumb is moved */}
      <p
        aria-live="polite"
        className="serif"
        style={{ fontSize: 'var(--t-xl)', textAlign: 'center', minHeight: '2.4rem', lineHeight: 1.1 }}
      >
        {touched ? labelOf(currentId) : 'Take your time.'}
      </p>

      <div style={{ position: 'relative', width: '100%' }}>
        {/* five state stops behind the track */}
        <div aria-hidden style={{ position: 'absolute', top: 11, left: 0, right: 0, transform: 'translateY(-50%)', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
          {STATE_IDS.map((_, i) => (
            <span
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: i <= idx && touched ? 'var(--gold)' : 'var(--hairline)',
                opacity: i <= idx && touched ? 0.9 : 1,
              }}
            />
          ))}
        </div>
        <input
          type="range"
          className="seek"
          min={0}
          max={STATE_IDS.length - 1}
          step={1}
          value={idx}
          style={{ '--seek-pct': `${pct}%`, position: 'relative' } as CSSProperties}
          onChange={(e) => {
            setIdx(Number(e.target.value));
            setTouched(true);
          }}
          aria-label="How are you arriving today?"
          aria-valuetext={touched ? labelOf(currentId) : 'not yet chosen'}
        />
      </div>

      {/* Always tappable — Begin starts the session; an untouched slider passes no
          presumed feeling (null). */}
      <Button onClick={() => onChoose(touched ? currentId : null)}>
        Begin
      </Button>
    </div>
  );
}
