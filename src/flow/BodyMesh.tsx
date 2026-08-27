// BodyMesh.tsx
// Interactive glowing wireframe human for the Support "locate" screen.
// Loads a real human GLB, renders its quad wireframe as glowing lines on a
// transparent canvas over the water background, and lets the user rotate and
// zoom it freely. EdgesGeometry with a low angle threshold drops the triangle
// diagonals and leaves the clean quad grid; normal (not additive) blending keeps
// dense-topology regions from glaring; ACES filmic tone mapping + depth fog give
// a luminous, volumetric read. The figure breathes on the shared clock.
//
// Every light is placed on a point SAMPLED from the mesh — the centroid of the
// local body volume — so it always sits inside the figure and stays there when
// rotated. `region` drives the accent:
//   'flow'  — one light descends the spine while both arms and (later) both legs
//             branch from it in sync, then gathers back up to the head, looping.
//   area    — a soft patch of light rests on that region (chest / belly / pelvis
//             / brain) and breathes with it.
//   'joints'— small lights sit on the elbows, wrists, knees and ankles.
//
// Requires: npm i three. Model: public/models/human.glb.

import { useEffect, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

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

function samplePath(pts: THREE.Vector3[], u: number, out: THREE.Vector3): THREE.Vector3 {
  const n = pts.length - 1
  const f = Math.max(0, Math.min(1, u)) * n
  const i = Math.min(Math.floor(f), n - 1)
  return out.copy(pts[i]).lerp(pts[i + 1], f - i)
}
const clamp01 = (x: number) => Math.max(0, Math.min(1, x))
const smooth = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t) }

type Props = {
  modelUrl?: string
  color?: string
  quadThresholdDeg?: number
  breath?: number
  region?: string // 'flow' | 'brain' | 'chest' | 'belly' | 'pelvis' | 'joints'
  autoRotate?: boolean
  fallback?: ReactNode
  className?: string
}

