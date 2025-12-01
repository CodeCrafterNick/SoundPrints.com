'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import type { ProductMockupRef } from './product-mockup'
import type { PrintifyProduct, ProductSize } from '@/lib/printify-product-catalog'
import { cn } from '@/lib/utils'

interface RoomScenePreviewProps {
  mockupRef: React.RefObject<ProductMockupRef | null>
  selectedProduct: PrintifyProduct
  selectedSize: ProductSize
  roomStyle?: 'living' | 'bedroom' | 'office' | 'minimal'
}

// Room configurations with wall areas for artwork placement
const ROOM_CONFIGS = {
  living: {
    name: 'Living Room',
    wallColor: '#e8e4df',
    accentColor: '#d4cfc7',
    floorColor: '#8b7355',
    hasPlant: true,
    hasFurniture: true,
    lightAngle: 45,
  },
  bedroom: {
    name: 'Bedroom',
    wallColor: '#f5f0eb',
    accentColor: '#e8e0d8',
    floorColor: '#c9b896',
    hasPlant: false,
    hasFurniture: true,
    lightAngle: 30,
  },
  office: {
    name: 'Office',
    wallColor: '#f0f0f0',
    accentColor: '#e0e0e0',
    floorColor: '#6b5b4f',
    hasPlant: true,
    hasFurniture: true,
    lightAngle: 60,
  },
  minimal: {
    name: 'Minimal',
    wallColor: '#ffffff',
    accentColor: '#f5f5f5',
    floorColor: '#e0e0e0',
    hasPlant: false,
    hasFurniture: false,
    lightAngle: 45,
  },
}

// Frame styles based on product type
function getFrameStyle(product: PrintifyProduct) {
  const category = product.category
  const isPremium = product.premium
  
  if (category === 'canvas') {
    return {
      type: 'canvas',
      depth: 20,
      wrapColor: '#1a1a1a',
      hasShadow: true,
      shadowBlur: 30,
      shadowOffset: 15,
    }
  }
  
  if (category === 'framed') {
    return {
      type: 'framed',
      frameWidth: isPremium ? 24 : 16,
      frameColor: '#1a1a1a',
      matWidth: isPremium ? 40 : 24,
      matColor: '#ffffff',
      hasGlass: true,
      hasShadow: true,
      shadowBlur: 40,
      shadowOffset: 20,
    }
  }
  
  if (category === 'tapestry') {
    return {
      type: 'tapestry',
      rodColor: '#8b4513',
      hasDrape: true,
      hasShadow: true,
      shadowBlur: 20,
      shadowOffset: 10,
    }
  }
  
  // Default: poster (no frame, just paper look)
  return {
    type: 'poster',
    hasShadow: true,
    shadowBlur: 25,
    shadowOffset: 12,
    hasCurl: true,
  }
}

