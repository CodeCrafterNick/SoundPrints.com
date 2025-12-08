'use client'

import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import { Stage, Layer, Rect, Group, Line, Circle, Transformer, Text, Image as KonvaImage } from 'react-konva'
import Konva from 'konva'
import { useInteractiveCanvasConfig, useInteractiveCanvasActions, useWaveformConfig, useBackgroundConfig, useAudioConfig, useTextConfig, useQRCodeConfig, useImageMaskConfig, useCustomizerStore, type TextElement } from '@/lib/stores/customizer-store'
import QRCodeLib from 'qrcode'

interface InteractiveCanvasEditorKonvaProps {
  mockupRef: React.RefObject<{ canvas: HTMLCanvasElement | null } | null>
  selectedSize?: { width: number; height: number }
}

export interface InteractiveCanvasEditorKonvaRef {
  exportImage: (pixelRatio?: number, cropToDesign?: boolean) => Promise<string>
}

// Helper to generate gradient fill string or solid color
function getGradientFillFunc(
  useGradient: boolean,
  color: string,
  gradientStops: Array<{ color: string; position: number }>,
  gradientDirection: 'horizontal' | 'vertical' | 'diagonal' | 'radial',
  width: number,
  height: number
): string | CanvasGradient | undefined {
  if (!useGradient || !gradientStops || gradientStops.length < 2) {
    return color
  }
  return color // For Konva shapes, we'll use fillLinearGradientColorStops instead
}

