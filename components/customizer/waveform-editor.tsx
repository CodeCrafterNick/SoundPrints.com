'use client'

import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Play, Pause, X } from 'lucide-react'

export function WaveformEditor() {
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const regionsRef = useRef<RegionsPlugin | null>(null)
  
  const audioUrl = useCustomizerStore((state) => state.audioUrl)
  const audioDuration = useCustomizerStore((state) => state.audioDuration)
  const waveformColor = useCustomizerStore((state) => state.waveformColor)
  const selectedRegion = useCustomizerStore((state) => state.selectedRegion)
  const setAudioDuration = useCustomizerStore((state) => state.setAudioDuration)
  const setSelectedRegion = useCustomizerStore((state) => state.setSelectedRegion)
  
  const [sliderRange, setSliderRange] = useState<[number, number]>([0, 100])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, scrollLeft: 0 })

  useEffect(() => {
    if (!waveformRef.current || !audioUrl) {
      console.log('WaveformEditor: Skipping init', { hasRef: !!waveformRef.current, hasAudioUrl: !!audioUrl })
      return
    }

    // Skip if wavesurfer already initialized
    if (wavesurferRef.current) {
      console.log('WaveformEditor: Already initialized, skipping')
      return
    }

    console.log('WaveformEditor: Initializing...', { audioUrl })

    const regions = RegionsPlugin.create()
    regionsRef.current = regions

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#000000',
      progressColor: '#000000',
      cursorColor: '#000000',
      cursorWidth: 2,
      height: 200,
      barWidth: 3,
      barGap: 2,
      barRadius: 2,
      barHeight: 1,
      normalize: true,
      splitChannels: false,
      interact: false,
      renderFunction: (channels, ctx) => {
        const { width, height } = ctx.canvas
        const halfHeight = height / 2
        const channel = channels[0]

        ctx.clearRect(0, 0, width, height)
        
        // Draw center line
        ctx.fillStyle = 'rgba(128, 128, 128, 0.2)'
        ctx.fillRect(0, halfHeight - 0.5, width, 1)

        // Draw bars
        const barWidth = 3
        const barGap = 2
        const barStep = barWidth + barGap
        const barsCount = Math.floor(width / barStep)
        
        ctx.fillStyle = '#000000'

        for (let i = 0; i < barsCount; i++) {
          const x = i * barStep
          const dataIndex = Math.floor((i / barsCount) * channel.length)
          const amplitude = Math.abs(channel[dataIndex] || 0)
          const barHeight = Math.min(amplitude * halfHeight * 1.2, halfHeight) // Amplify by 20% but cap at half height

          // Draw bar above center
          ctx.fillRect(x, halfHeight - barHeight, barWidth, barHeight)
          // Draw bar below center (mirrored)
          ctx.fillRect(x, halfHeight, barWidth, barHeight)
        }
      },
      plugins: [regions],
    })

    wavesurferRef.current = wavesurfer

    console.log('WaveformEditor: Loading audio...', audioUrl)
    
    // Load audio with proper error handling
    try {
      wavesurfer.load(audioUrl)
    } catch (error) {
      console.error('WaveformEditor: Failed to load audio', error)
    }

    wavesurfer.on('ready', () => {
      console.log('WaveformEditor: Waveform ready!', wavesurfer.getDuration())
      console.log('WaveformEditor: Container children count:', waveformRef.current?.children.length)
      console.log('WaveformEditor: Container innerHTML length:', waveformRef.current?.innerHTML.length)
      console.log('WaveformEditor: WaveSurfer wrapper:', wavesurfer.getWrapper())
      const duration = wavesurfer.getDuration()
      setAudioDuration(duration)
      
      // Only reset if there's no existing selection in store
      const hasExistingSelection = selectedRegion && (selectedRegion.start > 0.01 || selectedRegion.end < duration - 0.01)
      
      if (!hasExistingSelection) {
        // Initialize with full duration
        setSliderRange([0, 100])
        setSelectedRegion({ start: 0, end: duration })
      } else {
        // Restore existing selection
        const newSliderStart = (selectedRegion.start / duration) * 100
        const newSliderEnd = (selectedRegion.end / duration) * 100
        setSliderRange([newSliderStart, newSliderEnd])
        
        // Create the region
        regionsRef.current?.addRegion({
          start: selectedRegion.start,
          end: selectedRegion.end,
          color: 'rgba(168, 85, 247, 0.15)',
          drag: true,
          resize: true,
        })
      }
      
      // Make regions interactive by adding pointer-events
      const regionElements = waveformRef.current?.querySelectorAll('.wavesurfer-region')
      regionElements?.forEach(el => {
        (el as HTMLElement).style.pointerEvents = 'auto'
      })
    })

    regions.on('region-created', (region) => {
      console.log('WaveformEditor: Region created', region.start, region.end)
      
      // Clear any other regions first (only allow one region)
      const allRegions = regionsRef.current?.getRegions() || []
      allRegions.forEach(r => {
        if (r !== region) {
          r.remove()
        }
      })
      
      // Enable pointer events on the new region element
      setTimeout(() => {
        const regionElements = waveformRef.current?.querySelectorAll('.wavesurfer-region')
        regionElements?.forEach(el => {
          (el as HTMLElement).style.pointerEvents = 'auto'
        })
      }, 0)
      
      const duration = wavesurfer.getDuration()
      const newStart = region.start
      const newEnd = region.end
      const newSliderStart = (newStart / duration) * 100
      const newSliderEnd = (newEnd / duration) * 100
      
      // Only update if values actually changed
      if (Math.abs(sliderRange[0] - newSliderStart) > 0.1 || Math.abs(sliderRange[1] - newSliderEnd) > 0.1) {
        setSelectedRegion({ start: newStart, end: newEnd })
        setSliderRange([newSliderStart, newSliderEnd])
      }
    })

    regions.on('region-updated', (region) => {
      console.log('WaveformEditor: Region updated', region.start, region.end)
      setIsResizing(true)
      const duration = wavesurfer.getDuration()
      const newStart = region.start
      const newEnd = region.end
      const newSliderStart = (newStart / duration) * 100
      const newSliderEnd = (newEnd / duration) * 100
      
      // Only update if values actually changed
      if (Math.abs(sliderRange[0] - newSliderStart) > 0.1 || Math.abs(sliderRange[1] - newSliderEnd) > 0.1) {
        setSelectedRegion({ start: newStart, end: newEnd })
        setSliderRange([newSliderStart, newSliderEnd])
      }
    })

    wavesurfer.on('play', () => {
      setIsPlaying(true)
      // Show cursor when playing
      if (wavesurferRef.current) {
        const wrapper = wavesurferRef.current.getWrapper()
        const cursor = wrapper.querySelector('.wavesurfer-cursor') as HTMLElement
        if (cursor) {
          cursor.style.borderRightColor = '#000000'
          cursor.style.borderRightWidth = '2px'
        }
      }
    })

    wavesurfer.on('pause', () => {
      setIsPlaying(false)
      // Hide cursor when paused
      if (wavesurferRef.current) {
        const wrapper = wavesurferRef.current.getWrapper()
        const cursor = wrapper.querySelector('.wavesurfer-cursor') as HTMLElement
        if (cursor) {
          cursor.style.borderRightColor = 'transparent'
        }
      }
    })

    wavesurfer.on('finish', () => {
      setIsPlaying(false)
      // Hide cursor when finished
      if (wavesurferRef.current) {
        const wrapper = wavesurferRef.current.getWrapper()
        const cursor = wrapper.querySelector('.wavesurfer-cursor') as HTMLElement
        if (cursor) {
          cursor.style.borderRightColor = 'transparent'
        }
      }
    })

    return () => {
      // Don't destroy on unmount - keep the instance alive
      // Only destroy when audioUrl actually changes
      console.log('WaveformEditor: Component unmounting')
    }
  }, [audioUrl, setAudioDuration, waveformColor, selectedRegion])

  // Separate cleanup effect for when audioUrl actually changes
  useEffect(() => {
    return () => {
      if (wavesurferRef.current) {
        console.log('WaveformEditor: Cleanup - destroying wavesurfer due to audioUrl change')
        wavesurferRef.current.destroy()
        wavesurferRef.current = null
        regionsRef.current = null
      }
    }
  }, [audioUrl])

  // Sync region from store when component mounts or selectedRegion changes
  useEffect(() => {
    if (!wavesurferRef.current || !regionsRef.current || !selectedRegion || audioDuration === 0) return
    
    // Check if there's already a region matching the store
    const existingRegions = regionsRef.current.getRegions()
    const hasMatchingRegion = existingRegions.some(r => 
      Math.abs(r.start - selectedRegion.start) < 0.01 && 
      Math.abs(r.end - selectedRegion.end) < 0.01
    )
    
    // Only create region if it doesn't exist and it's not the full duration
    if (!hasMatchingRegion && (selectedRegion.start > 0.01 || selectedRegion.end < audioDuration - 0.01)) {
      regionsRef.current.clearRegions()
      regionsRef.current.addRegion({
        start: selectedRegion.start,
        end: selectedRegion.end,
        color: 'rgba(168, 85, 247, 0.15)',
        drag: true,
        resize: true,
      })
      
      // Update slider to match
      const newSliderStart = (selectedRegion.start / audioDuration) * 100
      const newSliderEnd = (selectedRegion.end / audioDuration) * 100
      setSliderRange([newSliderStart, newSliderEnd])
    }
  }, [selectedRegion, audioDuration])

  // Handle slider changes
  const handleSliderChange = (value: number[]) => {
    const newSliderRange = value as [number, number]
    
    // Only update if values actually changed
    if (Math.abs(sliderRange[0] - newSliderRange[0]) < 0.1 && Math.abs(sliderRange[1] - newSliderRange[1]) < 0.1) {
      return
    }
    
    setSliderRange(newSliderRange)
    
    if (!wavesurferRef.current || !regionsRef.current || audioDuration === 0) return
    
    const startTime = (value[0] / 100) * audioDuration
    const endTime = (value[1] / 100) * audioDuration
    const duration = endTime - startTime
    
    setSelectedRegion({ start: startTime, end: endTime })
    
    // Calculate zoom level based on selected duration
    // More zoom for smaller selections
    const zoomLevel = Math.max(1, Math.floor(audioDuration / duration))
    wavesurferRef.current.zoom(zoomLevel)
    
    // Clear existing regions and create new one
    regionsRef.current.clearRegions()
    regionsRef.current.addRegion({
      start: startTime,
      end: endTime,
      color: 'rgba(168, 85, 247, 0.15)',
      drag: true,
      resize: true,
    })
  }

  const handlePlayPause = () => {
    if (!wavesurferRef.current) return
    
    if (isPlaying) {
      wavesurferRef.current.pause()
    } else {
      // If there's a selected region, play from the start of it
      // Otherwise play from current position
      if (selectedRegion) {
        wavesurferRef.current.setTime(selectedRegion.start)
      }
      wavesurferRef.current.play()
    }
  }

  const handleClearRange = () => {
    if (!wavesurferRef.current || !regionsRef.current) return
    
    // Pause playback
    wavesurferRef.current.pause()
    setIsPlaying(false)
    
    // Clear all regions
    regionsRef.current.clearRegions()
    
    // Reset to full duration in state
    setSliderRange([0, 100])
    setSelectedRegion({ start: 0, end: audioDuration })
    
    // Reset playhead to start
    wavesurferRef.current.setTime(0)
    
    // Reset zoom
    setZoomLevel(1)
    wavesurferRef.current.zoom(1)
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!wavesurferRef.current) return
    
    e.preventDefault()
    
    const wrapper = wavesurferRef.current.getWrapper()
    const rect = wrapper.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mousePercent = mouseX / rect.width
    
    // Calculate new zoom level
    const delta = e.deltaY > 0 ? -5 : 5 // Zoom out on scroll down, in on scroll up
    const newZoom = Math.max(1, Math.min(zoomLevel + delta, 200))
    
    setZoomLevel(newZoom)
    wavesurferRef.current.zoom(newZoom)
    
    // Scroll to keep the mouse position centered
    if (newZoom > 1) {
      setTimeout(() => {
        const wrapper = wavesurferRef.current!.getWrapper()
        const scrollableWidth = wrapper.scrollWidth - wrapper.clientWidth
        wrapper.scrollLeft = scrollableWidth * mousePercent
      }, 0)
    }
  }

  // Stop playback when it reaches the end of the selected region
  useEffect(() => {
    if (!wavesurferRef.current || !selectedRegion) return

    const checkPlaybackPosition = () => {
      if (!wavesurferRef.current || !isPlaying) return
      
      const currentTime = wavesurferRef.current.getCurrentTime()
      if (currentTime >= selectedRegion.end) {
        wavesurferRef.current.pause()
        wavesurferRef.current.setTime(selectedRegion.start)
      }
    }

    const interval = setInterval(checkPlaybackPosition, 50)
    return () => clearInterval(interval)
  }, [selectedRegion, isPlaying])

  // Custom drag selection handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveformRef.current || !wavesurferRef.current || !regionsRef.current) return
    
    const target = e.target as HTMLElement
    
    // Ignore clicks on buttons
    if (target.closest('button')) return
    
    // Check if we're clicking on region handles - if so, prevent default and let region resize
    const isHandle = target.classList.contains('wavesurfer-handle')
    
    if (isHandle) {
      setIsResizing(true)
      return
    }
    
    // Check if clicking inside an existing region to move it
    const isRegion = target.classList.contains('wavesurfer-region') || target.closest('.wavesurfer-region') !== null
    
    if (isRegion) {
      setIsResizing(true)
      return
    }
    
    // Left click only for selection and panning
    if (e.button !== 0) return
    
    // Start new selection (works at any zoom level)
    const wrapper = wavesurferRef.current.getWrapper()
    const rect = wrapper.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const scrollLeft = wrapper.scrollLeft
    const wrapperWidth = wrapper.scrollWidth
    
    // Calculate time from click position accounting for scroll
    const absoluteX = clickX + scrollLeft
    const time = (absoluteX / wrapperWidth) * audioDuration
    
    setIsDragging(true)
    setDragStart(time)
    setIsResizing(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't do custom drag if we're resizing a region
    if (isResizing) return
    
    if (!isDragging || dragStart === null || !wavesurferRef.current || !regionsRef.current) return
    
    const wrapper = wavesurferRef.current.getWrapper()
    const rect = wrapper.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const scrollLeft = wrapper.scrollLeft
    const wrapperWidth = wrapper.scrollWidth
    
    // Calculate time from mouse position accounting for scroll
    const absoluteX = mouseX + scrollLeft
    const time = Math.max(0, Math.min((absoluteX / wrapperWidth) * audioDuration, audioDuration))
    
    const start = Math.min(dragStart, time)
    const end = Math.max(dragStart, time)
    
    // Only create region if there's a meaningful selection
    if (Math.abs(end - start) < 0.01) return
    
    // Update region
    const existingRegions = regionsRef.current.getRegions()
    
    // Only clear if we have more than one region or if we're creating a new one
    if (existingRegions.length > 0) {
      regionsRef.current.clearRegions()
    }
    
    const region = regionsRef.current.addRegion({
      start,
      end,
      color: 'rgba(168, 85, 247, 0.15)',
      drag: true,
      resize: true,
    })
    
    // Make sure the region is interactive
    setTimeout(() => {
      const regionElements = waveformRef.current?.querySelectorAll('.wavesurfer-region')
      regionElements?.forEach(el => {
        (el as HTMLElement).style.pointerEvents = 'auto'
      })
    }, 0)
    
    const newSliderStart = (start / audioDuration) * 100
    const newSliderEnd = (end / audioDuration) * 100
    setSliderRange([newSliderStart, newSliderEnd])
    setSelectedRegion({ start, end })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragStart(null)
    setIsResizing(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!audioUrl) {
    return (
      <div className="w-full h-32 flex items-center justify-center border rounded-lg bg-muted/20">
        <p className="text-muted-foreground text-sm">
          Upload an audio file to see the waveform
        </p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <div 
        className="relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          ref={waveformRef} 
          className="w-full rounded-lg border bg-white select-none overflow-hidden" 
          style={{ 
            height: '200px',
            cursor: isPanning ? 'grabbing' : isDragging ? 'crosshair' : zoomLevel > 1 ? 'grab' : 'default'
          }}
          onWheel={handleWheel}
        />
        <Button
          onClick={handlePlayPause}
          size="sm"
          variant="secondary"
          className="absolute bottom-2 right-2 z-10 pointer-events-auto"
          disabled={!audioUrl}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        {(regionsRef.current?.getRegions().length > 0 || zoomLevel > 1) && (
          <Button
            onClick={handleClearRange}
            size="sm"
            variant="outline"
            className="absolute bottom-2 right-14 z-10 pointer-events-auto"
            disabled={!audioUrl}
            title="Clear selection and reset zoom"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Start: {formatTime((sliderRange[0] / 100) * audioDuration)}</span>
          <span>End: {formatTime((sliderRange[1] / 100) * audioDuration)}</span>
        </div>
        <Slider
          value={sliderRange}
          onValueChange={handleSliderChange}
          min={0}
          max={100}
          step={0.1}
          minStepsBetweenThumbs={1}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground text-center">
          Drag on the waveform to select a range. {zoomLevel > 1 ? 'Drag empty space to pan.' : 'Scroll to zoom in.'}
        </p>
      </div>
    </div>
  )
}
        <p className="text-xs text-muted-foreground text-center">
          Drag on the waveform to select a range. Scroll to zoom in.
        </p>