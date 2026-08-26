import type { BodyAnchor } from '../data/flows';

/**
 * Shared figure geometry (§Phase-polish v3). The seated meditator as a profile of
 * revolution, reused by the 3D point-cloud figure and the SVG fallback so both
 * agree on shape and anchor positions. Coordinates match the 240×340 SVG space:
 * x centred on 120, y down from the head.
 */
export const CX = 120;
export const HEAD_CY = 52;
export const HEAD_R = 24;
export const TOP_Y = 78;
export const BASE_Y = 296;

// Half-width of the body at height y (neck → shoulders → waist → lap).
const PROFILE: [number, number][] = [
  [78, 9],
  [92, 34],
  [116, 40],
  [148, 33],
  [180, 41],
  [212, 55],
  [250, 74],
  [274, 70],
  [296, 40],
];
export function widthAt(y: number): number {
  if (y <= PROFILE[0][0]) return PROFILE[0][1];
  for (let i = 1; i < PROFILE.length; i++) {
    const [y0, w0] = PROFILE[i - 1];
    const [y1, w1] = PROFILE[i];
    if (y <= y1) return w0 + (w1 - w0) * ((y - y0) / (y1 - y0));
  }
  return PROFILE[PROFILE.length - 1][1];
}

const POINTS: Record<Exclude<BodyAnchor, 'whole' | 'hands'>, [number, number]> = {
  head: [120, 52],
  throat: [120, 88],
  chest: [120, 120],
  solarPlexus: [120, 148],
  belly: [120, 178],
  sacral: [120, 208],
  lowerBack: [120, 226],
};
export const HANDS: [number, number][] = [
  [82, 248],
  [158, 248],
];

/** The 2D anchor point(s) for a given anchor; empty for `whole`. */
export function anchorPoints(anchor: BodyAnchor): [number, number][] {
  if (anchor === 'whole') return [];
  if (anchor === 'hands') return HANDS;
  return [POINTS[anchor]];
}

/** The y at which the anchor sits (for brightening nearby geometry); null for whole. */
export function anchorY(anchor: BodyAnchor): number | null {
  if (anchor === 'whole') return null;
  if (anchor === 'hands') return 248;
  return POINTS[anchor][1];
}