export function RoomScenePreview({ 
  mockupRef, 
  selectedProduct, 
  selectedSize,
  roomStyle = 'living' 
}: RoomScenePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedRoom, setSelectedRoom] = useState<keyof typeof ROOM_CONFIGS>(roomStyle)
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  
  const roomConfig = ROOM_CONFIGS[selectedRoom]
  const frameStyle = useMemo(() => getFrameStyle(selectedProduct), [selectedProduct])
  
  // Capture artwork from mockup canvas
  useEffect(() => {
    const captureArtwork = () => {
      if (mockupRef?.current?.canvas) {
        try {
          const url = mockupRef.current.canvas.toDataURL('image/png')
          setArtworkUrl(url)
        } catch {
          // Canvas might not be ready
        }
      }
      animationFrameRef.current = requestAnimationFrame(captureArtwork)
    }
    
    captureArtwork()
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [mockupRef])
  
  // Render room scene with artwork
  useEffect(() => {
    if (!canvasRef.current || !artworkUrl) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const container = canvas.parentElement
    if (!container) return
    
    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    ctx.scale(dpr, dpr)
    
    const width = rect.width
    const height = rect.height
    
    // Load artwork image
    const artworkImg = new Image()
    artworkImg.crossOrigin = 'anonymous'
    artworkImg.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height)
      
      // Draw room background
      drawRoom(ctx, width, height, roomConfig)
      
      // Calculate artwork dimensions and position
      const aspectRatio = selectedSize.width / selectedSize.height
      const maxArtWidth = width * 0.45
      const maxArtHeight = height * 0.55
      
      let artWidth: number, artHeight: number
      if (aspectRatio > maxArtWidth / maxArtHeight) {
        artWidth = maxArtWidth
        artHeight = artWidth / aspectRatio
      } else {
        artHeight = maxArtHeight
        artWidth = artHeight * aspectRatio
      }
      
      // Center artwork on wall (slightly above center)
      const artX = (width - artWidth) / 2
      const artY = height * 0.25
      
      // Draw the framed/styled artwork
      drawStyledArtwork(ctx, artworkImg, artX, artY, artWidth, artHeight, frameStyle, roomConfig)
      
      // Draw size label
      ctx.save()
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.font = '12px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      const labelY = artY + artHeight + (frameStyle.type === 'framed' ? 60 : 30)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      const labelWidth = ctx.measureText(selectedSize.label).width + 16
      ctx.beginPath()
      ctx.roundRect(width / 2 - labelWidth / 2, labelY - 10, labelWidth, 22, 11)
      ctx.fill()
      ctx.fillStyle = '#333'
      ctx.fillText(selectedSize.label, width / 2, labelY + 4)
      ctx.restore()
    }
    artworkImg.src = artworkUrl
    
  }, [artworkUrl, selectedRoom, selectedProduct, selectedSize, roomConfig, frameStyle])
  
  return (
    <div className="w-full space-y-3">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 shadow-inner">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
      
      {/* Room style selector */}
      <div className="flex items-center justify-center gap-2">
        {(Object.keys(ROOM_CONFIGS) as Array<keyof typeof ROOM_CONFIGS>).map((room) => (
          <button
            key={room}
            onClick={() => setSelectedRoom(room)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
              selectedRoom === room
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            )}
          >
            {ROOM_CONFIGS[room].name}
          </button>
        ))}
      </div>
    </div>
  )
}

// Helper function to draw room background
function drawRoom(
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number, 
  config: typeof ROOM_CONFIGS.living
) {
  // Wall gradient (subtle lighting effect)
  const wallGradient = ctx.createLinearGradient(0, 0, width, height)
  wallGradient.addColorStop(0, config.wallColor)
  wallGradient.addColorStop(0.5, config.accentColor)
  wallGradient.addColorStop(1, config.wallColor)
  
  ctx.fillStyle = wallGradient
  ctx.fillRect(0, 0, width, height)
  
  // Add subtle texture to wall
  ctx.save()
  ctx.globalAlpha = 0.03
  for (let i = 0; i < width; i += 4) {
    for (let j = 0; j < height * 0.75; j += 4) {
      if (Math.random() > 0.5) {
        ctx.fillStyle = '#000'
        ctx.fillRect(i, j, 1, 1)
      }
    }
  }
  ctx.restore()
  
  // Floor
  const floorY = height * 0.78
  const floorGradient = ctx.createLinearGradient(0, floorY, 0, height)
  floorGradient.addColorStop(0, config.floorColor)
  floorGradient.addColorStop(1, darkenColor(config.floorColor, 20))
  
  ctx.fillStyle = floorGradient
  ctx.beginPath()
  ctx.moveTo(0, floorY)
  ctx.lineTo(width, floorY)
  ctx.lineTo(width, height)
  ctx.lineTo(0, height)
  ctx.closePath()
  ctx.fill()
  
  // Baseboard
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, floorY - 8, width, 8)
  ctx.fillStyle = 'rgba(0,0,0,0.1)'
  ctx.fillRect(0, floorY - 8, width, 2)
  
  // Add furniture silhouettes if enabled
  if (config.hasFurniture) {
    drawFurniture(ctx, width, height, floorY)
  }
  
  // Add plant if enabled
  if (config.hasPlant) {
    drawPlant(ctx, width * 0.85, floorY)
  }
  
  // Ambient light effect from window (top-left)
  const lightGradient = ctx.createRadialGradient(
    width * 0.2, height * 0.1, 0,
    width * 0.2, height * 0.1, width * 0.6
  )
  lightGradient.addColorStop(0, 'rgba(255, 255, 240, 0.15)')
  lightGradient.addColorStop(1, 'rgba(255, 255, 240, 0)')
  ctx.fillStyle = lightGradient
  ctx.fillRect(0, 0, width, height)
}

