import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import BodyGlow from './BodyGlow';
import { breathValue } from '../breath/useBreath';
import { prefersReduced } from '../lib/motion';
import type { BodyAnchor } from '../data/flows';

/**
 * The luminous figure in 3D (§Phase-polish v4). A serene humanoid drawn as a
 * glowing skeleton — head, spine, arms and legs as champagne bones threaded with
 * bright joints — turning slowly so its depth reads, breathing on the shared clock,
 * with the anchor region lit brighter and a soft bloom at the anchor joint. Lazy-
 * loaded so three.js never touches the initial bundle or any other screen. WebGL-
 * guarded (falls back to the SVG figure), paused when hidden / reduced-motion, and
 * fully disposed on unmount so it holds no context after the screen is left.
 */

type V3 = [number, number, number];
// A calm, front-facing figure, floating: head, spine, gently opened arms, legs.
const J: Record<string, V3> = {
  headTop: [0, 2.45, 0],
  skull: [0, 2.12, 0],
  neck: [0, 1.76, 0],
  chest: [0, 1.4, 0],
  solar: [0, 1.05, 0],
  belly: [0, 0.7, 0],
  pelvis: [0, 0.32, 0],
  shL: [-0.5, 1.66, 0],
  shR: [0.5, 1.66, 0],
  elL: [-0.68, 1.1, 0.1],
  elR: [0.68, 1.1, 0.1],
  wrL: [-0.72, 0.54, 0.2],
  wrR: [0.72, 0.54, 0.2],
  hipL: [-0.26, 0.28, 0],
  hipR: [0.26, 0.28, 0],
  knL: [-0.28, -0.52, 0.06],
  knR: [0.28, -0.52, 0.06],
  anL: [-0.26, -1.36, 0.1],
  anR: [0.26, -1.36, 0.1],
};
const BONES: [string, string][] = [
  ['headTop', 'skull'], ['skull', 'neck'], ['neck', 'chest'], ['chest', 'solar'], ['solar', 'belly'], ['belly', 'pelvis'],
  ['neck', 'shL'], ['neck', 'shR'], ['shL', 'elL'], ['elL', 'wrL'], ['shR', 'elR'], ['elR', 'wrR'],
  ['pelvis', 'hipL'], ['pelvis', 'hipR'], ['hipL', 'knL'], ['knL', 'anL'], ['hipR', 'knR'], ['knR', 'anR'],
];
const ANCHOR_JOINT: Record<Exclude<BodyAnchor, 'whole' | 'hands'>, string> = {
  head: 'skull', throat: 'neck', chest: 'chest', solarPlexus: 'solar', belly: 'belly', sacral: 'pelvis', lowerBack: 'pelvis',
};
const CENTER_Y = 0.55; // recentre the figure vertically about the origin

function makeDotTexture(): THREE.Texture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,244,224,0.75)');
  g.addColorStop(1, 'rgba(255,236,200,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.Texture(c);
  tex.needsUpdate = true;
  return tex;
}

