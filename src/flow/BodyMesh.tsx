// BodyMesh.tsx
// Interactive glowing wireframe human for the Support "locate" screen.
// Loads a real human GLB, renders its quad wireframe as glowing lines on a
// transparent canvas over the water background, and lets the user rotate and
// zoom it freely. Matches the reference look by using EdgesGeometry with a low
// angle threshold, which drops the triangle diagonals and leaves the clean quad
// grid, instead of a messy full triangle wireframe.
//
// The lines use normal (not additive) blending so dense-topology regions read at
// the same brightness as the rest instead of glaring white. ACES filmic tone
// mapping + depth fog give a luminous, volumetric read. The figure breathes on
// the shared clock.
//
// `region` drives the accent:
//   'flow'  — cancer / whole-body: one light descends from the head, branching to
//             both hands and down the spine at once, then to both legs, gathering
//             back up to the head on a loop (all dots synced, no gaps).
//   other   — a body area (brain, lungs, belly, pelvis, kidneys, joints, aura):
//             soft light rests on that region and breathes, emphasising it.
//
// Requires: npm i three
// Model: put a clean quad-topology human GLB at public/models/human.glb.

import { useEffect, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Soft round light: hot white core → warm gold → clear.
function makeGlowTexture(): THREE.Texture {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0.0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,244,222,0.85)')
  g.addColorStop(0.5, 'rgba(227,192,141,0.35)')
  g.addColorStop(1.0, 'rgba(227,192,141,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const tex = new THREE.Texture(c)
  tex.needsUpdate = true
  return tex
}

// Position at u∈[0,1] along a polyline of Vector3 waypoints (even per-segment).
function samplePath(pts: THREE.Vector3[], u: number, out: THREE.Vector3): THREE.Vector3 {
  const n = pts.length - 1
  const f = Math.max(0, Math.min(1, u)) * n
  const i = Math.min(Math.floor(f), n - 1)
  return out.copy(pts[i]).lerp(pts[i + 1], f - i)
}
const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const smooth = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t) } // smoothstep

type Props = {
  modelUrl?: string
  color?: string // line colour; app gold by default
  quadThresholdDeg?: number
  breath?: number // 0..1 from the app breath clock; own gentle pulse if omitted
  region?: string // 'flow' | 'brain' | 'lungs' | 'belly' | 'pelvis' | 'kidneys' | 'joints' | 'aura'
  autoRotate?: boolean
  fallback?: ReactNode // rendered if WebGL / the model is unavailable
  className?: string
}

const POOL = 6 // sprites reused for the flow dots (5) or the region highlight (≤6)

