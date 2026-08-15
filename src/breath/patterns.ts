import { INHALE, EXHALE } from './useBreath';

/**
 * Breathing patterns for the Breathe tool (§Phase2). The default "Coherent" is
 * the app's shared breath clock (INHALE/EXHALE) — the SAME source of truth, so
 * the tool never invents a competing rhythm. Phases drive both the orb scale and
 * the text cue; there is NO requestAnimationFrame loop (CSS transitions only).
 */
export type BreathPhaseKind = 'in' | 'hold' | 'out';
export type BreathPhase = { kind: BreathPhaseKind; label: string; seconds: number };
export type BreathPattern = { id: string; name: string; note: string; phases: BreathPhase[] };

export const PATTERNS: BreathPattern[] = [
  {
    id: 'coherent',
    name: 'Coherent',
    note: `${INHALE}–${EXHALE} · the calm default`,
    phases: [
      { kind: 'in', label: 'Breathe in', seconds: INHALE },
      { kind: 'out', label: 'Breathe out', seconds: EXHALE },
    ],
  },
  {
    id: 'box',
    name: 'Box',
    note: '4·4·4·4 · steady and even',
    phases: [
      { kind: 'in', label: 'Breathe in', seconds: 4 },
      { kind: 'hold', label: 'Hold', seconds: 4 },
      { kind: 'out', label: 'Breathe out', seconds: 4 },
      { kind: 'hold', label: 'Hold', seconds: 4 },
    ],
  },
  {
    id: '478',
    name: '4·7·8',
    note: 'longer holds · deep settle',
    phases: [
      { kind: 'in', label: 'Breathe in', seconds: 4 },
      { kind: 'hold', label: 'Hold', seconds: 7 },
      { kind: 'out', label: 'Breathe out', seconds: 8 },
    ],
  },
];

export const patternById = (id: string): BreathPattern => PATTERNS.find((p) => p.id === id) ?? PATTERNS[0];

/** Seconds in one full cycle of a pattern. */
export const cycleSeconds = (p: BreathPattern): number => p.phases.reduce((s, ph) => s + ph.seconds, 0);
