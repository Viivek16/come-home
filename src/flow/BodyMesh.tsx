import { useEffect, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/**
 * Interactive glowing wireframe human (§Support · locate). A real anatomical GLB
 * (CC0 MakeHuman base mesh, public/models/human.glb) drawn as its clean quad grid:
 * EdgesGeometry with a low angle threshold drops the triangle diagonals the GLB
 * carries and leaves the even quad wireframe, glowing on the dark water. The user
 * rotates it freely (drag) and zooms (pinch / wheel); panning is off with gentle
 * damping, which suits a calm app. The glow breathes on the shared `breath` clock.
 *
 * Lazy-imported by the locate screen so three + the model touch only this chunk.
 * WebGL-guarded and model-load-guarded → renders `fallback` (the 2D body of light)
 * if either is missing, so the screen never blanks. DPR capped, paused when hidden,
 * fully disposed on unmount so it holds no GPU context after the screen is left.
 *
 * If a swapped-in model still shows stray triangle edges, raise `quadThresholdDeg`
 * (1 → 10..20) until only the quad grid reads.
 */
export default function BodyMesh({
  breath,
  fallback,
  color = '#E3C08D',
  quadThresholdDeg = 1,
  size = 260,
  className = '',
}: {
  breath: number;
  fallback: ReactNode;
  color?: string;
  quadThresholdDeg?: number;
  size?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const breathRef = useRef(breath);
  breathRef.current = breath; // latest breath, read imperatively in the RAF loop

  const w = size;
  const h = Math.round(size * 1.3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false; // the GLB may resolve after a fast exit — don't touch a torn-down renderer

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      if (!disposed) setFailed(true);
    };
    canvas.addEventListener('webglcontextlost', onLost, false);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
      canvas.removeEventListener('webglcontextlost', onLost);
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); // cap DPR (§4)
    renderer.setSize(w, h, false);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    camera.position.set(0.9, 0.15, 4.3);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false; // calm: rotate + zoom only
    controls.rotateSpeed = 0.9;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 2.2;
    controls.maxDistance = 8;
    controls.target.set(0, 0, 0);

    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending, // stacks front + back edges into a soft glow
    });
    let lines: THREE.LineSegments | null = null;
    let edges: THREE.EdgesGeometry | null = null;

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      controls.update();
      const b = breathRef.current;
      material.opacity = 0.42 + b * 0.28; // brightness breathes on the shared clock
      if (lines) lines.scale.setScalar(1 + b * 0.02); // a gentle swell
      renderer.render(scene, camera);
    };
    const start = () => {
      if (!raf && !document.hidden) tick();
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);

    const loader = new GLTFLoader();
    loader.load(
      `${import.meta.env.BASE_URL}models/human.glb`,
      (gltf) => {
        if (disposed) return;
        // Collect every mesh as a position-only geometry in world space, merge,
        // then take the quad wireframe. Position-only + a consistent index keeps
        // the merge valid across multi-mesh models.
        gltf.scene.updateMatrixWorld(true);
        const parts: THREE.BufferGeometry[] = [];
        gltf.scene.traverse((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh || !m.geometry) return;
          const src = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
          src.applyMatrix4(m.matrixWorld);
          const g = new THREE.BufferGeometry();
          g.setAttribute('position', src.getAttribute('position').clone());
          parts.push(g);
          src.dispose();
        });
        if (!parts.length) {
          setFailed(true);
          return;
        }
        const merged = parts.length === 1 ? parts[0] : (mergeGeometries(parts, false) ?? parts[0]);

        // Normalise: recentre to origin, scale so the figure fills the frame.
        merged.computeBoundingBox();
        const bb = merged.boundingBox!;
        const dim = new THREE.Vector3();
        bb.getSize(dim);
        const centre = new THREE.Vector3();
        bb.getCenter(centre);
        merged.translate(-centre.x, -centre.y, -centre.z);
        const s = 2.6 / Math.max(dim.y, 1e-3);
        merged.scale(s, s, s);

        edges = new THREE.EdgesGeometry(merged, quadThresholdDeg);
        lines = new THREE.LineSegments(edges, material);
        scene.add(lines);

        // Source geometry is spent — free it before we start drawing.
        parts.forEach((p) => p !== merged && p.dispose());
        merged.dispose();
        gltf.scene.traverse((o) => {
          const m = o as THREE.Mesh;
          if (!m.isMesh) return;
          m.geometry?.dispose();
          const mat = m.material as THREE.Material & { map?: THREE.Texture };
          mat?.map?.dispose?.();
          (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x?.dispose());
        });

        setReady(true);
        start();
      },
      undefined,
      () => !disposed && setFailed(true), // model missing / decode error → 2D fallback
    );

    return () => {
      disposed = true;
      stop();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onLost);
      controls.dispose();
      edges?.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [w, h, color, quadThresholdDeg]);

  if (failed) return <>{fallback}</>;
  return (
    <div className={className} style={{ position: 'relative', width: w, height: h }}>
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{ width: w, height: h, display: 'block', touchAction: 'none', opacity: ready ? 1 : 0, transition: 'opacity 0.6s ease' }}
      />
      {!ready && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{fallback}</div>}
    </div>
  );
}