// Draw furniture silhouette
function drawFurniture(ctx: CanvasRenderingContext2D, width: number, height: number, floorY: number) {
  ctx.save()
  ctx.fillStyle = 'rgba(60, 50, 45, 0.15)'
  
  // Couch/sofa shape
  const sofaWidth = width * 0.55
  const sofaHeight = height * 0.12
  const sofaX = (width - sofaWidth) / 2
  const sofaY = floorY - sofaHeight
  
  // Sofa back
  ctx.beginPath()
  ctx.roundRect(sofaX, sofaY - sofaHeight * 0.4, sofaWidth, sofaHeight * 0.5, 8)
  ctx.fill()
  
  // Sofa seat
  ctx.beginPath()
  ctx.roundRect(sofaX - 10, sofaY, sofaWidth + 20, sofaHeight, 8)
  ctx.fill()
  
  // Side table
  ctx.fillRect(width * 0.08, floorY - height * 0.08, width * 0.08, height * 0.08)
  
  ctx.restore()
}

// Draw decorative plant
function drawPlant(ctx: CanvasRenderingContext2D, x: number, floorY: number) {
  ctx.save()
  
  // Pot
  ctx.fillStyle = '#8b6b4f'
  ctx.beginPath()
  ctx.moveTo(x - 15, floorY)
  ctx.lineTo(x + 15, floorY)
  ctx.lineTo(x + 12, floorY - 30)
  ctx.lineTo(x - 12, floorY - 30)
  ctx.closePath()
  ctx.fill()
  
  // Plant leaves (simplified)
  ctx.fillStyle = 'rgba(76, 119, 76, 0.6)'
  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    const angle = (i - 2) * 0.4
    ctx.ellipse(
      x + Math.sin(angle) * 15,
      floorY - 45 - i * 8,
      8,
      20,
      angle,
      0,
      Math.PI * 2
    )
    ctx.fill()
  }
  
  ctx.restore()
}

