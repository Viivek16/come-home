import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import BodyGlow from './BodyGlow';
import { HEAD_CY, HEAD_R, widthAt, anchorPoints, anchorY } from './figure';
import { breathValue } from '../breath/useBreath';
import { prefersReduced } from '../lib/motion';
import type { BodyAnchor } from '../data/flows';

/**
 * The luminous figure in 3D (§Phase-polish v3). A slowly turning champagne
 * point-cloud built as a body of revolution from the shared profile plus a head
 * sphere, with the anchor region lit brighter and a soft bloom sprite at the
 * anchor. Breathes on the shared clock. Lazy-loaded, so three.js and this scene
 * never touch the initial bundle or any other screen. WebGL-guarded (falls back to
 * the SVG figure), paused when the tab is hidden or reduced-motion is on, and fully
 * disposed on unmount so it holds no context after the screen is left.
 */

const S = 50; // svg units → world units
const CY = 162; // figure centre in svg-y

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

    // If the (second) WebGL context is ever lost — evicted under GPU pressure on a
    // constrained device — degrade to the SVG figure instead of a blank canvas.
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
    camera.position.set(0, 0, 8);

    const group = new THREE.Group();
    group.rotation.y = 0.5; // start on a 3/4 view so the form reads as 3D
    scene.add(group);

    // ---- point cloud: body of revolution + head sphere ----
    const base = new THREE.Color(0xe8c99b);
    const ay = anchorY(anchor);
    const ayW = ay === null ? null : (CY - ay) / S; // anchor height in world-y
    const pos: number[] = [];
    const col: number[] = [];
    const pushPoint = (x: number, y: number, z: number) => {
      pos.push(x, y, z);
      let bright = 0.55;
      if (ayW === null) bright = 1;
      else bright += 0.95 * Math.exp(-((y - ayW) ** 2) / (2 * 0.085));
      col.push(base.r * bright, base.g * bright, base.b * bright);
    };
    for (let y = 78; y <= 296; y += 3.5) {
      const rw = widthAt(y) / S;
      const yy = (CY - y) / S;
      for (let j = 0; j < 40; j++) {
        const th = (j / 40) * Math.PI * 2;
        pushPoint(rw * Math.cos(th), yy, rw * Math.sin(th));
      }
    }
    const hcy = (CY - HEAD_CY) / S;
    const hr = HEAD_R / S;
    for (let i = 1; i < 16; i++) {
      const phi = (i / 16) * Math.PI;
      for (let j = 0; j < 24; j++) {
        const th = (j / 24) * Math.PI * 2;
        pushPoint(hr * Math.sin(phi) * Math.cos(th), hcy + hr * Math.cos(phi), hr * Math.sin(phi) * Math.sin(th));
      }
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const dot = makeDotTexture();
    const mat = new THREE.PointsMaterial({
      size: 0.06,
      sizeAttenuation: true,
      map: dot,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geom, mat);
    group.add(points);

    // ---- anchor bloom sprite(s) ----
    const spriteTex = makeDotTexture();
    const sprites: THREE.Sprite[] = [];
    const anchorSprite = (x: number, y: number, z: number, scale: number) => {
      const sm = new THREE.SpriteMaterial({ map: spriteTex, color: 0xfff0d6, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
      const sp = new THREE.Sprite(sm);
      sp.position.set(x, y, z);
      sp.scale.setScalar(scale);
      group.add(sp);
      sprites.push(sp);
    };
    if (anchor === 'whole') {
      anchorSprite(0, (CY - 120) / S, 0.5, 1.2);
    } else {
      for (const [ax, ayy] of anchorPoints(anchor)) {
        const dx = ax - 120;
        const rw = anchor === 'head' ? HEAD_R : widthAt(ayy);
        const z = Math.sqrt(Math.max(0, rw * rw - dx * dx));
        anchorSprite(dx / S, (CY - ayy) / S, z / S, 0.85);
      }
    }

    const reduce = prefersReduced();
    let raf = 0;
    let last = performance.now();
    const render = () => {
      renderer.render(scene, camera);
    };
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const b = breathValue();
      group.rotation.y += dt * 0.12; // slow, meditative turn
      group.scale.setScalar(1 + b * 0.04); // breathe
      const sc = 0.85 * (1 + b * 0.18);
      for (const sp of sprites) sp.scale.setScalar(anchor === 'whole' ? 1.2 * (1 + b * 0.18) : sc);
      mat.opacity = 0.72 + b * 0.22;
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

    render(); // always paint one frame (covers reduced-motion + hidden)
    start();

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onLost);
      geom.dispose();
      mat.dispose();
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
