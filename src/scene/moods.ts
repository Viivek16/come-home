import type { Mood } from '../store/scene';
import dawnUrl from '../assets/backdrops/backdrop-dawn.avif';
import dayUrl from '../assets/backdrops/backdrop-day.avif';
import duskUrl from '../assets/backdrops/backdrop-dusk.avif';
import nightUrl from '../assets/backdrops/backdrop-night.avif';

/**
 * One illustrated backdrop bucket (§Phase5): the static image + the params for
 * the procedural layers that ride on top of it. Imported through Vite's asset
 * pipeline so `src` is a hashed, precacheable URL — never a raw /public path.
 * Hues stay in the app's teal/gold family so the scene reads as one system.
 */
export type Palette = {
  src: string; // L0 backdrop, hashed by Vite
  skyTop: string; // §9 immediate solid — never an empty rectangle
  stars: number; // L2 twinkle count (dawn/night only, else 0)
  bloom: { x: number; y: number; color: string; size: number }; // L3 light source
  scrim: number; // L5 per-bucket scrim strength token (§7)
};

// Filenames map 1:1 to the bucket keys — no mapping layer (§4). skyTop matches
// each image's sky so the load-in solid and the illustration never disagree.
export const MOODS: Record<Mood, Palette> = {
  // scrim tokens tuned by measuring real backdrop pixels: near-white --ink clears
  // WCAG AA (≥4.5) across the whole centre column on every bucket; darker images
  // take a lighter scrim so they aren't needlessly muddied (§7).
  // Dawn — low horizon glow, the last stars fading. Bright sky → near-full scrim.
  dawn: { src: dawnUrl, skyTop: '#0f2f43', stars: 20, bloom: { x: 74, y: 56, color: 'rgba(246,222,178,0.55)', size: 58 }, scrim: 0.95 },
  // Day — the brightest image, upper-centre glow, no stars → the heaviest scrim.
  day: { src: dayUrl, skyTop: '#164a5c', stars: 0, bloom: { x: 50, y: 20, color: 'rgba(252,239,207,0.34)', size: 54 }, scrim: 1.0 },
  // Dusk — a large low sun settling, warm glow; a darker image, so a lighter scrim.
  dusk: { src: duskUrl, skyTop: '#0a2029', stars: 0, bloom: { x: 30, y: 56, color: 'rgba(238,201,155,0.55)', size: 60 }, scrim: 0.82 },
  // Night — cool moon glow, a deep star field; already dark → the lightest scrim.
  night: { src: nightUrl, skyTop: '#050c15', stars: 28, bloom: { x: 76, y: 28, color: 'rgba(234,242,242,0.42)', size: 42 }, scrim: 0.72 },
};

/**
 * Deterministic star field for L2. Fixed positions in the upper 45% + a per-star
 * 3–7s cycle and offset delay, so stars never jump between renders and never
 * pulse in unison (§6). Sliced to each bucket's `stars` count.
 */
export type Star = { x: number; y: number; r: number; delay: number; dur: number };
const frac = (n: number) => {
  const x = Math.sin(n) * 43758.5453;
  return x - Math.floor(x);
};
export const STAR_FIELD: Star[] = Array.from({ length: 30 }, (_, i) => ({
  x: frac(i * 127.1) * 100,
  y: frac(i * 311.7) * 45, // upper 45%
  r: 0.4 + frac(i * 74.7) * 0.7,
  delay: frac(i * 51.3) * 6, // desync so they never pulse together
  dur: 3 + frac(i * 12.9) * 4, // 3–7s
}));
