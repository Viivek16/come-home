import Chip from './Chip';
import Reveal from './Reveal';
import type { Checkin } from '../store/session';

/**
 * The shared "How are you feeling now?" close (§Phase A/E). One source of truth for
 * the gentle end-of-session check-in so the player and the tools all offer the
 * exact same trauma-sensitive states and copy. Controlled: the caller owns what
 * (if anything) it records. No streaks, no scores.
 */
export const CHECKIN_OPTIONS: { id: Checkin; label: string }[] = [
  { id: 'calmer', label: 'Calmer' },
  { id: 'better', label: 'A little better' },
  { id: 'same', label: 'The same' },
  { id: 'struggling', label: 'Still struggling' },
];

export default function FeelingCheck({
  selected,
  onPick,
  heading = 'How are you feeling now?',
}: {
  selected: Checkin | null;
  onPick: (c: Checkin) => void;
  heading?: string;
}) {
  return (
    <>
      <Reveal delay={0.05}>
        <h2 className="serif" style={{ fontSize: 'var(--t-xl)' }}>
          {heading}
        </h2>
        <p style={{ color: 'var(--ink-muted)', marginTop: 6, marginBottom: 22, fontSize: 'var(--t-md)' }}>
          There's no right answer.
        </p>
      </Reveal>
      <div className="flex flex-col gap-3">
        {CHECKIN_OPTIONS.map((o, i) => (
          <Reveal key={o.id} delay={0.14 + i * 0.06}>
            <Chip selected={selected === o.id} onClick={() => onPick(o.id)}>
              {o.label}
            </Chip>
          </Reveal>
        ))}
      </div>
    </>
  );
}
