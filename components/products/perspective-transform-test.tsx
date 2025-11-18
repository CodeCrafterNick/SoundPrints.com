'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface PerspectiveTransformTestProps {
  artworkDataUrl: string
  mockupImageUrl: string
  printArea: { x: number; y: number; width: number; height: number }
}

type TransformTechnique = 'css-matrix' | 'keystone-slice' | 'threejs' | 'canvas-skew' | 'displacement-map'

/**
 * Generate displacement map from mockup image
 * Analyzes brightness to detect fabric wrinkles and folds
 */
function generateDisplacementMap(sourceImage: HTMLImageElement, printArea: { x: number; y: number; width: number; height: number }): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  
  const artX = sourceImage.naturalWidth * printArea.x
  const artY = sourceImage.naturalHeight * printArea.y
  const artW = sourceImage.naturalWidth * printArea.width
  const artH = sourceImage.naturalHeight * printArea.height
  
  canvas.width = artW
  canvas.height = artH
  
  // Draw the print area region
  ctx.drawImage(sourceImage, artX, artY, artW, artH, 0, 0, artW, artH)
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, artW, artH)
  const data = imageData.data
  
  // Convert to grayscale and enhance contrast for wrinkle detection
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    
    // Grayscale conversion
    const gray = 0.299 * r + 0.587 * g + 0.114 * b
    
    // Enhance contrast to make wrinkles more prominent
    const contrast = 1.5
    const enhanced = ((gray - 128) * contrast) + 128
    const clamped = Math.max(0, Math.min(255, enhanced))
    
    data[i] = clamped
    data[i + 1] = clamped
    data[i + 2] = clamped
  }
  
  // Apply blur to smooth the displacement map
  ctx.putImageData(imageData, 0, 0)
  ctx.filter = 'blur(2px)'
  ctx.drawImage(canvas, 0, 0)
  
  return canvas
}

/**
 * Test component to compare different perspective transform techniques
 */