export const InteractiveCanvasEditorKonva = forwardRef<InteractiveCanvasEditorKonvaRef, InteractiveCanvasEditorKonvaProps>(
  function InteractiveCanvasEditorKonva({ selectedSize }, ref) {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const waveformGroupRef = useRef<Konva.Group>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const textRefs = useRef<Map<string, Konva.Text>>(new Map())
  const textTransformerRef = useRef<Konva.Transformer>(null)
  const checkerboardRef = useRef<Konva.Rect>(null)
  const printableAreaIndicatorRef = useRef<Konva.Rect>(null)
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  // Position will be set once we know the actual container size
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [scale, setScale] = useState({ x: 1, y: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [showCenterGuides, setShowCenterGuides] = useState({ horizontal: false, vertical: false })
  const [selectedElement, setSelectedElement] = useState<'waveform' | 'qrcode' | string | null>(null)
  const [waveformOutsideBounds, setWaveformOutsideBounds] = useState(false)
  const [backgroundImageObj, setBackgroundImageObj] = useState<HTMLImageElement | null>(null)
  const [qrCodeImageObj, setQrCodeImageObj] = useState<HTMLImageElement | null>(null)
  const [maskImageObj, setMaskImageObj] = useState<HTMLImageElement | null>(null)
  const [checkerPatternImage, setCheckerPatternImage] = useState<HTMLImageElement | null>(null)
  const qrCodeRef = useRef<Konva.Image>(null)
  const qrTransformerRef = useRef<Konva.Transformer>(null)
  
  // Zoom and pan state
  const [stageZoom, setStageZoom] = useState(1)
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [zoomLocked, setZoomLocked] = useState(false)
  const lastPanPos = useRef({ x: 0, y: 0 })
  // Refs for export to access current zoom/position
  const stageZoomRef = useRef(1)
  const stagePositionRef = useRef({ x: 0, y: 0 })
  stageZoomRef.current = stageZoom
  stagePositionRef.current = stagePosition
  
  // CAD dimensions toggle
  const [showDimensions, setShowDimensions] = useState(false)
  
  // Store hooks
  const config = useInteractiveCanvasConfig()
  const actions = useInteractiveCanvasActions()
  const waveformConfig = useWaveformConfig()
  const backgroundConfig = useBackgroundConfig()
  const audioConfig = useAudioConfig()
  const textConfig = useTextConfig()
  const qrCodeConfig = useQRCodeConfig()
  const imageMaskConfig = useImageMaskConfig()
  const borderText = useCustomizerStore(state => state.borderText)
  const setQRCodeX = useCustomizerStore(state => state.setQRCodeX)
  const setQRCodeY = useCustomizerStore(state => state.setQRCodeY)
  
  // Animation state
  const isAnimationPlaying = useCustomizerStore(state => state.isAnimationPlaying)
  const animationProgress = useCustomizerStore(state => state.animationProgress)
  
  // Store mockupBounds in a ref so it can be accessed by exportImage
  const mockupBoundsRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null)
  
  // Expose export function via ref
  useImperativeHandle(ref, () => ({
    exportImage: async (pixelRatio = 2, cropToDesign = false) => {
      if (!stageRef.current) {
        throw new Error('Stage not available for export')
      }
      
      // Save current zoom and position
      const savedZoom = stageZoomRef.current
      const savedPosition = { ...stagePositionRef.current }
      
      // Log export parameters for debugging
      console.log('[Konva Export] Starting export', {
        pixelRatio,
        cropToDesign,
        waveformBarCount: waveformData.length,
        storeDataBarCount: useCustomizerStore.getState().computedWaveformData?.barCount,
        mockupBounds: mockupBoundsRef.current,
        savedZoom,
        savedPosition,
      })
      
      // Reset zoom and position to default for consistent export
      stageRef.current.scale({ x: 1, y: 1 })
      stageRef.current.position({ x: 0, y: 0 })
      
      // Hide all transformers and UI elements before export (remove selection boxes and borders)
      transformerRef.current?.hide()
      textTransformerRef.current?.hide()
      qrTransformerRef.current?.hide()
      printableAreaIndicatorRef.current?.hide()
      
      // Redraw to apply changes
      stageRef.current.batchDraw()
      
      let dataUrl: string
      
      if (cropToDesign && mockupBoundsRef.current) {
        // Export only the design area (mockup bounds)
        const bounds = mockupBoundsRef.current
        dataUrl = stageRef.current.toDataURL({ 
          pixelRatio,
          mimeType: 'image/png',
          x: bounds.left,
          y: bounds.top,
          width: bounds.width,
          height: bounds.height,
        })
      } else {
        // Export entire stage
        dataUrl = stageRef.current.toDataURL({ 
          pixelRatio,
          mimeType: 'image/png'
        })
      }
      
      // Restore zoom, position and UI elements
      stageRef.current.scale({ x: savedZoom, y: savedZoom })
      stageRef.current.position(savedPosition)
      transformerRef.current?.show()
      textTransformerRef.current?.show()
      qrTransformerRef.current?.show()
      printableAreaIndicatorRef.current?.show()
      stageRef.current.batchDraw()
      
      return dataUrl
    }
  }), [])

  // Direct subscriptions for values to ensure reactivity
  // useShallow may not detect changes properly for some values
  const waveformUseGradient = useCustomizerStore(state => state.waveformUseGradient)
  const waveformGradientStops = useCustomizerStore(state => state.waveformGradientStops)
  const waveformGradientDirection = useCustomizerStore(state => state.waveformGradientDirection)
  const barRounded = useCustomizerStore(state => state.barRounded)
  const barWidth = useCustomizerStore(state => state.barWidth)
  const barGap = useCustomizerStore(state => state.barGap)
  const circleGapAngle = useCustomizerStore(state => state.circleGapAngle)
  const circleInnerBars = useCustomizerStore(state => state.circleInnerBars)
  const optimizedBars = useCustomizerStore(state => state.optimizedBars)
  
  // Create checkerboard pattern image once
  useEffect(() => {
    const patternCanvas = document.createElement('canvas')
    const size = 24 // 2x size for each checker square (12px each)
    patternCanvas.width = size
    patternCanvas.height = size
    const ctx = patternCanvas.getContext('2d')
    if (ctx) {
      // Light squares
      ctx.fillStyle = '#f0f0f0'
      ctx.fillRect(0, 0, size / 2, size / 2)
      ctx.fillRect(size / 2, size / 2, size / 2, size / 2)
      // Dark squares
      ctx.fillStyle = '#e0e0e0'
      ctx.fillRect(size / 2, 0, size / 2, size / 2)
      ctx.fillRect(0, size / 2, size / 2, size / 2)
    }
    const img = new Image()
    img.onload = () => setCheckerPatternImage(img)
    img.src = patternCanvas.toDataURL()
  }, [])
  
  // Load background image when it changes
  useEffect(() => {
    if (!backgroundConfig.image) {
      setBackgroundImageObj(null)
      return
    }
    
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setBackgroundImageObj(img)
    }
    img.onerror = () => {
      console.error('Failed to load background image:', backgroundConfig.image)
      setBackgroundImageObj(null)
    }
    img.src = backgroundConfig.image
  }, [backgroundConfig.image])
  
  // Load QR code image when it changes or color changes
  useEffect(() => {
    if (!qrCodeConfig.showQRCode || !qrCodeConfig.qrCodeUrl) {
      setQrCodeImageObj(null)
      return
    }
    
    // Determine QR code color - use custom color if enabled, otherwise match waveform
    let qrColor = waveformConfig.color
    if (qrCodeConfig.qrCodeUseCustomColor && qrCodeConfig.qrCodeColor) {
      // Use custom QR code color
      qrColor = qrCodeConfig.qrCodeColor
    } else if (waveformUseGradient && waveformGradientStops && waveformGradientStops.length > 0) {
      // Sort stops by position and use the first one (leftmost/topmost color)
      const sortedStops = [...waveformGradientStops].sort((a, b) => a.position - b.position)
      qrColor = sortedStops[0].color
    }
    
    const qrStyle = qrCodeConfig.qrCodeStyle || 'square'
    
    // Generate styled QR code
    try {
      const qrData = QRCodeLib.create(qrCodeConfig.qrCodeUrl, { errorCorrectionLevel: 'M' })
      
      const canvas = document.createElement('canvas')
      const size = 200
      const margin = 8
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Transparent background
      ctx.clearRect(0, 0, size, size)

      const modules = qrData.modules
      const moduleCount = modules.size
      const moduleSize = (size - margin * 2) / moduleCount

      ctx.fillStyle = qrColor

      // Helper function for rounded rectangles
      const drawRoundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
        ctx.beginPath()
        ctx.moveTo(x + radius, y)
        ctx.lineTo(x + width - radius, y)
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
        ctx.lineTo(x + width, y + height - radius)
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
        ctx.lineTo(x + radius, y + height)
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
        ctx.lineTo(x, y + radius)
        ctx.quadraticCurveTo(x, y, x + radius, y)
        ctx.closePath()
        ctx.fill()
      }
      
      // Helper for diamond shape
      const drawDiamond = (cx: number, cy: number, size: number) => {
        ctx.beginPath()
        ctx.moveTo(cx, cy - size / 2)
        ctx.lineTo(cx + size / 2, cy)
        ctx.lineTo(cx, cy + size / 2)
        ctx.lineTo(cx - size / 2, cy)
        ctx.closePath()
        ctx.fill()
      }
      
      // Helper for star shape
      const drawStar = (cx: number, cy: number, size: number) => {
        const spikes = 4
        const outerRadius = size / 2
        const innerRadius = size / 4
        ctx.beginPath()
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius
          const angle = (i * Math.PI) / spikes - Math.PI / 2
          const x = cx + Math.cos(angle) * radius
          const y = cy + Math.sin(angle) * radius
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.fill()
      }
      
      // Helper for heart shape
      const drawHeart = (cx: number, cy: number, size: number) => {
        const s = size * 0.5
        ctx.beginPath()
        ctx.moveTo(cx, cy + s * 0.7)
        ctx.bezierCurveTo(cx - s, cy, cx - s, cy - s * 0.7, cx, cy - s * 0.3)
        ctx.bezierCurveTo(cx + s, cy - s * 0.7, cx + s, cy, cx, cy + s * 0.7)
        ctx.fill()
      }

      // Draw based on style
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (modules.get(row, col)) {
            const x = margin + col * moduleSize
            const y = margin + row * moduleSize
            const cx = x + moduleSize / 2
            const cy = y + moduleSize / 2

            switch (qrStyle) {
              case 'dots':
                ctx.beginPath()
                ctx.arc(cx, cy, moduleSize * 0.4, 0, Math.PI * 2)
                ctx.fill()
                break

              case 'rounded':
                drawRoundedRect(x + moduleSize * 0.05, y + moduleSize * 0.05, moduleSize * 0.9, moduleSize * 0.9, moduleSize * 0.25)
                break

              case 'extra-rounded':
                drawRoundedRect(x + moduleSize * 0.05, y + moduleSize * 0.05, moduleSize * 0.9, moduleSize * 0.9, moduleSize * 0.4)
                break
                
              case 'diamond':
                drawDiamond(cx, cy, moduleSize * 0.9)
                break
                
              case 'star':
                drawStar(cx, cy, moduleSize * 0.95)
                break
                
              case 'heart':
                drawHeart(cx, cy, moduleSize)
                break
                
              case 'fluid': {
                // Organic blob-like with pseudo-random sizes based on position
                const seed = (row * moduleCount + col) % 7
                const variation = [0.85, 0.9, 0.95, 0.88, 0.92, 0.87, 0.93][seed]
                ctx.beginPath()
                ctx.arc(cx, cy, (moduleSize * variation) / 2, 0, Math.PI * 2)
                ctx.fill()
                break
              }

              case 'classy':
                ctx.fillRect(x + moduleSize * 0.1, y + moduleSize * 0.1, moduleSize * 0.8, moduleSize * 0.8)
                if (col < moduleCount - 1 && modules.get(row, col + 1)) {
                  ctx.fillRect(x + moduleSize * 0.8, y + moduleSize * 0.3, moduleSize * 0.3, moduleSize * 0.4)
                }
                if (row < moduleCount - 1 && modules.get(row + 1, col)) {
                  ctx.fillRect(x + moduleSize * 0.3, y + moduleSize * 0.8, moduleSize * 0.4, moduleSize * 0.3)
                }
                break

              case 'classy-rounded':
                drawRoundedRect(x + moduleSize * 0.1, y + moduleSize * 0.1, moduleSize * 0.8, moduleSize * 0.8, moduleSize * 0.2)
                if (col < moduleCount - 1 && modules.get(row, col + 1)) {
                  ctx.fillRect(x + moduleSize * 0.8, y + moduleSize * 0.35, moduleSize * 0.3, moduleSize * 0.3)
                }
                if (row < moduleCount - 1 && modules.get(row + 1, col)) {
                  ctx.fillRect(x + moduleSize * 0.35, y + moduleSize * 0.8, moduleSize * 0.3, moduleSize * 0.3)
                }
                break

              case 'square':
              default:
                ctx.fillRect(x, y, moduleSize, moduleSize)
                break
            }
          }
        }
      }

      const dataUrl = canvas.toDataURL()
      const img = new window.Image()
      img.onload = () => {
        setQrCodeImageObj(img)
      }
      img.onerror = () => {
        console.error('Failed to load QR code image')
        setQrCodeImageObj(null)
      }
      img.src = dataUrl
    } catch (err) {
      console.error('Failed to generate QR code:', err)
      setQrCodeImageObj(null)
    }
  }, [qrCodeConfig.showQRCode, qrCodeConfig.qrCodeUrl, qrCodeConfig.qrCodeUseCustomColor, qrCodeConfig.qrCodeColor, qrCodeConfig.qrCodeStyle, waveformConfig.color, waveformUseGradient, waveformGradientStops])
  
  // Load mask image for image-mask style
  useEffect(() => {
    if (!imageMaskConfig.imageMaskImage) {
      setMaskImageObj(null)
      return
    }
    
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setMaskImageObj(img)
    }
    img.onerror = () => {
      console.error('Failed to load mask image:', imageMaskConfig.imageMaskImage)
      setMaskImageObj(null)
    }
    img.src = imageMaskConfig.imageMaskImage
  }, [imageMaskConfig.imageMaskImage])
  
  // Load actual audio waveform data from the store
  // IMPORTANT: Use computedWaveformData from store when available to ensure
  // exact match between preview and what's sent to Printify
  useEffect(() => {
    const loadAudioData = async () => {
      // First check if we have pre-computed waveform data in the store
      // This ensures exact match with ProductMockup preview
      const storedData = useCustomizerStore.getState().computedWaveformData
      if (storedData && storedData.normalizedAmplitudes.length > 0) {
        console.log('[Konva] Using stored waveform data for exact Printify match', {
          barCount: storedData.normalizedAmplitudes.length
        })
        setWaveformData(storedData.normalizedAmplitudes)
        return
      }
      
      if (!audioConfig.audioUrl) {
        // No audio - use placeholder data
        const bars = 150
        const data: number[] = []
        for (let i = 0; i < bars; i++) {
          const base = Math.sin(i / 10) * 0.3 + 0.5
          const noise = Math.random() * 0.4
          data.push(Math.max(0.1, Math.min(1, base + noise)))
        }
        setWaveformData(data)
        return
      }
      
      setIsLoadingAudio(true)
      
      try {
        const response = await fetch(audioConfig.audioUrl)
        const arrayBuffer = await response.arrayBuffer()
        const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        
        const channelData = audioBuffer.getChannelData(0)
        
        // Use selected region or full audio
        let regionData = channelData
        if (audioConfig.selectedRegion) {
          const startSample = Math.floor(audioConfig.selectedRegion.start * audioBuffer.sampleRate)
          const endSample = Math.floor(audioConfig.selectedRegion.end * audioBuffer.sampleRate)
          regionData = channelData.slice(startSample, endSample)
        }
        
        // Sample down to ~150 bars
        const bars = 150
        const blockSize = Math.max(1, Math.floor(regionData.length / bars))
        const sampledData: number[] = []
        
        for (let i = 0; i < bars; i++) {
          const blockStart = blockSize * i
          const blockEnd = Math.min(blockStart + blockSize, regionData.length)
          let sum = 0
          let count = 0
          
          for (let j = blockStart; j < blockEnd; j++) {
            sum += Math.abs(regionData[j])
            count++
          }
          
          sampledData.push(count > 0 ? sum / count : 0)
        }
        
        // Normalize to 0-1 range
        const max = Math.max(...sampledData)
        const normalizedData = max > 0 ? sampledData.map(n => n / max) : sampledData
        
        setWaveformData(normalizedData)
        audioContext.close()
      } catch (error) {
        console.error('Failed to load audio:', error)
        // Fall back to placeholder
        const bars = 150
        const data: number[] = []
        for (let i = 0; i < bars; i++) {
          const base = Math.sin(i / 10) * 0.3 + 0.5
          const noise = Math.random() * 0.4
          data.push(Math.max(0.1, Math.min(1, base + noise)))
        }
        setWaveformData(data)
      } finally {
        setIsLoadingAudio(false)
      }
    }
    
    loadAudioData()
  }, [audioConfig.audioUrl, audioConfig.selectedRegion])
  
  // Subscribe to computedWaveformData changes from the store
  // This ensures Konva updates when ProductMockup computes new waveform data
  useEffect(() => {
    // Zustand subscribe returns full state, we need to check for computedWaveformData changes
    let lastComputedAt: number | null = null
    
    const unsubscribe = useCustomizerStore.subscribe((state) => {
      const computedData = state.computedWaveformData
      if (computedData && computedData.normalizedAmplitudes.length > 0) {
        // Only update if this is new data (check computedAt timestamp)
        if (lastComputedAt !== computedData.computedAt) {
          lastComputedAt = computedData.computedAt
          console.log('[Konva] Store waveform data updated, syncing', {
            barCount: computedData.normalizedAmplitudes.length,
            computedAt: computedData.computedAt
          })
          setWaveformData(computedData.normalizedAmplitudes)
        }
      }
    })
    
    // Also check immediately on mount in case data is already there
    const currentData = useCustomizerStore.getState().computedWaveformData
    if (currentData && currentData.normalizedAmplitudes.length > 0) {
      lastComputedAt = currentData.computedAt
      setWaveformData(currentData.normalizedAmplitudes)
    }
    
    return () => unsubscribe()
  }, [])
  
  // Handle container resize
  useEffect(() => {
    if (!containerRef.current) return
    
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }
    
    updateSize()
    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])
  
  // Calculate mockup bounds - default to horizontal 16:10 aspect ratio
  // Must be calculated before useEffects that depend on it
  const targetWidth = selectedSize?.width || 16
  const targetHeight = selectedSize?.height || 10
  const aspectRatio = targetWidth / targetHeight
  const padding = 24
  const availableWidth = dimensions.width - (padding * 2)
  const availableHeight = dimensions.height - (padding * 2)
  
  let scaledWidth: number
  let scaledHeight: number
  
  if (availableWidth / availableHeight > aspectRatio) {
    scaledHeight = availableHeight
    scaledWidth = scaledHeight * aspectRatio
  } else {
    scaledWidth = availableWidth
    scaledHeight = scaledWidth / aspectRatio
  }
  
  const mockupBounds = {
    left: (dimensions.width - scaledWidth) / 2,
    top: (dimensions.height - scaledHeight) / 2,
    width: scaledWidth,
    height: scaledHeight,
  }
  
  // Update the ref so exportImage can access the bounds
  mockupBoundsRef.current = mockupBounds
  
  // Calculate center points for snapping
  const mockupCenterX = mockupBounds.left + mockupBounds.width / 2
  const mockupCenterY = mockupBounds.top + mockupBounds.height / 2
  
  // Initialize position ONCE when dimensions are ready
  // After that, position is controlled by drag
  const [positionInitialized, setPositionInitialized] = useState(false)
  
  // Track previous mockup bounds to detect resize
  const prevMockupBoundsRef = useRef<typeof mockupBounds | null>(null)
  
  useEffect(() => {
    if (positionInitialized) return
    if (dimensions.width === 0 || dimensions.height === 0) return
    if (scaledWidth === 0 || scaledHeight === 0) return
    
    // Use store percentage values to calculate pixel position
    // waveformConfig.x and waveformConfig.y are 0-100 percentages within mockup bounds
    const storeX = waveformConfig.x ?? 50
    const storeY = waveformConfig.y ?? 50
    
    // Convert percentage to pixel position within mockup bounds
    const pixelX = mockupBounds.left + (storeX / 100) * mockupBounds.width
    const pixelY = mockupBounds.top + (storeY / 100) * mockupBounds.height
    
    setPosition({ x: pixelX, y: pixelY })
    setPositionInitialized(true)
    prevMockupBoundsRef.current = mockupBounds
  }, [dimensions, scaledWidth, scaledHeight, positionInitialized, mockupBounds, waveformConfig.x, waveformConfig.y])
  
  // Update waveform position when window/container resizes (mockupBounds change)
  useEffect(() => {
    if (!positionInitialized) return
    if (!prevMockupBoundsRef.current) return
    
    const prevBounds = prevMockupBoundsRef.current
    
    // Check if bounds actually changed
    if (prevBounds.width === mockupBounds.width && 
        prevBounds.height === mockupBounds.height &&
        prevBounds.left === mockupBounds.left &&
        prevBounds.top === mockupBounds.top) {
      return
    }
    
    // Recalculate pixel position based on percentage values in store
    const storeX = waveformConfig.x ?? 50
    const storeY = waveformConfig.y ?? 50
    
    const newPixelX = mockupBounds.left + (storeX / 100) * mockupBounds.width
    const newPixelY = mockupBounds.top + (storeY / 100) * mockupBounds.height
    
    setPosition({ x: newPixelX, y: newPixelY })
    
    // Update the Konva node directly for immediate visual update
    if (waveformGroupRef.current) {
      waveformGroupRef.current.x(newPixelX)
      waveformGroupRef.current.y(newPixelY)
      waveformGroupRef.current.getLayer()?.batchDraw()
    }
    
    prevMockupBoundsRef.current = mockupBounds
  }, [mockupBounds, positionInitialized, waveformConfig.x, waveformConfig.y])

  // Attach transformer to waveform group - also update when waveform config changes
  // Note: peakAmplitude dependency is handled in a separate effect below (after peakAmplitude is defined)
  useEffect(() => {
    if (selectedElement === 'waveform' && transformerRef.current && waveformGroupRef.current) {
      transformerRef.current.nodes([waveformGroupRef.current])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [waveformData, barWidth, barGap, waveformConfig.style, config.waveformSize, config.waveformHeightMultiplier, selectedElement])
  
  // Force redraw when gradient values, barRounded, barWidth, or barGap change - Konva may not automatically re-render
  useEffect(() => {
    if (waveformGroupRef.current) {
      waveformGroupRef.current.getLayer()?.batchDraw()
    }
  }, [waveformUseGradient, waveformGradientStops, waveformGradientDirection, barRounded, barWidth, barGap])
  
  // Attach transformer to selected text element
  useEffect(() => {
    if (textTransformerRef.current) {
      if (selectedElement && selectedElement !== 'waveform' && selectedElement !== 'qrcode') {
        const textNode = textRefs.current.get(selectedElement)
        if (textNode) {
          textTransformerRef.current.nodes([textNode])
          textTransformerRef.current.getLayer()?.batchDraw()
        } else {
          textTransformerRef.current.nodes([])
        }
      } else {
        textTransformerRef.current.nodes([])
      }
    }
  }, [selectedElement, textConfig.textElements])
  
  // Attach transformer to QR code
  useEffect(() => {
    if (qrTransformerRef.current) {
      if (selectedElement === 'qrcode' && qrCodeRef.current) {
        qrTransformerRef.current.nodes([qrCodeRef.current])
        qrTransformerRef.current.getLayer()?.batchDraw()
      } else {
        qrTransformerRef.current.nodes([])
      }
    }
  }, [selectedElement, qrCodeConfig.showQRCode])
  
  // Waveform dimensions - proportional to mockup bounds
  // waveformSize 100 = 60% of mockup width, scales from there
  const sizeMultiplier = (config.waveformSize || 100) / 100
  const baseWidth = mockupBounds.width * 0.6
  const baseHeight = mockupBounds.height * 0.4
  const waveformWidth = Math.max(50, baseWidth * sizeMultiplier)
  const waveformHeight = Math.max(30, baseHeight * sizeMultiplier)
  
  // Snap threshold in pixels
  const SNAP_THRESHOLD = 10
  const EDGE_SNAP_THRESHOLD = 8
  
  // Edge snap state for visual guides
  const [edgeSnaps, setEdgeSnaps] = useState({ left: false, right: false, top: false, bottom: false })
  
  // Helper to calculate element bounds and check edge snapping
  const getElementBounds = useCallback((x: number, y: number, scaleX: number, scaleY: number, width: number, height: number) => {
    const halfWidth = (width * scaleX) / 2
    const halfHeight = (height * scaleY) / 2
    return {
      left: x - halfWidth,
      right: x + halfWidth,
      top: y - halfHeight,
      bottom: y + halfHeight,
      halfWidth,
      halfHeight
    }
  }, [])
  
  // Constrain position to keep element within canvas bounds
  const constrainToCanvas = useCallback((x: number, y: number, scaleX: number, scaleY: number, width: number, height: number) => {
    const halfWidth = (width * scaleX) / 2
    const halfHeight = (height * scaleY) / 2
    
    // Calculate min/max allowed positions
    const minX = mockupBounds.left + halfWidth
    const maxX = mockupBounds.left + mockupBounds.width - halfWidth
    const minY = mockupBounds.top + halfHeight
    const maxY = mockupBounds.top + mockupBounds.height - halfHeight
    
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y))
    }
  }, [mockupBounds])
  
  // Check edge snapping and return snapped position
  const checkEdgeSnapping = useCallback((x: number, y: number, scaleX: number, scaleY: number, width: number, height: number) => {
    const bounds = getElementBounds(x, y, scaleX, scaleY, width, height)
    
    let snappedX = x
    let snappedY = y
    const snaps = { left: false, right: false, top: false, bottom: false }
    
    // Check left edge
    const leftDist = Math.abs(bounds.left - mockupBounds.left)
    if (leftDist < EDGE_SNAP_THRESHOLD) {
      snappedX = mockupBounds.left + bounds.halfWidth
      snaps.left = true
    }
    
    // Check right edge
    const rightDist = Math.abs(bounds.right - (mockupBounds.left + mockupBounds.width))
    if (rightDist < EDGE_SNAP_THRESHOLD) {
      snappedX = mockupBounds.left + mockupBounds.width - bounds.halfWidth
      snaps.right = true
    }
    
    // Check top edge
    const topDist = Math.abs(bounds.top - mockupBounds.top)
    if (topDist < EDGE_SNAP_THRESHOLD) {
      snappedY = mockupBounds.top + bounds.halfHeight
      snaps.top = true
    }
    
    // Check bottom edge
    const bottomDist = Math.abs(bounds.bottom - (mockupBounds.top + mockupBounds.height))
    if (bottomDist < EDGE_SNAP_THRESHOLD) {
      snappedY = mockupBounds.top + mockupBounds.height - bounds.halfHeight
      snaps.bottom = true
    }
    
    return { x: snappedX, y: snappedY, snaps }
  }, [mockupBounds, getElementBounds])

  // Calculate actual waveform bounds based on style and settings
  // Use the *rendered* amplitudes (after optimized sampling) so bounds match what users see
  const renderedAmplitudes = React.useMemo(() => {
    if (waveformData.length === 0) return waveformData
    if (!optimizedBars) return waveformData
    // Match the optimized sampling logic used in renderWaveform
    const desiredBarWidth = barWidth || 3
    const desiredGap = barGap ?? 1
    const minSlotWidth = desiredBarWidth + desiredGap
    const maxBars = Math.max(1, Math.floor(waveformWidth / minSlotWidth))
    const actualBars = Math.min(waveformData.length, maxBars)
    if (actualBars >= waveformData.length) return waveformData
    return Array.from({ length: actualBars }, (_, i) => {
      const idx = Math.floor((i / actualBars) * waveformData.length)
      return waveformData[idx]
    })
  }, [waveformData, optimizedBars, barWidth, barGap, waveformWidth])

  // Calculate peak amplitude from the rendered data for tight bounds
  // Ensures transformer controls hug the visible waveform, not the theoretical maximum
  const peakAmplitude = React.useMemo(() => {
    if (renderedAmplitudes.length === 0) return 1
    const peak = Math.max(...renderedAmplitudes)
    // Ensure a minimum so the transformer doesn't become too small to interact with
    return Math.max(0.2, peak)
  }, [renderedAmplitudes])
  
  // Force transformer to recalculate bounds when peak amplitude changes or bounds change
  // This ensures the transformer controls match the actual rendered waveform height
  // Note: This effect must be AFTER peakAmplitude is defined
  useEffect(() => {
    if (selectedElement === 'waveform' && transformerRef.current && waveformGroupRef.current) {
      // Force the transformer to recalculate its bounding box
      transformerRef.current.nodes([waveformGroupRef.current])
      transformerRef.current.forceUpdate()
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [peakAmplitude, selectedElement, waveformConfig.heightMultiplier, waveformWidth, waveformHeight])
  
  const getActualWaveformBounds = useCallback(() => {
    const isCircular = waveformConfig.style === 'circular' || waveformConfig.style === 'vinyl' || waveformConfig.style === 'circular-blocks' || waveformConfig.style === 'laser'
    const isImageMask = waveformConfig.style === 'image-mask'
    const isImageMaskCircular = isImageMask && imageMaskConfig.imageMaskShape === 'circular'
    const heightMult = (waveformConfig.heightMultiplier || 100) / 100
    
    let boundWidth: number
    let boundHeight: number
    
    // Use the actual peak amplitude from rendered data to get tight bounds
    // This makes the transformer controls hug the actual visible waveform
    const actualPeak = renderedAmplitudes.length > 0 ? Math.max(...renderedAmplitudes) : 1
    
    if (isImageMaskCircular || isCircular) {
      // For circular styles: use the actual circle diameter
      const innerRadius = (waveformConfig.circleRadius || 50) * (waveformWidth / 400)
      const maxBarLength = (waveformHeight / 2) * heightMult * actualPeak
      const circleSize = (innerRadius + maxBarLength) * 2
      boundWidth = circleSize
      boundHeight = circleSize
    } else {
      // For rectangular styles (bars, mirror, smooth, etc.):
      // Width is always the full waveformWidth
      // Height is based on the actual tallest bar
      boundWidth = waveformWidth
      boundHeight = waveformHeight * heightMult * actualPeak
    }
    
    return { boundWidth, boundHeight }
  }, [waveformConfig.style, waveformConfig.heightMultiplier, waveformConfig.circleRadius, imageMaskConfig.imageMaskShape, waveformWidth, waveformHeight, renderedAmplitudes])

  // Check if element is within printable bounds
  const checkWaveformBounds = useCallback((x: number, y: number, scaleX: number, scaleY: number) => {
    const { boundWidth, boundHeight } = getActualWaveformBounds()
    
    const halfWidth = (boundWidth * scaleX) / 2
    const halfHeight = (boundHeight * scaleY) / 2
    
    const left = x - halfWidth
    const right = x + halfWidth
    const top = y - halfHeight
    const bottom = y + halfHeight
    
    // Check if any part of the waveform is outside the mockup bounds
    const outsideBounds = 
      left < mockupBounds.left ||
      right > mockupBounds.left + mockupBounds.width ||
      top < mockupBounds.top ||
      bottom > mockupBounds.top + mockupBounds.height
    
    return outsideBounds
  }, [getActualWaveformBounds, mockupBounds])  // Drag handlers with snap-to-center and edge snapping
  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    setSelectedElement('waveform')
  }, [])
  
  const handleDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target
    let x = node.x()
    let y = node.y()
    
    // Get actual waveform bounds based on style
    const { boundWidth, boundHeight } = getActualWaveformBounds()
    
    // No constraining - allow Photoshop-like free movement outside printable area
    
    // Check edge snapping
    const edgeSnap = checkEdgeSnapping(x, y, scale.x, scale.y, boundWidth, boundHeight)
    
    // Check if near horizontal center (overrides edge snap for x)
    const nearHorizontalCenter = Math.abs(x - mockupCenterX) < SNAP_THRESHOLD
    // Check if near vertical center (overrides edge snap for y)
    const nearVerticalCenter = Math.abs(y - mockupCenterY) < SNAP_THRESHOLD
    
    // Apply snapping - center takes priority over edge
    if (nearHorizontalCenter) {
      x = mockupCenterX
    } else if (edgeSnap.snaps.left || edgeSnap.snaps.right) {
      x = edgeSnap.x
    }
    
    if (nearVerticalCenter) {
      y = mockupCenterY
    } else if (edgeSnap.snaps.top || edgeSnap.snaps.bottom) {
      y = edgeSnap.y
    }
    
    node.x(x)
    node.y(y)
    
    // Update guide visibility
    setShowCenterGuides({
      horizontal: nearVerticalCenter,
      vertical: nearHorizontalCenter
    })
    
    // Update edge snap guides
    setEdgeSnaps({
      left: !nearHorizontalCenter && edgeSnap.snaps.left,
      right: !nearHorizontalCenter && edgeSnap.snaps.right,
      top: !nearVerticalCenter && edgeSnap.snaps.top,
      bottom: !nearVerticalCenter && edgeSnap.snaps.bottom
    })
    
    // Check bounds during drag
    const isOutside = checkWaveformBounds(x, y, scale.x, scale.y)
    setWaveformOutsideBounds(isOutside)
  }, [mockupCenterX, mockupCenterY, scale, getActualWaveformBounds, checkWaveformBounds, checkEdgeSnapping])
  
  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(false)
    setShowCenterGuides({ horizontal: false, vertical: false })
    setEdgeSnaps({ left: false, right: false, top: false, bottom: false })
    const node = e.target
    setPosition({ x: node.x(), y: node.y() })
    
    // Sync to store (only if bounds are valid)
    if (mockupBounds.width > 0 && mockupBounds.height > 0) {
      const relX = node.x() - mockupBounds.left
      const relY = node.y() - mockupBounds.top
      const pctX = (relX / mockupBounds.width) * 100
      const pctY = (relY / mockupBounds.height) * 100
      // Allow outside 0-100 for bleeding effect
      actions.setWaveformPosition(pctX, pctY)
    }
  }, [mockupBounds, actions])
  
  // Text element handlers
  const handleTextDragStart = useCallback((textId: string) => {
    setIsDragging(true)
    setSelectedElement(textId)
    actions.selectTextElement(textId)
  }, [actions])
  
  const handleTextDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target as Konva.Text
    let x = node.x()
    let y = node.y()
    
    // Get text element dimensions (text uses top-left positioning, not center)
    const textWidth = node.width() || 100
    const textHeight = node.height() || 30
    
    // Constrain to canvas (text uses top-left origin, so adjust bounds)
    const minX = mockupBounds.left
    const maxX = mockupBounds.left + mockupBounds.width - textWidth
    const minY = mockupBounds.top
    const maxY = mockupBounds.top + mockupBounds.height - textHeight
    
    x = Math.max(minX, Math.min(maxX, x))
    y = Math.max(minY, Math.min(maxY, y))
    
    // Snap to center
    const nearHorizontalCenter = Math.abs(x + textWidth / 2 - mockupCenterX) < SNAP_THRESHOLD
    const nearVerticalCenter = Math.abs(y + textHeight / 2 - mockupCenterY) < SNAP_THRESHOLD
    
    if (nearHorizontalCenter) {
      x = mockupCenterX - textWidth / 2
    }
    if (nearVerticalCenter) {
      y = mockupCenterY - textHeight / 2
    }
    
    // Check edge snapping for text
    const leftDist = Math.abs(x - mockupBounds.left)
    const rightDist = Math.abs((x + textWidth) - (mockupBounds.left + mockupBounds.width))
    const topDist = Math.abs(y - mockupBounds.top)
    const bottomDist = Math.abs((y + textHeight) - (mockupBounds.top + mockupBounds.height))
    
    const textEdgeSnaps = { left: false, right: false, top: false, bottom: false }
    
    if (!nearHorizontalCenter) {
      if (leftDist < EDGE_SNAP_THRESHOLD) {
        x = mockupBounds.left
        textEdgeSnaps.left = true
      } else if (rightDist < EDGE_SNAP_THRESHOLD) {
        x = mockupBounds.left + mockupBounds.width - textWidth
        textEdgeSnaps.right = true
      }
    }
    
    if (!nearVerticalCenter) {
      if (topDist < EDGE_SNAP_THRESHOLD) {
        y = mockupBounds.top
        textEdgeSnaps.top = true
      } else if (bottomDist < EDGE_SNAP_THRESHOLD) {
        y = mockupBounds.top + mockupBounds.height - textHeight
        textEdgeSnaps.bottom = true
      }
    }
    
    node.x(x)
    node.y(y)
    
    setShowCenterGuides({
      horizontal: nearVerticalCenter,
      vertical: nearHorizontalCenter
    })
    
    setEdgeSnaps(textEdgeSnaps)
  }, [mockupCenterX, mockupCenterY, mockupBounds])
  
  const handleTextDragEnd = useCallback((textId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(false)
    setShowCenterGuides({ horizontal: false, vertical: false })
    setEdgeSnaps({ left: false, right: false, top: false, bottom: false })
    const node = e.target
    
    // Convert to percentage coordinates
    if (mockupBounds.width > 0 && mockupBounds.height > 0) {
      const relX = node.x() - mockupBounds.left
      const relY = node.y() - mockupBounds.top
      const pctX = (relX / mockupBounds.width) * 100
      const pctY = (relY / mockupBounds.height) * 100
      
      actions.updateTextElement(textId, {
        x: Math.max(0, Math.min(100, pctX)),
        y: Math.max(0, Math.min(100, pctY))
      })
    }
  }, [mockupBounds, actions])
  
  const handleTextTransformEnd = useCallback((textId: string, e: Konva.KonvaEventObject<Event>) => {
    const node = e.target as Konva.Text
    
    // Get the new font size based on scale
    const scaleX = node.scaleX()
    const element = textConfig.textElements.find(el => el.id === textId)
    if (element) {
      const newFontSize = Math.round(element.fontSize * scaleX)
      
      // Reset scale and update font size
      node.scaleX(1)
      node.scaleY(1)
      
      // Convert position to percentage
      if (mockupBounds.width > 0 && mockupBounds.height > 0) {
        const relX = node.x() - mockupBounds.left
        const relY = node.y() - mockupBounds.top
        const pctX = (relX / mockupBounds.width) * 100
        const pctY = (relY / mockupBounds.height) * 100
        
        actions.updateTextElement(textId, {
          fontSize: Math.max(12, Math.min(200, newFontSize)),
          x: Math.max(0, Math.min(100, pctX)),
          y: Math.max(0, Math.min(100, pctY))
        })
      }
    }
  }, [textConfig.textElements, mockupBounds, actions])
  
  // Handle stage click to deselect (works for both mouse and touch)
  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    // Deselect if clicking on empty space OR outside the mockup bounds
    const stage = e.target.getStage()
    if (!stage) return
    
    const pos = stage.getPointerPosition()
    if (!pos) return
    
    // Check if click is outside mockup bounds
    const isOutsideMockup = pos.x < mockupBounds.left || 
                            pos.x > mockupBounds.left + mockupBounds.width ||
                            pos.y < mockupBounds.top || 
                            pos.y > mockupBounds.top + mockupBounds.height
    
    // Deselect if clicking on stage background or outside mockup
    if (e.target === stage || isOutsideMockup) {
      setSelectedElement(null)
      actions.selectTextElement(null)
    }
  }, [actions, mockupBounds])
  
  // Zoom with scroll wheel
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    
    // If zoom is locked, don't process wheel events
    if (zoomLocked) return
    
    const stage = stageRef.current
    if (!stage) return
    
    const scaleBy = 1.1
    const oldScale = stageZoom
    const pointer = stage.getPointerPosition()
    
    if (!pointer) return
    
    // Calculate new scale
    const direction = e.evt.deltaY < 0 ? 1 : -1
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy
    
    // Clamp zoom level
    const clampedScale = Math.max(0.5, Math.min(3, newScale))
    
    // Calculate new position to zoom towards pointer
    const mousePointTo = {
      x: (pointer.x - stagePosition.x) / oldScale,
      y: (pointer.y - stagePosition.y) / oldScale,
    }
    
    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    }
    
    setStageZoom(clampedScale)
    setStagePosition(newPos)
  }, [stageZoom, stagePosition, zoomLocked])
  
  // Pan with middle mouse button or spacebar + drag
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // Middle mouse button (button 1) for pan
    if (e.evt.button === 1) {
      e.evt.preventDefault()
      setIsPanning(true)
      lastPanPos.current = { x: e.evt.clientX, y: e.evt.clientY }
    }
  }, [])
  
  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanning) {
      const dx = e.evt.clientX - lastPanPos.current.x
      const dy = e.evt.clientY - lastPanPos.current.y
      
      setStagePosition(prev => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }))
      
      lastPanPos.current = { x: e.evt.clientX, y: e.evt.clientY }
    }
  }, [isPanning])
  
  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])
  
  // Reset zoom
  const resetZoom = useCallback(() => {
    setStageZoom(1)
    setStagePosition({ x: 0, y: 0 })
  }, [])
  
  // Transform handlers
  const handleTransformStart = useCallback(() => {
    setIsResizing(true)
    setSelectedElement('waveform')
  }, [])
  
  const handleTransform = useCallback(() => {
    // Check bounds and snap during transform
    const node = waveformGroupRef.current
    if (node) {
      let x = node.x()
      let y = node.y()
      const currentScaleX = node.scaleX()
      const currentScaleY = node.scaleY()
      
      // Check if near horizontal center
      const nearHorizontalCenter = Math.abs(x - mockupCenterX) < SNAP_THRESHOLD
      // Check if near vertical center
      const nearVerticalCenter = Math.abs(y - mockupCenterY) < SNAP_THRESHOLD
      
      // Apply snapping during resize
      if (nearHorizontalCenter) {
        x = mockupCenterX
        node.x(x)
      }
      if (nearVerticalCenter) {
        y = mockupCenterY
        node.y(y)
      }
      
      // Update guide visibility
      setShowCenterGuides({
        horizontal: nearVerticalCenter,
        vertical: nearHorizontalCenter
      })
      
      const isOutside = checkWaveformBounds(x, y, currentScaleX, currentScaleY)
      setWaveformOutsideBounds(isOutside)
    }
  }, [checkWaveformBounds, mockupCenterX, mockupCenterY])
  
  const handleTransformEnd = useCallback(() => {
    setIsResizing(false)
    setShowCenterGuides({ horizontal: false, vertical: false })
    const node = waveformGroupRef.current
    if (node) {
      // Just keep the scale like the demo does - don't reset it
      setScale({ x: node.scaleX(), y: node.scaleY() })
      setPosition({ x: node.x(), y: node.y() })
    }
  }, [])
  
  // Handle waveform click to select
  const handleWaveformClick = useCallback(() => {
    setSelectedElement('waveform')
    actions.selectTextElement(null)
  }, [actions])
  
  // Update bounds check when position or scale changes
  useEffect(() => {
    if (position) {
      const isOutside = checkWaveformBounds(position.x, position.y, scale.x, scale.y)
      setWaveformOutsideBounds(isOutside)
    }
  }, [position, scale, checkWaveformBounds])
  
  // Center selected element
  const handleCenterElement = useCallback(() => {
    if (!selectedElement) return
    
    if (selectedElement === 'waveform') {
      const centerX = mockupBounds.left + mockupBounds.width / 2
      const centerY = mockupBounds.top + mockupBounds.height / 2
      setPosition({ x: centerX, y: centerY })
      if (waveformGroupRef.current) {
        waveformGroupRef.current.x(centerX)
        waveformGroupRef.current.y(centerY)
      }
      actions.setWaveformPosition(50, 50)
    } else if (selectedElement === 'qrcode') {
      // Center QR code
      setQRCodeX(50)
      setQRCodeY(50)
    } else {
      // Center text element horizontally only - need to account for text width
      const textNode = textRefs.current.get(selectedElement)
      if (textNode) {
        // Get the text width
        const textWidth = textNode.width()
        
        // Calculate the offset as a percentage of the mockup bounds
        const widthPercent = (textWidth / mockupBounds.width) * 100
        
        // Center position minus half the text width (in percentage)
        const centeredX = 50 - widthPercent / 2
        
        // Only update X, keep Y as is
        actions.updateTextElement(selectedElement, { x: centeredX })
      } else {
        // Fallback if we can't get the text node
        actions.updateTextElement(selectedElement, { x: 50 })
      }
    }
  }, [selectedElement, mockupBounds, actions, setQRCodeX, setQRCodeY])
  
  // Reset waveform scale to default (1:1) and recenter
  const handleResetDimensions = useCallback(() => {
    // Reset scale
    setScale({ x: 1, y: 1 })
    if (waveformGroupRef.current) {
      waveformGroupRef.current.scaleX(1)
      waveformGroupRef.current.scaleY(1)
    }
    // Also recenter the waveform
    const centerX = mockupBounds.left + mockupBounds.width / 2
    const centerY = mockupBounds.top + mockupBounds.height / 2
    setPosition({ x: centerX, y: centerY })
    if (waveformGroupRef.current) {
      waveformGroupRef.current.x(centerX)
      waveformGroupRef.current.y(centerY)
    }
    actions.setWaveformPosition(50, 50)
  }, [mockupBounds, actions])
  
  // Get gradient properties for waveform
  const getWaveformGradientProps = useCallback(() => {
    if (!waveformUseGradient || !waveformGradientStops || waveformGradientStops.length < 2) {
      return {}
    }
    
    const stops = waveformGradientStops
    const direction = waveformGradientDirection || 'horizontal'
    
    // Build color stops array for Konva
    const colorStops: (number | string)[] = []
    stops.forEach(stop => {
      colorStops.push(stop.position, stop.color)
    })
    
    // Handle radial gradient separately
    if (direction === 'radial') {
      const radius = Math.max(waveformWidth, waveformHeight) / 2
      return {
        fillRadialGradientStartPoint: { x: 0, y: 0 },
        fillRadialGradientEndPoint: { x: 0, y: 0 },
        fillRadialGradientStartRadius: 0,
        fillRadialGradientEndRadius: radius,
        fillRadialGradientColorStops: colorStops,
      }
    }
    
    // Linear gradient start/end points based on waveform bounds
    let startX = -waveformWidth / 2
    let startY = 0
    let endX = waveformWidth / 2
    let endY = 0
    
    if (direction === 'vertical') {
      startX = 0
      startY = -waveformHeight / 2
      endX = 0
      endY = waveformHeight / 2
    } else if (direction === 'diagonal') {
      startX = -waveformWidth / 2
      startY = -waveformHeight / 2
      endX = waveformWidth / 2
      endY = waveformHeight / 2
    }
    
    return {
      fillLinearGradientStartPoint: { x: startX, y: startY },
      fillLinearGradientEndPoint: { x: endX, y: endY },
      fillLinearGradientColorStops: colorStops,
    }
  }, [waveformUseGradient, waveformGradientStops, waveformGradientDirection, waveformWidth, waveformHeight])

  // Get gradient properties for background
  const getBackgroundGradientProps = useCallback(() => {
    if (!backgroundConfig.useGradient || !backgroundConfig.gradientStops || backgroundConfig.gradientStops.length < 2) {
      return {}
    }
    
    const stops = backgroundConfig.gradientStops
    const direction = backgroundConfig.gradientDirection || 'horizontal'
    
    // Build color stops array for Konva
    const colorStops: (number | string)[] = []
    stops.forEach(stop => {
      colorStops.push(stop.position, stop.color)
    })
    
    // Handle radial gradient separately
    if (direction === 'radial') {
      const centerX = mockupBounds.width / 2
      const centerY = mockupBounds.height / 2
      const radius = Math.max(mockupBounds.width, mockupBounds.height) / 2
      return {
        fillRadialGradientStartPoint: { x: centerX, y: centerY },
        fillRadialGradientEndPoint: { x: centerX, y: centerY },
        fillRadialGradientStartRadius: 0,
        fillRadialGradientEndRadius: radius,
        fillRadialGradientColorStops: colorStops,
      }
    }
    
    // Linear gradient start/end points based on mockup bounds
    let startX = 0
    let startY = 0
    let endX = mockupBounds.width
    let endY = 0
    
    if (direction === 'vertical') {
      startX = 0
      startY = 0
      endX = 0
      endY = mockupBounds.height
    } else if (direction === 'diagonal') {
      startX = 0
      startY = 0
      endX = mockupBounds.width
      endY = mockupBounds.height
    }
    
    return {
      fillLinearGradientStartPoint: { x: startX, y: startY },
      fillLinearGradientEndPoint: { x: endX, y: endY },
      fillLinearGradientColorStops: colorStops,
    }
  }, [backgroundConfig.useGradient, backgroundConfig.gradientStops, backgroundConfig.gradientDirection, mockupBounds.width, mockupBounds.height])

  // Render waveform based on style
  const renderWaveform = () => {
    const style = waveformConfig.style || 'bars'
    const color = waveformConfig.color || '#3b82f6'
    // Use direct store subscriptions for values (more reliable reactivity)
    const useGradient = waveformUseGradient
    const gradientStops = waveformGradientStops
    const gradientDirection = waveformGradientDirection
    const barW = barWidth || 3
    const gap = barGap ?? 1
    // Use direct subscription for barRounded to ensure reactivity
    const isBarRounded = barRounded ?? false
    const heightMult = (config.waveformHeightMultiplier || 100) / 100
    
    // Helper function to interpolate between gradient colors based on position
    const getColorAtPosition = (position: number): string => {
      if (!gradientStops || gradientStops.length < 2) {
        return color
      }
      
      // Create a sorted copy (don't mutate the original array)
      const stops = [...gradientStops].sort((a, b) => a.position - b.position)
      
      // Clamp position to 0-1
      const t = Math.max(0, Math.min(1, position))
      
      // Find the two stops we're between
      let startStop = stops[0]
      let endStop = stops[stops.length - 1]
      
      for (let i = 0; i < stops.length - 1; i++) {
        if (t >= stops[i].position && t <= stops[i + 1].position) {
          startStop = stops[i]
          endStop = stops[i + 1]
          break
        }
      }
      
      // Calculate interpolation factor
      const range = endStop.position - startStop.position
      const localT = range > 0 ? (t - startStop.position) / range : 0
      
      // Parse colors and interpolate
      const parseHex = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 }
      }
      
      const start = parseHex(startStop.color)
      const end = parseHex(endStop.color)
      
      const r = Math.round(start.r + (end.r - start.r) * localT)
      const g = Math.round(start.g + (end.g - start.g) * localT)
      const b = Math.round(start.b + (end.b - start.b) * localT)
      
      return `rgb(${r}, ${g}, ${b})`
    }
    
    // Get fill color for a bar based on its position in the waveform
    const getBarFill = (barIndex: number, totalBars: number): string => {
      if (!useGradient || !gradientStops || gradientStops.length < 2) {
        return color
      }
      
      const direction = gradientDirection || 'horizontal'
      
      if (direction === 'horizontal') {
        // Position from 0 to 1 based on bar index
        const position = totalBars > 1 ? barIndex / (totalBars - 1) : 0.5
        return getColorAtPosition(position)
      } else if (direction === 'vertical') {
        // For vertical, all bars get the middle color (gradient applied per-bar height later)
        return getColorAtPosition(0.5)
      } else if (direction === 'radial') {
        // For radial, calculate distance from center (0 at center, 1 at edges)
        const centerIndex = (totalBars - 1) / 2
        const distanceFromCenter = Math.abs(barIndex - centerIndex) / centerIndex
        return getColorAtPosition(distanceFromCenter)
      } else {
        // Diagonal - mix based on position
        const position = totalBars > 1 ? barIndex / (totalBars - 1) : 0.5
        return getColorAtPosition(position)
      }
    }
    
    // For shapes that cover the full waveform area (Line, etc.), use Konva's linear/radial gradient
    const getGradientForShape = (): Record<string, unknown> => {
      if (!useGradient || !gradientStops || gradientStops.length < 2) {
        return { fill: color }
      }
      
      const stops = gradientStops
      const direction = gradientDirection || 'horizontal'
      const colorStops: (number | string)[] = []
      stops.forEach(stop => {
        colorStops.push(stop.position, stop.color)
      })
      
      // Handle radial gradient
      if (direction === 'radial') {
        const radius = Math.max(waveformWidth, waveformHeight) / 2
        return {
          fillRadialGradientStartPoint: { x: 0, y: 0 },
          fillRadialGradientEndPoint: { x: 0, y: 0 },
          fillRadialGradientStartRadius: 0,
          fillRadialGradientEndRadius: radius,
          fillRadialGradientColorStops: colorStops,
        }
      }
      
      let startX = -waveformWidth / 2
      let startY = 0
      let endX = waveformWidth / 2
      let endY = 0
      
      if (direction === 'vertical') {
        startX = 0
        startY = -waveformHeight / 2
        endX = 0
        endY = waveformHeight / 2
      } else if (direction === 'diagonal') {
        startX = -waveformWidth / 2
        startY = -waveformHeight / 2
        endX = waveformWidth / 2
        endY = waveformHeight / 2
      }
      
      return {
        fillLinearGradientStartPoint: { x: startX, y: startY },
        fillLinearGradientEndPoint: { x: endX, y: endY },
        fillLinearGradientColorStops: colorStops,
      }
    }
    
    switch (style) {
      case 'bars':
      case 'gradient-bars':
      case 'neon':
      case 'equalizer': {
        // Calculate how many bars to render based on optimizedBars setting
        const desiredBarWidth = barW
        const desiredGap = gap
        const minSlotWidth = desiredBarWidth + desiredGap
        
        // In optimized mode, limit bars to what fits nicely; otherwise render all
        const maxBars = Math.max(1, Math.floor(waveformWidth / minSlotWidth))
        const actualBars = optimizedBars ? Math.min(waveformData.length, maxBars) : waveformData.length
        
        // Calculate spacing and bar width
        const spacing = waveformWidth / actualBars
        const actualBarWidth = optimizedBars 
          ? Math.min(desiredBarWidth, Math.max(1, spacing - desiredGap))
          : Math.max(0.5, spacing * (desiredBarWidth / (desiredBarWidth + desiredGap)))
        
        // Create a gradient key to force re-render when colors change
        const gradientKey = useGradient ? gradientStops?.map(s => s.color).join('-') : color
        // Corner radius: neon always rounded, others based on barRounded setting
        // Use half the bar width for rounded corners (pill shape)
        const cornerRadius = style === 'neon' || isBarRounded ? Math.max(0.25, actualBarWidth / 2) : 0
        
        // Sample waveform data if in optimized mode with fewer bars
        const renderData = (optimizedBars && actualBars < waveformData.length)
          ? Array.from({ length: actualBars }, (_, i) => {
              const idx = Math.floor((i / actualBars) * waveformData.length)
              return waveformData[idx]
            })
          : waveformData
        
        return renderData.map((amplitude, i) => {
          const barH = amplitude * waveformHeight * heightMult
          // Center each bar on its position by offsetting by half the bar width
          const x = -waveformWidth / 2 + i * spacing + (spacing - actualBarWidth) / 2
          const y = -barH / 2
          const barFill = getBarFill(i, actualBars)
          
          return (
            <Rect
              key={`${i}-${gradientKey}-${isBarRounded}-${actualBars}-${optimizedBars}`}
              x={x}
              y={y}
              width={actualBarWidth}
              height={barH}
              fill={barFill}
              cornerRadius={cornerRadius}
              shadowColor={style === 'neon' ? color : undefined}
              shadowBlur={style === 'neon' ? 10 : 0}
              shadowOpacity={style === 'neon' ? 0.8 : 0}
            />
          )
        })
      }
      
      case 'smooth':
      case 'wave':
      case 'soundwave': {
        // Smooth filled waveform using Line with closed path
        if (waveformData.length < 2) return null
        
        const points: number[] = []
        const bottomPoints: number[] = []
        
        for (let i = 0; i < waveformData.length; i++) {
          const x = -waveformWidth / 2 + (i / (waveformData.length - 1)) * waveformWidth
          const h = waveformData[i] * (waveformHeight / 2) * heightMult
          points.push(x, -h)
          bottomPoints.unshift(x, h)
        }
        
        return (
          <Line
            points={[...points, ...bottomPoints]}
            {...getGradientForShape()}
            closed
            tension={0.4}
          />
        )
      }
      
      case 'mirror': {
        // Mirror style - bars on top and bottom
        const desiredBarWidth = barW
        const desiredGap = gap
        const minSlotWidth = desiredBarWidth + desiredGap
        
        // In optimized mode, limit bars; otherwise render all
        const maxBars = Math.max(1, Math.floor(waveformWidth / minSlotWidth))
        const actualBars = optimizedBars ? Math.min(waveformData.length, maxBars) : waveformData.length
        
        const spacing = waveformWidth / actualBars
        const actualBarWidth = optimizedBars
          ? Math.min(desiredBarWidth, Math.max(1, spacing - desiredGap))
          : Math.max(0.5, spacing * (desiredBarWidth / (desiredBarWidth + desiredGap)))
        
        const mirrorCornerRadius = isBarRounded ? Math.max(0.25, actualBarWidth / 2) : 0
        const gradientKey = useGradient ? gradientStops?.map(s => s.color).join('-') : color
        
        // Sample data if in optimized mode
        const renderData = (optimizedBars && actualBars < waveformData.length)
          ? Array.from({ length: actualBars }, (_, i) => {
              const idx = Math.floor((i / actualBars) * waveformData.length)
              return waveformData[idx]
            })
          : waveformData
        
        return renderData.flatMap((amplitude, i) => {
          const barH = amplitude * (waveformHeight / 2) * heightMult
          // Center each bar on its position
          const x = -waveformWidth / 2 + i * spacing + (spacing - actualBarWidth) / 2
          const topY = -barH
          const bottomY = 0
          const fillColor = getBarFill(i, actualBars)
          
          return [
            <Rect
              key={`top-${i}-${gradientKey}-${isBarRounded}-${actualBars}-${optimizedBars}`}
              x={x}
              y={topY}
              width={actualBarWidth}
              height={barH}
              fill={fillColor}
              cornerRadius={mirrorCornerRadius}
            />,
            <Rect
              key={`bottom-${i}-${gradientKey}-${isBarRounded}-${actualBars}-${optimizedBars}`}
              x={x}
              y={bottomY}
              width={actualBarWidth}
              height={barH}
              fill={fillColor}
              cornerRadius={mirrorCornerRadius}
            />
          ]
        })
      }
      
      case 'dots':
      case 'constellation':
      case 'particle': {
        // Dot-based visualization
        const dotRadius = Math.max(2, barW / 2)
        return waveformData.map((amplitude, i) => {
          const x = -waveformWidth / 2 + (i / (waveformData.length - 1)) * waveformWidth
          const y = -amplitude * (waveformHeight / 2) * heightMult
          
          return (
            <Circle
              key={i}
              x={x}
              y={y}
              radius={dotRadius * (0.5 + amplitude * 0.5)}
              fill={color}
              opacity={0.5 + amplitude * 0.5}
            />
          )
        })
      }
      
      case 'circular':
      case 'vinyl': {
        // Circular waveform with optional bottom gap and inner bars
        const centerX = 0
        const centerY = 0
        const innerRadius = (waveformConfig.circleRadius || 50) * (waveformWidth / 400)
        const maxBarLength = (waveformHeight / 2) * heightMult
        const gradientKey = useGradient ? gradientStops?.map(s => s.color).join('-') : color
        
        // Calculate gap angle in radians (gap is at BOTTOM, centered on 3π/2 or 270°)
        const gapAngleRad = (circleGapAngle * Math.PI) / 180
        // Start at top (-π/2) and go clockwise, leaving gap at bottom (π/2)
        const startAngle = -Math.PI / 2 // Start at top (12 o'clock)
        const endAngle = Math.PI * 1.5 - gapAngleRad // End before the bottom gap
        const arcAngle = endAngle - startAngle // Total arc we're drawing
        
        // Calculate bar count based on circumference
        const circumference = 2 * Math.PI * (innerRadius + maxBarLength / 2) * (arcAngle / (2 * Math.PI))
        const minSlotWidth = barW + gap
        const maxBars = Math.max(1, Math.floor(circumference / minSlotWidth))
        const actualBars = optimizedBars ? Math.min(waveformData.length, maxBars) : waveformData.length
        
        // Sample data if in optimized mode
        const renderData = (optimizedBars && actualBars < waveformData.length)
          ? Array.from({ length: actualBars }, (_, i) => {
              const idx = Math.floor((i / actualBars) * waveformData.length)
              return waveformData[idx]
            })
          : waveformData
        
        // Inner bar length (extends inward from inner radius)
        const innerBarMaxLength = circleInnerBars ? innerRadius * 0.6 : 0
        
        return renderData.map((amplitude, i) => {
          // Map index to angle within the arc (accounting for gap)
          const angle = startAngle + (i / actualBars) * arcAngle
          const outerBarLength = amplitude * maxBarLength
          const innerBarLength = circleInnerBars ? amplitude * innerBarMaxLength : 0
          
          // Outer bar (from inner radius outward)
          const x1 = centerX + Math.cos(angle) * innerRadius
          const y1 = centerY + Math.sin(angle) * innerRadius
          const x2 = centerX + Math.cos(angle) * (innerRadius + outerBarLength)
          const y2 = centerY + Math.sin(angle) * (innerRadius + outerBarLength)
          
          // Inner bar (from inner radius inward)
          const x1Inner = centerX + Math.cos(angle) * (innerRadius - innerBarLength)
          const y1Inner = centerY + Math.sin(angle) * (innerRadius - innerBarLength)
          
          const strokeColor = getBarFill(i, actualBars)
          
          if (circleInnerBars) {
            // Draw both inner and outer bars
            return (
              <React.Fragment key={`${i}-${gradientKey}-${isBarRounded}-${circleGapAngle}-${actualBars}-${circleInnerBars}-${optimizedBars}`}>
                <Line
                  points={[x1Inner, y1Inner, x2, y2]}
                  stroke={strokeColor}
                  strokeWidth={barW}
                  lineCap={isBarRounded ? 'round' : 'butt'}
                />
              </React.Fragment>
            )
          }
          
          return (
            <Line
              key={`${i}-${gradientKey}-${isBarRounded}-${circleGapAngle}-${actualBars}-${optimizedBars}`}
              points={[x1, y1, x2, y2]}
              stroke={strokeColor}
              strokeWidth={barW}
              lineCap={isBarRounded ? 'round' : 'butt'}
            />
          )
        })
      }
      
      case 'mountain': {
        // Mountain/filled area
        if (waveformData.length < 2) return null
        
        const points: number[] = [-waveformWidth / 2, waveformHeight / 2]
        
        for (let i = 0; i < waveformData.length; i++) {
          const x = -waveformWidth / 2 + (i / (waveformData.length - 1)) * waveformWidth
          const h = waveformData[i] * waveformHeight * heightMult
          points.push(x, waveformHeight / 2 - h)
        }
        
        points.push(waveformWidth / 2, waveformHeight / 2)
        
        return (
          <Line
            points={points}
            {...getGradientForShape()}
            closed
            tension={0.3}
            opacity={0.9}
          />
        )
      }
      
      case 'heartbeat': {
        // ECG/heartbeat line style
        if (waveformData.length < 2) return null
        
        const points: number[] = []
        
        for (let i = 0; i < waveformData.length; i++) {
          const x = -waveformWidth / 2 + (i / (waveformData.length - 1)) * waveformWidth
          const amplitude = waveformData[i]
          
          // Create ECG-like spikes for high amplitudes
          let y
          if (amplitude > 0.7) {
            const phase = (i % 8) / 8
            if (phase < 0.15) y = -amplitude * waveformHeight * 0.4 * heightMult
            else if (phase < 0.25) y = amplitude * waveformHeight * 0.15 * heightMult
            else y = 0
          } else {
            y = -amplitude * waveformHeight * 0.2 * heightMult
          }
          
          points.push(x, y)
        }
        
        return (
          <Line
            points={points}
            stroke={color}
            strokeWidth={barW}
            lineCap="round"
            lineJoin="round"
          />
        )
      }
      
      case 'spectrum':
      case 'frequency': {
        // Frequency spectrum - rising from left, peak in center-right, falling off
        const desiredBarWidth = barW
        const desiredGap = gap
        const minSlotWidth = desiredBarWidth + desiredGap
        
        // In optimized mode, limit bars; otherwise render all
        const maxBars = Math.max(1, Math.floor(waveformWidth / minSlotWidth))
        const actualBars = optimizedBars ? Math.min(waveformData.length, maxBars) : waveformData.length
        
        const spacing = waveformWidth / actualBars
        const actualBarWidth = optimizedBars
          ? Math.min(desiredBarWidth, Math.max(1, spacing - desiredGap))
          : Math.max(0.5, spacing * (desiredBarWidth / (desiredBarWidth + desiredGap)))
        
        // Sample data if in optimized mode
        const renderData = (optimizedBars && actualBars < waveformData.length)
          ? Array.from({ length: actualBars }, (_, i) => {
              const idx = Math.floor((i / actualBars) * waveformData.length)
              return waveformData[idx]
            })
          : waveformData
        
        return renderData.map((amplitude, i) => {
          // Create frequency curve: rises from left, peaks around 60-70%, then falls
          const position = i / actualBars
          // Frequency curve multiplier - peaks around 0.65
          const freqCurve = Math.sin(position * Math.PI * 0.85) * (1 - position * 0.3)
          // Blend original amplitude with frequency curve
          const adjustedAmplitude = amplitude * 0.4 + freqCurve * 0.6
          
          const barH = adjustedAmplitude * waveformHeight * heightMult
          const x = -waveformWidth / 2 + i * spacing + (spacing - actualBarWidth) / 2
          // Bars grow upward from bottom
          const y = waveformHeight / 2 - barH
          
          return (
            <Rect
              key={`${i}-${actualBars}-${optimizedBars}`}
              x={x}
              y={y}
              width={actualBarWidth}
              height={barH}
              fill={getBarFill(i, actualBars)}
              cornerRadius={[Math.max(0.25, actualBarWidth / 2), Math.max(0.25, actualBarWidth / 2), 0, 0]}
            />
          )
        })
      }
      
      case 'ripple': {
        // Concentric circles based on amplitude
        const numRings = Math.min(10, Math.floor(waveformData.length / 15))
        const maxRadius = Math.min(waveformWidth, waveformHeight) / 2 * heightMult
        
        return Array.from({ length: numRings }).map((_, i) => {
          const dataIndex = Math.floor((i / numRings) * waveformData.length)
          const amplitude = waveformData[dataIndex] || 0.5
          const radius = (i + 1) / numRings * maxRadius * (0.5 + amplitude * 0.5)
          
          return (
            <Circle
              key={i}
              x={0}
              y={0}
              radius={radius}
              stroke={color}
              strokeWidth={barW}
              opacity={0.3 + (1 - i / numRings) * 0.7}
            />
          )
        })
      }
      
      case 'pulse': {
        // Radiating pulse lines from center - like sound waves emanating
        const numRays = 36 // Number of radiating lines
        const maxRadius = Math.min(waveformWidth, waveformHeight) / 2 * heightMult
        
        return Array.from({ length: numRays }).map((_, i) => {
          const angle = (i / numRays) * Math.PI * 2
          // Sample amplitude data for this ray
          const dataIndex = Math.floor((i / numRays) * waveformData.length)
          const amplitude = waveformData[dataIndex] || 0.5
          
          // Inner and outer radius based on amplitude
          const innerRadius = maxRadius * 0.2
          const outerRadius = innerRadius + (maxRadius - innerRadius) * amplitude
          
          const x1 = Math.cos(angle) * innerRadius
          const y1 = Math.sin(angle) * innerRadius
          const x2 = Math.cos(angle) * outerRadius
          const y2 = Math.sin(angle) * outerRadius
          
          return (
            <Line
              key={i}
              points={[x1, y1, x2, y2]}
              stroke={color}
              strokeWidth={Math.max(1, barW * 0.5)}
              lineCap="round"
              opacity={0.5 + amplitude * 0.5}
            />
          )
        })
      }
      
      case 'image-mask': {
        // Image mask - waveform shape clips/masks an image behind it
        // The waveform shape can be scaled non-proportionally, but the IMAGE inside
        // must always maintain its original aspect ratio (cover mode).
        //
        // Strategy: Render at the GROUP's actual displayed pixel dimensions.
        // The canvas represents exactly what will appear on screen.
        // Use scaleX=1/scale.x and scaleY=1/scale.y so Group's transform cancels out.
        
        // Calculate actual pixel dimensions on screen
        const baseWidth = waveformWidth
        const baseHeight = waveformHeight * Math.max(1, heightMult)
        const pixelWidth = Math.max(1, Math.round(baseWidth * scale.x))
        const pixelHeight = Math.max(1, Math.round(baseHeight * scale.y))
        
        // Create offscreen canvas at the exact pixel size
        const offscreenCanvas = document.createElement('canvas')
        offscreenCanvas.width = pixelWidth
        offscreenCanvas.height = pixelHeight
        const ctx = offscreenCanvas.getContext('2d')
        
        if (!ctx) return null
        
        const maskShape = imageMaskConfig.imageMaskShape || 'normal'
        const focalPoint = imageMaskConfig.imageMaskFocalPoint
        
        // Draw the waveform shape as a mask
        ctx.fillStyle = '#000'
        
        if (maskShape === 'circular') {
          // Circular mask with radial bars
          const circularMaskRadius = Math.min(pixelWidth, pixelHeight) / 2
          const circleRadiusSetting = waveformConfig.circleRadius || 50
          const baseRadius = circularMaskRadius * (circleRadiusSetting / 200)
          // Use heightMult to control bar length (maps 10-200% to actual bar length)
          const maxBarLength = (circularMaskRadius - baseRadius) * heightMult
          
          const centerX = pixelWidth / 2
          const centerY = pixelHeight / 2
          
          // Calculate scaled bar width based on pixel dimensions
          const scaleFactor = Math.min(pixelWidth / waveformWidth, pixelHeight / (waveformHeight * Math.max(1, heightMult)))
          const scaledBarWidth = barW * scaleFactor * 1.5
          const halfBarWidth = scaledBarWidth / 2
          
          // Draw center circle - extend radius to meet bar starts (bars are stroked, so they overlap)
          ctx.beginPath()
          ctx.arc(centerX, centerY, baseRadius + halfBarWidth, 0, Math.PI * 2)
          ctx.fill()
          
          // Draw radial bars using lines (supports rounded caps)
          const numBars = waveformData.length
          const isBarRounded = waveformConfig.barRounded ?? false
          
          ctx.lineWidth = scaledBarWidth
          ctx.lineCap = isBarRounded ? 'round' : 'butt'
          ctx.strokeStyle = '#000'
          
          // Calculate how many bars to skip based on gap setting
          // gap=0 means draw all bars, gap=10 means skip 10 bars between each drawn bar
          const skipFactor = Math.max(1, Math.round(1 + (gap / 5)))
          
          for (let i = 0; i < numBars; i += skipFactor) {
            const angle = (i / numBars) * Math.PI * 2 - Math.PI / 2
            const barLength = waveformData[i] * maxBarLength
            // Start bars exactly at the edge of inner circle
            const innerR = baseRadius
            const outerR = baseRadius + Math.max(barLength, scaledBarWidth)
            
            if (outerR > innerR) {
              const x1 = centerX + Math.cos(angle) * innerR
              const y1 = centerY + Math.sin(angle) * innerR
              const x2 = centerX + Math.cos(angle) * outerR
              const y2 = centerY + Math.sin(angle) * outerR
              
              ctx.beginPath()
              ctx.moveTo(x1, y1)
              ctx.lineTo(x2, y2)
              ctx.stroke()
            }
          }
        } else {
          // Normal (linear) mask - horizontal waveform
          ctx.beginPath()
          const centerY = pixelHeight / 2
          
          // Top edge
          for (let i = 0; i < waveformData.length; i++) {
            const x = (i / waveformData.length) * pixelWidth
            const amplitude = waveformData[i] * (pixelHeight / 2) * 0.95
            const y = centerY - amplitude
            
            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
          
          // Right edge to bottom
          ctx.lineTo(pixelWidth, centerY)
          
          // Bottom edge (mirror)
          for (let i = waveformData.length - 1; i >= 0; i--) {
            const x = (i / waveformData.length) * pixelWidth
            const amplitude = waveformData[i] * (pixelHeight / 2) * 0.95
            const y = centerY + amplitude
            ctx.lineTo(x, y)
          }
          
          ctx.closePath()
          ctx.fill()
        }
        
        // Apply the image with source-in compositing
        if (maskImageObj) {
          ctx.globalCompositeOperation = 'source-in'
          
          // COVER mode: image fills the mask area, maintaining its aspect ratio
          // The image should fill the ENTIRE visible area without distortion
          const imgAspect = maskImageObj.width / maskImageObj.height
          const canvasAspect = pixelWidth / pixelHeight
          
          let drawWidth, drawHeight, drawX, drawY
          
          if (imgAspect > canvasAspect) {
            // Image is wider - fit to height, crop sides
            drawHeight = pixelHeight
            drawWidth = pixelHeight * imgAspect
          } else {
            // Image is taller - fit to width, crop top/bottom
            drawWidth = pixelWidth
            drawHeight = pixelWidth / imgAspect
          }
          
          if (focalPoint) {
            const focalX = (focalPoint.x / 100) * drawWidth
            const focalY = (focalPoint.y / 100) * drawHeight
            drawX = (pixelWidth / 2) - focalX
            drawY = (pixelHeight / 2) - focalY
          } else {
            drawX = (pixelWidth - drawWidth) / 2
            drawY = (pixelHeight - drawHeight) / 2
          }
          
          ctx.drawImage(maskImageObj, drawX, drawY, drawWidth, drawHeight)
        } else {
          // No mask image - use gradient fill
          ctx.globalCompositeOperation = 'source-in'
          
          let fillStyle: string | CanvasGradient
          if (useGradient && gradientStops && gradientStops.length >= 2) {
            const gradient = ctx.createLinearGradient(0, 0, pixelWidth, 0)
            gradientStops.forEach(stop => {
              gradient.addColorStop(stop.position, stop.color)
            })
            fillStyle = gradient
          } else {
            const defaultGradient = ctx.createLinearGradient(0, 0, pixelWidth, pixelHeight)
            defaultGradient.addColorStop(0, '#3b82f6')
            defaultGradient.addColorStop(0.5, '#8b5cf6')
            defaultGradient.addColorStop(1, '#ec4899')
            fillStyle = defaultGradient
          }
          
          ctx.fillStyle = fillStyle
          ctx.fillRect(0, 0, pixelWidth, pixelHeight)
        }
        
        // Convert canvas to image
        const dataUrl = offscreenCanvas.toDataURL()
        const konvaImage = new window.Image()
        konvaImage.src = dataUrl
        
        // Render the pixel-perfect canvas, then apply inverse scale
        // so the Group's transform doesn't distort it
        return (
          <KonvaImage
            key={`image-mask-${pixelWidth}-${pixelHeight}`}
            image={konvaImage}
            x={-pixelWidth / 2 / scale.x}
            y={-pixelHeight / 2 / scale.y}
            width={pixelWidth / scale.x}
            height={pixelHeight / scale.y}
          />
        )
      }
      
      case 'squiggly': {
        // Squiggly artistic waveform - inspired by wavesurfer custom render
        if (waveformData.length < 2) return null
        
        const step = 8 // Squiggle segment width
        const points: number[] = []
        
        for (let i = 0; i < waveformData.length; i += 2) {
          const x = -waveformWidth / 2 + (i / waveformData.length) * waveformWidth
          const amplitude = waveformData[i] || 0.3
          const y = amplitude * (waveformHeight / 2) * heightMult
          
          // Create squiggly pattern - alternating up/down with curves
          if (i % 4 < 2) {
            points.push(x, -y, x + step/2, -y - step/3, x + step, 0)
          } else {
            points.push(x, y, x + step/2, y + step/3, x + step, 0)
          }
        }
        
        return (
          <Line
            points={points}
            stroke={color}
            strokeWidth={Math.max(2, barW)}
            lineCap="round"
            lineJoin="round"
            tension={0.5}
          />
        )
      }
      
      case 'soundcloud': {
        // SoundCloud-style bars with rounded tops and gradient
        const desiredBarWidth = barW
        const desiredGap = gap
        const minSlotWidth = desiredBarWidth + desiredGap
        
        // In optimized mode, limit bars; otherwise render all
        const maxBars = Math.max(1, Math.floor(waveformWidth / minSlotWidth))
        const actualBars = optimizedBars ? Math.min(waveformData.length, maxBars) : waveformData.length
        
        const spacing = waveformWidth / actualBars
        const actualBarWidth = optimizedBars
          ? Math.min(desiredBarWidth, Math.max(1, spacing - desiredGap))
          : Math.max(0.5, spacing * (desiredBarWidth / (desiredBarWidth + desiredGap)))
        const gradientKey = useGradient ? gradientStops?.map(s => s.color).join('-') : color
        
        // Sample data if in optimized mode
        const renderData = (optimizedBars && actualBars < waveformData.length)
          ? Array.from({ length: actualBars }, (_, i) => {
              const idx = Math.floor((i / actualBars) * waveformData.length)
              return waveformData[idx]
            })
          : waveformData
        
        return renderData.map((amplitude, i) => {
          const barH = amplitude * waveformHeight * heightMult * 0.9
          const x = -waveformWidth / 2 + i * spacing + (spacing - actualBarWidth) / 2
          const y = waveformHeight / 2 - barH
          const barFill = getBarFill(i, actualBars)
          
          return (
            <Rect
              key={`${i}-${gradientKey}-${actualBars}-${optimizedBars}`}
              x={x}
              y={y}
              width={actualBarWidth}
              height={barH}
              fill={barFill}
              cornerRadius={[Math.max(0.25, actualBarWidth / 2), Math.max(0.25, actualBarWidth / 2), 0, 0]}
              opacity={0.7 + amplitude * 0.3}
            />
          )
        })
      }
      
      case 'ribbon': {
        // Flowing ribbon waveform - like a dancing ribbon
        if (waveformData.length < 2) return null
        
        const topPoints: number[] = []
        const bottomPoints: number[] = []
        
        for (let i = 0; i < waveformData.length; i++) {
          const x = -waveformWidth / 2 + (i / (waveformData.length - 1)) * waveformWidth
          const amplitude = waveformData[i]
          const ribbonWidth = amplitude * (waveformHeight / 3) * heightMult
          
          // Add wave motion to y position
          const waveOffset = Math.sin((i / waveformData.length) * Math.PI * 4) * 10
          
          topPoints.push(x, -ribbonWidth + waveOffset)
          bottomPoints.unshift(x, ribbonWidth + waveOffset)
        }
        
        return (
          <Line
            points={[...topPoints, ...bottomPoints]}
            {...getGradientForShape()}
            closed
            tension={0.4}
            opacity={0.85}
          />
        )
      }
      
      case 'blocks': {
        // Stacked blocks visualization
        // Calculate how many columns can fit given bar width and gap
        const desiredBlockWidth = barW
        const desiredGap = gap
        const minSlotWidth = desiredBlockWidth + desiredGap
        const maxColumns = Math.max(1, Math.floor(waveformWidth / minSlotWidth))
        const actualColumns = Math.min(waveformData.length, maxColumns)
        
        const spacing = waveformWidth / actualColumns
        const blockWidth = Math.min(desiredBlockWidth, Math.max(2, spacing - desiredGap))
        const blockHeight = 4
        const maxBlocks = Math.floor(waveformHeight / (blockHeight + 2))
        
        const elements: React.ReactElement[] = []
        
        for (let i = 0; i < actualColumns; i++) {
          const dataIdx = Math.floor((i / actualColumns) * waveformData.length)
          const amplitude = waveformData[dataIdx]
          const numBlocks = Math.max(1, Math.floor(amplitude * maxBlocks * heightMult))
          const x = -waveformWidth / 2 + i * spacing + (spacing - blockWidth) / 2
          const fillColor = getBarFill(i, actualColumns)
          
          for (let j = 0; j < numBlocks; j++) {
            const y = -j * (blockHeight + 2) - blockHeight / 2
            elements.push(
              <Rect
                key={`${i}-${j}-${actualColumns}`}
                x={x}
                y={y}
                width={blockWidth}
                height={blockHeight}
                fill={fillColor}
                cornerRadius={1}
                opacity={0.6 + (j / maxBlocks) * 0.4}
              />
            )
          }
        }
        
        return elements
      }
      
      case 'dna': {
        // DNA helix style waveform
        if (waveformData.length < 2) return null
        
        const elements: React.ReactElement[] = []
        const helixWidth = waveformHeight / 3
        
        // Create two intertwining strands
        const strand1Points: number[] = []
        const strand2Points: number[] = []
        
        for (let i = 0; i < waveformData.length; i++) {
          const x = -waveformWidth / 2 + (i / (waveformData.length - 1)) * waveformWidth
          const amplitude = waveformData[i] * heightMult
          const phase = (i / waveformData.length) * Math.PI * 6
          
          const y1 = Math.sin(phase) * helixWidth * amplitude
          const y2 = Math.sin(phase + Math.PI) * helixWidth * amplitude
          
          strand1Points.push(x, y1)
          strand2Points.push(x, y2)
          
          // Add connecting rungs between strands
          if (i % 8 === 0 && Math.abs(y1 - y2) > 5) {
            elements.push(
              <Line
                key={`rung-${i}`}
                points={[x, y1, x, y2]}
                stroke={color}
                strokeWidth={2}
                opacity={0.3}
              />
            )
          }
        }
        
        elements.push(
          <Line key="strand1" points={strand1Points} stroke={color} strokeWidth={barW} lineCap="round" tension={0.3} />,
          <Line key="strand2" points={strand2Points} stroke={color} strokeWidth={barW} lineCap="round" tension={0.3} opacity={0.7} />
        )
        
        return elements
      }
      
      case 'crystals': {
        // Crystal/geometric shard visualization
        // Calculate how many crystals can fit given bar width and gap
        const desiredCrystalWidth = barW * 2 // Crystals are wider
        const desiredGap = gap
        const minSlotWidth = desiredCrystalWidth + desiredGap
        const maxCrystals = Math.max(1, Math.floor(waveformWidth / minSlotWidth))
        const numCrystals = Math.min(waveformData.length, maxCrystals)
        
        const spacing = waveformWidth / numCrystals
        const crystalWidth = Math.min(desiredCrystalWidth, Math.max(4, spacing - desiredGap))
        
        return Array.from({ length: numCrystals }).map((_, i) => {
          const dataIdx = Math.floor((i / numCrystals) * waveformData.length)
          const amplitude = waveformData[dataIdx]
          const x = -waveformWidth / 2 + i * spacing + spacing / 2
          const height = amplitude * waveformHeight * heightMult * 0.8
          const fillColor = getBarFill(i, numCrystals)
          
          // Create diamond/crystal shape
          const points = [
            x, -height / 2,                    // top
            x + crystalWidth / 2, 0,           // right
            x, height / 2,                     // bottom
            x - crystalWidth / 2, 0,           // left
          ]
          
          return (
            <Line
              key={`${i}-${numCrystals}`}
              points={points}
              fill={fillColor}
              closed
              opacity={0.5 + amplitude * 0.5}
            />
          )
        })
      }
      
      case 'spectrogram': {
        // Frequency spectrogram style - horizontal bands with varying intensity
        // Calculate how many columns can fit given bar width and gap
        const desiredColumnWidth = barW
        const desiredGap = gap
        const minSlotWidth = desiredColumnWidth + desiredGap
        const maxColumns = Math.max(1, Math.floor(waveformWidth / minSlotWidth))
        const numColumns = Math.min(waveformData.length, maxColumns)
        
        const spacing = waveformWidth / numColumns
        const columnWidth = Math.min(desiredColumnWidth, Math.max(2, spacing - desiredGap))
        
        const numBands = 20
        const bandHeight = waveformHeight / numBands
        
        const elements: React.ReactElement[] = []
        
        for (let col = 0; col < numColumns; col++) {
          const dataIdx = Math.floor((col / numColumns) * waveformData.length)
          const baseAmplitude = waveformData[dataIdx]
          const x = -waveformWidth / 2 + col * spacing + (spacing - columnWidth) / 2
          
          for (let band = 0; band < numBands; band++) {
            // Simulate frequency distribution - bass at bottom, treble at top
            const freqMultiplier = 1 - Math.abs(band - numBands * 0.3) / numBands
            const intensity = baseAmplitude * freqMultiplier * (0.5 + Math.random() * 0.5)
            
            if (intensity > 0.1) {
              const y = -waveformHeight / 2 + band * bandHeight
              
              elements.push(
                <Rect
                  key={`${col}-${band}-${numColumns}`}
                  x={x}
                  y={y}
                  width={columnWidth}
                  height={bandHeight - 1}
                  fill={color}
                  opacity={intensity * heightMult}
                />
              )
            }
          }
        }
        
        return elements
      }
      
      case 'circular-blocks': {
        // Circular waveform with stacked blocks instead of bars
        const centerX = 0
        const centerY = 0
        const innerRadius = (waveformConfig.circleRadius || 50) * (waveformWidth / 400)
        const maxBarLength = (waveformHeight / 2) * heightMult
        
        // Calculate gap angle in radians (gap is at BOTTOM)
        const gapAngleRad = (circleGapAngle * Math.PI) / 180
        const startAngle = -Math.PI / 2
        const endAngle = Math.PI * 1.5 - gapAngleRad
        const arcAngle = endAngle - startAngle
        
        // Calculate how many columns can fit
        const circumference = 2 * Math.PI * (innerRadius + maxBarLength / 2) * (arcAngle / (2 * Math.PI))
        const desiredBlockWidth = barW
        const desiredGap = gap
        const minSlotWidth = desiredBlockWidth + desiredGap
        const maxColumns = Math.max(1, Math.floor(circumference / minSlotWidth))
        const actualColumns = Math.min(waveformData.length, maxColumns)
        
        // Block settings
        const blockThickness = Math.max(2, barW * 0.7)
        const blockSpacing = 2
        const maxBlocks = Math.floor(maxBarLength / (blockThickness + blockSpacing))
        
        // Inner blocks settings (extends inward from inner radius)
        const innerMaxLength = circleInnerBars ? innerRadius * 0.6 : 0
        const maxInnerBlocks = circleInnerBars ? Math.floor(innerMaxLength / (blockThickness + blockSpacing)) : 0
        
        const elements: React.ReactElement[] = []
        
        for (let i = 0; i < actualColumns; i++) {
          const dataIdx = Math.floor((i / actualColumns) * waveformData.length)
          const amplitude = waveformData[dataIdx]
          const angle = startAngle + (i / actualColumns) * arcAngle
          const numBlocks = Math.max(1, Math.floor(amplitude * maxBlocks))
          const fillColor = getBarFill(i, actualColumns)
          
          // Outer blocks (extending outward from inner radius)
          for (let j = 0; j < numBlocks; j++) {
            const blockRadius = innerRadius + j * (blockThickness + blockSpacing) + blockThickness / 2
            const blockLength = (2 * Math.PI * blockRadius) / actualColumns * 0.7
            const x = centerX + Math.cos(angle) * blockRadius
            const y = centerY + Math.sin(angle) * blockRadius
            
            elements.push(
              <Rect
                key={`outer-${i}-${j}-${actualColumns}-${circleInnerBars}`}
                x={x - blockLength / 2}
                y={y - blockThickness / 2}
                width={blockLength}
                height={blockThickness}
                fill={fillColor}
                cornerRadius={1}
                rotation={(angle * 180) / Math.PI + 90}
                offsetX={0}
                offsetY={0}
                opacity={0.6 + (j / maxBlocks) * 0.4}
              />
            )
          }
          
          // Inner blocks (extending inward from inner radius)
          if (circleInnerBars && maxInnerBlocks > 0) {
            const numInnerBlocks = Math.max(1, Math.floor(amplitude * maxInnerBlocks))
            for (let j = 0; j < numInnerBlocks; j++) {
              const blockRadius = innerRadius - j * (blockThickness + blockSpacing) - blockThickness / 2
              if (blockRadius <= 0) continue // Don't draw blocks past center
              const blockLength = (2 * Math.PI * blockRadius) / actualColumns * 0.7
              const x = centerX + Math.cos(angle) * blockRadius
              const y = centerY + Math.sin(angle) * blockRadius
              
              elements.push(
                <Rect
                  key={`inner-${i}-${j}-${actualColumns}-${circleInnerBars}`}
                  x={x - blockLength / 2}
                  y={y - blockThickness / 2}
                  width={blockLength}
                  height={blockThickness}
                  fill={fillColor}
                  cornerRadius={1}
                  rotation={(angle * 180) / Math.PI + 90}
                  offsetX={0}
                  offsetY={0}
                  opacity={0.6 + (j / maxInnerBlocks) * 0.4}
                />
              )
            }
          }
        }
        
        return elements
      }
      
      case 'circuit': {
        // Circuit board / tech grid style - futuristic digital waveform
        const elements: React.ReactElement[] = []
        
        // Calculate grid
        const desiredBarWidth = barW * 1.5
        const desiredGap = gap
        const minSlotWidth = desiredBarWidth + desiredGap
        const numColumns = Math.max(1, Math.min(waveformData.length, Math.floor(waveformWidth / minSlotWidth)))
        const spacing = waveformWidth / numColumns
        const nodeSize = Math.min(desiredBarWidth * 0.6, Math.max(4, spacing * 0.3))
        
        // Create vertical lines with nodes
        for (let i = 0; i < numColumns; i++) {
          const dataIdx = Math.floor((i / numColumns) * waveformData.length)
          const amplitude = waveformData[dataIdx]
          const x = -waveformWidth / 2 + i * spacing + spacing / 2
          const height = amplitude * waveformHeight * heightMult
          const fillColor = getBarFill(i, numColumns)
          
          // Main vertical trace
          elements.push(
            <Line
              key={`trace-${i}`}
              points={[x, 0, x, -height]}
              stroke={fillColor}
              strokeWidth={2}
              opacity={0.8}
            />
          )
          
          // Node at top
          elements.push(
            <Rect
              key={`node-${i}`}
              x={x - nodeSize / 2}
              y={-height - nodeSize / 2}
              width={nodeSize}
              height={nodeSize}
              fill={fillColor}
              cornerRadius={1}
            />
          )
          
          // Horizontal connector to next (every other)
          if (i < numColumns - 1 && i % 2 === 0) {
            const nextDataIdx = Math.floor(((i + 1) / numColumns) * waveformData.length)
            const nextAmplitude = waveformData[nextDataIdx]
            const nextHeight = nextAmplitude * waveformHeight * heightMult
            const midY = -Math.min(height, nextHeight) * 0.5
            const nextX = -waveformWidth / 2 + (i + 1) * spacing + spacing / 2
            
            elements.push(
              <Line
                key={`h-${i}`}
                points={[x, midY, nextX, midY]}
                stroke={fillColor}
                strokeWidth={1}
                opacity={0.5}
                dash={[4, 2]}
              />
            )
          }
        }
        
        return elements
      }
      
      case 'matrix': {
        // Matrix rain / falling code style
        const elements: React.ReactElement[] = []
        
        const desiredBarWidth = barW
        const desiredGap = gap * 0.5
        const minSlotWidth = desiredBarWidth + desiredGap
        const numColumns = Math.max(1, Math.min(waveformData.length, Math.floor(waveformWidth / minSlotWidth)))
        const spacing = waveformWidth / numColumns
        const charWidth = Math.min(desiredBarWidth, Math.max(3, spacing - desiredGap))
        const charHeight = charWidth * 1.2
        const maxChars = Math.floor(waveformHeight / (charHeight + 1))
        
        for (let i = 0; i < numColumns; i++) {
          const dataIdx = Math.floor((i / numColumns) * waveformData.length)
          const amplitude = waveformData[dataIdx]
          const x = -waveformWidth / 2 + i * spacing + (spacing - charWidth) / 2
          const numChars = Math.max(1, Math.floor(amplitude * maxChars * heightMult))
          
          for (let j = 0; j < numChars; j++) {
            // Fade effect - brightest at tip
            const brightness = j === numChars - 1 ? 1 : (j / numChars) * 0.7
            const y = -j * (charHeight + 1)
            
            elements.push(
              <Rect
                key={`${i}-${j}-${numColumns}`}
                x={x}
                y={y - charHeight}
                width={charWidth}
                height={charHeight}
                fill={getBarFill(i, numColumns)}
                cornerRadius={0}
                opacity={brightness}
              />
            )
          }
          
          // Add glow at tip
          if (numChars > 0) {
            const tipY = -(numChars - 1) * (charHeight + 1) - charHeight
            elements.push(
              <Rect
                key={`glow-${i}`}
                x={x - 1}
                y={tipY - 1}
                width={charWidth + 2}
                height={charHeight + 2}
                fill={getBarFill(i, numColumns)}
                cornerRadius={0}
                opacity={0.3}
              />
            )
          }
        }
        
        return elements
      }
      
      case 'laser': {
        // Laser beam / light ray style
        const elements: React.ReactElement[] = []
        
        const numRays = Math.min(waveformData.length, 40)
        const angleSpread = Math.PI * 0.6 // 108 degree spread
        const startAngle = -Math.PI / 2 - angleSpread / 2
        
        for (let i = 0; i < numRays; i++) {
          const dataIdx = Math.floor((i / numRays) * waveformData.length)
          const amplitude = waveformData[dataIdx]
          const angle = startAngle + (i / (numRays - 1)) * angleSpread
          const rayLength = amplitude * waveformHeight * heightMult
          
          const x2 = Math.cos(angle) * rayLength
          const y2 = Math.sin(angle) * rayLength
          const fillColor = getBarFill(i, numRays)
          
          // Main laser beam
          elements.push(
            <Line
              key={`ray-${i}`}
              points={[0, 0, x2, y2]}
              stroke={fillColor}
              strokeWidth={barW * 0.8}
              lineCap="round"
              opacity={0.9}
            />
          )
          
          // Core (brighter center)
          elements.push(
            <Line
              key={`core-${i}`}
              points={[0, 0, x2 * 0.8, y2 * 0.8]}
              stroke={fillColor}
              strokeWidth={barW * 0.3}
              lineCap="round"
              opacity={1}
            />
          )
          
          // Endpoint flare
          if (amplitude > 0.3) {
            elements.push(
              <Circle
                key={`flare-${i}`}
                x={x2}
                y={y2}
                radius={barW * 0.5}
                fill={fillColor}
                opacity={0.5}
              />
            )
          }
        }
        
        // Center glow
        elements.push(
          <Circle
            key="center"
            x={0}
            y={0}
            radius={barW * 1.5}
            fill={color}
            opacity={0.6}
          />
        )
        
        return elements
      }
      
      case 'isometric': {
        // 3D Isometric bars with depth
        const desiredBarWidth = barW * 1.2
        const desiredGap = gap * 1.5
        const minSlotWidth = desiredBarWidth + desiredGap
        
        // In optimized mode, limit bars; otherwise render all
        const maxBars = Math.max(1, Math.floor(waveformWidth / minSlotWidth))
        const actualBars = optimizedBars ? Math.min(waveformData.length, maxBars) : waveformData.length
        
        const spacing = waveformWidth / actualBars
        const actualBarWidth = optimizedBars
          ? Math.min(desiredBarWidth, Math.max(1, spacing - desiredGap))
          : Math.max(0.5, spacing * (desiredBarWidth / (desiredBarWidth + desiredGap)))
        const depth = actualBarWidth * 0.5 // 3D depth
        
        // Sample data if in optimized mode
        const renderData = (optimizedBars && actualBars < waveformData.length)
          ? Array.from({ length: actualBars }, (_, i) => {
              const idx = Math.floor((i / actualBars) * waveformData.length)
              return waveformData[idx]
            })
          : waveformData
        
        const elements: React.ReactElement[] = []
        
        for (let i = 0; i < renderData.length; i++) {
          const amplitude = renderData[i]
          const barH = amplitude * waveformHeight * heightMult
          const x = -waveformWidth / 2 + i * spacing + (spacing - actualBarWidth) / 2
          const y = -barH / 2
          const fillColor = getBarFill(i, actualBars)
          
          // Right side face (darker)
          elements.push(
            <Line
              key={`side-${i}-${optimizedBars}`}
              points={[
                x + actualBarWidth, y,
                x + actualBarWidth + depth, y - depth * 0.5,
                x + actualBarWidth + depth, y + barH - depth * 0.5,
                x + actualBarWidth, y + barH
              ]}
              closed
              fill={fillColor}
              opacity={0.6}
            />
          )
          
          // Top face (lighter)
          elements.push(
            <Line
              key={`top-${i}`}
              points={[
                x, y,
                x + depth, y - depth * 0.5,
                x + actualBarWidth + depth, y - depth * 0.5,
                x + actualBarWidth, y
              ]}
              closed
              fill={fillColor}
              opacity={0.9}
            />
          )
          
          // Front face
          elements.push(
            <Rect
              key={`front-${i}`}
              x={x}
              y={y}
              width={actualBarWidth}
              height={barH}
              fill={fillColor}
              opacity={0.75}
            />
          )
        }
        
        return elements
      }
      
      case 'watercolor': {
        // Soft watercolor bleed effect
        const elements: React.ReactElement[] = []
        const numLayers = 3
        
        for (let layer = 0; layer < numLayers; layer++) {
          const points: number[] = []
          const offset = layer * 5 - 5
          const opacity = 0.3 - layer * 0.08
          
          // Top edge with organic variation
          for (let i = 0; i <= waveformData.length; i++) {
            const idx = Math.min(i, waveformData.length - 1)
            const x = -waveformWidth / 2 + (i / waveformData.length) * waveformWidth
            const baseH = waveformData[idx] * waveformHeight * heightMult * 0.5
            // Add organic variation per layer
            const variation = Math.sin(i * 0.5 + layer * 2) * 10 + Math.cos(i * 0.3) * 5
            const y = -baseH + offset + variation
            points.push(x, y)
          }
          
          // Bottom edge (mirror)
          for (let i = waveformData.length; i >= 0; i--) {
            const idx = Math.min(i, waveformData.length - 1)
            const x = -waveformWidth / 2 + (i / waveformData.length) * waveformWidth
            const baseH = waveformData[idx] * waveformHeight * heightMult * 0.5
            const variation = Math.sin(i * 0.5 + layer * 2 + 1) * 10 + Math.cos(i * 0.3) * 5
            const y = baseH - offset - variation
            points.push(x, y)
          }
          
          elements.push(
            <Line
              key={`watercolor-${layer}`}
              points={points}
              closed
              fill={color}
              opacity={opacity}
              tension={0.4}
            />
          )
        }
        
        return elements
      }
      
      case 'sketch': {
        // Hand-drawn sketch style with multiple strokes
        const elements: React.ReactElement[] = []
        const numStrokes = 3
        
        for (let stroke = 0; stroke < numStrokes; stroke++) {
          const points: number[] = []
          
          for (let i = 0; i < waveformData.length; i++) {
            const x = -waveformWidth / 2 + (i / (waveformData.length - 1)) * waveformWidth
            const h = waveformData[i] * waveformHeight * heightMult * 0.5
            // Add sketch wobble
            const wobbleX = (Math.random() - 0.5) * 3
            const wobbleY = (Math.random() - 0.5) * 4
            points.push(x + wobbleX, -h + wobbleY)
          }
          
          elements.push(
            <Line
              key={`sketch-top-${stroke}`}
              points={points}
              stroke={color}
              strokeWidth={1 + stroke * 0.5}
              opacity={0.6 - stroke * 0.15}
              tension={0.2}
              lineCap="round"
            />
          )
        }
        
        // Mirror strokes for bottom
        for (let stroke = 0; stroke < numStrokes; stroke++) {
          const points: number[] = []
          
          for (let i = 0; i < waveformData.length; i++) {
            const x = -waveformWidth / 2 + (i / (waveformData.length - 1)) * waveformWidth
            const h = waveformData[i] * waveformHeight * heightMult * 0.5
            const wobbleX = (Math.random() - 0.5) * 3
            const wobbleY = (Math.random() - 0.5) * 4
            points.push(x + wobbleX, h + wobbleY)
          }
          
          elements.push(
            <Line
              key={`sketch-bottom-${stroke}`}
              points={points}
              stroke={color}
              strokeWidth={1 + stroke * 0.5}
              opacity={0.6 - stroke * 0.15}
              tension={0.2}
              lineCap="round"
            />
          )
        }
        
        return elements
      }
      
      case 'particle-cloud': {
        // Floating particle/dot cloud
        const elements: React.ReactElement[] = []
        const particlesPerBar = 8
        
        const numColumns = Math.min(40, waveformData.length)
        
        for (let i = 0; i < numColumns; i++) {
          const dataIdx = Math.floor((i / numColumns) * waveformData.length)
          const amplitude = waveformData[dataIdx]
          const baseX = -waveformWidth / 2 + (i / numColumns) * waveformWidth
          const maxY = amplitude * waveformHeight * heightMult * 0.5
          const fillColor = getBarFill(i, numColumns)
          
          for (let p = 0; p < particlesPerBar; p++) {
            // Distribute particles within the amplitude area
            const t = p / particlesPerBar
            const spreadX = (Math.random() - 0.5) * (waveformWidth / numColumns) * 0.8
            const spreadY = (Math.random() - 0.5) * maxY * 2
            const x = baseX + spreadX
            const y = spreadY
            const size = 2 + Math.random() * 3 * amplitude
            
            elements.push(
              <Circle
                key={`particle-${i}-${p}`}
                x={x}
                y={y}
                radius={size}
                fill={fillColor}
                opacity={0.3 + amplitude * 0.5}
              />
            )
          }
        }
        
        return elements
      }
      
      case 'tessellation': {
        // Triangular tessellation/mosaic
        const elements: React.ReactElement[] = []
        const triangleSize = barW * 2
        const rows = Math.ceil(waveformHeight / triangleSize)
        const cols = Math.ceil(waveformWidth / triangleSize)
        
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const dataIdx = Math.floor((col / cols) * waveformData.length)
            const amplitude = waveformData[dataIdx]
            const fillColor = getBarFill(col, cols)
            
            // Only draw triangles within the amplitude area
            const y = -waveformHeight / 2 + row * triangleSize
            const maxAmplitudeY = amplitude * waveformHeight * heightMult * 0.5
            
            if (Math.abs(y) > maxAmplitudeY) continue
            
            const x = -waveformWidth / 2 + col * triangleSize
            const offset = (row % 2) * (triangleSize / 2)
            
            // Upward triangle
            elements.push(
              <Line
                key={`tri-up-${row}-${col}`}
                points={[
                  x + offset, y + triangleSize,
                  x + offset + triangleSize / 2, y,
                  x + offset + triangleSize, y + triangleSize
                ]}
                closed
                fill={fillColor}
                opacity={0.5 + amplitude * 0.3}
                stroke={fillColor}
                strokeWidth={0.5}
              />
            )
          }
        }
        
        return elements
      }
      
      case 'vinyl-grooves': {
        // Record grooves style - concentric circles modulated by waveform
        const elements: React.ReactElement[] = []
        const numGrooves = 30
        const innerR = waveformHeight * 0.1
        const outerR = waveformHeight * 0.45
        const grooveSpacing = (outerR - innerR) / numGrooves
        
        for (let g = 0; g < numGrooves; g++) {
          const baseRadius = innerR + g * grooveSpacing
          const points: number[] = []
          const segments = 120
          
          for (let s = 0; s <= segments; s++) {
            const angle = (s / segments) * Math.PI * 2
            const dataIdx = Math.floor((s / segments) * waveformData.length)
            const amplitude = waveformData[dataIdx]
            // Modulate radius by amplitude
            const r = baseRadius + amplitude * grooveSpacing * 2 * heightMult
            const x = Math.cos(angle) * r
            const y = Math.sin(angle) * r
            points.push(x, y)
          }
          
          elements.push(
            <Line
              key={`groove-${g}`}
              points={points}
              stroke={color}
              strokeWidth={1}
              opacity={0.5 + (g / numGrooves) * 0.3}
              tension={0}
            />
          )
        }
        
        // Center label area
        elements.push(
          <Circle
            key="center-label"
            x={0}
            y={0}
            radius={innerR * 0.8}
            fill={color}
            opacity={0.8}
          />
        )
        
        return elements
      }
      
      case 'heart-shape': {
        // Heart-shaped waveform container
        const elements: React.ReactElement[] = []
        const heartScale = waveformHeight * 0.5
        
        // Heart parametric points
        const heartPoints: number[] = []
        const numPoints = 100
        
        for (let i = 0; i <= numPoints; i++) {
          const t = (i / numPoints) * Math.PI * 2
          // Heart curve parametric equations
          const x = 16 * Math.pow(Math.sin(t), 3)
          const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
          
          // Get amplitude at this position
          const dataIdx = Math.floor((i / numPoints) * waveformData.length)
          const amplitude = waveformData[dataIdx]
          
          // Scale by amplitude for dynamic effect
          const scale = heartScale / 20 * (0.8 + amplitude * 0.4 * heightMult)
          heartPoints.push(x * scale, y * scale)
        }
        
        // Fill heart with bars inside
        elements.push(
          <Line
            key="heart-outline"
            points={heartPoints}
            closed
            stroke={color}
            strokeWidth={barW}
            tension={0.1}
          />
        )
        
        // Inner bars
        const numBars = 20
        for (let i = 0; i < numBars; i++) {
          const dataIdx = Math.floor((i / numBars) * waveformData.length)
          const amplitude = waveformData[dataIdx]
          const x = -heartScale * 0.6 + (i / numBars) * heartScale * 1.2
          const barH = amplitude * heartScale * 0.8 * heightMult
          
          elements.push(
            <Rect
              key={`heart-bar-${i}`}
              x={x}
              y={-barH / 2}
              width={heartScale / numBars * 0.8}
              height={barH}
              fill={getBarFill(i, numBars)}
              cornerRadius={isBarRounded ? 2 : 0}
              opacity={0.7}
            />
          )
        }
        
        return elements
      }
      
      case 'starburst': {
        // Star burst radiating pattern
        const elements: React.ReactElement[] = []
        const numRays = Math.min(60, waveformData.length)
        const innerR = waveformHeight * 0.1
        const maxLength = waveformHeight * 0.4
        
        for (let i = 0; i < numRays; i++) {
          const dataIdx = Math.floor((i / numRays) * waveformData.length)
          const amplitude = waveformData[dataIdx]
          const angle = (i / numRays) * Math.PI * 2
          
          const length = innerR + amplitude * maxLength * heightMult
          const x1 = Math.cos(angle) * innerR
          const y1 = Math.sin(angle) * innerR
          const x2 = Math.cos(angle) * length
          const y2 = Math.sin(angle) * length
          
          elements.push(
            <Line
              key={`ray-${i}`}
              points={[x1, y1, x2, y2]}
              stroke={getBarFill(i, numRays)}
              strokeWidth={barW}
              lineCap={isBarRounded ? 'round' : 'butt'}
              opacity={0.8}
            />
          )
          
          // Star point
          if (amplitude > 0.5) {
            elements.push(
              <Circle
                key={`star-${i}`}
                x={x2}
                y={y2}
                radius={barW * 0.8}
                fill={getBarFill(i, numRays)}
                opacity={amplitude}
              />
            )
          }
        }
        
        // Center
        elements.push(
          <Circle
            key="center"
            x={0}
            y={0}
            radius={innerR * 0.5}
            fill={color}
            opacity={0.9}
          />
        )
        
        return elements
      }
      
      case 'text-wave': {
        // Wave inside text shape - simplified version using bars with mask-like effect
        const elements: React.ReactElement[] = []
        
        // Create bars that form a text-like pattern
        const numBars = Math.min(80, waveformData.length)
        const letterWidth = waveformWidth / 4 // Approximate space for text effect
        
        for (let i = 0; i < numBars; i++) {
          const dataIdx = Math.floor((i / numBars) * waveformData.length)
          const amplitude = waveformData[dataIdx]
          const x = -waveformWidth / 2 + (i / numBars) * waveformWidth
          const barH = amplitude * waveformHeight * heightMult * 0.5
          
          // Create modulation that suggests letter shapes
          const letterPhase = (x / letterWidth) * Math.PI * 2
          const letterMod = 0.7 + 0.3 * Math.abs(Math.sin(letterPhase))
          
          elements.push(
            <Rect
              key={`textwave-${i}`}
              x={x}
              y={-barH * letterMod / 2}
              width={barW}
              height={barH * letterMod}
              fill={getBarFill(i, numBars)}
              cornerRadius={isBarRounded ? barW / 4 : 0}
              opacity={0.85}
            />
          )
        }
        
        return elements
      }
      
      default: {
        // Fallback to bars
        const desiredBarWidth = barW
        const desiredGap = gap
        const minSlotWidth = desiredBarWidth + desiredGap
        
        // In optimized mode, limit bars; otherwise render all
        const maxBars = Math.max(1, Math.floor(waveformWidth / minSlotWidth))
        const actualBars = optimizedBars ? Math.min(waveformData.length, maxBars) : waveformData.length
        
        const spacing = waveformWidth / actualBars
        const actualBarWidth = optimizedBars
          ? Math.min(desiredBarWidth, Math.max(1, spacing - desiredGap))
          : Math.max(0.5, spacing * (desiredBarWidth / (desiredBarWidth + desiredGap)))
        
        // Sample data if in optimized mode
        const renderData = (optimizedBars && actualBars < waveformData.length)
          ? Array.from({ length: actualBars }, (_, i) => {
              const idx = Math.floor((i / actualBars) * waveformData.length)
              return waveformData[idx]
            })
          : waveformData
        
        return renderData.map((amplitude, i) => {
          const barH = amplitude * waveformHeight * heightMult
          // Center each bar on its position
          const x = -waveformWidth / 2 + i * spacing + (spacing - actualBarWidth) / 2
          const y = -barH / 2
          
          return (
            <Rect
              key={`${i}-${actualBars}-${optimizedBars}`}
              x={x}
              y={y}
              width={actualBarWidth}
              height={barH}
              fill={getBarFill(i, actualBars)}
              cornerRadius={1}
            />
          )
        })
      }
    }
  }
  
  return (
    <div className="flex flex-col h-full">
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-[#f5f5f5]"
        style={{ 
          minHeight: 400,
          backgroundImage: 'radial-gradient(circle at 1px 1px, #e0e0e0 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Floating control bar for delete actions - appears when element is selected */}
        <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-2 bg-white shadow-lg border border-gray-200 rounded-xl transition-all duration-200 ${selectedElement && selectedElement !== 'waveform' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
          {/* Delete button for text elements */}
          {selectedElement && selectedElement !== 'waveform' && selectedElement !== 'qrcode' && (
            <button
              onClick={() => {
                actions.removeTextElement(selectedElement)
                setSelectedElement(null)
              }}
              title="Delete this text element"
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Text
            </button>
          )}
          {/* Delete button for QR code */}
          {selectedElement === 'qrcode' && (
            <button
              onClick={() => {
                useCustomizerStore.getState().setShowQRCode(false)
                setSelectedElement(null)
              }}
              title="Remove QR code from design"
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove QR Code
            </button>
          )}
        </div>
        
        {/* Waveform Controls - floating directly above the waveform */}
        {position && selectedElement === 'waveform' && (() => {
          // Calculate waveform bounds using the stored position and scale
          const { boundWidth, boundHeight } = getActualWaveformBounds()
          
          // The waveform center is at 'position' (in stage coordinates)
          // The actual size is boundWidth/Height * scale
          const halfWidth = (boundWidth * scale.x) / 2
          const halfHeight = (boundHeight * scale.y) / 2
          
          // Top edge of waveform in stage coordinates
          const waveformTopStage = position.y - halfHeight
          const waveformCenterXStage = position.x
          
          // Convert to screen coordinates (accounting for stage zoom and pan)
          const screenCenterX = stagePosition.x + (waveformCenterXStage * stageZoom)
          const screenTop = stagePosition.y + (waveformTopStage * stageZoom)
          
          // Position controls 28px above the waveform's top edge (minimum 4px from container top)
          const controlsTop = Math.max(screenTop - 28, 4)
          
          return (
            <div 
              className="absolute z-20 flex items-center gap-0.5 px-1.5 py-0.5 bg-white/95 backdrop-blur-sm shadow-md border border-gray-200 rounded-md pointer-events-auto"
              style={{
                left: screenCenterX,
                top: controlsTop,
                transform: 'translateX(-50%)'
              }}
            >
              {/* Center waveform */}
              <button
                onClick={() => actions.setWaveformPosition(50, 50)}
                className="p-1 hover:bg-violet-50 rounded transition-colors text-gray-600 hover:text-violet-600"
                title="Center Waveform"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" />
                  <circle cx="12" cy="12" r="9" strokeWidth={2} />
                </svg>
              </button>
              <div className="w-px h-3 bg-gray-200" />
              {/* Reset size */}
              <button
                onClick={() => actions.setWaveformSize(100)}
                className="p-1 hover:bg-violet-50 rounded transition-colors text-gray-600 hover:text-violet-600"
                title="Reset Size (100%)"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
              <div className="w-px h-3 bg-gray-200" />
              {/* Position indicator */}
              <span className="text-[9px] text-gray-500 font-medium px-0.5 min-w-[40px] text-center">
                {Math.round(config.waveformX)}%, {Math.round(config.waveformY)}%
              </span>
            </div>
          )
        })()}
        
        {/* Zoom controls */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 px-2 py-1 bg-white shadow-lg border border-gray-200 rounded-lg">
          {/* Dimensions toggle */}
          <button
            onClick={() => setShowDimensions(d => !d)}
            className={`p-1.5 rounded transition-colors ${showDimensions ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            title="Toggle dimensions"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4v2m0 12v2m18-16v2m0 12v2M6 3h2m8 0h2M6 21h2m8 0h2" />
            </svg>
          </button>
          <div className="w-px h-5 bg-gray-200" />
          {/* Zoom lock toggle */}
          <button
            onClick={() => setZoomLocked(l => !l)}
            className={`p-1.5 rounded transition-colors ${zoomLocked ? 'bg-amber-100 text-amber-600' : 'hover:bg-gray-100'}`}
            title={zoomLocked ? 'Unlock scroll zoom' : 'Lock scroll zoom'}
          >
            {zoomLocked ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          <div className="w-px h-5 bg-gray-200" />
          <button
            onClick={() => setStageZoom(z => Math.max(0.5, z / 1.2))}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Zoom out"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <button
            onClick={resetZoom}
            className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors min-w-[50px]"
            title="Reset zoom"
          >
            {Math.round(stageZoom * 100)}%
          </button>
          <button
            onClick={() => setStageZoom(z => Math.min(3, z * 1.2))}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Zoom in"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <div className="w-px h-5 bg-gray-200" />
          {/* Fit to view button */}
          <button
            onClick={resetZoom}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Fit to view"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>
        
        {/* Export/Download button */}
        <div className="absolute bottom-3 left-3 z-10">
          <button
            onClick={async () => {
              try {
                // Reset zoom before export
                const savedZoom = stageZoom
                const savedPos = { ...stagePosition }
                setStageZoom(1)
                setStagePosition({ x: 0, y: 0 })
                
                // Wait for state to update
                await new Promise(r => setTimeout(r, 100))
                
                // Export the design area at 4x resolution
                const dataUrl = stageRef.current?.toDataURL({
                  pixelRatio: 4,
                  mimeType: 'image/png',
                  x: mockupBounds.left,
                  y: mockupBounds.top,
                  width: mockupBounds.width,
                  height: mockupBounds.height,
                })
                
                // Restore zoom
                setStageZoom(savedZoom)
                setStagePosition(savedPos)
                
                if (dataUrl) {
                  // Create download link
                  const link = document.createElement('a')
                  link.download = 'soundprint-preview.png'
                  link.href = dataUrl
                  link.click()
                }
              } catch (err) {
                console.error('Export failed:', err)
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white shadow-lg border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Download high-resolution preview"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
        
        <Stage 
          ref={stageRef}
          width={dimensions.width} 
          height={dimensions.height}
          onClick={handleStageClick}
          onTap={handleStageClick}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          scaleX={stageZoom}
          scaleY={stageZoom}
          x={stagePosition.x}
          y={stagePosition.y}
        >
          {/* Background Layer */}
          <Layer>
            {/* Workspace background with checkerboard pattern - extends beyond visible area to cover during zoom/pan */}
            {(() => {
              // Calculate the visible area in canvas coordinates (accounting for zoom and pan)
              // We need to cover the entire viewport even when zoomed out or panned
              const padding = 2000 // Extra padding to ensure coverage during pan
              const viewportX = -stagePosition.x / stageZoom - padding
              const viewportY = -stagePosition.y / stageZoom - padding
              const viewportWidth = dimensions.width / stageZoom + padding * 2
              const viewportHeight = dimensions.height / stageZoom + padding * 2
              
              return (
                <Rect
                  x={viewportX}
                  y={viewportY}
                  width={viewportWidth}
                  height={viewportHeight}
                  fill={checkerPatternImage ? undefined : '#f0f0f0'}
                  fillPatternImage={checkerPatternImage || undefined}
                  fillPatternRepeat="repeat"
                  fillPatternScale={{ x: 1 / stageZoom, y: 1 / stageZoom }}
                  listening={false}
                />
              )
            })()}
            {/* Mockup background with gradient support - hide when there's a background image */}
            {!backgroundImageObj && (
              <Rect
                x={mockupBounds.left}
                y={mockupBounds.top}
                width={mockupBounds.width}
                height={mockupBounds.height}
                fill={backgroundConfig.useGradient ? undefined : (backgroundConfig.color || '#ffffff')}
                {...getBackgroundGradientProps()}
                shadowColor="black"
                shadowBlur={20}
                shadowOpacity={0.15}
                cornerRadius={4}
              />
            )}
            {/* Background Image - Cover mode to maintain aspect ratio */}
            {backgroundImageObj && (
              <Group
                clipFunc={(ctx) => {
                  ctx.beginPath()
                  ctx.roundRect(mockupBounds.left, mockupBounds.top, mockupBounds.width, mockupBounds.height, 4)
                  ctx.closePath()
                }}
              >
                {(() => {
                  // Calculate cover dimensions to maintain aspect ratio
                  const imgAspect = backgroundImageObj.width / backgroundImageObj.height
                  const boundsAspect = mockupBounds.width / mockupBounds.height
                  const focalPoint = backgroundConfig.focalPoint
                  
                  let renderWidth: number
                  let renderHeight: number
                  let renderX: number
                  let renderY: number
                  
                  if (imgAspect > boundsAspect) {
                    // Image is wider - fit height, crop width
                    renderHeight = mockupBounds.height
                    renderWidth = mockupBounds.height * imgAspect
                    
                    // Use focal point if set, otherwise center
                    if (focalPoint) {
                      // Calculate offset to position the focal point in the center of the mockup
                      const focalPointInImageX = (focalPoint.x / 100) * renderWidth
                      const desiredCenterX = mockupBounds.left + mockupBounds.width / 2
                      renderX = desiredCenterX - focalPointInImageX
                      // Clamp to prevent going past edges
                      const minX = mockupBounds.left - (renderWidth - mockupBounds.width)
                      const maxX = mockupBounds.left
                      renderX = Math.max(minX, Math.min(maxX, renderX))
                    } else {
                      renderX = mockupBounds.left - (renderWidth - mockupBounds.width) / 2
                    }
                    renderY = mockupBounds.top
                  } else {
                    // Image is taller - fit width, crop height
                    renderWidth = mockupBounds.width
                    renderHeight = mockupBounds.width / imgAspect
                    renderX = mockupBounds.left
                    
                    // Use focal point if set, otherwise center
                    if (focalPoint) {
                      // Calculate offset to position the focal point in the center of the mockup
                      const focalPointInImageY = (focalPoint.y / 100) * renderHeight
                      const desiredCenterY = mockupBounds.top + mockupBounds.height / 2
                      renderY = desiredCenterY - focalPointInImageY
                      // Clamp to prevent going past edges
                      const minY = mockupBounds.top - (renderHeight - mockupBounds.height)
                      const maxY = mockupBounds.top
                      renderY = Math.max(minY, Math.min(maxY, renderY))
                    } else {
                      renderY = mockupBounds.top - (renderHeight - mockupBounds.height) / 2
                    }
                  }
                  
                  return (
                    <KonvaImage
                      image={backgroundImageObj}
                      x={renderX}
                      y={renderY}
                      width={renderWidth}
                      height={renderHeight}
                      shadowColor="black"
                      shadowBlur={20}
                      shadowOpacity={0.15}
                    />
                  )
                })()}
              </Group>
            )}
            {/* Printable area indicator - show when dragging or element is outside */}
            <Rect
              ref={printableAreaIndicatorRef}
              x={mockupBounds.left}
              y={mockupBounds.top}
              width={mockupBounds.width}
              height={mockupBounds.height}
              stroke={waveformOutsideBounds ? '#ef4444' : '#3b82f6'}
              strokeWidth={2}
              dash={[8, 4]}
              fill="transparent"
              cornerRadius={4}
              listening={false}
              visible={isDragging || waveformOutsideBounds}
            />
            
            {/* CAD-style dimension lines */}
            {showDimensions && selectedSize && (
              <>
                {/* Width dimension - top */}
                <Group listening={false}>
                  {/* Left arrow */}
                  <Line
                    points={[
                      mockupBounds.left, mockupBounds.top - 25,
                      mockupBounds.left, mockupBounds.top - 35,
                    ]}
                    stroke="#0066cc"
                    strokeWidth={1.5}
                  />
                  {/* Extension line */}
                  <Line
                    points={[
                      mockupBounds.left, mockupBounds.top - 30,
                      mockupBounds.left + mockupBounds.width, mockupBounds.top - 30,
                    ]}
                    stroke="#0066cc"
                    strokeWidth={1.5}
                  />
                  {/* Left arrowhead */}
                  <Line
                    points={[
                      mockupBounds.left, mockupBounds.top - 30,
                      mockupBounds.left + 8, mockupBounds.top - 26,
                      mockupBounds.left + 8, mockupBounds.top - 34,
                    ]}
                    closed
                    fill="#0066cc"
                    stroke="#0066cc"
                  />
                  {/* Right arrow */}
                  <Line
                    points={[
                      mockupBounds.left + mockupBounds.width, mockupBounds.top - 25,
                      mockupBounds.left + mockupBounds.width, mockupBounds.top - 35,
                    ]}
                    stroke="#0066cc"
                    strokeWidth={1.5}
                  />
                  {/* Right arrowhead */}
                  <Line
                    points={[
                      mockupBounds.left + mockupBounds.width, mockupBounds.top - 30,
                      mockupBounds.left + mockupBounds.width - 8, mockupBounds.top - 26,
                      mockupBounds.left + mockupBounds.width - 8, mockupBounds.top - 34,
                    ]}
                    closed
                    fill="#0066cc"
                    stroke="#0066cc"
                  />
                  {/* Width label */}
                  <Rect
                    x={mockupBounds.left + mockupBounds.width / 2 - 25}
                    y={mockupBounds.top - 42}
                    width={50}
                    height={18}
                    fill="white"
                    cornerRadius={2}
                    shadowColor="black"
                    shadowBlur={3}
                    shadowOpacity={0.1}
                  />
                  <Text
                    x={mockupBounds.left + mockupBounds.width / 2 - 25}
                    y={mockupBounds.top - 39}
                    width={50}
                    align="center"
                    text={`${selectedSize.width}"`}
                    fontSize={11}
                    fontFamily="system-ui, sans-serif"
                    fontStyle="bold"
                    fill="#0066cc"
                  />
                </Group>

                {/* Height dimension - left */}
                <Group listening={false}>
                  {/* Top line */}
                  <Line
                    points={[
                      mockupBounds.left - 25, mockupBounds.top,
                      mockupBounds.left - 35, mockupBounds.top,
                    ]}
                    stroke="#0066cc"
                    strokeWidth={1.5}
                  />
                  {/* Vertical extension line */}
                  <Line
                    points={[
                      mockupBounds.left - 30, mockupBounds.top,
                      mockupBounds.left - 30, mockupBounds.top + mockupBounds.height,
                    ]}
                    stroke="#0066cc"
                    strokeWidth={1.5}
                  />
                  {/* Top arrowhead */}
                  <Line
                    points={[
                      mockupBounds.left - 30, mockupBounds.top,
                      mockupBounds.left - 26, mockupBounds.top + 8,
                      mockupBounds.left - 34, mockupBounds.top + 8,
                    ]}
                    closed
                    fill="#0066cc"
                    stroke="#0066cc"
                  />
                  {/* Bottom line */}
                  <Line
                    points={[
                      mockupBounds.left - 25, mockupBounds.top + mockupBounds.height,
                      mockupBounds.left - 35, mockupBounds.top + mockupBounds.height,
                    ]}
                    stroke="#0066cc"
                    strokeWidth={1.5}
                  />
                  {/* Bottom arrowhead */}
                  <Line
                    points={[
                      mockupBounds.left - 30, mockupBounds.top + mockupBounds.height,
                      mockupBounds.left - 26, mockupBounds.top + mockupBounds.height - 8,
                      mockupBounds.left - 34, mockupBounds.top + mockupBounds.height - 8,
                    ]}
                    closed
                    fill="#0066cc"
                    stroke="#0066cc"
                  />
                  {/* Height label - rotated */}
                  <Rect
                    x={mockupBounds.left - 55}
                    y={mockupBounds.top + mockupBounds.height / 2 - 9}
                    width={44}
                    height={18}
                    fill="white"
                    cornerRadius={2}
                    shadowColor="black"
                    shadowBlur={3}
                    shadowOpacity={0.1}
                  />
                  <Text
                    x={mockupBounds.left - 55}
                    y={mockupBounds.top + mockupBounds.height / 2 - 6}
                    width={44}
                    align="center"
                    text={`${selectedSize.height}"`}
                    fontSize={11}
                    fontFamily="system-ui, sans-serif"
                    fontStyle="bold"
                    fill="#0066cc"
                  />
                </Group>
              </>
            )}
          </Layer>
          
          {/* Waveform Layer */}
          <Layer>
            <Group
              ref={waveformGroupRef}
              x={position?.x ?? mockupCenterX}
              y={position?.y ?? mockupCenterY}
              scaleX={scale.x}
              scaleY={scale.y}
              draggable
              onDragStart={handleDragStart}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
              onTransformStart={handleTransformStart}
              onTransform={handleTransform}
              onTransformEnd={handleTransformEnd}
              onClick={handleWaveformClick}
              onTap={handleWaveformClick}
            >
              {/* Bounds rect for transformer - sized to match actual waveform content using getActualWaveformBounds */}
              {(() => {
                const { boundWidth, boundHeight } = getActualWaveformBounds()
                
                return (
                  <Rect
                    x={-boundWidth / 2}
                    y={-boundHeight / 2}
                    width={boundWidth}
                    height={boundHeight}
                    fill="transparent"
                  />
                )
              })()}
              
              {/* Waveform - rendered based on style */}
              {renderWaveform()}
              
              {/* Animation playback progress indicator */}
              {isAnimationPlaying && !['circular', 'circular-blocks', 'laser', 'vinyl', 'vinyl-grooves', 'galaxy', 'ripple', 'heart-shape', 'starburst'].includes(waveformConfig.style) && (() => {
                // Use the same bounds as the transformer to avoid expanding the group's bounding box
                const { boundHeight: animBoundHeight } = getActualWaveformBounds()
                return (
                  <Line
                    points={[
                      -waveformWidth / 2 + waveformWidth * animationProgress,
                      -animBoundHeight / 2 - 5,
                      -waveformWidth / 2 + waveformWidth * animationProgress,
                      animBoundHeight / 2 + 5
                    ]}
                    stroke={waveformConfig.color || '#3b82f6'}
                    strokeWidth={2}
                    opacity={0.8}
                  />
                )
              })()}
            </Group>
            
            {/* Waveform Transformer */}
            {selectedElement === 'waveform' && (
              <Transformer
                ref={transformerRef}
                padding={0}
                rotateEnabled={['circular', 'circular-blocks', 'laser'].includes(waveformConfig.style) || (waveformConfig.style === 'image-mask' && imageMaskConfig.imageMaskShape === 'circular')}
                keepRatio={['circular', 'circular-blocks', 'laser'].includes(waveformConfig.style) || (waveformConfig.style === 'image-mask' && imageMaskConfig.imageMaskShape === 'circular')}
                enabledAnchors={
                  ['circular', 'circular-blocks', 'laser'].includes(waveformConfig.style) || (waveformConfig.style === 'image-mask' && imageMaskConfig.imageMaskShape === 'circular')
                    ? ['top-left', 'top-right', 'bottom-left', 'bottom-right']
                    : ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']
                }
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 50 || newBox.height < 30) return oldBox
                  return newBox
                }}
                anchorSize={10}
                anchorCornerRadius={5}
                anchorFill="#3b82f6"
                anchorStroke="#ffffff"
                anchorStrokeWidth={2}
                borderStroke="#3b82f6"
                borderStrokeWidth={1.5}
                borderDash={[4, 4]}
              />
            )}
            
            {/* Center guide lines */}
            {showCenterGuides.vertical && (
              <Line
                points={[mockupCenterX, mockupBounds.top, mockupCenterX, mockupBounds.top + mockupBounds.height]}
                stroke="#3b82f6"
                strokeWidth={1}
                dash={[4, 4]}
              />
            )}
            {showCenterGuides.horizontal && (
              <Line
                points={[mockupBounds.left, mockupCenterY, mockupBounds.left + mockupBounds.width, mockupCenterY]}
                stroke="#3b82f6"
                strokeWidth={1}
                dash={[4, 4]}
              />
            )}
            
            {/* Edge snap guide lines */}
            {edgeSnaps.left && (
              <Line
                points={[mockupBounds.left, mockupBounds.top, mockupBounds.left, mockupBounds.top + mockupBounds.height]}
                stroke="#10b981"
                strokeWidth={2}
              />
            )}
            {edgeSnaps.right && (
              <Line
                points={[mockupBounds.left + mockupBounds.width, mockupBounds.top, mockupBounds.left + mockupBounds.width, mockupBounds.top + mockupBounds.height]}
                stroke="#10b981"
                strokeWidth={2}
              />
            )}
            {edgeSnaps.top && (
              <Line
                points={[mockupBounds.left, mockupBounds.top, mockupBounds.left + mockupBounds.width, mockupBounds.top]}
                stroke="#10b981"
                strokeWidth={2}
              />
            )}
            {edgeSnaps.bottom && (
              <Line
                points={[mockupBounds.left, mockupBounds.top + mockupBounds.height, mockupBounds.left + mockupBounds.width, mockupBounds.top + mockupBounds.height]}
                stroke="#10b981"
                strokeWidth={2}
              />
            )}
          </Layer>
          
          {/* Text Elements Layer */}
          <Layer>
            {textConfig.textElements
              .filter(textEl => textEl.visible !== false) // Filter out hidden text elements
              .map((textEl) => {
              // Convert percentage to pixel position
              const textX = mockupBounds.left + (textEl.x / 100) * mockupBounds.width
              const textY = mockupBounds.top + (textEl.y / 100) * mockupBounds.height
              // Scale font size relative to mockup size
              const scaledFontSize = (textEl.fontSize / 100) * Math.min(mockupBounds.width, mockupBounds.height) * 0.1
              
              // Check if text is outside printable area (simple check based on position)
              const textOutsideBounds = 
                textX < mockupBounds.left ||
                textX > mockupBounds.left + mockupBounds.width ||
                textY < mockupBounds.top ||
                textY > mockupBounds.top + mockupBounds.height
              
              return (
                <Text
                  key={textEl.id}
                  ref={(node) => {
                    if (node) {
                      textRefs.current.set(textEl.id, node)
                    } else {
                      textRefs.current.delete(textEl.id)
                    }
                  }}
                  x={textX}
                  y={textY}
                  text={textEl.text}
                  fontSize={scaledFontSize}
                  fontFamily={textEl.fontFamily}
                  fill={textEl.color}
                  opacity={textOutsideBounds ? 0.4 : 1}
                  draggable
                  onDragStart={() => handleTextDragStart(textEl.id)}
                  onDragMove={handleTextDragMove}
                  onDragEnd={(e) => handleTextDragEnd(textEl.id, e)}
                  onTransformEnd={(e) => handleTextTransformEnd(textEl.id, e)}
                  onClick={() => {
                    setSelectedElement(textEl.id)
                    actions.selectTextElement(textEl.id)
                  }}
                  onTap={() => {
                    setSelectedElement(textEl.id)
                    actions.selectTextElement(textEl.id)
                  }}
                  offsetX={0}
                  offsetY={0}
                />
              )
            })}
            
            {/* Text Transformer */}
            <Transformer
              ref={textTransformerRef}
              rotateEnabled={true}
              keepRatio={true}
              enabledAnchors={[
                'top-left', 'top-right', 'bottom-left', 'bottom-right'
              ]}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 20 || newBox.height < 10) return oldBox
                return newBox
              }}
              anchorSize={10}
              anchorCornerRadius={5}
              anchorFill="#10b981"
              anchorStroke="#ffffff"
              anchorStrokeWidth={2}
              borderStroke="#10b981"
              borderStrokeWidth={2}
            />
          </Layer>
          
          {/* Border Text Layer */}
          {borderText.enabled && borderText.text && (
            <Layer>
              {(() => {
                const textContent = borderText.uppercase ? borderText.text.toUpperCase() : borderText.text
                const bandHeight = (borderText.height / 100) * mockupBounds.height
                // Use a consistent corner margin for even spacing on all sides
                const cornerMargin = (borderText.margin / 100) * Math.min(mockupBounds.width, mockupBounds.height)
                const edgeMargin = bandHeight * 0.5 // Keep text away from edges
                const scaledFontSize = (borderText.fontSize / 100) * Math.min(mockupBounds.width, mockupBounds.height) * 0.15
                
                // Use canvas to measure actual text width for accurate fitting
                const measureTextWidth = (text: string): number => {
                  const canvas = document.createElement('canvas')
                  const ctx = canvas.getContext('2d')
                  if (!ctx) return text.length * scaledFontSize * 0.6
                  ctx.font = `${scaledFontSize}px ${borderText.fontFamily}`
                  // Add letter spacing to measurement
                  const baseWidth = ctx.measureText(text).width
                  const letterSpacingTotal = (text.length - 1) * (borderText.letterSpacing || 0)
                  return baseWidth + letterSpacingTotal
                }
                
                // Continuous wrap mode - text flows around corners as ONE continuous sentence (no repeating)
                if (borderText.continuous && borderText.sides.length > 0) {
                  // Order sides clockwise: top -> right -> bottom -> left
                  const sideOrder: ('top' | 'right' | 'bottom' | 'left')[] = ['top', 'right', 'bottom', 'left']
                  const activeSides = sideOrder.filter(s => borderText.sides.includes(s))
                  
                  // Calculate available pixel widths for each side (with safety buffer)
                  const totalCornerMargin = cornerMargin * 2 + edgeMargin * 2
                  const safetyBuffer = scaledFontSize * 1.2 // Extra buffer to prevent overflow
                  const sideWidths: Record<string, number> = {
                    top: mockupBounds.width - totalCornerMargin - safetyBuffer,
                    bottom: mockupBounds.width - totalCornerMargin - safetyBuffer,
                    left: mockupBounds.height - totalCornerMargin - safetyBuffer,
                    right: mockupBounds.height - totalCornerMargin - safetyBuffer
                  }
                  
                  // Smart break function using actual text measurement
                  const smartBreak = (text: string, maxWidth: number): { segment: string; consumed: number } => {
                    // First check if all remaining text fits
                    if (measureTextWidth(text) <= maxWidth) {
                      return { segment: text, consumed: text.length }
                    }
                    
                    // If breakWords is disabled, try to break at word boundaries
                    if (!borderText.breakWords) {
                      // Find the last space that fits
                      let lastSpaceIndex = -1
                      for (let i = 0; i < text.length; i++) {
                        if (text[i] === ' ') {
                          const testText = text.substring(0, i)
                          if (measureTextWidth(testText) <= maxWidth) {
                            lastSpaceIndex = i
                          } else {
                            break
                          }
                        }
                      }
                      
                      // If we found a space that fits, break there
                      if (lastSpaceIndex > 0) {
                        return { segment: text.substring(0, lastSpaceIndex), consumed: lastSpaceIndex + 1 }
                      }
                      
                      // No space found - fall through to character break (but without hyphen)
                      let low = 1
                      let high = text.length
                      let bestFit = 1
                      
                      while (low <= high) {
                        const mid = Math.floor((low + high) / 2)
                        const testText = text.substring(0, mid)
                        const width = measureTextWidth(testText)
                        
                        if (width <= maxWidth) {
                          bestFit = mid
                          low = mid + 1
                        } else {
                          high = mid - 1
                        }
                      }
                      
                      return { segment: text.substring(0, bestFit), consumed: bestFit }
                    }
                    
                    // breakWords enabled - use hyphenation
                    // Binary search to find how many characters fit
                    let low = 1
                    let high = text.length
                    let bestFit = 1
                    
                    while (low <= high) {
                      const mid = Math.floor((low + high) / 2)
                      const testText = text.substring(0, mid) + '-'
                      const width = measureTextWidth(testText)
                      
                      if (width <= maxWidth) {
                        bestFit = mid
                        low = mid + 1
                      } else {
                        high = mid - 1
                      }
                    }
                    
                    // Use the best fit with hyphen
                    return { segment: text.substring(0, bestFit) + '-', consumed: bestFit }
                  }
                  
                  // Distribute text across sides with smart breaking
                  const textSegments: React.ReactNode[] = []
                  let remainingText = textContent
                  
                  activeSides.forEach((side) => {
                    // Only render if there's still text left to show
                    if (!remainingText.trim()) return
                    
                    const maxWidth = sideWidths[side]
                    const { segment, consumed } = smartBreak(remainingText, maxWidth)
                    remainingText = remainingText.substring(consumed)
                    
                    // Skip empty segments
                    if (!segment.trim()) return
                    
                    let x = 0, y = 0, rotation = 0
                    
                    // Position with even margins - text flows clockwise
                    switch (side) {
                      case 'top':
                        // Top: left to right, centered in the band
                        x = mockupBounds.left + cornerMargin + edgeMargin
                        y = mockupBounds.top + cornerMargin + bandHeight / 2
                        rotation = 0
                        break
                      case 'right':
                        // Right: top to bottom
                        x = mockupBounds.left + mockupBounds.width - cornerMargin - bandHeight / 2
                        y = mockupBounds.top + cornerMargin + edgeMargin
                        rotation = 90
                        break
                      case 'bottom':
                        // Bottom: right to left (continues clockwise)
                        x = mockupBounds.left + mockupBounds.width - cornerMargin - edgeMargin
                        y = mockupBounds.top + mockupBounds.height - cornerMargin - bandHeight / 2
                        rotation = 180
                        break
                      case 'left':
                        // Left: bottom to top (continues clockwise)
                        x = mockupBounds.left + cornerMargin + bandHeight / 2
                        y = mockupBounds.top + mockupBounds.height - cornerMargin - edgeMargin
                        rotation = -90
                        break
                    }
                    
                    textSegments.push(
                      <Text
                        key={`continuous-${side}`}
                        x={x}
                        y={y}
                        text={segment}
                        fontSize={scaledFontSize}
                        fontFamily={borderText.fontFamily}
                        fill={borderText.color}
                        align="left"
                        verticalAlign="middle"
                        rotation={rotation}
                        letterSpacing={borderText.letterSpacing}
                        listening={false}
                      />
                    )
                  })
                  
                  return <>{textSegments}</>
                }
                
                // Standard mode - same text on each selected side
                const renderSideText = (side: 'top' | 'right' | 'bottom' | 'left') => {
                  if (!borderText.sides.includes(side)) return null
                  
                  let x = 0, y = 0, rotation = 0, width = 0
                  
                  switch (side) {
                    case 'top':
                      x = mockupBounds.left + mockupBounds.width / 2
                      y = mockupBounds.top + cornerMargin + bandHeight / 2
                      width = mockupBounds.width - cornerMargin * 2
                      rotation = 0
                      break
                    case 'bottom':
                      x = mockupBounds.left + mockupBounds.width / 2
                      y = mockupBounds.top + mockupBounds.height - cornerMargin - bandHeight / 2
                      width = mockupBounds.width - cornerMargin * 2
                      rotation = 0
                      break
                    case 'left':
                      x = mockupBounds.left + cornerMargin + bandHeight / 2
                      y = mockupBounds.top + mockupBounds.height / 2
                      width = mockupBounds.height - cornerMargin * 2
                      rotation = -90
                      break
                    case 'right':
                      x = mockupBounds.left + mockupBounds.width - cornerMargin - bandHeight / 2
                      y = mockupBounds.top + mockupBounds.height / 2
                      width = mockupBounds.height - cornerMargin * 2
                      rotation = 90
                      break
                  }
                  
                  // Handle text repeat and justify
                  let displayText = textContent
                  if (borderText.repeat) {
                    // Repeat text to fill the width (approximate)
                    const charsNeeded = Math.ceil(width / charWidth)
                    const repeatCount = Math.ceil(charsNeeded / textContent.length)
                    displayText = (textContent + ' • ').repeat(repeatCount)
                  }
                  
                  let align: 'left' | 'center' | 'right' = 'center'
                  if (borderText.justify === 'start') align = 'left'
                  else if (borderText.justify === 'end') align = 'right'
                  else align = 'center'
                  
                  return (
                    <Text
                      key={side}
                      x={x}
                      y={y}
                      text={displayText}
                      fontSize={scaledFontSize}
                      fontFamily={borderText.fontFamily}
                      fill={borderText.color}
                      align={align}
                      verticalAlign="middle"
                      width={width}
                      rotation={rotation}
                      offsetX={width / 2}
                      offsetY={0}
                      letterSpacing={borderText.letterSpacing}
                      listening={false}
                    />
                  )
                }
                
                return (
                  <>
                    {renderSideText('top')}
                    {renderSideText('bottom')}
                    {renderSideText('left')}
                    {renderSideText('right')}
                  </>
                )
              })()}
            </Layer>
          )}
          
          {/* QR Code Layer */}
          {qrCodeConfig.showQRCode && qrCodeImageObj && (
            <Layer>
              <KonvaImage
                ref={qrCodeRef}
                image={qrCodeImageObj}
                x={mockupBounds.left + (qrCodeConfig.qrCodeX / 100) * mockupBounds.width}
                y={mockupBounds.top + (qrCodeConfig.qrCodeY / 100) * mockupBounds.height}
                width={(qrCodeConfig.qrCodeSize / 100) * mockupBounds.width * 0.3}
                height={(qrCodeConfig.qrCodeSize / 100) * mockupBounds.width * 0.3}
                draggable
                onClick={() => setSelectedElement('qrcode')}
                onTap={() => setSelectedElement('qrcode')}
                onDragEnd={(e) => {
                  const node = e.target
                  const newX = ((node.x() - mockupBounds.left) / mockupBounds.width) * 100
                  const newY = ((node.y() - mockupBounds.top) / mockupBounds.height) * 100
                  setQRCodeX(Math.max(0, Math.min(100, newX)))
                  setQRCodeY(Math.max(0, Math.min(100, newY)))
                }}
                onTransformEnd={(e) => {
                  const node = e.target as Konva.Image
                  const scaleX = node.scaleX()
                  // Reset scale and update size instead
                  node.scaleX(1)
                  node.scaleY(1)
                  const newWidth = node.width() * scaleX
                  const newSizePercent = (newWidth / (mockupBounds.width * 0.3)) * 100
                  const setQRCodeSize = useCustomizerStore.getState().setQRCodeSize
                  setQRCodeSize(Math.max(20, Math.min(200, newSizePercent)))
                }}
              />
              
              {/* QR Code Transformer */}
              {selectedElement === 'qrcode' && (
                <Transformer
                  ref={qrTransformerRef}
                  rotateEnabled={false}
                  keepRatio={true}
                  enabledAnchors={[
                    'top-left', 'top-right', 'bottom-left', 'bottom-right'
                  ]}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 20 || newBox.height < 20) return oldBox
                    return newBox
                  }}
                  anchorSize={10}
                  anchorCornerRadius={5}
                  anchorFill="#8b5cf6"
                  anchorStroke="#ffffff"
                  anchorStrokeWidth={2}
                  borderStroke="#8b5cf6"
                  borderStrokeWidth={2}
                />
              )}
            </Layer>
          )}
        </Stage>

        {/* Loading Overlay - show until waveform data is ready */}
        {(isLoadingAudio || waveformData.length === 0) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90 z-50">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-end gap-1 h-12">
                <div className="w-1.5 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '30%', animationDelay: '0ms' }} />
                <div className="w-1.5 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '60%', animationDelay: '80ms' }} />
                <div className="w-1.5 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '100%', animationDelay: '160ms' }} />
                <div className="w-1.5 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '70%', animationDelay: '240ms' }} />
                <div className="w-1.5 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '90%', animationDelay: '320ms' }} />
                <div className="w-1.5 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '50%', animationDelay: '400ms' }} />
                <div className="w-1.5 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '80%', animationDelay: '480ms' }} />
              </div>
              <p className="text-sm font-medium text-gray-600">Loading waveform...</p>
            </div>
          </div>
        )}
        {(isDragging || isResizing) && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
            {isDragging ? 'Dragging...' : 'Resizing...'}
          </div>
        )}
      </div>
    </div>
  )
})

// Display name for dev tools
InteractiveCanvasEditorKonva.displayName = 'InteractiveCanvasEditorKonva'
