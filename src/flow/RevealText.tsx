import { Fragment } from 'react';

/**
 * Word-by-word calm reveal (§Phase-polish). The line surfaces one word at a time
 * out of a soft blur, gently rising into focus, so a still affirmation reads as
 * something breathed into being rather than printed. Enter-only and staggered
 * (Emil-Kowalski ethos); reduced motion snaps it in via the global rule.
 *
 * `stagger` is the delay added per word; `delay` offsets the whole line so it can
 * follow another element in.
 */
export default function RevealText({
  text,
  className = '',
  style,
  stagger = 0.085,
  delay = 0.15,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  stagger?: number;
  delay?: number;
}) {
  const words = text.split(' ');
  return (
    <span className={className} style={style}>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="word-surface" style={{ animationDelay: `${delay + i * stagger}s` }}>
            {w}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </span>
  );
}
