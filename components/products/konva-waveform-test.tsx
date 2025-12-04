'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Stage, Layer, Rect, Group, Line, Transformer } from 'react-konva'
import Konva from 'konva'
import WaveSurfer from 'wavesurfer.js'

interface KonvaWaveformTestProps {
  audioUrl?: string
}

export function KonvaWaveformTest({ audioUrl }: KonvaWaveformTestProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const waveformGroupRef = useRef<Konva.Group>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const waveContainerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [position, setPosition] = useState({ x: 400, y: 300 })
  const [scale, setScale] = useState({ x: 1, y: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null)
  
  // Initialize WaveSurfer for audio decoding
  useEffect(() => {
    if (!waveContainerRef.current) return
    
    const ws = WaveSurfer.create({
      container: waveContainerRef.current,
      waveColor: '#3b82f6',
      progressColor: '#1d4ed8',
      height: 60,
      normalize: true,
      interact: false,
    })
    
    wavesurferRef.current = ws
    
    // Extract waveform data when audio is decoded
    ws.on('decode', () => {
      const peaks = ws.getDecodedData()?.getChannelData(0)
      if (peaks) {
        // Downsample to ~150 bars
        const numBars = 150
        const samplesPerBar = Math.floor(peaks.length / numBars)
        const data: number[] = []
        
        for (let i = 0; i < numBars; i++) {
          let sum = 0
          for (let j = 0; j < samplesPerBar; j++) {
            sum += Math.abs(peaks[i * samplesPerBar + j] || 0)
          }
          const avg = sum / samplesPerBar
          // Normalize to 0-1 range with some boost
          data.push(Math.min(1, avg * 3))
        }
        
        setWaveformData(data)
        setIsLoading(false)
      }
    })
    
    return () => {
      ws.destroy()
    }
  }, [])
  
  // Load audio when URL changes
  useEffect(() => {
    const urlToLoad = audioUrl || localAudioUrl
    if (urlToLoad && wavesurferRef.current) {
      setIsLoading(true)
      wavesurferRef.current.load(urlToLoad)
    }
  }, [audioUrl, localAudioUrl])
  
  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setLocalAudioUrl(url)
    }
  }, [])
  
  // Generate fake waveform data for testing (only if no audio loaded)
  useEffect(() => {
    if (waveformData.length > 0) return // Don't override real data
    
    const bars = 150
    const data: number[] = []
    for (let i = 0; i < bars; i++) {
      // Create a realistic-looking waveform pattern
      const base = Math.sin(i / 10) * 0.3 + 0.5
      const noise = Math.random() * 0.4
      data.push(Math.max(0.1, Math.min(1, base + noise)))
    }
    setWaveformData(data)
  }, [waveformData.length])
  
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
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  
  // Attach transformer to waveform group
  useEffect(() => {
    if (transformerRef.current && waveformGroupRef.current) {
      transformerRef.current.nodes([waveformGroupRef.current])
      transformerRef.current.getLayer()?.batchDraw()
    }
  }, [waveformData]) // Re-attach when waveform is ready
  
  // Waveform dimensions
  const waveformWidth = 400
  const waveformHeight = 200
  const barWidth = 3
  const barGap = 1
  
  // Handle drag
  const handleDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])
  
  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    setIsDragging(false)
    const node = e.target
    setPosition({ x: node.x(), y: node.y() })
  }, [])
  
  const handleDragMove = useCallback(() => {
    // Position updates happen automatically via Konva
  }, [])
  
  // Handle transform (resize)
  const handleTransformStart = useCallback(() => {
    setIsResizing(true)
  }, [])
  
  const handleTransformEnd = useCallback((e: Konva.KonvaEventObject<Event>) => {
    setIsResizing(false)
    const node = waveformGroupRef.current
    if (node) {
      setScale({ x: node.scaleX(), y: node.scaleY() })
      setPosition({ x: node.x(), y: node.y() })
    }
  }, [])

  return (
    <div className="flex flex-col gap-4">
      {/* Hidden WaveSurfer container for audio decoding */}
      <div ref={waveContainerRef} className="h-[60px] bg-gray-800 rounded" />
      
      {/* Audio upload */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700">
          <span>Upload Audio</span>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
        {isLoading && <span className="text-yellow-500">Loading audio...</span>}
        {localAudioUrl && !isLoading && <span className="text-green-500">Audio loaded!</span>}
      </div>
      
      <div className="text-sm text-muted-foreground">
        <strong>Konva Waveform Test</strong> - Drag the waveform or use corner/edge handles to resize
        {isDragging && <span className="ml-2 text-blue-500">(Dragging...)</span>}
        {isResizing && <span className="ml-2 text-green-500">(Resizing...)</span>}
      </div>
      
      <div 
        ref={containerRef}
        className="w-full h-[500px] bg-gray-900 rounded-lg overflow-hidden"
      >
        <Stage width={dimensions.width} height={dimensions.height}>
          {/* Background Layer - Static */}
          <Layer>
            <Rect
              x={0}
              y={0}
              width={dimensions.width}
              height={dimensions.height}
              fill="#1a1a2e"
            />
            {/* Simulated product background */}
            <Rect
              x={dimensions.width / 2 - 250}
              y={dimensions.height / 2 - 300}
              width={500}
              height={600}
              fill="#16213e"
              cornerRadius={8}
              shadowColor="black"
              shadowBlur={20}
              shadowOpacity={0.3}
            />
          </Layer>
          
          {/* Waveform Layer - Draggable & Resizable */}
          <Layer>
            <Group
              ref={waveformGroupRef}
              x={position.x}
              y={position.y}
              scaleX={scale.x}
              scaleY={scale.y}
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragMove={handleDragMove}
              onTransformStart={handleTransformStart}
              onTransformEnd={handleTransformEnd}
            >
              {/* Waveform bounds - used for transformer sizing */}
              <Rect
                x={-waveformWidth / 2}
                y={-waveformHeight / 2}
                width={waveformWidth}
                height={waveformHeight}
                fill="transparent"
              />
              
              {/* Waveform bars */}
              {waveformData.map((amplitude, i) => {
                const barHeight = amplitude * waveformHeight
                const x = -waveformWidth / 2 + i * (barWidth + barGap)
                const y = -barHeight / 2
                
                return (
                  <Rect
                    key={i}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill="#3b82f6"
                    cornerRadius={1}
                  />
                )
              })}
            </Group>
            
            {/* Transformer for resize handles */}
            <Transformer
              ref={transformerRef}
              rotateEnabled={false}
              keepRatio={true}
              enabledAnchors={[
                'top-left', 'top-right', 'bottom-left', 'bottom-right',
                'middle-left', 'middle-right', 'top-center', 'bottom-center'
              ]}
              boundBoxFunc={(oldBox, newBox) => {
                // Limit minimum size
                if (newBox.width < 50 || newBox.height < 30) {
                  return oldBox
                }
                return newBox
              }}
              anchorSize={12}
              anchorCornerRadius={6}
              anchorFill="#3b82f6"
              anchorStroke="#ffffff"
              anchorStrokeWidth={2}
              borderStroke="#3b82f6"
              borderStrokeWidth={2}
              borderDash={[8, 4]}
            />
          </Layer>
          
          {/* UI Layer - Controls/indicators */}
          <Layer>
            {/* Center crosshair */}
            <Line
              points={[dimensions.width / 2, 0, dimensions.width / 2, dimensions.height]}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
            />
            <Line
              points={[0, dimensions.height / 2, dimensions.width, dimensions.height / 2]}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
            />
          </Layer>
        </Stage>
      </div>
      
      <div className="text-xs text-muted-foreground">
        Position: ({Math.round(position.x)}, {Math.round(position.y)}) | 
        Scale: ({scale.x.toFixed(2)}, {scale.y.toFixed(2)}) |
        Bars: {waveformData.length} | 
        Layer-based rendering: Waveform moves/resizes without re-rendering background
      </div>
    </div>
  )
}
