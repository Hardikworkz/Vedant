import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Bounds, ContactShadows, Html, useGLTF } from '@react-three/drei'
import { MathUtils } from 'three'
import metalKeyUrl from '../models/keys.glb?url'
import './MetalKeyCanvas.css'

function MetalKeyMesh({ paused }) {
  const groupRef = useRef(null)
  const { scene } = useGLTF(metalKeyUrl)

  const keyObject = useMemo(() => {
    const root = scene.clone()

    root.traverse((node) => {
      if (node.isMesh) {
        node.material = node.material.clone()

        if (node.material.color) {
          node.material.color.set('#4a3e35')
        }

        if ('metalness' in node.material) {
          node.material.metalness = 0.85
        }

        if ('roughness' in node.material) {
          node.material.roughness = 0.4
        }

        node.castShadow = true
        node.receiveShadow = true
      }
    })

    return root
  }, [scene])

  useEffect(() => {
    keyObject.updateMatrixWorld(true)
  }, [keyObject])

  useEffect(() => {
    if (!groupRef.current) {
      return
    }

    if (paused) {
      groupRef.current.rotation.set(-0.22, 0.82, 0.16)
      groupRef.current.position.y = 0.04
      return
    }

    groupRef.current.rotation.set(-0.12, 0.38, 0.06)
    groupRef.current.position.y = 0
  }, [paused, keyObject])

  useFrame((state, delta) => {
    if (!groupRef.current || paused) {
      return
    }

    const time = state.clock.getElapsedTime()

    groupRef.current.rotation.x = MathUtils.lerp(
      groupRef.current.rotation.x,
      -0.2 + Math.sin(time * 0.9) * 0.14,
      0.09,
    )
    groupRef.current.rotation.y += delta * 0.8
    groupRef.current.rotation.z = MathUtils.lerp(
      groupRef.current.rotation.z,
      Math.cos(time * 0.8) * 0.18,
      0.08,
    )
    groupRef.current.position.y = Math.sin(time * 1.3) * 0.18
  })

  return (
    <group ref={groupRef}>
      <primitive object={keyObject} />
    </group>
  )
}

function MetalKeyCanvas({ isStatic = false }) {
  return (
    <div className="metal-key-shell">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 36 }}
        dpr={isStatic ? [1, 1.5] : [1, 2]}
        frameloop={isStatic ? 'demand' : 'always'}
      >
        <ambientLight intensity={1.8} />
        <hemisphereLight
          intensity={1.6}
          color="#fff6df"
          groundColor="#6f625cff"
        />
        <directionalLight
          position={[3.5, 5, 4.5]}
          intensity={3.2}
          color="#ffe1a6"
          castShadow
        />
        <pointLight position={[-2.5, 1.5, 3]} intensity={12} color="#9f3d29" />

        <Suspense
          fallback={
            <Html center className="metal-key-loader">
              Loading key...
            </Html>
          }
        >
          <Bounds fit observe margin={1.2}>
            <MetalKeyMesh paused={isStatic} />
          </Bounds>

          <ContactShadows
            position={[0, -1.7, 0]}
            opacity={0.45}
            scale={5}
            blur={2.6}
            far={4.2}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload(metalKeyUrl)

export default MetalKeyCanvas