const POOL = 8 // enough for the 5 flow dots or the 8 joint lights

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

    const lineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      blending: THREE.NormalBlending,
    })

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

    type Flow = { center: THREE.Vector3[]; armL: THREE.Vector3[]; armR: THREE.Vector3[]; legL: THREE.Vector3[]; legR: THREE.Vector3[] }
    let flow: Flow | null = null
    let highlight: { points: THREE.Vector3[]; size: number; op: number } | null = null
    const isFlow = region === 'flow'
    const tmp = new THREE.Vector3()
    const PERIOD = 12

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

        const top = box.max.y, bottom = box.min.y
        const H = size.y, W = size.x, cx = center.x
        const yAt = (f: number) => top - f * H
        let hxL = Infinity, hxR = -Infinity
        for (const arr of verts) for (let i = 0; i < arr.length; i += 3) { const x = arr[i]; if (x < hxL) hxL = x; if (x > hxR) hxR = x }

        type Pred = (x: number, y: number, z: number) => boolean
        // Centroid of every vertex in a region — always inside the body volume.
        const centroid = (pred: Pred): THREE.Vector3 => {
          let sx = 0, sy = 0, sz = 0, c = 0
          for (const arr of verts) for (let i = 0; i < arr.length; i += 3) { const x = arr[i], y = arr[i + 1], z = arr[i + 2]; if (pred(x, y, z)) { sx += x; sy += y; sz += z; c++ } }
          return c ? new THREE.Vector3(sx / c, sy / c, sz / c) : center.clone()
        }
        // A limb centre-line: bin vertices along an axis, take each bin's centroid.
        const centerline = (pred: Pred, axis: 'x' | 'y', n: number, lo: number, hi: number, desc: boolean): THREE.Vector3[] => {
          const sx = new Float64Array(n), sy = new Float64Array(n), sz = new Float64Array(n), ct = new Uint32Array(n)
          for (const arr of verts) for (let i = 0; i < arr.length; i += 3) {
            const x = arr[i], y = arr[i + 1], z = arr[i + 2]
            if (!pred(x, y, z)) continue
            const a = axis === 'y' ? y : x
            let bi = Math.floor(((a - lo) / (hi - lo)) * n); if (bi < 0) bi = 0; if (bi >= n) bi = n - 1
            sx[bi] += x; sy[bi] += y; sz[bi] += z; ct[bi]++
          }
          const pts: THREE.Vector3[] = []
          for (let i = 0; i < n; i++) if (ct[i] > 0) pts.push(new THREE.Vector3(sx[i] / ct[i], sy[i] / ct[i], sz[i] / ct[i]))
          pts.sort((a, b) => (axis === 'y' ? (desc ? b.y - a.y : a.y - b.y) : (desc ? b.x - a.x : a.x - b.x)))
          return pts
        }

        const pelvisY = yAt(0.52)
        const armX = cx - 0.16 * W, armXr = cx + 0.16 * W
        const spine = centerline((x, y) => Math.abs(x - cx) < 0.13 * W && y >= pelvisY, 'y', 6, pelvisY, top, true)
        const legLw = centerline((x, y) => x < cx && y < yAt(0.53), 'y', 5, bottom, yAt(0.53), true)
        const legRw = centerline((x, y) => x > cx && y < yAt(0.53), 'y', 5, bottom, yAt(0.53), true)
        // Upper-body only, or the splayed feet (which reach past armX in x) would
        // pull the arm centre-line down toward the floor.
        const armLw = centerline((x, y) => x < armX && y > yAt(0.48), 'x', 5, hxL, armX, true)
        const armRw = centerline((x, y) => x > armXr && y > yAt(0.48), 'x', 5, armXr, hxR, false)
        const head = spine[0] ?? centroid((_x, y) => y > yAt(0.11))
        const pelvis = spine[spine.length - 1] ?? new THREE.Vector3(cx, pelvisY, center.z)
        // Arms branch from a point on the spine at shoulder height (never above it).
        const armLconn = new THREE.Vector3(cx, (armLw[0] ?? spine[1] ?? head).y, center.z)
        const armRconn = new THREE.Vector3(cx, (armRw[0] ?? spine[1] ?? head).y, center.z)

        flow = {
          center: spine.length > 1 ? spine : [head, pelvis],
          armL: [armLconn, ...armLw],
          armR: [armRconn, ...armRw],
          legL: [pelvis, ...legLw],
          legR: [pelvis, ...legRw],
        }

        // Region patches / joint points, all from mesh-sampled interior positions.
        const chestC = centroid((x, y) => Math.abs(x - cx) < 0.16 * W && y < yAt(0.19) && y > yAt(0.31))
        const bellyC = centroid((x, y) => Math.abs(x - cx) < 0.16 * W && y < yAt(0.35) && y > yAt(0.48))
        const pelvisC = centroid((x, y) => Math.abs(x - cx) < 0.16 * W && y < yAt(0.48) && y > yAt(0.58))
        const brainC = centroid((_x, y) => y > yAt(0.1))
        const at = (p: THREE.Vector3[], u: number) => samplePath(p, u, new THREE.Vector3()).clone()
        const joints = [
          at(flow.armL, 0.55), at(flow.armR, 0.55), // elbows
          at(flow.armL, 0.9), at(flow.armR, 0.9), //   wrists
          at(flow.legL, 0.5), at(flow.legR, 0.5), //   knees
          at(flow.legL, 0.88), at(flow.legR, 0.88), // ankles
        ]
        const regions: Record<string, { points: THREE.Vector3[]; size: number; op: number }> = {
          brain: { points: [brainC], size: H * 0.15, op: 0.6 },
          chest: { points: [chestC], size: H * 0.2, op: 0.42 },
          belly: { points: [bellyC], size: H * 0.19, op: 0.42 },
          pelvis: { points: [pelvisC], size: H * 0.17, op: 0.46 },
          joints: { points: joints, size: H * 0.055, op: 0.8 },
        }
        if (!isFlow) highlight = regions[region] ?? regions.chest

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
      outer.scale.setScalar(baseScale * (1 + 0.012 * b))

      if (isFlow && flow) {
        if (reduceMotion) {
          place(0, flow.center[Math.min(2, flow.center.length - 1)], 0.55)
          for (let i = 1; i < POOL; i++) dots[i].visible = false
        } else {
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
          for (let i = 5; i < POOL; i++) dots[i].visible = false
        }
      } else if (highlight) {
        const op = highlight.op * (reduceMotion ? 1 : 0.8 + 0.45 * b)
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
