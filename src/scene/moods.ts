import type { Mood } from '../store/scene';

/** A single illustrated landscape palette. All hues stay in the app's teal/gold
 *  family so the scene reads as one system, never a stock illustration — warmth
 *  comes from the gold glow, never a second hue (§3). */
export type Palette = {
  skyTop: string;
  skyMid: string;
  skyHorizon: string;
  glow: string; // horizon glow behind the ridge
  body: { kind: 'sun' | 'moon'; x: number; y: number; color: string; r: number };
  rays: boolean; // sun-ray fan behind the body (morning/afternoon)
  stars: number; // 0 = none
  clouds: number; // drifting cloud puffs (0 = none)
  birds: number; // drifting birds (morning/day)
  leaves: number; // falling leaves (day/dusk)
  fireflies: number; // gold motes near the water (dusk/night)
  shooting: boolean; // a shooting star (night)
  reflect: boolean; // the sun/moon reflected on the waterline
  ridgeFar: string;
  ridgeMid: string;
  ridgeNear: string;
  tree: string;
};

export const MOODS: Record<Mood, Palette> = {
  // MORNING — a low sun rising, soft rays, birds, the last stars fading.
  dawn: {
    skyTop: '#0f2f43',
    skyMid: '#295a68',
    skyHorizon: '#5a8a8f',
    glow: 'rgba(240,205,150,0.42)',
    body: { kind: 'sun', x: 74, y: 58, color: '#F6E1B6', r: 15 },
    rays: true,
    stars: 6,
    clouds: 3,
    birds: 3,
    leaves: 0,
    fireflies: 0,
    shooting: false,
    reflect: true,
    ridgeFar: '#2c525f',
    ridgeMid: '#1c3f4b',
    ridgeNear: '#0f2c37',
    tree: '#0a1e26',
  },
  // AFTERNOON — a high sun, clear bright sky, strong rays, drifting leaves.
  day: {
    skyTop: '#164a5c',
    skyMid: '#33768a',
    skyHorizon: '#69a7b4',
    glow: 'rgba(240,215,165,0.26)',
    body: { kind: 'sun', x: 78, y: 30, color: '#FCEFCF', r: 14 },
    rays: true,
    stars: 0,
    clouds: 4,
    birds: 2,
    leaves: 6,
    fireflies: 0,
    shooting: false,
    reflect: true,
    ridgeFar: '#3d6c7e',
    ridgeMid: '#255463',
    ridgeNear: '#153843',
    tree: '#0e2a34',
  },
  // EVENING — a large low sun settling, warm glow, first fireflies, quiet.
  dusk: {
    skyTop: '#0a2029',
    skyMid: '#234a58',
    skyHorizon: '#5d7f80',
    glow: 'rgba(238,196,150,0.4)',
    body: { kind: 'sun', x: 28, y: 62, color: '#EEC99B', r: 16 },
    rays: true,
    stars: 20,
    clouds: 1,
    birds: 0,
    leaves: 3,
    fireflies: 6,
    shooting: false,
    reflect: true,
    ridgeFar: '#22434f',
    ridgeMid: '#152f3a',
    ridgeNear: '#0b2028',
    tree: '#07161d',
  },
  // NIGHT — a crescent moon, a deep star field, fireflies, a shooting star.
  night: {
    skyTop: '#050c15',
    skyMid: '#0a2029',
    skyHorizon: '#123540',
    glow: 'rgba(232,201,155,0.18)',
    body: { kind: 'moon', x: 76, y: 30, color: '#EAF2F2', r: 12 },
    rays: false,
    stars: 70,
    clouds: 0,
    birds: 0,
    leaves: 0,
    fireflies: 5,
    shooting: true,
    reflect: true,
    ridgeFar: '#132e39',
    ridgeMid: '#0c222b',
    ridgeNear: '#07151c',
    tree: '#040f14',
  },
};

// Deterministic star field (fixed positions so stars never jump between renders).
export type Star = { x: number; y: number; r: number; d: number };
export const STAR_FIELD: Star[] = Array.from({ length: 70 }, (_, i) => {
  const h = Math.sin(i * 127.1) * 43758.5453;
  const h2 = Math.sin(i * 311.7) * 24634.6345;
  const h3 = Math.sin(i * 74.7) * 9812.213;
  const f = (n: number) => n - Math.floor(n);
  return { x: f(h) * 100, y: f(h2) * 52, r: 0.35 + f(h3) * 0.7, d: f(h3) * 4 };
});

// Deterministic cloud + firefly fields — stable across renders.
export const CLOUD_FIELD = [
  { top: 16, w: 168, h: 34, dur: 96, delay: 0, op: 0.5 },
  { top: 26, w: 118, h: 24, dur: 128, delay: -48, op: 0.36 },
  { top: 12, w: 96, h: 20, dur: 150, delay: -30, op: 0.28 },
  { top: 34, w: 140, h: 28, dur: 112, delay: -70, op: 0.3 },
];
export const FIREFLY_FIELD = [
  { x: 20, y: 70, delay: 0 },
  { x: 38, y: 62, delay: -2 },
  { x: 55, y: 74, delay: -4.5 },
  { x: 71, y: 64, delay: -1.5 },
  { x: 85, y: 72, delay: -3 },
  { x: 12, y: 60, delay: -6 },
];
