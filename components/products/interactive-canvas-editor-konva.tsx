'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Stage, Layer, Rect, Group, Line, Circle, Transformer, Text, Image as KonvaImage } from 'react-konva'
import Konva from 'konva'
import { useInteractiveCanvasConfig, useInteractiveCanvasActions, useWaveformConfig, useBackgroundConfig, useAudioConfig, useTextConfig, useQRCodeConfig, useCustomizerStore, type TextElement } from '@/lib/stores/customizer-store'
import QRCodeLib from 'qrcode'

interface InteractiveCanvasEditorKonvaProps {
  mockupRef: React.RefObject<{ canvas: HTMLCanvasElement | null } | null>
  selectedSize?: { width: number; height: number }
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

export function InteractiveCanvasEditorKonva({ selectedSize }: InteractiveCanvasEditorKonvaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const waveformGroupRef = useRef<Konva.Group>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const textRefs = useRef<Map<string, Konva.Text>>(new Map())
  const textTransformerRef = useRef<Konva.Transformer>(null)
  
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [isLoadingAudio, setIsLoadingAudio] = useState(false)
  // Position will be set once we know the actual container size
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [scale, setScale] = useState({ x: 1, y: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [showCenterGuides, setShowCenterGuides] = useState({ horizontal: false, vertical: false })
  const [selectedElement, setSelectedElement] = useState<'waveform' | 'qrcode' | string | null>('waveform')
  const [waveformOutsideBounds, setWaveformOutsideBounds] = useState(false)
  const [backgroundImageObj, setBackgroundImageObj] = useState<HTMLImageElement | null>(null)
  const [qrCodeImageObj, setQrCodeImageObj] = useState<HTMLImageElement | null>(null)
  const qrCodeRef = useRef<Konva.Image>(null)
  const qrTransformerRef = useRef<Konva.Transformer>(null)
  
  // Store hooks
  const config = useInteractiveCanvasConfig()
  const actions = useInteractiveCanvasActions()
  const waveformConfig = useWaveformConfig()
  const backgroundConfig = useBackgroundConfig()
  const audioConfig = useAudioConfig()
  const textConfig = useTextConfig()
  const qrCodeConfig = useQRCodeConfig()
  const setQRCodeX = useCustomizerStore(state => state.setQRCodeX)
  const setQRCodeY = useCustomizerStore(state => state.setQRCodeY)
  
  // Direct subscriptions for gradient values to ensure reactivity
  // useShallow may not detect changes in nested arrays properly
  const waveformUseGradient = useCustomizerStore(state => state.waveformUseGradient)
  const waveformGradientStops = useCustomizerStore(state => state.waveformGradientStops)
  const waveformGradientDirection = useCustomizerStore(state => state.waveformGradientDirection)
  const barRounded = useCustomizerStore(state => state.barRounded)
  
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
  
  // Load QR code image when it changes
  useEffect(() => {
    if (!qrCodeConfig.showQRCode || !qrCodeConfig.qrCodeUrl) {
      setQrCodeImageObj(null)
      return
    }
    
    // Generate QR code as data URL
    QRCodeLib.toDataURL(qrCodeConfig.qrCodeUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    }).then((dataUrl) => {
      const img = new window.Image()
      img.onload = () => {
        setQrCodeImageObj(img)
      }
      img.onerror = () => {
        console.error('Failed to load QR code image')
        setQrCodeImageObj(null)
      }
      img.src = dataUrl
    }).catch((err) => {
      console.error('Failed to generate QR code:', err)
      setQrCodeImageObj(null)
    })
  }, [qrCodeConfig.showQRCode, qrCodeConfig.qrCodeUrl])
  
  // Load actual audio waveform data from the store
  useEffect(() => {
    const loadAudioData = async () => {
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
  
  // Calculate center points for snapping
  const mockupCenterX = mockupBounds.left + mockupBounds.width / 2
  const mockupCenterY = mockupBounds.top + mockupBounds.height / 2
  
  // Initialize position ONCE when dimensions are ready
  // After that, position is controlled by drag
  const [positionInitialized, setPositionInitialized] = useState(false)
  
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
  }, [dimensions, scaledWidth, scaledHeight, positionInitialized, mockupBounds, waveformConfig.x, waveformConfig.y])
  
  // Attach transformer to waveform group - also update when waveform config changes
  useEffect(() => {
    if (selectedElement === 'waveform' && transformerRef.current && waveformGroupRef.current) {
      transformerRef.current.nodes([waveformGroupRef.current])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [waveformData, waveformConfig.barWidth, waveformConfig.barGap, waveformConfig.style, config.waveformSize, config.waveformHeightMultiplier, selectedElement])
  
  // Force redraw when gradient values or barRounded change - Konva may not automatically re-render
  useEffect(() => {
    if (waveformGroupRef.current) {
      waveformGroupRef.current.getLayer()?.batchDraw()
    }
  }, [waveformUseGradient, waveformGradientStops, waveformGradientDirection, barRounded])
  
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
  
  // Check if element is within printable bounds
  const checkWaveformBounds = useCallback((x: number, y: number, scaleX: number, scaleY: number) => {
    const halfWidth = (waveformWidth * scaleX) / 2
    const halfHeight = (waveformHeight * scaleY) / 2
    
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
  }, [waveformWidth, waveformHeight, mockupBounds])
  
  // Drag handlers with snap-to-center
  const handleDragStart = useCallback(() => {
    setIsDragging(true)
    setSelectedElement('waveform')
  }, [])
  
  const handleDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target
    let x = node.x()
    let y = node.y()
    
    // Check if near horizontal center
    const nearHorizontalCenter = Math.abs(x - mockupCenterX) < SNAP_THRESHOLD
    // Check if near vertical center
    const nearVerticalCenter = Math.abs(y - mockupCenterY) < SNAP_THRESHOLD
    
    // Snap to center if within threshold
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
    
    // Check bounds during drag
    const isOutside = checkWaveformBounds(x, y, scale.x, scale.y)
    setWaveformOutsideBounds(isOutside)
  }, [mockupCenterX, mockupCenterY, scale, checkWaveformBounds])
  
  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(false)
    setShowCenterGuides({ horizontal: false, vertical: false })
    const node = e.target
    setPosition({ x: node.x(), y: node.y() })
    
    // Sync to store (only if bounds are valid)
    if (mockupBounds.width > 0 && mockupBounds.height > 0) {
      const relX = node.x() - mockupBounds.left
      const relY = node.y() - mockupBounds.top
      const pctX = (relX / mockupBounds.width) * 100
      const pctY = (relY / mockupBounds.height) * 100
      actions.setWaveformPosition(
        Math.max(0, Math.min(100, pctX)),
        Math.max(0, Math.min(100, pctY))
      )
    }
  }, [mockupBounds, actions])
  
  // Text element handlers
  const handleTextDragStart = useCallback((textId: string) => {
    setIsDragging(true)
    setSelectedElement(textId)
    actions.selectTextElement(textId)
  }, [actions])
  
  const handleTextDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target
    let x = node.x()
    let y = node.y()
    
    // Snap to center
    const nearHorizontalCenter = Math.abs(x - mockupCenterX) < SNAP_THRESHOLD
    const nearVerticalCenter = Math.abs(y - mockupCenterY) < SNAP_THRESHOLD
    
    if (nearHorizontalCenter) {
      x = mockupCenterX
      node.x(x)
    }
    if (nearVerticalCenter) {
      y = mockupCenterY
      node.y(y)
    }
    
    setShowCenterGuides({
      horizontal: nearVerticalCenter,
      vertical: nearHorizontalCenter
    })
  }, [mockupCenterX, mockupCenterY])
  
  const handleTextDragEnd = useCallback((textId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(false)
    setShowCenterGuides({ horizontal: false, vertical: false })
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
  
  // Handle stage click to deselect
  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // Only deselect if clicking on empty space
    if (e.target === e.target.getStage()) {
      setSelectedElement(null)
      actions.selectTextElement(null)
    }
  }, [actions])
  
  // Transform handlers
  const handleTransformStart = useCallback(() => {
    setIsResizing(true)
    setSelectedElement('waveform')
  }, [])
  
  const handleTransform = useCallback(() => {
    // Check bounds during transform
    const node = waveformGroupRef.current
    if (node) {
      const isOutside = checkWaveformBounds(node.x(), node.y(), node.scaleX(), node.scaleY())
      setWaveformOutsideBounds(isOutside)
    }
  }, [checkWaveformBounds])
  
  const handleTransformEnd = useCallback(() => {
    setIsResizing(false)
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
    } else {
      // Center text element
      actions.updateTextElement(selectedElement, { x: 50, y: 50 })
    }
  }, [selectedElement, mockupBounds, actions])
  
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
    
    // Build color stops array for Konva
    const colorStops: (number | string)[] = []
    stops.forEach(stop => {
      colorStops.push(stop.position, stop.color)
    })
    
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
    
    // Build color stops array for Konva
    const colorStops: (number | string)[] = []
    stops.forEach(stop => {
      colorStops.push(stop.position, stop.color)
    })
    
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
    // Use direct store subscriptions for gradient values (more reliable reactivity)
    const useGradient = waveformUseGradient
    const gradientStops = waveformGradientStops
    const gradientDirection = waveformGradientDirection
    const barW = waveformConfig.barWidth || 3
    const barGap = waveformConfig.barGap ?? 1
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
      } else {
        // Diagonal - mix based on position
        const position = totalBars > 1 ? barIndex / (totalBars - 1) : 0.5
        return getColorAtPosition(position)
      }
    }
    
    // For shapes that cover the full waveform area (Line, etc.), use Konva's linear gradient
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
        // Standard bar rendering - distribute bars evenly across waveform width
        const totalBars = waveformData.length
        const availableWidth = waveformWidth
        const spacing = availableWidth / totalBars
        const actualBarWidth = Math.max(1, Math.min(barW, spacing - 1))
        // Create a gradient key to force re-render when colors change
        const gradientKey = useGradient ? gradientStops?.map(s => s.color).join('-') : color
        // Corner radius: neon always rounded, others based on barRounded setting
        // Use half the bar width for rounded corners (pill shape)
        const cornerRadius = style === 'neon' || isBarRounded ? Math.max(1, actualBarWidth / 2) : 0
        
        return waveformData.map((amplitude, i) => {
          const barH = amplitude * waveformHeight * heightMult
          // Center each bar on its position by offsetting by half the bar width
          const x = -waveformWidth / 2 + i * spacing + (spacing - actualBarWidth) / 2
          const y = -barH / 2
          const barFill = getBarFill(i, totalBars)
          
          return (
            <Rect
              key={`${i}-${gradientKey}-${isBarRounded}`}
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
        const totalBars = waveformData.length
        const spacing = waveformWidth / totalBars
        const actualBarWidth = Math.max(1, Math.min(barW, spacing - 1))
        const mirrorCornerRadius = isBarRounded ? actualBarWidth / 2 : 0
        const gradientKey = useGradient ? gradientStops?.map(s => s.color).join('-') : color
        
        return waveformData.flatMap((amplitude, i) => {
          const barH = amplitude * (waveformHeight / 2) * heightMult
          // Center each bar on its position
          const x = -waveformWidth / 2 + i * spacing + (spacing - actualBarWidth) / 2
          const topY = -barH
          const bottomY = 0
          const fillColor = getBarFill(i, totalBars)
          
          return [
            <Rect
              key={`top-${i}-${gradientKey}-${isBarRounded}`}
              x={x}
              y={topY}
              width={actualBarWidth}
              height={barH}
              fill={fillColor}
              cornerRadius={mirrorCornerRadius}
            />,
            <Rect
              key={`bottom-${i}-${gradientKey}-${isBarRounded}`}
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
        // Circular waveform
        const centerX = 0
        const centerY = 0
        const innerRadius = (waveformConfig.circleRadius || 50) * (waveformWidth / 400)
        const maxBarLength = (waveformHeight / 2) * heightMult
        const totalBars = waveformData.length
        const gradientKey = useGradient ? gradientStops?.map(s => s.color).join('-') : color
        
        return waveformData.map((amplitude, i) => {
          const angle = (i / waveformData.length) * Math.PI * 2 - Math.PI / 2
          const barLength = amplitude * maxBarLength
          const x1 = centerX + Math.cos(angle) * innerRadius
          const y1 = centerY + Math.sin(angle) * innerRadius
          const x2 = centerX + Math.cos(angle) * (innerRadius + barLength)
          const y2 = centerY + Math.sin(angle) * (innerRadius + barLength)
          const strokeColor = getBarFill(i, totalBars)
          
          return (
            <Line
              key={`${i}-${gradientKey}-${isBarRounded}`}
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
        // Mimics typical audio frequency distribution
        const totalBars = waveformData.length
        const spacing = waveformWidth / totalBars
        const actualBarWidth = Math.max(1, Math.min(barW, spacing - 1))
        
        return waveformData.map((amplitude, i) => {
          // Create frequency curve: rises from left, peaks around 60-70%, then falls
          const position = i / totalBars
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
              key={i}
              x={x}
              y={y}
              width={actualBarWidth}
              height={barH}
              fill={getBarFill(i, totalBars)}
              cornerRadius={[actualBarWidth / 2, actualBarWidth / 2, 0, 0]}
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
      
      default: {
        // Fallback to bars
        const totalBars = waveformData.length
        const spacing = waveformWidth / totalBars
        const actualBarWidth = Math.max(1, Math.min(barW, spacing - 1))
        
        return waveformData.map((amplitude, i) => {
          const barH = amplitude * waveformHeight * heightMult
          // Center each bar on its position
          const x = -waveformWidth / 2 + i * spacing + (spacing - actualBarWidth) / 2
          const y = -barH / 2
          
          return (
            <Rect
              key={i}
              x={x}
              y={y}
              width={actualBarWidth}
              height={barH}
              fill={getBarFill(i, totalBars)}
              cornerRadius={1}
            />
          )
        })
      }
    }
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Control bar with center button */}
      {selectedElement && (
        <div className="flex items-center justify-center gap-2 p-2 bg-gray-100 border-b">
          <button
            onClick={handleCenterElement}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Center {selectedElement === 'waveform' ? 'Waveform' : 'Text'}
          </button>
          {selectedElement === 'waveform' && (scale.x !== 1 || scale.y !== 1) && (
            <button
              onClick={handleResetDimensions}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Size
            </button>
          )}
          <span className="text-xs text-gray-500">
            Selected: {selectedElement === 'waveform' ? 'Waveform' : selectedElement === 'qrcode' ? 'QR Code' : 'Text Element'}
          </span>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-muted/20"
        style={{ minHeight: 400 }}
      >
        <Stage 
          width={dimensions.width} 
          height={dimensions.height}
          onClick={handleStageClick}
        >
          {/* Background Layer */}
          <Layer>
            <Rect
              x={0}
              y={0}
              width={dimensions.width}
              height={dimensions.height}
              fill="#fafafa"
            />
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
            {/* Background Image */}
            {backgroundImageObj && (
              <Group
                clipFunc={(ctx) => {
                  ctx.beginPath()
                  ctx.roundRect(mockupBounds.left, mockupBounds.top, mockupBounds.width, mockupBounds.height, 4)
                  ctx.closePath()
                }}
              >
                <KonvaImage
                  image={backgroundImageObj}
                  x={mockupBounds.left}
                  y={mockupBounds.top}
                  width={mockupBounds.width}
                  height={mockupBounds.height}
                  shadowColor="black"
                  shadowBlur={20}
                  shadowOpacity={0.15}
                />
              </Group>
            )}
            {/* Printable area indicator - show when dragging or element is outside */}
            {(isDragging || waveformOutsideBounds) && (
              <Rect
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
              />
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
              opacity={waveformOutsideBounds ? 0.4 : 1}
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
              {/* Bounds rect for transformer */}
              <Rect
                x={-waveformWidth / 2}
                y={-waveformHeight / 2}
                width={waveformWidth}
                height={waveformHeight}
                fill="transparent"
              />
              
              {/* Waveform - rendered based on style */}
              {renderWaveform()}
            </Group>
            
            {/* Waveform Transformer */}
            {selectedElement === 'waveform' && (
              <Transformer
                ref={transformerRef}
                rotateEnabled={waveformConfig.style === 'circular'}
                keepRatio={waveformConfig.style === 'circular'}
                enabledAnchors={
                  waveformConfig.style === 'circular'
                    ? ['top-left', 'top-right', 'bottom-left', 'bottom-right']
                    : ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']
                }
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 50 || newBox.height < 30) return oldBox
                  return newBox
                }}
                anchorSize={12}
                anchorCornerRadius={6}
                anchorFill="#3b82f6"
                anchorStroke="#ffffff"
                anchorStrokeWidth={2}
                borderStroke="#3b82f6"
                borderStrokeWidth={2}
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

        {/* Status */}
        {isLoadingAudio && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="bg-black/70 text-white text-sm px-4 py-2 rounded-full">
              Loading audio...
            </div>
          </div>
        )}
        {(isDragging || isResizing) && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
            {isDragging ? 'Dragging...' : 'Resizing...'}
          </div>
        )}
        {waveformOutsideBounds && !isDragging && !isResizing && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Element outside printable area
          </div>
        )}
      </div>
    </div>
  )
}
