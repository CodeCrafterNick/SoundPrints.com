'use client'

import { useEffect, useRef, useState } from 'react'
import { useCustomizerStore } from '@/lib/stores/customizer-store'

interface InteractiveCanvasEditorProps {
  mockupRef: React.RefObject<{ canvas: HTMLCanvasElement | null }>
  selectedSize?: { width: number; height: number }
}

type DragMode = 'none' | 'waveform' | 'text' | 'resize-waveform'
type ResizeHandle = 'none' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w'

export function InteractiveCanvasEditor({ mockupRef, selectedSize }: InteractiveCanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  
  const [dragMode, setDragMode] = useState<DragMode>('none')
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>('none')
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialValues, setInitialValues] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 })
  
  // Store state
  const waveformSize = useCustomizerStore((state) => state.waveformSize)
  const waveformHeightMultiplier = useCustomizerStore((state) => state.waveformHeightMultiplier)
  const setWaveformSize = useCustomizerStore((state) => state.setWaveformSize)
  const setWaveformHeightMultiplier = useCustomizerStore((state) => state.setWaveformHeightMultiplier)
  const showText = useCustomizerStore((state) => state.showText)
  const textX = useCustomizerStore((state) => state.textX)
  const textY = useCustomizerStore((state) => state.textY)
  const setTextX = useCustomizerStore((state) => state.setTextX)
  const setTextY = useCustomizerStore((state) => state.setTextY)
  const fontSize = useCustomizerStore((state) => state.fontSize)
  const setFontSize = useCustomizerStore((state) => state.setFontSize)

  // Render the preview canvas
  useEffect(() => {
    const renderPreview = () => {
      if (!canvasRef.current || !mockupRef.current?.canvas) {
        animationFrameRef.current = requestAnimationFrame(renderPreview)
        return
      }

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const sourceCanvas = mockupRef.current.canvas
      
      if (!ctx || sourceCanvas.width === 0 || sourceCanvas.height === 0) {
        animationFrameRef.current = requestAnimationFrame(renderPreview)
        return
      }

      const container = canvas.parentElement
      if (container) {
        const dpr = window.devicePixelRatio || 1
        const rect = container.getBoundingClientRect()
        
        const targetAspectRatio = selectedSize 
          ? selectedSize.width / selectedSize.height 
          : sourceCanvas.width / sourceCanvas.height
        
        let displayWidth = rect.width
        let displayHeight = rect.width / targetAspectRatio
        
        if (displayHeight > rect.height) {
          displayHeight = rect.height
          displayWidth = rect.height * targetAspectRatio
        }
        
        canvas.width = displayWidth * dpr
        canvas.height = displayHeight * dpr
        canvas.style.width = `${displayWidth}px`
        canvas.style.height = `${displayHeight}px`
        
        // Update dimensions state to trigger overlay re-render
        if (canvasDimensions.width !== displayWidth || canvasDimensions.height !== displayHeight) {
          setCanvasDimensions({ width: displayWidth, height: displayHeight })
        }
        
        ctx.scale(dpr, dpr)
        
        const scale = Math.min(displayWidth / sourceCanvas.width, displayHeight / sourceCanvas.height)
        const x = (displayWidth - sourceCanvas.width * scale) / 2
        const y = (displayHeight - sourceCanvas.height * scale) / 2
        
        ctx.clearRect(0, 0, rect.width, rect.height)
        ctx.drawImage(sourceCanvas, x, y, sourceCanvas.width * scale, sourceCanvas.height * scale)
      }
      
      animationFrameRef.current = requestAnimationFrame(renderPreview)
    }

    renderPreview()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [mockupRef, selectedSize, canvasDimensions.width, canvasDimensions.height])

  const getCanvasScale = () => {
    if (!canvasRef.current || !mockupRef.current?.canvas) return 1
    const sourceCanvas = mockupRef.current.canvas
    const displayCanvas = canvasRef.current
    return displayCanvas.offsetWidth / sourceCanvas.width
  }

  const getWaveformBounds = () => {
    if (!mockupRef.current?.canvas) return null
    const canvas = mockupRef.current.canvas
    const scale = getCanvasScale()
    
    // Calculate approximate waveform bounds based on size settings
    const margin = Math.min(canvas.width, canvas.height) * 0.08
    const availableWidth = canvas.width - (margin * 2)
    const availableHeight = canvas.height - (margin * 2)
    
    const waveformWidth = availableWidth * (waveformSize / 100)
    const waveformHeight = availableHeight * 0.7 * (waveformSize / 100) * 2 * (waveformHeightMultiplier / 100)
    
    const x = (canvas.width - waveformWidth) / 2
    const y = (canvas.height - waveformHeight) / 2
    
    return {
      x: x * scale,
      y: y * scale,
      width: waveformWidth * scale,
      height: waveformHeight * scale
    }
  }

  const getTextBounds = () => {
    if (!showText || !mockupRef.current?.canvas) return null
    const canvas = mockupRef.current.canvas
    const scale = getCanvasScale()
    
    const x = (textX / 100) * canvas.width * scale
    const y = (textY / 100) * canvas.height * scale
    const size = fontSize * scale
    
    // Approximate text bounds (would need actual text measurement for precision)
    return {
      x: x - size * 3,
      y: y - size,
      width: size * 6,
      height: size * 2
    }
  }

  const isPointInBounds = (px: number, py: number, bounds: { x: number, y: number, width: number, height: number } | null) => {
    if (!bounds) return false
    return px >= bounds.x && px <= bounds.x + bounds.width &&
           py >= bounds.y && py <= bounds.y + bounds.height
  }

  const getResizeHandle = (px: number, py: number, bounds: { x: number, y: number, width: number, height: number }): ResizeHandle => {
    const handleSize = 12
    const { x, y, width, height } = bounds
    
    // Corner handles
    if (Math.abs(px - x) < handleSize && Math.abs(py - y) < handleSize) return 'nw'
    if (Math.abs(px - (x + width)) < handleSize && Math.abs(py - y) < handleSize) return 'ne'
    if (Math.abs(px - x) < handleSize && Math.abs(py - (y + height)) < handleSize) return 'sw'
    if (Math.abs(px - (x + width)) < handleSize && Math.abs(py - (y + height)) < handleSize) return 'se'
    
    // Edge handles
    if (Math.abs(px - x) < handleSize && py > y && py < y + height) return 'w'
    if (Math.abs(px - (x + width)) < handleSize && py > y && py < y + height) return 'e'
    if (Math.abs(py - y) < handleSize && px > x && px < x + width) return 'n'
    if (Math.abs(py - (y + height)) < handleSize && px > x && px < x + width) return 's'
    
    return 'none'
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const waveformBounds = getWaveformBounds()
    const textBounds = getTextBounds()
    
    // Check for waveform resize handles first
    if (waveformBounds) {
      const handle = getResizeHandle(x, y, waveformBounds)
      if (handle !== 'none') {
        setDragMode('resize-waveform')
        setResizeHandle(handle)
        setDragStart({ x, y })
        setInitialValues({ 
          x: 0, 
          y: 0, 
          width: waveformSize, 
          height: waveformHeightMultiplier 
        })
        return
      }
    }
    
    // Check for text drag
    if (textBounds && isPointInBounds(x, y, textBounds)) {
      setDragMode('text')
      setDragStart({ x, y })
      setInitialValues({ x: textX, y: textY, width: 0, height: 0 })
      return
    }
    
    // Check for waveform drag
    if (waveformBounds && isPointInBounds(x, y, waveformBounds)) {
      setDragMode('waveform')
      setDragStart({ x, y })
      // Note: waveform position is always centered, but we could add offset support
      return
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect || !mockupRef.current?.canvas) return
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    if (dragMode === 'none') {
      // Update cursor based on hover
      const waveformBounds = getWaveformBounds()
      const textBounds = getTextBounds()
      
      if (waveformBounds) {
        const handle = getResizeHandle(x, y, waveformBounds)
        if (handle !== 'none') {
          const cursors: Record<ResizeHandle, string> = {
            'none': 'default',
            'nw': 'nwse-resize',
            'ne': 'nesw-resize',
            'sw': 'nesw-resize',
            'se': 'nwse-resize',
            'n': 'ns-resize',
            's': 'ns-resize',
            'e': 'ew-resize',
            'w': 'ew-resize'
          }
          if (overlayRef.current) overlayRef.current.style.cursor = cursors[handle]
          return
        }
      }
      
      if (textBounds && isPointInBounds(x, y, textBounds)) {
        if (overlayRef.current) overlayRef.current.style.cursor = 'move'
        return
      }
      
      if (waveformBounds && isPointInBounds(x, y, waveformBounds)) {
        if (overlayRef.current) overlayRef.current.style.cursor = 'grab'
        return
      }
      
      if (overlayRef.current) overlayRef.current.style.cursor = 'default'
      return
    }
    
    const dx = x - dragStart.x
    const dy = y - dragStart.y
    const canvas = mockupRef.current.canvas
    const scale = getCanvasScale()
    
    if (dragMode === 'text') {
      const newX = initialValues.x + (dx / scale / canvas.width * 100)
      const newY = initialValues.y + (dy / scale / canvas.height * 100)
      setTextX(Math.max(0, Math.min(100, newX)))
      setTextY(Math.max(0, Math.min(100, newY)))
    } else if (dragMode === 'resize-waveform') {
      const handle = resizeHandle
      
      // Calculate size changes based on handle
      if (handle.includes('e') || handle.includes('w')) {
        const widthChange = (dx / scale / canvas.width * 100) * (handle.includes('w') ? -2 : 2)
        const newWidth = initialValues.width + widthChange
        setWaveformSize(Math.max(20, Math.min(200, newWidth)))
      }
      
      if (handle.includes('n') || handle.includes('s')) {
        const heightChange = (dy / scale / canvas.height * 100) * (handle.includes('n') ? -2 : 2)
        const newHeight = initialValues.height + heightChange
        setWaveformHeightMultiplier(Math.max(50, Math.min(200, newHeight)))
      }
    }
  }

  const handleMouseUp = () => {
    if (dragMode !== 'none' && overlayRef.current) {
      overlayRef.current.style.cursor = 'default'
    }
    setDragMode('none')
    setResizeHandle('none')
  }

  const renderOverlay = () => {
    // Don't render overlay until canvas is properly sized
    if (canvasDimensions.width === 0 || canvasDimensions.height === 0) {
      return null
    }
    
    const waveformBounds = getWaveformBounds()
    const textBounds = getTextBounds()
    
    // Fallback waveform bounds if calculation fails but canvas is ready
    const effectiveWaveformBounds = waveformBounds || {
      x: canvasDimensions.width * 0.1,
      y: canvasDimensions.height * 0.2,
      width: canvasDimensions.width * 0.8,
      height: canvasDimensions.height * 0.6
    }
    
    return (
      <>
        {/* Waveform bounds */}
        <div
          className="absolute border-2 border-blue-500 border-dashed pointer-events-none"
          style={{
            left: `${effectiveWaveformBounds.x}px`,
            top: `${effectiveWaveformBounds.y}px`,
            width: `${effectiveWaveformBounds.width}px`,
            height: `${effectiveWaveformBounds.height}px`,
          }}
        >
          {/* Resize handles */}
          {/* Corner handles */}
          <div className="absolute w-3 h-3 bg-blue-500 border border-white pointer-events-auto cursor-nwse-resize" style={{ top: '-6px', left: '-6px' }} />
          <div className="absolute w-3 h-3 bg-blue-500 border border-white pointer-events-auto cursor-nesw-resize" style={{ top: '-6px', right: '-6px' }} />
          <div className="absolute w-3 h-3 bg-blue-500 border border-white pointer-events-auto cursor-nesw-resize" style={{ bottom: '-6px', left: '-6px' }} />
          <div className="absolute w-3 h-3 bg-blue-500 border border-white pointer-events-auto cursor-nwse-resize" style={{ bottom: '-6px', right: '-6px' }} />
          {/* Edge handles */}
          <div className="absolute w-3 h-3 bg-blue-500 border border-white pointer-events-auto cursor-ns-resize" style={{ top: '-6px', left: '50%', transform: 'translateX(-50%)' }} />
          <div className="absolute w-3 h-3 bg-blue-500 border border-white pointer-events-auto cursor-ns-resize" style={{ bottom: '-6px', left: '50%', transform: 'translateX(-50%)' }} />
          <div className="absolute w-3 h-3 bg-blue-500 border border-white pointer-events-auto cursor-ew-resize" style={{ top: '50%', right: '-6px', transform: 'translateY(-50%)' }} />
          <div className="absolute w-3 h-3 bg-blue-500 border border-white pointer-events-auto cursor-ew-resize" style={{ top: '50%', left: '-6px', transform: 'translateY(-50%)' }} />
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap pointer-events-none">
            Waveform: {Math.round(waveformSize)}% × {Math.round(waveformHeightMultiplier)}%
          </div>
        </div>
        
        {/* Text bounds */}
        {textBounds && (
          <div
            className="absolute border-2 border-green-500 border-dashed pointer-events-none"
            style={{
              left: `${textBounds.x}px`,
              top: `${textBounds.y}px`,
              width: `${textBounds.width}px`,
              height: `${textBounds.height}px`,
            }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
              Text: {Math.round(textX)}%, {Math.round(textY)}%
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="w-full h-full rounded-lg overflow-visible relative bg-white">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div
        ref={overlayRef}
        className="absolute inset-0"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {renderOverlay()}
      </div>
    </div>
  )
}
