'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { Canvas, FabricImage, Rect, FabricText, Pattern } from 'fabric'
import { useCustomizerStore, useInteractiveCanvasConfig, useInteractiveCanvasActions, useInteractiveCanvasUndoRedo } from '@/lib/stores/customizer-store'
import { Crosshair, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trash2, Undo2, Redo2, Copy, Clipboard, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

interface InteractiveCanvasEditorProps {
  mockupRef: React.RefObject<{ canvas: HTMLCanvasElement | null } | null>
  selectedSize?: { width: number; height: number }
}

// Store the mockup bounds so we can convert positions correctly
interface MockupBounds {
  left: number
  top: number
  width: number
  height: number
}

// Snapping threshold in percentage
const SNAP_THRESHOLD = 2

// Reference print canvas dimensions for scaling
const PRINT_CANVAS_WIDTH = 3600
const PRINT_CANVAS_HEIGHT = 4800

// Cache for loaded fonts
const loadedFontsCache = new Set<string>()

// Load Google Font dynamically if not already loaded
const ensureFontLoaded = async (fontFamily: string): Promise<void> => {
  if (loadedFontsCache.has(fontFamily)) return
  if (!fontFamily || fontFamily === 'Arial' || fontFamily === 'sans-serif') return
  
  // Check if already available in the document
  const fontSpec = `16px "${fontFamily}"`
  if (document.fonts && document.fonts.check(fontSpec)) {
    loadedFontsCache.add(fontFamily)
    return
  }
  
  // Load the font
  if (!document.querySelector(`link[href*="${fontFamily.replace(/ /g, '+')}"]`)) {
    const link = document.createElement('link')
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;700&display=swap`
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  
  // Wait for font to load
  try {
    if (document.fonts) {
      await document.fonts.load(fontSpec)
    }
    loadedFontsCache.add(fontFamily)
  } catch {
    // Font may not exist, continue anyway
    loadedFontsCache.add(fontFamily)
  }
}

export function InteractiveCanvasEditor({ mockupRef, selectedSize }: InteractiveCanvasEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricRef = useRef<Canvas | null>(null)
  const backgroundImageRef = useRef<FabricImage | null>(null)
  const waveformBoundsRef = useRef<Rect | null>(null)
  const textObjectsRef = useRef<Map<string, FabricText>>(new Map())
  const mainTextObjectRef = useRef<FabricText | null>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const isUserInteracting = useRef(false)
  const draggingTextIds = useRef<Set<string>>(new Set())
  const lastCanvasData = useRef<string>('')
  const lastCanvasHashRef = useRef<number>(0) // Fast hash for dirty check
  const mockupBoundsRef = useRef<MockupBounds>({ left: 0, top: 0, width: 0, height: 0 })
  const initialBoundsSize = useRef<{ width: number; height: number } | null>(null)
  const lastUpdateTime = useRef<number>(0)
  const boundsInitialized = useRef(false) // Track if bounds have been properly sized
  const isShiftPressed = useRef(false) // Track Shift key for multi-select
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isInitialized, setIsInitialized] = useState(false)
  const [mockupReady, setMockupReady] = useState(false) // Track when mockup bounds are available
  const [isDragging, setIsDragging] = useState(false)
  const [snapIndicator, setSnapIndicator] = useState<{ horizontal: boolean; vertical: boolean }>({ horizontal: false, vertical: false })
  const [zoomLevel, setZoomLevel] = useState(1) // 0.5 to 2.0
  
  // Store state - use grouped selectors for minimal re-renders (reduces 20 to 2 subscriptions)
  const config = useInteractiveCanvasConfig()
  const actions = useInteractiveCanvasActions()
  const undoRedo = useInteractiveCanvasUndoRedo()
  
  // Destructure config for easier use
  const waveformX = config.waveformX
  const waveformY = config.waveformY
  const waveformSize = config.waveformSize
  const waveformHeightMultiplier = config.waveformHeightMultiplier
  const textElements = config.textElements
  const selectedTextElementId = config.selectedTextElementId
  const selectedTextElementIds = config.selectedTextElementIds
  const clipboardTextElements = config.clipboardTextElements
  const showText = config.showText
  const customText = config.customText
  const textX = config.textX
  const textY = config.textY
  const fontSize = config.fontSize
  const fontFamily = config.fontFamily
  const textColor = config.textColor
  
  // Destructure actions
  const setWaveformPosition = actions.setWaveformPosition
  const setWaveformSize = actions.setWaveformSize
  const updateTextElement = actions.updateTextElement
  const selectTextElement = actions.selectTextElement
  const removeTextElement = actions.removeTextElement
  const toggleTextElementSelection = actions.toggleTextElementSelection
  const selectAllTextElements = actions.selectAllTextElements
  const clearTextSelection = actions.clearTextSelection
  const copySelectedTextElements = actions.copySelectedTextElements
  const pasteTextElements = actions.pasteTextElements
  const deleteSelectedTextElements = actions.deleteSelectedTextElements
  const setTextX = actions.setTextX
  const setTextY = actions.setTextY
  const setFontSize = actions.setFontSize
  const undo = actions.undo
  const redo = actions.redo
  const saveToHistory = actions.saveToHistory
  
  // Undo/redo state
  const canUndo = undoRedo.canUndo
  const canRedo = undoRedo.canRedo

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(2, prev + 0.25))
  }, [])
  
  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(0.5, prev - 0.25))
  }, [])
  
  const handleZoomReset = useCallback(() => {
    setZoomLevel(1)
  }, [])

  // Calculate display dimensions - use full container size
  const calculateDimensions = useCallback(() => {
    if (!containerRef.current) return { width: 0, height: 0 }
    
    const rect = containerRef.current.getBoundingClientRect()
    return { width: Math.floor(rect.width), height: Math.floor(rect.height) }
  }, [])

  // Convert canvas position to store percentage (relative to mockup bounds)
  const canvasToStorePosition = useCallback((canvasX: number, canvasY: number) => {
    const bounds = mockupBoundsRef.current
    if (bounds.width === 0 || bounds.height === 0) {
      return { x: 50, y: 50 }
    }
    
    // Convert to percentage relative to mockup area
    const relativeX = canvasX - bounds.left
    const relativeY = canvasY - bounds.top
    
    const percentX = (relativeX / bounds.width) * 100
    const percentY = (relativeY / bounds.height) * 100
    
    return { 
      x: Math.max(0, Math.min(100, percentX)), 
      y: Math.max(0, Math.min(100, percentY)) 
    }
  }, [])

  // Convert store percentage to canvas position
  const storeToCanvasPosition = useCallback((storeX: number, storeY: number) => {
    const bounds = mockupBoundsRef.current
    
    const canvasX = bounds.left + (storeX / 100) * bounds.width
    const canvasY = bounds.top + (storeY / 100) * bounds.height
    
    return { x: canvasX, y: canvasY }
  }, [])

  // Snap position to center if close enough, and round to 2 decimal places
  const snapToCenter = useCallback((percentX: number, percentY: number): { x: number; y: number; snappedH: boolean; snappedV: boolean } => {
    let snappedX = percentX
    let snappedY = percentY
    let snappedH = false
    let snappedV = false
    
    // Snap to horizontal center (50%)
    if (Math.abs(percentX - 50) < SNAP_THRESHOLD) {
      snappedX = 50
      snappedH = true
    }
    
    // Snap to vertical center (50%)
    if (Math.abs(percentY - 50) < SNAP_THRESHOLD) {
      snappedY = 50
      snappedV = true
    }
    
    // Round to 2 decimal places to avoid floating point precision issues
    return { 
      x: Math.round(snappedX * 100) / 100, 
      y: Math.round(snappedY * 100) / 100, 
      snappedH, 
      snappedV 
    }
  }, [])

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return
    
    const dims = calculateDimensions()
    if (dims.width === 0 || dims.height === 0) return
    
    setDimensions(dims)
    
    // Create grid pattern for editor background
    const gridSize = 20
    const gridColor = '#e5e7eb'
    const gridColorLight = '#f3f4f6'
    
    // Create an offscreen canvas for the grid pattern
    const patternCanvas = document.createElement('canvas')
    patternCanvas.width = gridSize * 2
    patternCanvas.height = gridSize * 2
    const patternCtx = patternCanvas.getContext('2d')
    
    if (patternCtx) {
      // Light background
      patternCtx.fillStyle = '#fafafa'
      patternCtx.fillRect(0, 0, gridSize * 2, gridSize * 2)
      
      // Draw checkerboard pattern (like Photoshop transparency)
      patternCtx.fillStyle = gridColorLight
      patternCtx.fillRect(0, 0, gridSize, gridSize)
      patternCtx.fillRect(gridSize, gridSize, gridSize, gridSize)
    }
    
    // Create Fabric canvas with proper configuration
    const fabricCanvas = new Canvas(canvasRef.current, {
      width: dims.width,
      height: dims.height,
      selection: false,
      preserveObjectStacking: true,
      renderOnAddRemove: true,
    })
    
    // Set the grid pattern as background
    const pattern = new Pattern({
      source: patternCanvas,
      repeat: 'repeat',
    })
    fabricCanvas.backgroundColor = pattern
    
    fabricRef.current = fabricCanvas

    // Create waveform bounds indicator (draggable rectangle)
    // Start invisible until mockup bounds are ready
    const boundsRect = new Rect({
      fill: 'transparent', // No overlay - just the border
      stroke: '#3b82f6',
      strokeWidth: 2,
      strokeDashArray: [8, 4],
      originX: 'center',
      originY: 'center',
      hasControls: true,
      hasBorders: true,
      lockRotation: true,
      lockScalingFlip: true,
      lockUniScaling: true, // Force proportional scaling from ALL handles
      cornerColor: '#3b82f6',
      cornerStyle: 'circle',
      cornerSize: 12,
      transparentCorners: false,
      borderColor: '#3b82f6',
      padding: 0,
      selectable: true,
      evented: true,
      // Set initial position at center, but start invisible
      left: dims.width / 2,
      top: dims.height / 2,
      width: 200,
      height: 100,
      visible: false, // Hidden until mockup bounds are calculated
      opacity: 0,
    })
    
    waveformBoundsRef.current = boundsRect
    fabricCanvas.add(boundsRect)
    fabricCanvas.setActiveObject(boundsRect)
    
    // Handle drag - pure 60fps, no store updates during drag
    boundsRect.on('moving', () => {
      isUserInteracting.current = true
      setIsDragging(true)
      
      const bounds = mockupBoundsRef.current
      if (bounds.width > 0 && bounds.height > 0) {
        const centerX = boundsRect.left || 0
        const centerY = boundsRect.top || 0
        const relativeX = centerX - bounds.left
        const relativeY = centerY - bounds.top
        const percentX = Math.max(0, Math.min(100, (relativeX / bounds.width) * 100))
        const percentY = Math.max(0, Math.min(100, (relativeY / bounds.height) * 100))
        
        // Apply snapping visually
        const snapped = snapToCenter(percentX, percentY)
        setSnapIndicator({ horizontal: snapped.snappedH, vertical: snapped.snappedV })
        
        // If snapped, update the visual position only
        if (snapped.snappedH || snapped.snappedV) {
          const newPos = storeToCanvasPosition(snapped.x, snapped.y)
          boundsRect.set({
            left: snapped.snappedH ? newPos.x : centerX,
            top: snapped.snappedV ? newPos.y : centerY,
          })
        }
      }
    })
    
    // Handle scaling start - store initial size
    boundsRect.on('scaling', () => {
      isUserInteracting.current = true
      setIsDragging(true)
      if (!initialBoundsSize.current) {
        initialBoundsSize.current = {
          width: boundsRect.width || 200,
          height: boundsRect.height || 100,
        }
      }
    })
    
    // Handle drag/scale end - NOW update the store
    boundsRect.on('modified', () => {
      const bounds = mockupBoundsRef.current
      if (bounds.width === 0 || bounds.height === 0) {
        isUserInteracting.current = false
        setIsDragging(false)
        setSnapIndicator({ horizontal: false, vertical: false })
        return
      }
      
      // Get final position
      const centerX = boundsRect.left || 0
      const centerY = boundsRect.top || 0
      
      // Convert to store percentage
      const relativeX = centerX - bounds.left
      const relativeY = centerY - bounds.top
      const percentX = Math.max(0, Math.min(100, (relativeX / bounds.width) * 100))
      const percentY = Math.max(0, Math.min(100, (relativeY / bounds.height) * 100))
      
      // Apply snapping
      const snapped = snapToCenter(percentX, percentY)
      setWaveformPosition(snapped.x, snapped.y)
      
      // Handle resize - only if user actually scaled (scale != 1)
      const currentScaleX = boundsRect.scaleX || 1
      const currentScaleY = boundsRect.scaleY || 1
      const wasScaled = Math.abs(currentScaleX - 1) > 0.01 || Math.abs(currentScaleY - 1) > 0.01
      
      if (wasScaled && boundsInitialized.current) {
        const scaledWidth = (boundsRect.width || 200) * currentScaleX
        const scaledHeight = (boundsRect.height || 100) * currentScaleY
        
        // Reverse calculate waveformSize from scaled width
        const newSize = Math.max(10, Math.min(200, (scaledWidth / (bounds.width * 0.75)) * 100))
        
        // Only update size if it changed significantly
        if (Math.abs(newSize - waveformSize) > 2) {
          setWaveformSize(newSize)
        }
        
        // Reset the scale and apply as width/height
        boundsRect.set({
          scaleX: 1,
          scaleY: 1,
          width: scaledWidth,
          height: scaledHeight,
        })
        boundsRect.setCoords()
      }
      
      initialBoundsSize.current = null
      isUserInteracting.current = false
      setIsDragging(false)
      setSnapIndicator({ horizontal: false, vertical: false })
      
      // Force background refresh by invalidating the hash
      lastCanvasHashRef.current = 0
      lastCanvasData.current = ''
      
      fabricCanvas.renderAll()
    })
    
    // Also handle mouse up on canvas level as fallback
    fabricCanvas.on('mouse:up', () => {
      setTimeout(() => {
        if (isUserInteracting.current) {
          isUserInteracting.current = false
          setIsDragging(false)
          // Force background refresh
          lastCanvasHashRef.current = 0
          lastCanvasData.current = ''
        }
      }, 100)
    })
    
    fabricCanvas.renderAll()
    setIsInitialized(true)
    
    return () => {
      fabricCanvas.dispose()
      fabricRef.current = null
      waveformBoundsRef.current = null
      backgroundImageRef.current = null
      setIsInitialized(false)
    }
  }, [calculateDimensions, setWaveformPosition, setWaveformSize, waveformSize])

  // Fast hash function for canvas dirty detection
  const getCanvasHash = (canvas: HTMLCanvasElement): number => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return 0
    // Sample a small region of pixels for fast comparison
    try {
      const data = ctx.getImageData(
        Math.floor(canvas.width / 4), 
        Math.floor(canvas.height / 4), 
        8, 8
      ).data
      // Simple hash from sampled pixels
      let hash = 0
      for (let i = 0; i < data.length; i += 16) {
        hash = ((hash << 5) - hash + data[i]) | 0
      }
      return hash
    } catch {
      return 0
    }
  }

  // Update background image from source canvas (continuous render loop)
  useEffect(() => {
    if (!isInitialized) return
    
    let isActive = true
    let frameCount = 0
    
    const updateBackground = async () => {
      if (!isActive) return
      
      // Skip completely during drag for smooth 60fps
      if (isUserInteracting.current) {
        animationFrameRef.current = requestAnimationFrame(updateBackground)
        return
      }
      
      // Throttle to every 5th frame when idle
      frameCount++
      if (frameCount % 5 !== 0) {
        animationFrameRef.current = requestAnimationFrame(updateBackground)
        return
      }
      
      const fabricCanvas = fabricRef.current
      const sourceCanvas = mockupRef.current?.canvas
      
      if (!fabricCanvas || !sourceCanvas || sourceCanvas.width === 0) {
        animationFrameRef.current = requestAnimationFrame(updateBackground)
        return
      }
      
      // Fast hash comparison to detect changes without expensive toDataURL
      const currentHash = getCanvasHash(sourceCanvas)
      if (currentHash === lastCanvasHashRef.current) {
        animationFrameRef.current = requestAnimationFrame(updateBackground)
        return
      }
      lastCanvasHashRef.current = currentHash
      
      // Get current canvas data
      const dataUrl = sourceCanvas.toDataURL('image/jpeg', 0.7)
      
      // Only update if changed (secondary check for edge cases)
      if (dataUrl !== lastCanvasData.current) {
        lastCanvasData.current = dataUrl
        
        try {
          const img = await FabricImage.fromURL(dataUrl)
          
          if (!isActive || !fabricCanvas.width || !fabricCanvas.height) return
          
          // Calculate scale to fit (maintain aspect ratio) with minimal padding
          const padding = 12 // minimal padding around the mockup
          const availableWidth = fabricCanvas.width - (padding * 2)
          const availableHeight = fabricCanvas.height - (padding * 2)
          
          const scale = Math.min(
            availableWidth / sourceCanvas.width,
            availableHeight / sourceCanvas.height
          )
          
          const scaledWidth = sourceCanvas.width * scale
          const scaledHeight = sourceCanvas.height * scale
          
          // Center the mockup in the canvas
          const offsetX = (fabricCanvas.width - scaledWidth) / 2
          const offsetY = (fabricCanvas.height - scaledHeight) / 2
          
          // Store the mockup bounds for position conversion
          const newBounds = {
            left: offsetX,
            top: offsetY,
            width: scaledWidth,
            height: scaledHeight,
          }
          
          // Check if bounds changed significantly (for triggering waveform resize)
          const boundsChanged = Math.abs(mockupBoundsRef.current.width - scaledWidth) > 5 ||
                               Math.abs(mockupBoundsRef.current.height - scaledHeight) > 5
          
          mockupBoundsRef.current = newBounds
          
          // Signal that mockup is ready for waveform bounds calculation
          if (!boundsInitialized.current || boundsChanged) {
            setMockupReady(prev => !prev) // Toggle to trigger effect
          }
          
          img.set({
            scaleX: scale,
            scaleY: scale,
            left: offsetX,
            top: offsetY,
            originX: 'left',
            originY: 'top',
            selectable: false,
            evented: false,
          })
          
          // Add shadow to make the mockup stand out
          img.set({
            shadow: {
              color: 'rgba(0,0,0,0.15)',
              blur: 20,
              offsetX: 0,
              offsetY: 4,
            }
          })
          
          // Store old background for removal AFTER new one is added (prevents flash)
          const oldBackground = backgroundImageRef.current
          
          // Add new background first
          backgroundImageRef.current = img
          fabricCanvas.add(img)
          fabricCanvas.sendObjectToBack(img)
          
          // Now remove old background (no flash since new one is already visible)
          if (oldBackground) {
            fabricCanvas.remove(oldBackground)
          }
          
          fabricCanvas.requestRenderAll()
        } catch (err) {
          console.warn('Failed to load background image:', err)
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(updateBackground)
    }
    
    updateBackground()
    
    return () => {
      isActive = false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [mockupRef, isInitialized])

  // Update waveform bounds position and size from store (also triggered when mockup ready)
  useEffect(() => {
    const fabricCanvas = fabricRef.current
    const boundsRect = waveformBoundsRef.current
    
    if (!fabricCanvas || !boundsRect || !fabricCanvas.width || !fabricCanvas.height) return
    if (isUserInteracting.current) return // Don't update while user is dragging/resizing
    
    const bounds = mockupBoundsRef.current
    if (bounds.width === 0 || bounds.height === 0) return
    
    // Calculate waveform bounds based on store values
    const waveformWidth = bounds.width * 0.75 * (waveformSize / 100)
    const waveformHeight = bounds.height * 0.65 * (waveformSize / 100)
    
    // Convert store percentage to canvas position
    const { x: centerX, y: centerY } = storeToCanvasPosition(waveformX, waveformY)
    
    // Update bounds rect
    boundsRect.set({
      left: centerX,
      top: centerY,
      width: Math.max(50, waveformWidth),
      height: Math.max(30, waveformHeight),
      scaleX: 1,
      scaleY: 1,
      visible: true, // Show bounds now that they're properly sized
      opacity: 1,
    })
    
    boundsRect.setCoords()
    boundsInitialized.current = true // Mark as properly initialized
    fabricCanvas.setActiveObject(boundsRect)
    fabricCanvas.requestRenderAll()
  }, [waveformX, waveformY, waveformSize, waveformHeightMultiplier, dimensions, isInitialized, mockupReady, storeToCanvasPosition])

  // Manage text elements as draggable Fabric.js objects
  useEffect(() => {
    const fabricCanvas = fabricRef.current
    if (!fabricCanvas || !isInitialized) return
    
    const bounds = mockupBoundsRef.current
    if (bounds.width === 0 || bounds.height === 0) return
    
    // Cancellation flag for async operations
    let isCancelled = false
    
    // Calculate scale factor: display size / print size
    const scaleFactor = bounds.width / PRINT_CANVAS_WIDTH
    
    // Track which elements exist in the store
    const storeElementIds = new Set(textElements.map(el => el.id))
    
    // Remove text objects that are no longer in store
    textObjectsRef.current.forEach((textObj, id) => {
      if (!storeElementIds.has(id)) {
        fabricCanvas.remove(textObj)
        textObjectsRef.current.delete(id)
      }
    })
    
    // Process text elements (async to handle font loading)
    const processTextElements = async () => {
      // Load all unique fonts first
      const uniqueFonts = new Set(textElements.map(el => el.fontFamily || 'Inter'))
      await Promise.all([...uniqueFonts].map(font => ensureFontLoaded(font)))
      
      // Check if cancelled after async operation
      if (isCancelled) return
      
      // Create or update text objects for each element
      for (const element of textElements) {
        // Check cancellation inside loop
        if (isCancelled) return
        
        // Check if already exists in ref (might have been added by another run)
        let textObj = textObjectsRef.current.get(element.id)
        
        // Scale font size from print resolution to display resolution
        const displayFontSize = Math.round((element.fontSize || 80) * scaleFactor)
      
        if (!textObj) {
        // Create new text object
        textObj = new FabricText(element.text || 'Text', {
          originX: 'center',
          originY: 'center',
          fontSize: displayFontSize,
          fontFamily: element.fontFamily || 'Inter',
          fill: element.color || '#ffffff',
          hasControls: true,
          hasBorders: true,
          lockRotation: false,
          lockScalingFlip: true,
          transparentCorners: false,
          cornerColor: '#3b82f6',
          cornerStrokeColor: '#ffffff',
          cornerSize: 10,
          borderColor: '#3b82f6',
          borderScaleFactor: 2,
          padding: 5,
          selectable: true,
          evented: true,
          visible: element.visible !== false,
        })
        
        // Position based on store percentages
        const canvasX = bounds.left + (element.x / 100) * bounds.width
        const canvasY = bounds.top + (element.y / 100) * bounds.height
        textObj.set({ left: canvasX, top: canvasY })
        
        // Handle selection - support multi-select with Shift key
        textObj.on('selected', () => {
          if (isShiftPressed.current) {
            toggleTextElementSelection(element.id)
          } else {
            selectTextElement(element.id)
          }
        })
        
        // Track when dragging starts
        textObj.on('mousedown', () => {
          draggingTextIds.current.add(element.id)
        })
        
        // Handle dragging with snapping
        let lastTextUpdate = 0
        textObj.on('moving', () => {
          draggingTextIds.current.add(element.id) // Ensure tracked
          const now = performance.now()
          if (now - lastTextUpdate < 16.67) return // Throttle to 60fps
          lastTextUpdate = now
          
          const currentLeft = textObj!.left ?? 0
          const currentTop = textObj!.top ?? 0
          
          // Convert to percentage
          let percentX = ((currentLeft - bounds.left) / bounds.width) * 100
          let percentY = ((currentTop - bounds.top) / bounds.height) * 100
          
          // Apply snapping
          const snapped = snapToCenter(percentX, percentY)
          
          if (snapped.x !== percentX || snapped.y !== percentY) {
            // Update position to snapped value
            const snappedCanvasX = bounds.left + (snapped.x / 100) * bounds.width
            const snappedCanvasY = bounds.top + (snapped.y / 100) * bounds.height
            textObj!.set({ left: snappedCanvasX, top: snappedCanvasY })
          }
          
          // Update snap indicators
          setSnapIndicator({
            horizontal: snapped.snappedV,
            vertical: snapped.snappedH
          })
          
          // Don't update store during drag - only on modified
        })
        
        textObj.on('modified', () => {
          // Clear drag tracking
          draggingTextIds.current.delete(element.id)
          
          // Clear snap indicators
          setSnapIndicator({ horizontal: false, vertical: false })
          
          const currentLeft = textObj!.left ?? 0
          const currentTop = textObj!.top ?? 0
          const scale = textObj!.scaleX ?? 1
          
          // Convert to percentage
          let percentX = ((currentLeft - bounds.left) / bounds.width) * 100
          let percentY = ((currentTop - bounds.top) / bounds.height) * 100
          
          // Apply final snapping
          const snapped = snapToCenter(percentX, percentY)
          
          // Calculate new font size at print resolution based on scale
          const newFontSize = Math.round((element.fontSize || 80) * scale)
          
          // Update store with final values
          updateTextElement(element.id, { 
            x: snapped.x, 
            y: snapped.y,
            fontSize: Math.max(16, Math.min(400, newFontSize))
          })
          
          // Reset scale
          textObj!.set({ scaleX: 1, scaleY: 1 })
          textObj!.setCoords()
        })
        
        // Double-check we haven't been cancelled or object hasn't been added by another run
        if (isCancelled) return
        if (!textObjectsRef.current.has(element.id)) {
          fabricCanvas.add(textObj)
          textObjectsRef.current.set(element.id, textObj)
        }
      } else {
        // Update existing text object if not being dragged
        if (!draggingTextIds.current.has(element.id)) {
          textObj.set({
            text: element.text || 'Text',
            fontSize: displayFontSize,
            fontFamily: element.fontFamily || 'Inter',
            fill: element.color || '#ffffff',
            visible: element.visible !== false,
          })
          
          // Update position
          const canvasX = bounds.left + (element.x / 100) * bounds.width
          const canvasY = bounds.top + (element.y / 100) * bounds.height
          textObj.set({ left: canvasX, top: canvasY })
          textObj.setCoords()
        }
      }
    }
      
      // Check cancellation before final render
      if (isCancelled) return
      
      // Bring waveform bounds to front so it's always selectable
      const boundsRect = waveformBoundsRef.current
      if (boundsRect) {
        fabricCanvas.bringObjectToFront(boundsRect)
      }
      
      fabricCanvas.requestRenderAll()
    }
    
    processTextElements()
    
    // Cleanup: cancel async operations
    return () => {
      isCancelled = true
    }
  }, [isInitialized, dimensions, snapToCenter, textElements, updateTextElement, selectTextElement])

  // Manage main text as a draggable Fabric.js object
  useEffect(() => {
    const fabricCanvas = fabricRef.current
    if (!fabricCanvas || !isInitialized) return
    
    const bounds = mockupBoundsRef.current
    if (bounds.width === 0 || bounds.height === 0) return
    
    // Calculate scale factor: display size / print size
    const scaleFactor = bounds.width / PRINT_CANVAS_WIDTH
    
    // Remove main text if showText is disabled
    if (!showText || !customText) {
      if (mainTextObjectRef.current) {
        fabricCanvas.remove(mainTextObjectRef.current)
        mainTextObjectRef.current = null
        fabricCanvas.renderAll()
      }
      return
    }
    
    // Scale font size from print resolution to display resolution
    const displayFontSize = Math.round((fontSize || 120) * scaleFactor)
    
    // Process main text (async to handle font loading)
    const processMainText = async () => {
      // Load font first
      await ensureFontLoaded(fontFamily || 'Inter')
      
      let textObj = mainTextObjectRef.current
      
      if (!textObj) {
        // Create new main text object
        textObj = new FabricText(customText, {
          originX: 'center',
          originY: 'center',
          fontSize: displayFontSize,
          fontFamily: fontFamily || 'Inter',
          fill: textColor || '#ffffff',
          hasControls: true,
          hasBorders: true,
          lockRotation: false,
          lockScalingFlip: true,
          transparentCorners: false,
          cornerColor: '#10b981', // Green for main text to distinguish from additional text
          cornerStrokeColor: '#ffffff',
          cornerSize: 10,
          borderColor: '#10b981',
          borderScaleFactor: 2,
          padding: 5,
          selectable: true,
        evented: true,
      })
      
      // Position based on store percentages
      const canvasX = bounds.left + (textX / 100) * bounds.width
      const canvasY = bounds.top + (textY / 100) * bounds.height
      textObj.set({ left: canvasX, top: canvasY })
      
      // Handle dragging with snapping
      let lastTextUpdate = 0
      textObj.on('moving', () => {
        const now = performance.now()
        if (now - lastTextUpdate < 16.67) return // Throttle to 60fps
        lastTextUpdate = now
        
        const currentLeft = textObj!.left ?? 0
        const currentTop = textObj!.top ?? 0
        
        // Convert to percentage
        let percentX = ((currentLeft - bounds.left) / bounds.width) * 100
        let percentY = ((currentTop - bounds.top) / bounds.height) * 100
        
        // Apply snapping
        const snapped = snapToCenter(percentX, percentY)
        
        if (snapped.x !== percentX || snapped.y !== percentY) {
          // Update position to snapped value
          const snappedCanvasX = bounds.left + (snapped.x / 100) * bounds.width
          const snappedCanvasY = bounds.top + (snapped.y / 100) * bounds.height
          textObj!.set({ left: snappedCanvasX, top: snappedCanvasY })
        }
        
        // Update snap indicators
        setSnapIndicator({
          horizontal: snapped.snappedV,
          vertical: snapped.snappedH
        })
        
        // Update store
        setTextX(snapped.x)
        setTextY(snapped.y)
      })
      
      textObj.on('modified', () => {
        // Clear snap indicators
        setSnapIndicator({ horizontal: false, vertical: false })
        
        const currentLeft = textObj!.left ?? 0
        const currentTop = textObj!.top ?? 0
        const scale = textObj!.scaleX ?? 1
        
        // Convert to percentage
        let percentX = ((currentLeft - bounds.left) / bounds.width) * 100
        let percentY = ((currentTop - bounds.top) / bounds.height) * 100
        
        // Apply final snapping
        const snapped = snapToCenter(percentX, percentY)
        
        // Calculate new font size at print resolution based on scale
        const newFontSize = Math.round((fontSize || 120) * scale)
        
        // Update store with final values
        setTextX(snapped.x)
        setTextY(snapped.y)
        setFontSize(Math.max(16, Math.min(400, newFontSize)))
        
        // Reset scale
        textObj!.set({ scaleX: 1, scaleY: 1 })
        textObj!.setCoords()
      })
      
      fabricCanvas.add(textObj)
      mainTextObjectRef.current = textObj
    } else {
      // Update existing main text object if not being interacted with
      if (!textObj.isMoving) {
        textObj.set({
          text: customText,
          fontSize: displayFontSize,
          fontFamily: fontFamily || 'Inter',
          fill: textColor || '#ffffff',
        })
        
        // Update position
        const canvasX = bounds.left + (textX / 100) * bounds.width
        const canvasY = bounds.top + (textY / 100) * bounds.height
        textObj.set({ left: canvasX, top: canvasY })
        textObj.setCoords()
      }
    }
    
    // Bring waveform bounds to front
    const boundsRect = waveformBoundsRef.current
    if (boundsRect) {
      fabricCanvas.bringObjectToFront(boundsRect)
    }
    
    fabricCanvas.requestRenderAll()
  }
    
  processMainText()
}, [isInitialized, dimensions, snapToCenter, showText, customText, textX, textY, fontSize, fontFamily, textColor, setTextX, setTextY, setFontSize])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const fabricCanvas = fabricRef.current
      if (!fabricCanvas) return
      
      const dims = calculateDimensions()
      if (dims.width === 0 || dims.height === 0) return
      
      setDimensions(dims)
      fabricCanvas.setDimensions(dims)
      
      // Clear background cache to force re-render
      lastCanvasData.current = ''
      
      fabricCanvas.requestRenderAll()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [calculateDimensions])

  // Handle keyboard events for deleting selected text elements, undo/redo, and deselect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Track Shift key for multi-select
      if (e.key === 'Shift') {
        isShiftPressed.current = true
      }
      
      // Don't handle if user is typing in an input field
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }
      
      // Undo: Ctrl/Cmd + Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
      
      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
        return
      }
      
      // Copy: Ctrl/Cmd + C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (selectedTextElementId || selectedTextElementIds.length > 0) {
          e.preventDefault()
          copySelectedTextElements()
        }
        return
      }
      
      // Paste: Ctrl/Cmd + V
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (clipboardTextElements.length > 0) {
          e.preventDefault()
          saveToHistory()
          pasteTextElements()
        }
        return
      }
      
      // Select All: Ctrl/Cmd + A
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        if (textElements.length > 0) {
          e.preventDefault()
          selectAllTextElements()
        }
        return
      }
      
      // Escape: Deselect text element
      if (e.key === 'Escape' && (selectedTextElementId || selectedTextElementIds.length > 0)) {
        e.preventDefault()
        clearTextSelection()
        // Also deselect in Fabric.js canvas
        const fabricCanvas = fabricRef.current
        if (fabricCanvas) {
          fabricCanvas.discardActiveObject()
          fabricCanvas.requestRenderAll()
        }
        return
      }
      
      // Delete/Backspace: Delete selected text element(s)
      if ((e.key === 'Delete' || e.key === 'Backspace') && (selectedTextElementId || selectedTextElementIds.length > 0)) {
        e.preventDefault()
        saveToHistory() // Save state before deleting
        deleteSelectedTextElements()
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      // Track Shift key release
      if (e.key === 'Shift') {
        isShiftPressed.current = false
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [selectedTextElementId, selectedTextElementIds, textElements, clipboardTextElements, removeTextElement, selectTextElement, clearTextSelection, copySelectedTextElements, pasteTextElements, selectAllTextElements, deleteSelectedTextElements, undo, redo, saveToHistory])

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden touch-none"
      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      {/* Snap indicators - visual guides when centered */}
      {snapIndicator.vertical && (
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-blue-500/70 pointer-events-none" />
      )}
      {snapIndicator.horizontal && (
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-500/70 pointer-events-none" />
      )}
      
      {/* Delete button - appears when text element is selected */}
      {(selectedTextElementId || selectedTextElementIds.length > 0) && (
        <div className="absolute top-4 left-4 pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => {
              saveToHistory()
              deleteSelectedTextElements()
            }}
            className="p-2 bg-red-500 hover:bg-red-600 rounded-lg shadow-lg text-white transition-colors flex items-center gap-1.5"
            title="Delete selected text (Delete/Backspace)"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-xs font-medium">Delete</span>
          </button>
          {/* Copy button */}
          <button
            onClick={copySelectedTextElements}
            className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg border border-gray-200 text-gray-700 hover:text-blue-600 transition-colors"
            title="Copy selected (Ctrl+C)"
          >
            <Copy className="w-4 h-4" />
          </button>
          {/* Show selected count/name */}
          <div className="bg-black/70 text-white text-xs px-2 py-1.5 rounded-lg">
            {selectedTextElementIds.length > 1 ? (
              `${selectedTextElementIds.length} items selected`
            ) : (
              <>
                Selected: {textElements.find(el => el.id === selectedTextElementId)?.text?.slice(0, 15) || 'Text'}
                {(textElements.find(el => el.id === selectedTextElementId)?.text?.length ?? 0) > 15 ? '...' : ''}
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Paste button - appears when clipboard has content */}
      {clipboardTextElements.length > 0 && !selectedTextElementId && selectedTextElementIds.length === 0 && (
        <div className="absolute top-4 left-4 pointer-events-auto">
          <button
            onClick={() => {
              saveToHistory()
              pasteTextElements()
            }}
            className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg shadow-lg text-white transition-colors flex items-center gap-1.5"
            title="Paste from clipboard (Ctrl+V)"
          >
            <Clipboard className="w-4 h-4" />
            <span className="text-xs font-medium">Paste ({clipboardTextElements.length})</span>
          </button>
        </div>
      )}
      
      {/* Undo/Redo Controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-auto">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-2 rounded-lg shadow-lg border transition-colors ${
            canUndo 
              ? 'bg-white/90 hover:bg-white border-gray-200 text-gray-700 hover:text-blue-600' 
              : 'bg-gray-100/50 border-gray-100 text-gray-300 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-2 rounded-lg shadow-lg border transition-colors ${
            canRedo 
              ? 'bg-white/90 hover:bg-white border-gray-200 text-gray-700 hover:text-blue-600' 
              : 'bg-gray-100/50 border-gray-100 text-gray-300 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>
      
      {/* Position Controls - persistent on canvas */}
      <div className="absolute top-4 right-4 flex flex-col items-center gap-1 pointer-events-auto" style={{ transform: `scale(${1/zoomLevel})`, transformOrigin: 'top right' }}>
        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-white/90 rounded-lg shadow-lg border border-gray-200 p-1 mb-1">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
            className={`p-1.5 rounded transition-colors ${zoomLevel <= 0.5 ? 'text-gray-300' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}`}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomReset}
            className="px-1.5 py-1 text-[10px] font-medium text-gray-500 hover:text-gray-900 transition-colors min-w-[40px]"
            title="Reset Zoom"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 2}
            className={`p-1.5 rounded transition-colors ${zoomLevel >= 2 ? 'text-gray-300' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}`}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        
        {/* Center button */}
        <button
          onClick={() => setWaveformPosition(50, 50)}
          className="p-2 bg-white/90 hover:bg-white rounded-lg shadow-lg border border-gray-200 text-gray-700 hover:text-rose-600 transition-colors"
          title="Center Waveform"
        >
          <Crosshair className="w-5 h-5" />
        </button>
        
        {/* Arrow controls */}
        <div className="flex flex-col items-center bg-white/90 rounded-lg shadow-lg border border-gray-200 p-1 mt-1">
          <button
            onClick={() => setWaveformPosition(waveformX, Math.max(0, waveformY - 2))}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900 transition-colors"
            title="Move Up"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <div className="flex items-center">
            <button
              onClick={() => setWaveformPosition(Math.max(0, waveformX - 2), waveformY)}
              className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900 transition-colors"
              title="Move Left"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="w-6 h-6 flex items-center justify-center text-[10px] text-gray-400 font-medium">
              {Math.round(waveformX)},{Math.round(waveformY)}
            </div>
            <button
              onClick={() => setWaveformPosition(Math.min(100, waveformX + 2), waveformY)}
              className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900 transition-colors"
              title="Move Right"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setWaveformPosition(waveformX, Math.min(100, waveformY + 2))}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-gray-900 transition-colors"
            title="Move Down"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Position indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full pointer-events-none flex items-center gap-2">
        {isDragging ? (
          <span className="text-blue-300">Dragging... release to apply</span>
        ) : selectedTextElementIds.length > 1 ? (
          <>
            <span className="text-blue-300">{selectedTextElementIds.length} items selected</span>
            <span className="text-white/50">|</span>
            <span className="text-white/50">Ctrl+C copy • Del delete • Esc deselect</span>
          </>
        ) : selectedTextElementId ? (
          <>
            <span className="text-blue-300">Text selected</span>
            <span className="text-white/50">|</span>
            <span className="text-white/50">Shift+click multi • Ctrl+C copy • Del delete</span>
          </>
        ) : clipboardTextElements.length > 0 ? (
          <>
            <span>Position: {Math.round(waveformX)}%, {Math.round(waveformY)}%</span>
            <span className="text-white/50">|</span>
            <span className="text-green-300">Ctrl+V to paste ({clipboardTextElements.length})</span>
          </>
        ) : (
          <>
            <span>Position: {Math.round(waveformX)}%, {Math.round(waveformY)}%</span>
            <span className="text-white/50">|</span>
            <span className="text-white/70">Size: {Math.round(waveformSize)}%</span>
          </>
        )}
      </div>
    </div>
  )
}