export default function BodyMesh({
  modelUrl = '/models/human.glb',
  color = '#E3C08D',
  quadThresholdDeg = 1,
  breath,
  region = 'flow',
  autoRotate = false,
  fallback = null,
  className,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null)
  const breathRef = useRef<number | undefined>(breath)
  breathRef.current = breath
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    } catch {
      setFailed(true)
      return
    }

    let disposed = false
    let raf = 0
    const clock = new THREE.Clock()
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    const width = mount.clientWidth || 1
    const height = mount.clientHeight || 1

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x08201f, 5.2, 7.4)
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100)
    camera.position.set(0, 0, 6)

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = false
    controls.rotateSpeed = 0.7
    controls.autoRotate = autoRotate
    controls.autoRotateSpeed = 0.5
    controls.minDistance = 3
    controls.maxDistance = 9

    const inner = new THREE.Group()
    const outer = new THREE.Group()
    outer.add(inner)
    scene.add(outer)
    let baseScale = 1

    // Normal blending → dense mesh regions stay as bright as sparse ones.
    const lineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      blending: THREE.NormalBlending,
    })

    // Shared soft-glow texture + a small pool of additive sprites (depthTest off
    // so the light reads as an inner glow).
    const glowTex = makeGlowTexture()
    const mats: THREE.SpriteMaterial[] = []
    const dots: THREE.Sprite[] = []
    for (let i = 0; i < POOL; i++) {
      const m = new THREE.SpriteMaterial({ map: glowTex, transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })
      const s = new THREE.Sprite(m)
      s.visible = false
      mats.push(m)
      dots.push(s)
    }

    // Filled once the model's bounds and anatomical anchors are known.
    type Flow = { center: THREE.Vector3[]; armL: THREE.Vector3[]; armR: THREE.Vector3[]; legL: THREE.Vector3[]; legR: THREE.Vector3[] }
    let flow: Flow | null = null
    let highlight: { points: THREE.Vector3[]; size: number } | null = null
    const isFlow = region === 'flow'
    const tmp = new THREE.Vector3()
    const PERIOD = 12 // seconds for a full descend + gather cycle — slow, meditative

    const loader = new GLTFLoader()
    loader.load(
      modelUrl,
      (gltf) => {
        if (disposed) return
        gltf.scene.updateWorldMatrix(true, true)
        const verts: Float32Array[] = []
        gltf.scene.traverse((child) => {
          const mesh = child as THREE.Mesh
          if ((mesh as unknown as { isMesh?: boolean }).isMesh && mesh.geometry) {
            const geo = mesh.geometry.clone()
            geo.applyMatrix4(mesh.matrixWorld)
            verts.push((geo.getAttribute('position').array as Float32Array).slice())
            const edges = new THREE.EdgesGeometry(geo, quadThresholdDeg)
            inner.add(new THREE.LineSegments(edges, lineMat))
            geo.dispose()
          }
        })

        const box = new THREE.Box3().setFromObject(inner)
        const size = new THREE.Vector3()
        const center = new THREE.Vector3()
        box.getSize(size)
        box.getCenter(center)
        inner.position.sub(center)
        baseScale = 3.4 / (size.y || 1)
        outer.scale.setScalar(baseScale)

        const top = box.max.y
        const H = size.y
        const W = size.x
        const cx = center.x
        const cz = center.z
        // Real hands from the mesh so the arm light reaches the actual fingertips.
        const handL = new THREE.Vector3(Infinity, 0, 0)
        const handR = new THREE.Vector3(-Infinity, 0, 0)
        for (const arr of verts) {
          for (let i = 0; i < arr.length; i += 3) {
            const x = arr[i]
            if (x < handL.x) handL.set(x, arr[i + 1], arr[i + 2])
            if (x > handR.x) handR.set(x, arr[i + 1], arr[i + 2])
          }
        }
        // Spine + limb anchors as body fractions, all at mid-depth (cz) so the
        // light stays *inside* the volume — the legs no longer spill outside.
        const P = (fx: number, fy: number) => new THREE.Vector3(cx + fx * W, top - fy * H, cz)
        const head = P(0, 0.05)
        const throat = P(0, 0.15)
        const chest = P(0, 0.26)
        const navel = P(0, 0.42)
        const pelvis = P(0, 0.52)
        const shL = P(-0.1, 0.16), shR = P(0.1, 0.16)
        const elbowL = shL.clone().lerp(handL, 0.5), elbowR = shR.clone().lerp(handR, 0.5)
        const kneeL = P(-0.1, 0.72), kneeR = P(0.1, 0.72)
        const ankleL = P(-0.11, 0.92), ankleR = P(0.11, 0.92)
        const lungL = P(-0.1, 0.26), lungR = P(0.1, 0.26)
        const kidneyL = P(-0.13, 0.45), kidneyR = P(0.13, 0.45)

        flow = {
          center: [head, throat, chest, navel, pelvis],
          armL: [throat, shL, elbowL, handL],
          armR: [throat, shR, elbowR, handR],
          legL: [pelvis, kneeL, ankleL],
          legR: [pelvis, kneeR, ankleR],
        }
        const regions: Record<string, { points: THREE.Vector3[]; size: number }> = {
          brain: { points: [head], size: H * 0.15 },
          lungs: { points: [lungL, lungR], size: H * 0.12 },
          belly: { points: [navel], size: H * 0.14 },
          pelvis: { points: [pelvis], size: H * 0.12 },
          kidneys: { points: [kidneyL, kidneyR], size: H * 0.1 },
          joints: { points: [elbowL, elbowR, handL, handR, kneeL, kneeR], size: H * 0.06 },
          aura: { points: [chest], size: H * 0.34 },
        }
        if (!isFlow) highlight = regions[region] ?? regions.aura

        const flowSize = H * 0.055
        for (const s of dots) s.scale.setScalar(flowSize)
        inner.add(...dots)
      },
      undefined,
      (err) => {
        if (disposed) return
        console.warn('BodyMesh: model failed to load', err)
        setFailed(true)
      },
    )

    const place = (i: number, p: THREE.Vector3, op: number, sizeAbs?: number) => {
      const s = dots[i]
      s.position.copy(p)
      s.visible = op > 0.001
      mats[i].opacity = op
      if (sizeAbs) s.scale.setScalar(sizeAbs)
    }

    const animate = () => {
      raf = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      let b = breathRef.current
      if (b == null) {
        const cyc = 10
        const p = (t % cyc) / cyc
        b = p < 0.4 ? p / 0.4 : 1 - (p - 0.4) / 0.6
      }
      lineMat.opacity = 0.62 + 0.16 * b
      outer.scale.setScalar(baseScale * (1 + 0.012 * b)) // whole figure breathes — quietly alive

      if (isFlow && flow) {
        if (reduceMotion) {
          place(0, flow.center[2], 0.55) // hold one light at the chest
          for (let i = 1; i < POOL; i++) dots[i].visible = false
        } else {
          // One synchronised wave: w 0→1 spreads (head → arms + spine → legs),
          // 1→0 gathers back to the head. Continuous — no phase gaps.
          const tt = (t / PERIOD) % 1
          const w = smooth(tt < 0.5 ? tt * 2 : 2 - tt * 2)
          const pulse = 0.9 + 0.1 * Math.sin(t * 2)
          const cp = clamp01(w / 0.55)
          const ap = clamp01((w - 0.06) / 0.5)
          const lp = clamp01((w - 0.5) / 0.5)
          place(0, samplePath(flow.center, cp, tmp).clone(), 0.9 * smooth(w / 0.04) * pulse)
          const aop = 0.9 * smooth(ap / 0.16) * pulse
          place(1, samplePath(flow.armL, ap, tmp).clone(), aop)
          place(2, samplePath(flow.armR, ap, tmp).clone(), aop)
          const lop = 0.9 * smooth(lp / 0.16) * pulse
          place(3, samplePath(flow.legL, lp, tmp).clone(), lop)
          place(4, samplePath(flow.legR, lp, tmp).clone(), lop)
          dots[5].visible = false
        }
      } else if (highlight) {
        // Region emphasis: soft light rests on the area and breathes with it.
        const op = (reduceMotion ? 0.55 : 0.5 + 0.32 * b)
        const scl = highlight.size * (reduceMotion ? 1 : 0.94 + 0.1 * b)
        for (let i = 0; i < POOL; i++) {
          if (i < highlight.points.length) place(i, highlight.points[i], op, scl)
          else dots[i].visible = false
        }
      }

      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = mount.clientWidth || 1
      const h = mount.clientHeight || 1
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(mount)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      controls.dispose()
      inner.traverse((o) => {
        const seg = o as THREE.LineSegments
        if (seg.geometry) seg.geometry.dispose()
      })
      lineMat.dispose()
      for (const m of mats) m.dispose()
      glowTex.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [modelUrl, color, quadThresholdDeg, autoRotate, region])

  if (failed) return <>{fallback}</>
  return <div ref={mountRef} className={className} style={{ width: '100%', height: '100%' }} />
}
