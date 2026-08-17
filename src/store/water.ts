import { useSyncExternalStore } from 'react';
import { currentBand, type TimeBand } from '../lib/timeBand';

/**
 * Living Water target params (§4, §Phase B). Split into two axes:
 *  - DEPTH (route group) drives MOTION energy — intensity + speed.
 *  - TIME BAND drives the PALETTE — base gradient + highlight warmth (glint).
 * <LivingWater /> eases its own current values toward this target over ~1.2s so
 * both route changes and time-of-day boundaries lerp smoothly, never hard-cut.
 */
export type WaterParams = {
  intensity: number;
  deep: [number, number, number];
  top: [number, number, number];
  glint: [number, number, number];
  speed: number;
};

export type DepthGroup = 'opening' | 'response' | 'checkin' | 'hub';

// Motion energy per route group (§4). Colour now comes from the time band below.
const DEPTH: Record<DepthGroup, { intensity: number; speed: number }> = {
  opening: { intensity: 1.0, speed: 1.0 },
  response: { intensity: 0.7, speed: 0.6 },
  checkin: { intensity: 0.45, speed: 0.4 },
  hub: { intensity: 0.55, speed: 0.5 },
};

/**
 * Palette per time band (§Phase B). Teal-dominant throughout (Still Water);
 * the band shifts base luminance + a whisper of warmth/coolness, and the glint
 * carries the accent: rose-champagne at dawn → gold by day → amber at golden
 * hour → cool moon-glow at night. Values are linear 0–1 for the shader. Night is
 * near-black teal (low luminance baked into the base). No red, ever (§5).
 */
type BandPalette = { deep: [number, number, number]; top: [number, number, number]; glint: [number, number, number] };
const BAND_WATER: Record<TimeBand, BandPalette> = {
  dawn:    { deep: [0.035, 0.072, 0.098], top: [0.13, 0.17, 0.215], glint: [0.96, 0.80, 0.72] }, // soft rose-gold, low light
  morning: { deep: [0.03, 0.09, 0.12],   top: [0.09, 0.235, 0.275], glint: [0.96, 0.84, 0.63] }, // brighter teal, warm gold
  midday:  { deep: [0.035, 0.11, 0.145], top: [0.10, 0.27, 0.32],   glint: [0.93, 0.86, 0.70] }, // clear teal, high light
  golden:  { deep: [0.052, 0.085, 0.10], top: [0.165, 0.205, 0.215], glint: [0.99, 0.80, 0.55] }, // amber/gold over teal
  dusk:    { deep: [0.04, 0.055, 0.09],  top: [0.095, 0.125, 0.20],  glint: [0.84, 0.80, 0.86] }, // deep teal → violet
  night:   { deep: [0.012, 0.032, 0.048], top: [0.03, 0.09, 0.12],   glint: [0.72, 0.80, 0.92] }, // near-black teal, cool moon-glow
};

let group: DepthGroup = 'opening';
const listeners = new Set<() => void>();

export function setDepth(next: DepthGroup) {
  if (next === group) return;
  group = next;
  listeners.forEach((l) => l());
}

/** Imperative read for the render loop: motion from depth, palette from the band. */
export const targetParams = (): WaterParams => {
  const d = DEPTH[group];
  const w = BAND_WATER[currentBand()];
  return { intensity: d.intensity, speed: d.speed, deep: [...w.deep], top: [...w.top], glint: [...w.glint] };
};

const to255 = (c: [number, number, number]) => `rgb(${c.map((x) => Math.round(x * 255)).join(', ')})`;

/** Static, band-correct Still-Water gradient for the reduced-motion / no-WebGL
 *  fallback (§Phase B). Same palette the shader tints toward, just not animated. */
export function stillWaterGradient(band: TimeBand): string {
  const w = BAND_WATER[band];
  const bottom: [number, number, number] = [w.deep[0] * 0.6, w.deep[1] * 0.6, w.deep[2] * 0.6];
  return `linear-gradient(180deg, ${to255(w.top)} 0%, ${to255(w.deep)} 58%, ${to255(bottom)} 100%)`;
}

export function useDepth(): DepthGroup {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => group,
    () => group,
  );
}