// Draw styled artwork based on product type
function drawStyledArtwork(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  style: ReturnType<typeof getFrameStyle>,
  roomConfig: typeof ROOM_CONFIGS.living
) {
  ctx.save()
  
  // Calculate total dimensions with frame/mat
  let totalWidth = width
  let totalHeight = height
  let artworkX = x
  let artworkY = y
  
  if (style.type === 'framed') {
    const frameW = style.frameWidth || 16
    const matW = style.matWidth || 24
    const totalBorder = (frameW + matW) * 2
    totalWidth = width + totalBorder
    totalHeight = height + totalBorder
    artworkX = x - frameW - matW
    artworkY = y - frameW - matW
  } else if (style.type === 'canvas') {
    const depth = style.depth || 20
    totalWidth = width + 4
    totalHeight = height + 4
    artworkX = x - 2
    artworkY = y - 2
  }
  
  // Draw shadow
  if (style.hasShadow) {
    const shadowBlur = style.shadowBlur || 25
    const shadowOffset = style.shadowOffset || 12
    
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
    ctx.shadowBlur = shadowBlur
    ctx.shadowOffsetX = shadowOffset * 0.5
    ctx.shadowOffsetY = shadowOffset
    ctx.fillStyle = '#000'
    
    if (style.type === 'canvas') {
      // Canvas wrap shadow
      ctx.beginPath()
      ctx.rect(artworkX, artworkY, totalWidth, totalHeight)
      ctx.fill()
    } else if (style.type === 'framed') {
      // Framed shadow
      ctx.beginPath()
      ctx.rect(artworkX, artworkY, totalWidth, totalHeight)
      ctx.fill()
    } else {
      // Poster shadow (slight curl effect)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + width, y)
      ctx.lineTo(x + width, y + height)
      ctx.quadraticCurveTo(x + width * 0.5, y + height + 5, x, y + height)
      ctx.closePath()
      ctx.fill()
    }
    ctx.restore()
  }
  
  if (style.type === 'framed') {
    const frameW = style.frameWidth || 16
    const matW = style.matWidth || 24
    
    // Frame outer
    ctx.fillStyle = style.frameColor || '#1a1a1a'
    ctx.beginPath()
    ctx.rect(artworkX, artworkY, totalWidth, totalHeight)
    ctx.fill()
    
    // Frame inner bevel (lighter edge)
    ctx.fillStyle = lightenColor(style.frameColor || '#1a1a1a', 20)
    ctx.beginPath()
    ctx.rect(artworkX + 3, artworkY + 3, totalWidth - 6, totalHeight - 6)
    ctx.fill()
    
    // Frame inner
    ctx.fillStyle = style.frameColor || '#1a1a1a'
    ctx.beginPath()
    ctx.rect(artworkX + frameW - 3, artworkY + frameW - 3, totalWidth - frameW * 2 + 6, totalHeight - frameW * 2 + 6)
    ctx.fill()
    
    // Mat
    ctx.fillStyle = style.matColor || '#ffffff'
    ctx.beginPath()
    ctx.rect(artworkX + frameW, artworkY + frameW, width + matW * 2, height + matW * 2)
    ctx.fill()
    
    // Mat inner shadow
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 2
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.rect(x - 2, y - 2, width + 4, height + 4)
    ctx.fill()
    ctx.restore()
    
    // Artwork
    ctx.drawImage(img, x, y, width, height)
    
    // Glass reflection
    if (style.hasGlass) {
      const glassGradient = ctx.createLinearGradient(x, y, x + width, y + height)
      glassGradient.addColorStop(0, 'rgba(255, 255, 255, 0.08)')
      glassGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.02)')
      glassGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0)')
      glassGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)')
      ctx.fillStyle = glassGradient
      ctx.fillRect(x, y, width, height)
    }
    
  } else if (style.type === 'canvas') {
    const depth = style.depth || 20
    
    // Canvas wrap sides (3D effect)
    // Right side
    ctx.fillStyle = darkenColor('#333', 10)
    ctx.beginPath()
    ctx.moveTo(x + width, y)
    ctx.lineTo(x + width + depth * 0.4, y + depth * 0.3)
    ctx.lineTo(x + width + depth * 0.4, y + height + depth * 0.3)
    ctx.lineTo(x + width, y + height)
    ctx.closePath()
    ctx.fill()
    
    // Bottom side
    ctx.fillStyle = darkenColor('#333', 20)
    ctx.beginPath()
    ctx.moveTo(x, y + height)
    ctx.lineTo(x + width, y + height)
    ctx.lineTo(x + width + depth * 0.4, y + height + depth * 0.3)
    ctx.lineTo(x + depth * 0.4, y + height + depth * 0.3)
    ctx.closePath()
    ctx.fill()
    
    // Main canvas surface
    ctx.drawImage(img, x, y, width, height)
    
    // Canvas texture overlay
    ctx.save()
    ctx.globalAlpha = 0.04
    ctx.fillStyle = '#000'
    for (let i = 0; i < width; i += 3) {
      ctx.fillRect(x + i, y, 1, height)
    }
    for (let j = 0; j < height; j += 3) {
      ctx.fillRect(x, y + j, width, 1)
    }
    ctx.restore()
    
  } else if (style.type === 'tapestry') {
    // Hanging rod
    ctx.fillStyle = style.rodColor || '#8b4513'
    ctx.beginPath()
    ctx.roundRect(x - 20, y - 15, width + 40, 12, 6)
    ctx.fill()
    
    // Rod caps
    ctx.fillStyle = darkenColor(style.rodColor || '#8b4513', 20)
    ctx.beginPath()
    ctx.arc(x - 15, y - 9, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x + width + 15, y - 9, 8, 0, Math.PI * 2)
    ctx.fill()
    
    // Tapestry with slight wave effect
    ctx.drawImage(img, x, y, width, height)
    
    // Fabric texture
    ctx.save()
    ctx.globalAlpha = 0.06
    for (let i = 0; i < width; i += 2) {
      ctx.strokeStyle = i % 4 === 0 ? '#fff' : '#000'
      ctx.beginPath()
      ctx.moveTo(x + i, y)
      ctx.lineTo(x + i, y + height)
      ctx.stroke()
    }
    ctx.restore()
    
  } else {
    // Poster (simple with optional curl)
    ctx.drawImage(img, x, y, width, height)
    
    // Paper edge effect
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.lineWidth = 1
    ctx.strokeRect(x, y, width, height)
    
    // Subtle corner curl
    if (style.hasCurl) {
      ctx.save()
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.beginPath()
      ctx.moveTo(x + width - 15, y + height)
      ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - 15)
      ctx.lineTo(x + width, y + height)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
  }
  
  ctx.restore()
}

// Helper to darken a color
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, (num >> 16) - amt)
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt)
  const B = Math.max(0, (num & 0x0000ff) - amt)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}

// Helper to lighten a color
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.min(255, (num >> 16) + amt)
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt)
  const B = Math.min(255, (num & 0x0000ff) + amt)
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`
}