export default function BodyMesh3D({ anchor, size = 240, className = '' }: { anchor: BodyAnchor; size?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const w = size;
  const h = size * (340 / 240);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onLost = (e: Event) => {
      e.preventDefault();
      setFailed(true);
    };
    canvas.addEventListener('webglcontextlost', onLost, false);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power', failIfMajorPerformanceCaveat: false });
    } catch {
      canvas.removeEventListener('webglcontextlost', onLost);
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    const group = new THREE.Group();
    group.rotation.y = 0.42; // a 3/4 view so the depth reads at rest
    scene.add(group);

    // anchor joint position(s) in 3D
    const anchorPts: V3[] = anchor === 'whole' ? [] : anchor === 'hands' ? [J.wrL, J.wrR] : [J[ANCHOR_JOINT[anchor]]];
    const base = new THREE.Color(0xe8c99b);
    const brightAt = (x: number, y: number, z: number): number => {
      if (anchor === 'whole') return 1;
      let m = 0.5;
      for (const [ax, ay, az] of anchorPts) m += 0.95 * Math.exp(-(((x - ax) ** 2 + (y - ay) ** 2 + (z - az) ** 2)) / (2 * 0.05));
      return Math.min(1.7, m);
    };

    // bones (points sampled along each segment) + head sphere shell
    const bonePos: number[] = [];
    const boneCol: number[] = [];
    const push = (arrP: number[], arrC: number[], x: number, y: number, z: number, mul = 1) => {
      arrP.push(x, y - CENTER_Y, z);
      const br = Math.min(1.9, brightAt(x, y, z) * mul);
      arrC.push(base.r * br, base.g * br, base.b * br);
    };
    for (const [a, b] of BONES) {
      const pa = J[a];
      const pb = J[b];
      const N = 13;
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        push(bonePos, boneCol, pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t, pa[2] + (pb[2] - pa[2]) * t);
      }
    }
    const [sx, sy, sz] = J.skull;
    const hr = 0.33;
    for (let i = 1; i < 11; i++) {
      const phi = (i / 11) * Math.PI;
      for (let j = 0; j < 15; j++) {
        const th = (j / 15) * Math.PI * 2;
        push(bonePos, boneCol, sx + hr * Math.sin(phi) * Math.cos(th), sy + hr * Math.cos(phi), sz + hr * Math.sin(phi) * Math.sin(th));
      }
    }

    // joints (brighter, larger)
    const jointPos: number[] = [];
    const jointCol: number[] = [];
    for (const k in J) {
      const [x, y, z] = J[k];
      push(jointPos, jointCol, x, y, z, 1.25);
    }

    const dot = makeDotTexture();
    const mkPoints = (pos: number[], col: number[], sz2: number, op: number) => {
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geom.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      const mat = new THREE.PointsMaterial({ size: sz2, sizeAttenuation: true, map: dot, vertexColors: true, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending });
      const pts = new THREE.Points(geom, mat);
      group.add(pts);
      return { geom, mat };
    };
    const bones = mkPoints(bonePos, boneCol, 0.05, 0.8);
    const joints = mkPoints(jointPos, jointCol, 0.11, 0.95);

    // anchor bloom sprite(s)
    const spriteTex = makeDotTexture();
    const sprites: THREE.Sprite[] = [];
    const addSprite = (x: number, y: number, z: number, scale: number) => {
      const sm = new THREE.SpriteMaterial({ map: spriteTex, color: 0xfff0d6, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
      const sp = new THREE.Sprite(sm);
      sp.position.set(x, y - CENTER_Y, z);
      sp.scale.setScalar(scale);
      group.add(sp);
      sprites.push(sp);
    };
    const baseSprite = anchor === 'whole' ? 0.62 : 0.5;
    if (anchor === 'whole') addSprite(J.chest[0], J.chest[1], J.chest[2] + 0.2, baseSprite);
    else for (const [x, y, z] of anchorPts) addSprite(x, y, z + 0.12, baseSprite);

    const reduce = prefersReduced();
    let raf = 0;
    let last = performance.now();
    const render = () => renderer.render(scene, camera);
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const b = breathValue();
      group.rotation.y += dt * 0.12;
      group.scale.setScalar(1 + b * 0.04);
      const sc = baseSprite * (1 + b * 0.18);
      for (const sp of sprites) sp.scale.setScalar(sc);
      bones.mat.opacity = 0.7 + b * 0.2;
      render();
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (raf || reduce || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);

    render();
    start();

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onLost);
      bones.geom.dispose();
      bones.mat.dispose();
      joints.geom.dispose();
      joints.mat.dispose();
      dot.dispose();
      spriteTex.dispose();
      for (const sp of sprites) sp.material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [anchor, w, h]);

  if (failed) return <BodyGlow anchor={anchor} size={size} className={className} />;
  return <canvas ref={canvasRef} className={className} style={{ width: w, height: h, display: 'block' }} aria-hidden />;
}
