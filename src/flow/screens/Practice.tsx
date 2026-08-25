import { useEffect, useRef } from 'react';
import Reveal from '../../ui/Reveal';
import Button from '../../ui/Button';
import ExitButton from '../../ui/ExitButton';
import BreathRing from '../../audio/BreathRing';
import { audioControls, useAudio, TRACK } from '../../audio/audioStore';
import { flow } from '../../store/flow';
import { flowTrackSrc, type FlowEntry } from '../../data/flows';

/**
 * Screen — Practice (§Phase B, polished). The practice title + intro, then one
 * breathing play control (the shared BreathRing, glow driven by the breath clock).
 * Tapping it streams the mapped track through the existing audio player. A calm
 * gold progress line tracks it, no timer, no red. A quiet step onward to the close,
 * whenever the person is ready. The feeling flow arrives straight here after its
 * affirmation — just the music, no body screen.
 */
export default function Practice({ entry }: { entry: FlowEntry }) {
  const src = flowTrackSrc(entry.practice.track);
  const { position, duration, error } = useAudio();
  const felback = useRef(false);

  // Load the mapped track. The user's tap on the ring plays it (mobile autoplay).
  useEffect(() => {
    felback.current = false;
    audioControls.ensureLoaded(src);
  }, [src]);

  // Missing / failed asset → fall back to the closest calm track, never break.
  useEffect(() => {
    if (error && !felback.current && src !== TRACK) {
      felback.current = true;
      console.warn(`[flow] practice track "${entry.practice.track}" (${src}) unavailable, falling back to ${TRACK}`);
      audioControls.ensureLoaded(TRACK);
    }
  }, [error, src, entry.practice.track]);

  const pct = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

  return (
    <div className="screen">
      <ExitButton />
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
        <Reveal delay={0.05}>
          <h2 className="serif" style={{ fontSize: 'var(--t-lg)' }}>
            {entry.practice.title}
          </h2>
          <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-md)', lineHeight: 1.55, marginTop: 8, maxWidth: 320 }}>
            {entry.practice.intro}
          </p>
        </Reveal>

        <Reveal delay={0.35} className="mt-12 flex justify-center">
          <BreathRing size={150} />
        </Reveal>

        {/* calm progress — a thin champagne line, no numbers, no alarm */}
        <Reveal delay={0.5} className="mt-9 w-full" style={{ maxWidth: 220 }}>
          <div style={{ height: 3, borderRadius: 999, background: 'var(--hairline)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                borderRadius: 999,
                background: 'var(--gold)',
                transition: 'width 240ms linear',
              }}
            />
          </div>
        </Reveal>

        <Reveal delay={0.6} className="mt-9">
          <Button variant="ghost" onClick={() => flow.next()}>
            When you&rsquo;re ready
          </Button>
        </Reveal>
      </div>
    </div>
  );
}
