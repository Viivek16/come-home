// BodyMesh.tsx
// Interactive glowing wireframe human for the Support "locate" screen.
// Loads a real human GLB, renders its quad wireframe as glowing lines on a
// transparent canvas over the water background, and lets the user rotate and
// zoom it freely. Matches the reference look by using EdgesGeometry with a low
// angle threshold, which drops the triangle diagonals and leaves the clean quad
// grid, instead of a messy full triangle wireframe.
//
// Premium pass: the lines use normal (not additive) blending so dense-topology
// regions — face, hands, feet, groin — read at the same brightness as the rest
// instead of glaring white where the quads bunch up. ACES filmic tone mapping +
// depth fog give a luminous, volumetric read (near lines gold, far lines recede
// into the dark). A single soft light then travels *inside* the body along its
// anatomical channels — head → both arms → spine to the navel → both legs → and
// back up to the head — the one deliberate motion accent, slow and eased, paused
// under prefers-reduced-motion.
//
// Requires: npm i three
// Model: put a clean quad-topology human GLB at public/models/human.glb.
// See the accompanying prompt for CC0 sourcing options.

import { useEffect, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Soft round light for the travelling point: hot white core → warm gold → clear.
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
const easeInOut = (u: number) => u * u * (3 - 2 * u) // smoothstep — eased on-screen movement

type Props = {
  modelUrl?: string
  // Line colour. App accent gold by default. Try '#5FE3D8' for the cyan look.
  color?: string
  // Degrees. 1 gives the cleanest quad grid. Raise to 10 to 20 if a model shows
  // too many stray edges.
  quadThresholdDeg?: number
  // Optional external breath value 0..1 from the app breath clock. If omitted the
  // component runs its own gentle ~4s in, 6s out pulse.
  breath?: number
  autoRotate?: boolean
  // Rendered if WebGL is unavailable or the model fails to load. Pass the existing
  // 2D body-of-light here so the screen never blanks.
  fallback?: ReactNode
  className?: string
}

export default function BodyMesh({
  modelUrl = '/models/human.glb',
  color = '#E3C08D',
  quadThresholdDeg = 1,
  breath,
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
    // Depth fog: the same near-black teal the water settles to, tuned so the far
    // side of the figure dissolves into it — volume without a heavier shader.
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

    // Normal blending caps brightness at the line colour, so dense mesh regions
    // stay as bright as sparse ones — no more white glare at the hands and face.
    const lineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      blending: THREE.NormalBlending,
    })

    // The travelling light: a shared soft-glow material + two sprites (one for
    // single-file stretches, both for the arm and leg branches). Additive so the
    // light itself blooms, depthTest off so it reads as an inner glow.
    const glowTex = makeGlowTexture()
    const dotMat = new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })
    const sprite0 = new THREE.Sprite(dotMat)
    const sprite1 = new THREE.Sprite(dotMat)
    sprite0.visible = false
    sprite1.visible = false

    // Animation state, filled once the model's bounds and anchors are known.
    type PathKey = 'headThroat' | 'armL' | 'armR' | 'torso' | 'legL' | 'legR' | 'ret'
    let paths: Record<PathKey, THREE.Vector3[]> | null = null
    const chestPos = new THREE.Vector3()
    const tmp = new THREE.Vector3()
    const LOOP = 17 // seconds for a full circuit — slow and meditative

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

        // Center the figure at the origin and scale it to a consistent height.
        const box = new THREE.Box3().setFromObject(inner)
        const size = new THREE.Vector3()
        const center = new THREE.Vector3()
        box.getSize(size)
        box.getCenter(center)
        inner.position.sub(center)
        outer.scale.setScalar(3.4 / (size.y || 1))

        // Anatomical anchors (model space). Extremes come from real vertices so the
        // light hugs the actual hands and feet; the spine points are body fractions.
        const top = box.max.y
        const bottom = box.min.y
        const H = top - bottom
        const W = size.x
        const cx = center.x
        const cz = center.z
        const handL = new THREE.Vector3(Infinity, 0, 0)
        const handR = new THREE.Vector3(-Infinity, 0, 0)
        const footL = new THREE.Vector3(0, Infinity, 0)
        const footR = new THREE.Vector3(0, Infinity, 0)
        for (const arr of verts) {
          for (let i = 0; i < arr.length; i += 3) {
            const x = arr[i]
            const y = arr[i + 1]
            const z = arr[i + 2]
            if (x < handL.x) handL.set(x, y, z)
            if (x > handR.x) handR.set(x, y, z)
            if (x < cx && y < footL.y) footL.set(x, y, z)
            if (x >= cx && y < footR.y) footR.set(x, y, z)
          }
        }
        const P = (fx: number, fy: number) => new THREE.Vector3(cx + fx * W, top - fy * H, cz)
        const head = P(0, 0.03)
        const throat = P(0, 0.15)
        const chest = P(0, 0.25)
        const navel = P(0, 0.42)
        const pelvis = P(0, 0.52)
        const shL = P(-0.1, 0.16)
        const shR = P(0.1, 0.16)
        const hipL = P(-0.07, 0.52)
        const hipR = P(0.07, 0.52)
        const mid = (a: THREE.Vector3, b: THREE.Vector3) => a.clone().lerp(b, 0.5)
        paths = {
          headThroat: [head, throat],
          armL: [throat, shL, mid(shL, handL), handL],
          armR: [throat, shR, mid(shR, handR), handR],
          torso: [throat, chest, navel, pelvis],
          legL: [pelvis, hipL, mid(hipL, footL), footL],
          legR: [pelvis, hipR, mid(hipR, footR), footR],
          ret: [pelvis, navel, chest, throat, head],
        }
        chestPos.copy(chest)
        const dotSize = H * 0.06
        sprite0.scale.setScalar(dotSize)
        sprite1.scale.setScalar(dotSize)
        inner.add(sprite0, sprite1)
      },
      undefined,
      (err) => {
        if (disposed) return
        console.warn('BodyMesh: model failed to load', err)
        setFailed(true)
      },
    )

    // Timeline of the light's journey (fractions of the loop). Single-file stretches
    // move sprite0 only; the arm and leg stretches light both sprites, left + right.
    const legs: { a: number; b: number; p0: PathKey; p1: PathKey | null }[] = [
      { a: 0.0, b: 0.12, p0: 'headThroat', p1: null }, // head → throat
      { a: 0.12, b: 0.34, p0: 'armL', p1: 'armR' }, //     both arms
      { a: 0.34, b: 0.52, p0: 'torso', p1: null }, //      throat → navel → pelvis
      { a: 0.52, b: 0.74, p0: 'legL', p1: 'legR' }, //     both legs
      { a: 0.74, b: 1.0, p0: 'ret', p1: null }, //         back up to the head
    ]

    const animate = () => {
      raf = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      // Breath: use the app value if given, else a gentle asymmetric pulse.
      let b = breathRef.current
      if (b == null) {
        const cycle = 10
        const p = (t % cycle) / cycle
        b = p < 0.4 ? p / 0.4 : 1 - (p - 0.4) / 0.6
      }
      lineMat.opacity = 0.62 + 0.16 * b

      if (paths) {
        if (reduceMotion) {
          // No travel under reduced motion — a single, steady light at the chest.
          sprite0.position.copy(chestPos)
          sprite0.visible = true
          sprite1.visible = false
          dotMat.opacity = 0.5
        } else {
          const gp = (t / LOOP) % 1
          let seg = legs[legs.length - 1]
          for (const s of legs) if (gp >= s.a && gp < s.b) { seg = s; break }
          const u = (gp - seg.a) / (seg.b - seg.a)
          const e = easeInOut(u)
          const env = Math.max(0, Math.min(1, u / 0.18, (1 - u) / 0.18)) // fade in/out, never a pop
          dotMat.opacity = 0.9 * env * (0.9 + 0.1 * Math.sin(t * 2))
          samplePath(paths[seg.p0], e, tmp)
          sprite0.position.copy(tmp)
          sprite0.visible = true
          if (seg.p1) {
            samplePath(paths[seg.p1], e, tmp)
            sprite1.position.copy(tmp)
            sprite1.visible = true
          } else {
            sprite1.visible = false
          }
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
      dotMat.dispose()
      glowTex.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [modelUrl, color, quadThresholdDeg, autoRotate])

  if (failed) return <>{fallback}</>
  return <div ref={mountRef} className={className} style={{ width: '100%', height: '100%' }} />
}