export function PerspectiveTransformTest({
  artworkDataUrl,
  mockupImageUrl,
  printArea
}: PerspectiveTransformTestProps) {
  const [technique, setTechnique] = useState<TransformTechnique>('keystone-slice')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cssTransformRef = useRef<HTMLDivElement>(null)
  const threejsRef = useRef<HTMLDivElement>(null)

  // Technique 1: CSS matrix3d Transform
  useEffect(() => {
    if (technique !== 'css-matrix' || !cssTransformRef.current) return

    const container = cssTransformRef.current
    container.innerHTML = ''

    // Create layers
    const mockupImg = document.createElement('img')
    mockupImg.src = mockupImageUrl
    mockupImg.style.cssText = 'width: 100%; height: 100%; object-fit: contain;'

    const artworkImg = document.createElement('img')
    artworkImg.src = artworkDataUrl
    artworkImg.style.cssText = `
      position: absolute;
      left: ${printArea.x * 100}%;
      top: ${printArea.y * 100}%;
      width: ${printArea.width * 100}%;
      height: ${printArea.height * 100}%;
      transform-origin: center center;
      transform: matrix3d(
        1, 0.02, 0, -0.0001,
        -0.15, 1, 0, -0.00005,
        0, 0, 1, 0,
        0, 0, 0, 1
      );
      mix-blend-mode: multiply;
      filter: brightness(0.94);
    `

    container.appendChild(mockupImg)
    container.appendChild(artworkImg)
  }, [technique, artworkDataUrl, mockupImageUrl, printArea])

  // Technique 2: Keystone Slicing (Canvas 2D)
  useEffect(() => {
    if (technique !== 'keystone-slice' || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const mockupImg = new Image()
    mockupImg.crossOrigin = 'anonymous'

    mockupImg.onload = () => {
      canvas.width = mockupImg.naturalWidth
      canvas.height = mockupImg.naturalHeight

      // Draw mockup base
      ctx.drawImage(mockupImg, 0, 0)

      const artworkImg = new Image()
      artworkImg.onload = () => {
        const artX = canvas.width * printArea.x
        const artY = canvas.height * printArea.y
        const artW = canvas.width * printArea.width
        const artH = canvas.height * printArea.height

        ctx.save()
        ctx.globalCompositeOperation = 'multiply'
        ctx.filter = 'brightness(0.94)'

        // Keystone slicing: divide into vertical strips
        const sliceCount = 100
        const sliceWidth = artW / sliceCount

        for (let i = 0; i < sliceCount; i++) {
          const xPos = i / sliceCount
          
          // Perspective distortion curve
          // Top is narrower (pulled back), bottom is wider (closer)
          const perspectiveFactor = 0.85 + (xPos * 0.3) // 0.85 to 1.15
          const skewOffset = (xPos - 0.5) * artH * -0.15 // Horizontal skew
          
          const srcX = (artworkImg.width * i) / sliceCount
          const srcW = artworkImg.width / sliceCount
          
          const destX = artX + (i * sliceWidth) + skewOffset
          const destY = artY + (artH * (1 - perspectiveFactor) / 2)
          const destH = artH * perspectiveFactor

          ctx.drawImage(
            artworkImg,
            srcX, 0, srcW, artworkImg.height,
            destX, destY, sliceWidth, destH
          )
        }

        ctx.restore()
      }
      artworkImg.src = artworkDataUrl
    }
    mockupImg.src = mockupImageUrl
  }, [technique, artworkDataUrl, mockupImageUrl, printArea])

  // Technique 3: Three.js with texture mapping
  useEffect(() => {
    if (technique !== 'threejs' || !threejsRef.current) return

    const container = threejsRef.current
    container.innerHTML = ''

    const width = 800
    const height = 800

    // Setup Three.js scene
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(
      width / -2, width / 2,
      height / 2, height / -2,
      0.1, 1000
    )
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    container.appendChild(renderer.domElement)

    // Load mockup as background
    const mockupImg = new Image()
    mockupImg.crossOrigin = 'anonymous'
    mockupImg.onload = () => {
      const bgTexture = new THREE.Texture(mockupImg)
      bgTexture.needsUpdate = true
      
      const bgGeometry = new THREE.PlaneGeometry(width, height)
      const bgMaterial = new THREE.MeshBasicMaterial({ map: bgTexture })
      const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial)
      bgMesh.position.z = -1
      scene.add(bgMesh)

      // Load artwork and apply to plane
      const artworkImg = new Image()
      artworkImg.crossOrigin = 'anonymous'
      artworkImg.onload = () => {
        const artTexture = new THREE.Texture(artworkImg)
        artTexture.needsUpdate = true

        const artW = width * printArea.width
        const artH = height * printArea.height
        const artGeometry = new THREE.PlaneGeometry(artW, artH, 32, 32)

        // Apply perspective distortion to vertices
        const positions = artGeometry.attributes.position
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i)
          const y = positions.getY(i)
          
          // Normalize coordinates (-1 to 1)
          const normX = x / (artW / 2)
          const normY = y / (artH / 2)
          
          // Apply perspective warp
          const perspectiveZ = normX * -0.1 * artW
          const skewX = normY * 0.05 * artW
          
          positions.setX(i, x + skewX)
          positions.setZ(i, perspectiveZ)
        }
        positions.needsUpdate = true

        const artMaterial = new THREE.MeshBasicMaterial({
          map: artTexture,
          transparent: true,
          blending: THREE.MultiplyBlending,
          opacity: 0.94
        })

        const artMesh = new THREE.Mesh(artGeometry, artMaterial)
        artMesh.position.set(
          width * (printArea.x - 0.5),
          height * (0.5 - printArea.y),
          0
        )
        artMesh.rotation.y = -0.1 // Slight rotation for perspective
        scene.add(artMesh)

        renderer.render(scene, camera)
      }
      artworkImg.src = artworkDataUrl
    }
    mockupImg.src = mockupImageUrl

    return () => {
      renderer.dispose()
      container.innerHTML = ''
    }
  }, [technique, artworkDataUrl, mockupImageUrl, printArea])

  // Technique 4: Canvas Skew Transform (fallback)
  useEffect(() => {
    if (technique !== 'canvas-skew' || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const mockupImg = new Image()
    mockupImg.crossOrigin = 'anonymous'

    mockupImg.onload = () => {
      canvas.width = mockupImg.naturalWidth
      canvas.height = mockupImg.naturalHeight

      ctx.drawImage(mockupImg, 0, 0)

      const artworkImg = new Image()
      artworkImg.onload = () => {
        const artX = canvas.width * printArea.x
        const artY = canvas.height * printArea.y
        const artW = canvas.width * printArea.width
        const artH = canvas.height * printArea.height

        ctx.save()

        const centerX = artX + artW / 2
        const centerY = artY + artH / 2

        ctx.translate(centerX, centerY)
        ctx.transform(1, 0.02, -0.15, 1, 0, 0)
        ctx.translate(-centerX, -centerY)

        ctx.globalCompositeOperation = 'multiply'
        ctx.filter = 'brightness(0.94)'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
        ctx.shadowBlur = 8
        ctx.shadowOffsetY = 3

        ctx.drawImage(artworkImg, artX, artY, artW, artH)

        ctx.restore()
      }
      artworkImg.src = artworkDataUrl
    }
    mockupImg.src = mockupImageUrl
  }, [technique, artworkDataUrl, mockupImageUrl, printArea])

  // Technique 5: Displacement Map Warping (Canvas 2D)
  useEffect(() => {
    if (technique !== 'displacement-map' || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const mockupImg = new Image()
    mockupImg.crossOrigin = 'anonymous'

    mockupImg.onload = () => {
      canvas.width = mockupImg.naturalWidth
      canvas.height = mockupImg.naturalHeight

      ctx.drawImage(mockupImg, 0, 0)

      // Generate displacement map from mockup
      const displacementMap = generateDisplacementMap(mockupImg, printArea)
      const dispCtx = displacementMap.getContext('2d')!
      const dispData = dispCtx.getImageData(0, 0, displacementMap.width, displacementMap.height)

      const artworkImg = new Image()
      artworkImg.crossOrigin = 'anonymous'
      artworkImg.onload = () => {
        console.log('Artwork loaded for displacement:', artworkImg.width, artworkImg.height)
        
        const artX = canvas.width * printArea.x
        const artY = canvas.height * printArea.y
        const artW = canvas.width * printArea.width
        const artH = canvas.height * printArea.height

        // Create temporary canvas for artwork
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = artW
        tempCanvas.height = artH
        const tempCtx = tempCanvas.getContext('2d')!
        
        // First draw artwork at full opacity to verify it works
        tempCtx.drawImage(artworkImg, 0, 0, artW, artH)
        const artworkData = tempCtx.getImageData(0, 0, artW, artH)
        
        console.log('Artwork data captured:', artworkData.data.length, 'bytes')

        // Create output canvas for displaced artwork
        const outputCanvas = document.createElement('canvas')
        outputCanvas.width = artW
        outputCanvas.height = artH
        const outputCtx = outputCanvas.getContext('2d')!
        const outputData = outputCtx.createImageData(artW, artH)

        // Apply displacement mapping with bilinear interpolation
        const displacementStrength = 8 // Pixel displacement amount

        for (let y = 0; y < artH; y++) {
          for (let x = 0; x < artW; x++) {
            const i = (y * artW + x) * 4

            // Get displacement value (0-255) from displacement map
            const dispValue = dispData.data[i] || 128
            
            // Convert to normalized offset (-1 to 1, centered at 0)
            const normalizedDisp = (dispValue - 128) / 128
            
            // Calculate displaced source coordinates
            const sourceX = x + (normalizedDisp * displacementStrength)
            const sourceY = y + (normalizedDisp * displacementStrength * 0.5) // Less vertical distortion
            
            // Bilinear interpolation for smoother result
            const x0 = Math.floor(sourceX)
            const x1 = Math.ceil(sourceX)
            const y0 = Math.floor(sourceY)
            const y1 = Math.ceil(sourceY)
            
            // Clamp to valid bounds
            if (x0 >= 0 && x1 < artW && y0 >= 0 && y1 < artH) {
              const fx = sourceX - x0
              const fy = sourceY - y0
              
              // Get four surrounding pixels
              const i00 = (y0 * artW + x0) * 4
              const i10 = (y0 * artW + x1) * 4
              const i01 = (y1 * artW + x0) * 4
              const i11 = (y1 * artW + x1) * 4
              
              // Interpolate each channel
              for (let c = 0; c < 4; c++) {
                const v00 = artworkData.data[i00 + c] || 0
                const v10 = artworkData.data[i10 + c] || 0
                const v01 = artworkData.data[i01 + c] || 0
                const v11 = artworkData.data[i11 + c] || 0
                
                const v0 = v00 * (1 - fx) + v10 * fx
                const v1 = v01 * (1 - fx) + v11 * fx
                const v = v0 * (1 - fy) + v1 * fy
                
                outputData.data[i + c] = Math.round(v)
              }
            } else {
              // Out of bounds - use original position
              const clampedX = Math.max(0, Math.min(artW - 1, x))
              const clampedY = Math.max(0, Math.min(artH - 1, y))
              const sourceI = (clampedY * artW + clampedX) * 4
              
              outputData.data[i] = artworkData.data[sourceI] || 0
              outputData.data[i + 1] = artworkData.data[sourceI + 1] || 0
              outputData.data[i + 2] = artworkData.data[sourceI + 2] || 0
              outputData.data[i + 3] = artworkData.data[sourceI + 3] || 255
            }
          }
        }

        outputCtx.putImageData(outputData, 0, 0)

        // Draw the displaced artwork with blend mode
        ctx.save()
        ctx.globalCompositeOperation = 'multiply'
        ctx.filter = 'brightness(0.94)'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
        ctx.shadowBlur = 8
        ctx.shadowOffsetY = 3

        ctx.drawImage(outputCanvas, artX, artY)

        ctx.restore()
        
        console.log('Displacement map applied:', {
          dispMapSize: `${displacementMap.width}x${displacementMap.height}`,
          artworkArea: `${artX},${artY} ${artW}x${artH}`,
          pixelsProcessed: artW * artH
        })
      }
      artworkImg.src = artworkDataUrl
    }
    mockupImg.src = mockupImageUrl
  }, [technique, artworkDataUrl, mockupImageUrl, printArea])

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setTechnique('keystone-slice')}
          className={`px-4 py-2 rounded ${technique === 'keystone-slice' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Keystone Slicing
        </button>
        <button
          onClick={() => setTechnique('displacement-map')}
          className={`px-4 py-2 rounded ${technique === 'displacement-map' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          🔥 Displacement Map
        </button>
        <button
          onClick={() => setTechnique('css-matrix')}
          className={`px-4 py-2 rounded ${technique === 'css-matrix' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          CSS matrix3d
        </button>
        <button
          onClick={() => setTechnique('threejs')}
          className={`px-4 py-2 rounded ${technique === 'threejs' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Three.js
        </button>
        <button
          onClick={() => setTechnique('canvas-skew')}
          className={`px-4 py-2 rounded ${technique === 'canvas-skew' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Canvas Skew
        </button>
      </div>

      <div className="text-lg font-semibold">
        Current Technique: {technique}
        {technique === 'displacement-map' && <span className="text-sm text-gray-600 ml-2">(Auto-generated from fabric wrinkles)</span>}
      </div>

      {technique === 'css-matrix' && (
        <div ref={cssTransformRef} className="relative w-full aspect-square rounded-lg shadow-lg overflow-hidden" />
      )}

      {(technique === 'keystone-slice' || technique === 'canvas-skew' || technique === 'displacement-map') && (
        <canvas ref={canvasRef} className="w-full h-auto rounded-lg shadow-lg" />
      )}

      {technique === 'threejs' && (
        <div ref={threejsRef} className="w-full rounded-lg shadow-lg overflow-hidden" />
      )}
    </div>
  )
}
