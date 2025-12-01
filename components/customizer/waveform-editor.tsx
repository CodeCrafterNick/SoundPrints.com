'use client'

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Play, Pause, X } from 'lucide-react'

export interface WaveformEditorHandle {
  play: () => void
  pause: () => void
  togglePlayPause: () => void
  isPlaying: () => boolean
}

export const WaveformEditor = forwardRef<WaveformEditorHandle>(function WaveformEditor(props, ref) {
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)
  const regionsRef = useRef<RegionsPlugin | null>(null)
  const waveformColorRef = useRef<string>('#000000')
  
  const audioUrl = useCustomizerStore((state) => state.audioUrl)
  const audioDuration = useCustomizerStore((state) => state.audioDuration)
  const waveformColor = useCustomizerStore((state) => state.waveformColor)
  const waveformUseGradient = useCustomizerStore((state) => state.waveformUseGradient)
  const waveformGradientStops = useCustomizerStore((state) => state.waveformGradientStops)
  const waveformGradientDirection = useCustomizerStore((state) => state.waveformGradientDirection)
  const backgroundColor = useCustomizerStore((state) => state.backgroundColor)
  const backgroundUseGradient = useCustomizerStore((state) => state.backgroundUseGradient)
  const backgroundGradientStops = useCustomizerStore((state) => state.backgroundGradientStops)
  const backgroundGradientDirection = useCustomizerStore((state) => state.backgroundGradientDirection)
  const backgroundImage = useCustomizerStore((state) => state.backgroundImage)
  const backgroundImagePosition = useCustomizerStore((state) => state.backgroundImagePosition)
  const selectedRegion = useCustomizerStore((state) => state.selectedRegion)
  const hasHydrated = useCustomizerStore((state) => state._hasHydrated)
  const setAudioDuration = useCustomizerStore((state) => state.setAudioDuration)
  const setSelectedRegion = useCustomizerStore((state) => state.setSelectedRegion)
  
  // Update color refs whenever colors change
  waveformColorRef.current = waveformColor || '#000000'
  const backgroundColorRef = useRef<string>('#FFFFFF')
  backgroundColorRef.current = backgroundColor || '#FFFFFF'
  
  const [sliderRange, setSliderRange] = useState<[number, number]>([0, 100])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<number | null>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, scrollLeft: 0 })

  // Expose play/pause methods to parent via ref
  useImperativeHandle(ref, () => ({
    play: () => {
      if (wavesurferRef.current) {
        const selectedRegion = useCustomizerStore.getState().selectedRegion
        if (selectedRegion) {
          wavesurferRef.current.setTime(selectedRegion.start)
        }
        wavesurferRef.current.play()
      }
    },
    pause: () => {
      wavesurferRef.current?.pause()
    },
    togglePlayPause: () => {
      if (wavesurferRef.current) {
        if (wavesurferRef.current.isPlaying()) {
          wavesurferRef.current.pause()
        } else {
          const selectedRegion = useCustomizerStore.getState().selectedRegion
          if (selectedRegion) {
            wavesurferRef.current.setTime(selectedRegion.start)
          }
          wavesurferRef.current.play()
        }
      }
    },
    isPlaying: () => isPlaying
  }), [isPlaying])

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

    // Track if component is still mounted
    let isMounted = true
    // Track if we're restoring a saved selection (to avoid re-saving in region-created)
    let isRestoringSelection = false

    console.log('WaveformEditor: Initializing...', { audioUrl })

    const regions = RegionsPlugin.create()
    regionsRef.current = regions

    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: waveformColorRef.current,
      progressColor: waveformColorRef.current,
      cursorColor: waveformColorRef.current,
      cursorWidth: 2,
      height: 100,
      barWidth: 2,
      barGap: 1,
      barRadius: 0,
      barHeight: 1,
      normalize: false,
      minPxPerSec: 1,
      interact: false,
      plugins: [regions],
    })

    wavesurferRef.current = wavesurfer

    console.log('WaveformEditor: Loading audio...', audioUrl)
    
    // Load audio with proper error handling
    wavesurfer.load(audioUrl).catch((error) => {
      // Ignore AbortError when component unmounts during load
      if (error?.name === 'AbortError' || !isMounted) {
        return
      }
      console.error('WaveformEditor: Failed to load audio', error)
    })

    wavesurfer.on('ready', () => {
      if (!isMounted) return
      console.log('WaveformEditor: Waveform ready!', wavesurfer.getDuration())
      
      // Get current state from store (not from closure which may be stale)
      const storeState = useCustomizerStore.getState()
      const currentHasHydrated = storeState._hasHydrated
      const storedRegion = storeState.selectedRegion
      const storedDuration = storeState.audioDuration
      
      const duration = wavesurfer.getDuration()
      console.log('WaveformEditor: Has hydrated?', currentHasHydrated)
      console.log('WaveformEditor: Selected region from store:', storedRegion)
      console.log('WaveformEditor: Stored duration:', storedDuration, 'Actual duration:', duration)
      setAudioDuration(duration)
      
      // Only restore selection if store has hydrated and we have a valid selection
      // Be lenient with the end check - allow small floating point differences
      const hasStoredSelection = currentHasHydrated && storedRegion && 
        storedRegion.start >= 0 && 
        storedRegion.end > 0 && 
        storedRegion.end <= duration + 0.5 // Allow 0.5s tolerance
      
      if (hasStoredSelection && storedRegion) {
        // Restore the stored selection, clamping end to actual duration if needed
        const clampedEnd = Math.min(storedRegion.end, duration)
        console.log('WaveformEditor: ✅ Restoring stored selection', { start: storedRegion.start, end: clampedEnd })
        const newSliderStart = (storedRegion.start / duration) * 100
        const newSliderEnd = (clampedEnd / duration) * 100
        setSliderRange([newSliderStart, newSliderEnd])
        
        // Mark that we're restoring so region-created doesn't overwrite the store
        isRestoringSelection = true
        
        // Create the region
        regionsRef.current?.addRegion({
          start: storedRegion.start,
          end: clampedEnd,
          color: 'rgba(168, 85, 247, 0.15)',
          drag: true,
          resize: true,
        })
        
        // Reset the flag after a short delay (after region-created fires)
        setTimeout(() => {
          isRestoringSelection = false
        }, 100)
      } else {
        // Initialize with full duration if no stored selection or not yet hydrated
        console.log('WaveformEditor: ⚠️  Initializing with full duration (no stored selection or not hydrated)')
        setSliderRange([0, 100])
        setSelectedRegion({ start: 0, end: duration })
        
        // Also create a visual region for the full duration
        regionsRef.current?.addRegion({
          start: 0,
          end: duration,
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
      if (!isMounted) return
      // Skip if we're just restoring a saved selection
      if (isRestoringSelection) {
        console.log('WaveformEditor: Region created (restoring, skipping store update)', region.start, region.end)
        return
      }
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
      if (!isMounted) return
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
      if (!isMounted) return
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
      if (!isMounted) return
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

    // Stop playback when reaching end of selected region
    wavesurfer.on('timeupdate', (currentTime) => {
      if (!isMounted) return
      const region = useCustomizerStore.getState().selectedRegion
      if (region && currentTime >= region.end) {
        wavesurfer.pause()
        wavesurfer.setTime(region.start) // Reset to start of selection
      }
    })

    wavesurfer.on('finish', () => {
      if (!isMounted) return
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
      // Mark as unmounted first to prevent async callbacks from running
      isMounted = false
      
      // Properly destroy the wavesurfer instance on unmount
      // This is necessary because the container DOM element is removed when accordion closes
      console.log('WaveformEditor: Component unmounting, destroying wavesurfer instance')
      if (wavesurferRef.current) {
        try {
          // Unsubscribe all events before destroying to prevent callbacks during cleanup
          wavesurferRef.current.unAll()
          wavesurferRef.current.destroy()
        } catch {
          // Ignore any errors during cleanup (including AbortError)
        }
        wavesurferRef.current = null
        regionsRef.current = null
      }
    }
  }, [audioUrl, setAudioDuration, setSelectedRegion])

  // Helper to create CSS gradient string
  const createGradientString = (stops: Array<{ color: string; position: number }>, direction: string) => {
    if (!stops || stops.length === 0) return null
    const sortedStops = [...stops].sort((a, b) => a.position - b.position)
    const colorStops = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ')
    return `linear-gradient(${direction}, ${colorStops})`
  }

  // Helper to create a CanvasGradient for WaveSurfer
  const createCanvasGradient = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    stops: Array<{ color: string; position: number }>,
    direction: string
  ): CanvasGradient | null => {
    if (!stops || stops.length === 0) return null
    
    // Parse direction to determine gradient coordinates
    let x0 = 0, y0 = 0, x1 = 0, y1 = height
    if (direction.includes('right')) {
      x0 = 0; y0 = height / 2; x1 = width; y1 = height / 2
    } else if (direction.includes('left')) {
      x0 = width; y0 = height / 2; x1 = 0; y1 = height / 2
    } else if (direction.includes('top')) {
      x0 = width / 2; y0 = height; x1 = width / 2; y1 = 0
    } else {
      // Default: to bottom
      x0 = width / 2; y0 = 0; x1 = width / 2; y1 = height
    }
    
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1)
    const sortedStops = [...stops].sort((a, b) => a.position - b.position)
    sortedStops.forEach(stop => {
      gradient.addColorStop(stop.position / 100, stop.color)
    })
    return gradient
  }

  // Update colors dynamically without reinitializing
  useEffect(() => {
    if (!wavesurferRef.current) return
    
    const wrapper = wavesurferRef.current.getWrapper()
    const canvas = wrapper?.querySelector('canvas')
    
    // Determine waveform color (gradient or solid)
    let effectiveWaveformColor: string | CanvasGradient = waveformColor || '#000000'
    if (waveformUseGradient && waveformGradientStops && waveformGradientStops.length > 0 && canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const gradient = createCanvasGradient(
          ctx,
          canvas.width,
          canvas.height,
          waveformGradientStops,
          waveformGradientDirection || 'to bottom'
        )
        if (gradient) {
          effectiveWaveformColor = gradient
        }
      }
    }
    
    wavesurferRef.current.setOptions({
      waveColor: effectiveWaveformColor,
      progressColor: effectiveWaveformColor,
      cursorColor: typeof effectiveWaveformColor === 'string' ? effectiveWaveformColor : (waveformGradientStops?.[0]?.color || '#000000'),
    })
    
    // Make sure wrapper and canvas are transparent so our background div shows through
    if (wrapper) {
      wrapper.style.backgroundColor = 'transparent'
      wrapper.style.backgroundImage = 'none'
      if (canvas) {
        canvas.style.backgroundColor = 'transparent'
      }
    }
  }, [waveformColor, waveformUseGradient, waveformGradientStops, waveformGradientDirection, backgroundColor, backgroundUseGradient, backgroundGradientStops, backgroundGradientDirection, backgroundImage, backgroundImagePosition])

  // Separate cleanup effect for when audioUrl changes
  useEffect(() => {
    return () => {
      if (wavesurferRef.current) {
        console.log('WaveformEditor: Cleanup - destroying wavesurfer due to audioUrl change')
        try {
          wavesurferRef.current.destroy()
        } catch (error) {
          // Ignore AbortError during cleanup - it's expected
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('WaveformEditor: Error during cleanup:', error)
          }
        }
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
    
    setSelectedRegion({ start: startTime, end: endTime })
    
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
    
    // Clear all regions (visual selection boxes)
    regionsRef.current.clearRegions()
    
    // Reset slider to full range
    setSliderRange([0, 100])
    
    // Set selection to full audio duration (use entire waveform)
    const duration = wavesurferRef.current.getDuration()
    setSelectedRegion({ start: 0, end: duration })
    
    // Create a new region for the full duration (visual indicator)
    regionsRef.current.addRegion({
      start: 0,
      end: duration,
      color: 'rgba(59, 130, 246, 0.3)',
      drag: false,
      resize: true,
    })
    
    // Reset playhead to start
    wavesurferRef.current.setTime(0)
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Allow default horizontal scrolling behavior
    // Don't zoom - keep bars relative to entire audio file
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

  // Render buttons to external container using effect
  useEffect(() => {
    if (typeof document === 'undefined') return
    
    const container = document.getElementById('waveform-controls')
    if (!container) return
    
    // Create root if it doesn't exist
    const root = (container as any)._reactRoot || ((container as any)._reactRoot = require('react-dom/client').createRoot(container))
    
    root.render(
      <>
        <Button
          onClick={handlePlayPause}
          size="sm"
          variant="secondary"
          className="h-7 w-7 p-0"
          disabled={!audioUrl}
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>
        {(regionsRef.current?.getRegions()?.length ?? 0) > 0 && (
          <Button
            onClick={handleClearRange}
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0"
            disabled={!audioUrl}
            title="Clear selection and reset zoom"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </>
    )
  }, [audioUrl, isPlaying, handlePlayPause, handleClearRange])

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

  // Background style for the waveform container
  const getBackgroundStyle = (): React.CSSProperties => {
    if (backgroundImage) {
      return {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: backgroundImagePosition || 'center',
      }
    } else if (backgroundUseGradient && backgroundGradientStops && backgroundGradientStops.length > 0) {
      const gradientString = createGradientString(backgroundGradientStops, backgroundGradientDirection || 'to bottom')
      return {
        backgroundImage: gradientString || 'none',
      }
    } else {
      return {
        backgroundColor: backgroundColor || '#FFFFFF',
      }
    }
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
        {/* Background layer that shows the gradient/image */}
        <div 
          className="absolute inset-0 rounded-lg z-0"
          style={getBackgroundStyle()}
        />
        <div 
          ref={waveformRef} 
          className="w-full rounded-lg border select-none relative z-10" 
          style={{ 
            height: '100px',
            cursor: isDragging ? 'crosshair' : 'default',
            overflowX: 'auto',
            overflowY: 'hidden',
            backgroundColor: 'transparent',
          }}
          onWheel={handleWheel}
        />
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
          Drag on the waveform to select a range.
        </p>
      </div>
    </div>
  )
})