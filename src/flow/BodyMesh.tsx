// BodyMesh.tsx
// Interactive glowing wireframe human for the Support "locate" screen.
// Loads a real human GLB, renders its quad wireframe as glowing lines on a
// transparent canvas over the water background, and lets the user rotate and
// zoom it freely. Matches the reference look by using EdgesGeometry with a low
// angle threshold, which drops the triangle diagonals and leaves the clean quad
// grid, instead of a messy full triangle wireframe.
//
// Requires: npm i three
// Model: put a clean quad-topology human GLB at public/models/human.glb.
// See the accompanying prompt for CC0 sourcing options.

import { useEffect, useRef, useState, type ReactNode } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

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

    const width = mount.clientWidth || 1
    const height = mount.clientHeight || 1

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100)
    camera.position.set(0, 0, 6)

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
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
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

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
      lineMat.opacity = 0.72 + 0.26 * b
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
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [modelUrl, color, quadThresholdDeg, autoRotate])

  if (failed) return <>{fallback}</>
  return <div ref={mountRef} className={className} style={{ width: '100%', height: '100%' }} />
}
