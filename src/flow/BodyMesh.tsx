// BodyMesh.tsx
// Interactive glowing wireframe human for the Support "locate" screen.
// Loads a real human GLB, renders its quad wireframe as glowing lines on a
// transparent canvas over the water background, and lets the user rotate and
// zoom it freely. Matches the reference look by using EdgesGeometry with a low
// angle threshold, which drops the triangle diagonals and leaves the clean quad
// grid, instead of a messy full triangle wireframe.
//
// Premium pass: ACES filmic tone mapping + depth fog roll the flat white blow-out
// into a luminous, volumetric read (near lines bright gold, far lines recede into
// the dark), and a single soft point of light travels down the body — the one
// deliberate motion accent, paused under prefers-reduced-motion.
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
    // side of the figure dissolves into it. Gives volume and quietly removes the
    // doubled additive stack from back-facing lines (what flattened it to white).
    scene.fog = new THREE.Fog(0x08201f, 5.2, 7.4)
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100)
    camera.position.set(0, 0, 6)

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    // Filmic highlight rolloff instead of a hard clip to white — the premium look.
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

    const lineMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    // The travelling light. Populated once the model's bounds are known.
    const glowTex = makeGlowTexture()
    const dotMat = new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })
    const dot = new THREE.Sprite(dotMat)
    dot.visible = false
    let headY = 0
    let footY = 0
    let dotSize = 0.5

    const loader = new GLTFLoader()
    loader.load(
      modelUrl,
      (gltf) => {
        if (disposed) return
        gltf.scene.updateWorldMatrix(true, true)
        gltf.scene.traverse((child) => {
          const mesh = child as THREE.Mesh
          if ((mesh as unknown as { isMesh?: boolean }).isMesh && mesh.geometry) {
            const geo = mesh.geometry.clone()
            geo.applyMatrix4(mesh.matrixWorld)
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

        // Seat the light on the body's vertical axis, just in front of the mesh,
        // travelling between crown and feet (geometry space; inner carries it).
        headY = box.max.y
        footY = box.min.y
        dotSize = size.y * 0.095
        dot.scale.setScalar(dotSize)
        dot.position.set(center.x, headY, box.max.z + size.z * 0.12)
        dot.visible = true
        inner.add(dot)
      },
      undefined,
      (err) => {
        console.warn('BodyMesh: model failed to load', err)
        setFailed(true)
      },
    )

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
      lineMat.opacity = 0.5 + 0.2 * b

      // Travelling light: a smooth crown↔feet sweep, easing at each turn. Held
      // still and dim under reduced-motion so it never becomes a distraction.
      if (dot.visible) {
        if (reduceMotion) {
          dot.position.y = headY + (footY - headY) * 0.32
          dotMat.opacity = 0.5
        } else {
          const period = 6.5
          const tt = (t % period) / period
          const tri = tt < 0.5 ? tt * 2 : 2 - tt * 2 // 0→1→0 ping-pong
          const e = tri * tri * (3 - 2 * tri) // smoothstep ease at the turns
          dot.position.y = headY + (footY - headY) * e
          const pulse = 0.85 + 0.15 * Math.sin(t * 3)
          dotMat.opacity = 0.95 * pulse
          dot.scale.setScalar(dotSize * (0.92 + 0.12 * Math.sin(t * 3)))
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
