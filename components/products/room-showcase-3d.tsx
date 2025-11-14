'use client'

import { Canvas, useLoader } from '@react-three/fiber'
import { PerspectiveCamera, Environment, OrbitControls } from '@react-three/drei'
import { TextureLoader } from 'three'
import { Suspense, useEffect, useState } from 'react'
import * as THREE from 'three'
import type { ProductMockupRef } from './product-mockup'

interface FramedArtworkProps {
  artworkUrl: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
}

function FramedArtwork({ artworkUrl, position, rotation, scale }: FramedArtworkProps) {
  const texture = useLoader(TextureLoader, artworkUrl)
  
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Black frame */}
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[1.05, 1.4, 0.03]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>
      
      {/* White mat */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[0.92, 1.25]} />
        <meshStandardMaterial color="white" />
      </mesh>
      
      {/* Artwork */}
      <mesh position={[0, 0, 0.02]} castShadow>
        <planeGeometry args={[0.8, 1.1]} />
        <meshStandardMaterial 
          map={texture} 
          toneMapped={false}
        />
      </mesh>
      
      {/* Glass reflection (optional) */}
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[0.8, 1.1]} />
        <meshPhysicalMaterial 
          transparent 
          opacity={0.1}
          roughness={0.1}
          metalness={0.9}
          reflectivity={0.8}
        />
      </mesh>
    </group>
  )
}

interface RoomScene {
  name: string
  background: string
  artworkPosition: [number, number, number]
  artworkRotation: [number, number, number]
  artworkScale: number
  cameraPosition: [number, number, number]
}

const ROOM_SCENES: RoomScene[] = [
  {
    name: 'Living Room',
    background: '/mockups/living-room.png',
    artworkPosition: [0, 1.5, -2],
    artworkRotation: [0, 0, 0],
    artworkScale: 1.2,
    cameraPosition: [0, 1.6, 3.5]
  },
  {
    name: 'Bedroom',
    background: '/mockups/living-room.png',
    artworkPosition: [-1.5, 1.4, -2.2],
    artworkRotation: [0, 0.3, 0],
    artworkScale: 0.9,
    cameraPosition: [0.5, 1.5, 3]
  },
  {
    name: 'Gallery',
    background: '/mockups/living-room.png',
    artworkPosition: [0, 1.6, -3],
    artworkRotation: [0, 0, 0],
    artworkScale: 1.5,
    cameraPosition: [0, 1.6, 4]
  }
]

function Scene({ artworkUrl, sceneIndex }: { artworkUrl: string; sceneIndex: number }) {
  const scene = ROOM_SCENES[sceneIndex]
  const bgTexture = useLoader(TextureLoader, scene.background)
  
  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={scene.cameraPosition} 
        fov={50}
      />
      
      {/* Background sphere with room image */}
      <mesh>
        <sphereGeometry args={[10, 64, 64]} />
        <meshBasicMaterial map={bgTexture} side={THREE.BackSide} />
      </mesh>
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <spotLight 
        position={[0, 4, 2]} 
        angle={0.3}
        intensity={0.5}
        castShadow
      />
      
      {/* Artwork */}
      <FramedArtwork 
        artworkUrl={artworkUrl}
        position={scene.artworkPosition}
        rotation={scene.artworkRotation}
        scale={scene.artworkScale}
      />
      
      {/* Floor (for shadows) */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
      
      {/* Optional orbit controls for interactive viewing */}
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI / 6}
        maxAzimuthAngle={Math.PI / 6}
      />
    </>
  )
}

interface RoomShowcase3DProps {
  mockupRef?: React.RefObject<ProductMockupRef | null>
}

export function RoomShowcase3D({ mockupRef }: RoomShowcase3DProps) {
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null)
  const [sceneIndex, setSceneIndex] = useState(0)
  
  useEffect(() => {
    if (mockupRef?.current?.canvas) {
      try {
        const url = mockupRef.current.canvas.toDataURL('image/png')
        setArtworkUrl(url)
      } catch (error) {
        console.error('Failed to capture canvas:', error)
      }
    }
  }, [mockupRef?.current?.canvas])
  
  if (!artworkUrl) {
    return (
      <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Upload audio to see 3D preview</p>
      </div>
    )
  }
  
  return (
    <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-2xl">
      <Canvas shadows dpr={[1, 2]} gl={{ preserveDrawingBuffer: true }}>
        <Suspense fallback={null}>
          <Scene artworkUrl={artworkUrl} sceneIndex={sceneIndex} />
        </Suspense>
      </Canvas>
      
      {/* Scene selector */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {ROOM_SCENES.map((scene, i) => (
          <button
            key={i}
            onClick={() => setSceneIndex(i)}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              i === sceneIndex 
                ? 'bg-white text-black shadow-lg' 
                : 'bg-black/50 text-white hover:bg-black/70'
            }`}
          >
            {scene.name}
          </button>
        ))}
      </div>
    </div>
  )
}
