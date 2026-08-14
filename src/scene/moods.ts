import type { Mood } from '../store/scene';

/** A single illustrated landscape palette. All hues stay in the app's teal/gold
 *  family so the scene reads as one system, never a stock illustration. */
export type Palette = {
  skyTop: string;
  skyHorizon: string;
  glow: string; // horizon glow behind the ridge
  body: { kind: 'sun' | 'moon'; x: number; y: number; color: string; r: number };
  stars: number; // 0 = none
  clouds: boolean;
  birds: number; // drifting birds (morning/day)
  leaves: number; // falling leaves (day/dusk)
  ridgeFar: string;
  ridgeNear: string;
  tree: string;
  scrim: string; // rising content bleed at the base
};

export const MOODS: Record<Mood, Palette> = {
  dawn: {
    skyTop: '#16384a',
    skyHorizon: '#3a6a78',
    glow: 'rgba(232,201,155,0.34)',
    body: { kind: 'sun', x: 74, y: 60, color: '#F4DDB4', r: 15 },
    stars: 10,
    clouds: true,
    birds: 3,
    leaves: 0,
    ridgeFar: '#274a58',
    ridgeNear: '#12303c',
    tree: '#0c2028',
    scrim: 'rgba(8,22,30,0.0)',
  },
  day: {
    skyTop: '#1b4d5e',
    skyHorizon: '#4a8296',
    glow: 'rgba(232,201,155,0.22)',
    body: { kind: 'sun', x: 78, y: 40, color: '#FBEBC8', r: 13 },
    stars: 0,
    clouds: true,
    birds: 2,
    leaves: 5,
    ridgeFar: '#356072',
    ridgeNear: '#173a48',
    tree: '#102a34',
    scrim: 'rgba(8,22,30,0.0)',
  },
  dusk: {
    skyTop: '#0d2733',
    skyHorizon: '#2b5163',
    glow: 'rgba(232,201,155,0.30)',
    body: { kind: 'sun', x: 30, y: 66, color: '#EAC99B', r: 12 },
    stars: 26,
    clouds: false,
    birds: 0,
    leaves: 3,
    ridgeFar: '#1e3f4c',
    ridgeNear: '#0e2630',
    tree: '#081b22',
    scrim: 'rgba(6,18,25,0.0)',
  },
  night: {
    skyTop: '#060e17',
    skyHorizon: '#0f2b37',
    glow: 'rgba(232,201,155,0.16)',
    body: { kind: 'moon', x: 76, y: 34, color: '#EAF2F2', r: 11 },
    stars: 64,
    clouds: false,
    birds: 0,
    leaves: 0,
    ridgeFar: '#132e39',
    ridgeNear: '#08171e',
    tree: '#04101557',
    scrim: 'rgba(4,12,18,0.0)',
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
