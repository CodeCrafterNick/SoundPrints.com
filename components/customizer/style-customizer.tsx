'use client'

import { useCustomizerStore, type WaveformStyle } from '@/lib/stores/customizer-store'
import { Sparkles, SlidersHorizontal, Circle, Palette, Upload, ImageIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Slider } from '@/components/ui/slider'
import { useCallback, useRef, memo } from 'react'

// Export the preview component for use in accordion trigger
export { WaveformPreviewIcon }

// Elegant SVG-based waveform preview icons
function WaveformPreviewIcon({ style, size = 'normal' }: { style: WaveformStyle; size?: 'small' | 'normal' }) {
  const dimensions = size === 'small' ? { w: 48, h: 24 } : { w: 80, h: 40 }
  const { w, h } = dimensions
  const cy = h / 2

  // Generate consistent waveform data (seeded by style name for consistency)
  const seed = style.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const bars = Array.from({ length: 24 }, (_, i) => {
    const noise = Math.sin(seed + i * 0.7) * 0.5 + Math.sin(seed * 2 + i * 1.3) * 0.3 + 0.2
    return Math.abs(noise) * 0.85 + 0.15
  })

  const renderStyle = () => {
    switch (style) {
      case 'bars':
      case 'gradient-bars':
        // Wide bars with spacing
        return (
          <g>
            {bars.filter((_, i) => i % 2 === 0).map((h, i) => {
              const barH = h * (dimensions.h * 0.85)
              const x = (i / 12) * w + w * 0.03
              const barW = (w / 12) * 0.65
              return (
                <rect
                  key={i}
                  x={x}
                  y={cy - barH / 2}
                  width={barW}
                  height={barH}
                  rx={barW / 4}
                  className="fill-current"
                />
              )
            })}
          </g>
        )

      case 'image-mask':
        // Image mask style - show solid waveform shape that would clip an image
        const maskPoints: { x: number; y: number }[] = []
        // Top curve
        bars.forEach((bh, i) => {
          const x = (i / (bars.length - 1)) * w
          const y = cy - (bh * dimensions.h * 0.4)
          maskPoints.push({ x, y })
        })
        // Bottom curve (reversed)
        for (let i = bars.length - 1; i >= 0; i--) {
          const x = (i / (bars.length - 1)) * w
          const y = cy + (bars[i] * dimensions.h * 0.4)
          maskPoints.push({ x, y })
        }
        return (
          <g>
            <defs>
              <linearGradient id="imageMaskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <polygon
              points={maskPoints.map(p => `${p.x},${p.y}`).join(' ')}
              fill="url(#imageMaskGradient)"
              opacity={0.9}
            />
          </g>
        )

      case 'smooth':
      case 'wave':
        // Smooth style - solid filled waveform shape like image-mask but all black
        const smoothMaskPoints: { x: number; y: number }[] = []
        // Top curve
        bars.forEach((bh, i) => {
          const x = (i / (bars.length - 1)) * w
          const y = cy - (bh * dimensions.h * 0.4)
          smoothMaskPoints.push({ x, y })
        })
        // Bottom curve (reversed)
        for (let i = bars.length - 1; i >= 0; i--) {
          const x = (i / (bars.length - 1)) * w
          const y = cy + (bars[i] * dimensions.h * 0.4)
          smoothMaskPoints.push({ x, y })
        }
        return (
          <polygon
            points={smoothMaskPoints.map(p => `${p.x},${p.y}`).join(' ')}
            className="fill-current"
            opacity={0.9}
          />
        )

      case 'mirror':
        return (
          <g>
            {bars.map((h, i) => {
              const barH = h * (dimensions.h * 0.4)
              const x = (i / 24) * w + w * 0.02
              const barW = (w / 24) * 0.65
              return (
                <g key={i}>
                  <rect x={x} y={cy - barH} width={barW} height={barH} rx={barW / 3} className="fill-current" />
                  <rect x={x} y={cy} width={barW} height={barH} rx={barW / 3} className="fill-current opacity-60" />
                </g>
              )
            })}
          </g>
        )

      case 'circular':
      case 'soundwave':
        const cx = w / 2
        const baseR = Math.min(w, h) * 0.25
        return (
          <g>
            <circle cx={cx} cy={cy} r={baseR * 0.3} className="fill-current" />
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i / 16) * Math.PI * 2 - Math.PI / 2
              const len = bars[i % bars.length] * baseR * 0.7
              const x1 = cx + Math.cos(angle) * baseR * 0.5
              const y1 = cy + Math.sin(angle) * baseR * 0.5
              const x2 = cx + Math.cos(angle) * (baseR * 0.5 + len)
              const y2 = cy + Math.sin(angle) * (baseR * 0.5 + len)
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              )
            })}
          </g>
        )

      case 'dots':
      case 'constellation':
        return (
          <g>
            {bars.map((h, i) => {
              const x = (i / 24) * w + w * 0.04
              const y = cy + (h - 0.5) * dimensions.h * 0.7
              const r = 1.5 + h * 1.5
              return <circle key={i} cx={x} cy={y} r={r} className="fill-current" />
            })}
          </g>
        )

      case 'mountain':
        const mountainPoints = [{ x: 0, y: h }]
        bars.forEach((bh, i) => {
          const x = (i / (bars.length - 1)) * w
          const y = h - bh * h * 0.85
          mountainPoints.push({ x, y })
        })
        mountainPoints.push({ x: w, y: h })
        return (
          <polygon
            points={mountainPoints.map(p => `${p.x},${p.y}`).join(' ')}
            className="fill-current opacity-80"
          />
        )

      case 'heartbeat':
      case 'pulse':
        const pulseY = cy
        const pulsePoints = [
          `M 0,${pulseY}`,
          `L ${w * 0.2},${pulseY}`,
          `L ${w * 0.25},${pulseY - h * 0.1}`,
          `L ${w * 0.3},${pulseY}`,
          `L ${w * 0.4},${pulseY}`,
          `L ${w * 0.45},${pulseY - h * 0.35}`,
          `L ${w * 0.5},${pulseY + h * 0.25}`,
          `L ${w * 0.55},${pulseY - h * 0.2}`,
          `L ${w * 0.6},${pulseY}`,
          `L ${w * 0.7},${pulseY}`,
          `L ${w * 0.75},${pulseY - h * 0.1}`,
          `L ${w * 0.8},${pulseY}`,
          `L ${w},${pulseY}`,
        ].join(' ')
        return (
          <path
            d={pulsePoints}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )

      case 'spectrum':
      case 'frequency':
      case 'equalizer':
        return (
          <g>
            {Array.from({ length: 8 }).map((_, i) => {
              const barH = bars[i * 3] * (dimensions.h * 0.85)
              const x = (i / 8) * w + w * 0.04
              const barW = (w / 8) * 0.75
              return (
                <rect
                  key={i}
                  x={x}
                  y={h - barH - h * 0.05}
                  width={barW}
                  height={barH}
                  rx={2}
                  className="fill-current"
                />
              )
            })}
          </g>
        )

      case 'vinyl':
        const vcx = w / 2
        return (
          <g>
            {[0.9, 0.7, 0.5, 0.3].map((r, i) => (
              <circle
                key={i}
                cx={vcx}
                cy={cy}
                r={Math.min(w, h) * 0.4 * r}
                fill="none"
                stroke="currentColor"
                strokeWidth={i === 3 ? 3 : 1}
                opacity={i === 3 ? 1 : 0.4}
              />
            ))}
            <circle cx={vcx} cy={cy} r={3} className="fill-current" />
          </g>
        )

      case 'dna':
      case 'ribbon':
        const dnaPath1: string[] = []
        const dnaPath2: string[] = []
        for (let i = 0; i <= 20; i++) {
          const x = (i / 20) * w
          const offset = Math.sin(i * 0.6) * h * 0.3
          dnaPath1.push(`${i === 0 ? 'M' : 'L'} ${x},${cy + offset}`)
          dnaPath2.push(`${i === 0 ? 'M' : 'L'} ${x},${cy - offset}`)
        }
        return (
          <g>
            <path d={dnaPath1.join(' ')} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
            <path d={dnaPath2.join(' ')} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" opacity={0.5} />
          </g>
        )

      case 'geometric':
        return (
          <g>
            <polygon points={`${w * 0.5},${h * 0.1} ${w * 0.85},${h * 0.9} ${w * 0.15},${h * 0.9}`} fill="none" stroke="currentColor" strokeWidth={2} />
            <polygon points={`${w * 0.5},${h * 0.75} ${w * 0.7},${h * 0.35} ${w * 0.3},${h * 0.35}`} fill="none" stroke="currentColor" strokeWidth={2} opacity={0.5} />
          </g>
        )

      case 'galaxy':
      case 'particle':
        return (
          <g>
            {Array.from({ length: 20 }).map((_, i) => {
              const angle = (i / 20) * Math.PI * 4
              const r = (i / 20) * Math.min(w, h) * 0.4
              const px = w / 2 + Math.cos(angle) * r
              const py = cy + Math.sin(angle) * r * 0.6
              const size = 1 + (i / 20) * 2
              return <circle key={i} cx={px} cy={py} r={size} className="fill-current" opacity={0.4 + (i / 20) * 0.6} />
            })}
          </g>
        )

      case 'ripple':
        return (
          <g>
            {[0.2, 0.4, 0.6, 0.8, 1].map((r, i) => (
              <ellipse
                key={i}
                cx={w / 2}
                cy={cy}
                rx={w * 0.45 * r}
                ry={h * 0.4 * r}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                opacity={1 - r * 0.7}
              />
            ))}
          </g>
        )

      case 'neon':
      case 'glow':
        return (
          <g>
            {bars.slice(0, 12).map((bh, i) => {
              const barH = bh * (dimensions.h * 0.75)
              const x = (i / 12) * w + w * 0.03
              const barW = (w / 12) * 0.6
              return (
                <g key={i}>
                  <rect x={x} y={cy - barH / 2} width={barW} height={barH} rx={barW / 2} className="fill-current opacity-30" />
                  <rect x={x + barW * 0.15} y={cy - barH * 0.4} width={barW * 0.7} height={barH * 0.8} rx={barW / 3} className="fill-current" />
                </g>
              )
            })}
          </g>
        )

      case 'soundwave-lines':
        return (
          <g>
            {Array.from({ length: 5 }).map((_, i) => {
              const offset = (i - 2) * h * 0.15
              const linePoints = bars.map((bh, j) => {
                const x = (j / (bars.length - 1)) * w
                const y = cy + offset + (bh - 0.5) * h * 0.2
                return `${j === 0 ? 'M' : 'L'} ${x},${y}`
              }).join(' ')
              return (
                <path
                  key={i}
                  d={linePoints}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  opacity={1 - Math.abs(i - 2) * 0.25}
                />
              )
            })}
          </g>
        )

      case 'wave3d':
      case 'tunnel':
        return (
          <g>
            {[0.3, 0.5, 0.7, 0.9].map((scale, i) => (
              <rect
                key={i}
                x={w * (1 - scale) / 2}
                y={h * (1 - scale * 0.8) / 2}
                width={w * scale}
                height={h * scale * 0.8}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                rx={2}
                opacity={0.3 + i * 0.2}
              />
            ))}
          </g>
        )

      case 'moire':
      case 'kaleidoscope':
        return (
          <g>
            {Array.from({ length: 6 }).map((_, i) => {
              const angle = (i / 6) * Math.PI
              const x1 = w / 2 + Math.cos(angle) * w * 0.45
              const y1 = cy + Math.sin(angle) * h * 0.4
              const x2 = w / 2 - Math.cos(angle) * w * 0.45
              const y2 = cy - Math.sin(angle) * h * 0.4
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={1.5} />
            })}
            <circle cx={w / 2} cy={cy} r={4} className="fill-current" />
          </g>
        )

      case 'fluid':
      case 'aurora':
        const fluidPath = `M 0,${h * 0.6} Q ${w * 0.25},${h * 0.2} ${w * 0.5},${h * 0.5} T ${w},${h * 0.4}`
        const fluidPath2 = `M 0,${h * 0.7} Q ${w * 0.25},${h * 0.5} ${w * 0.5},${h * 0.6} T ${w},${h * 0.5}`
        return (
          <g>
            <path d={fluidPath} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
            <path d={fluidPath2} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" opacity={0.4} />
          </g>
        )

      case 'glitch':
        return (
          <g>
            {[0, 1, 2].map((offset) => (
              <g key={offset} transform={`translate(${offset * 2 - 2}, ${offset - 1})`} opacity={offset === 1 ? 1 : 0.3}>
                {bars.slice(0, 16).map((bh, i) => {
                  const barH = bh * (dimensions.h * 0.6)
                  const x = (i / 16) * w
                  return <rect key={i} x={x} y={cy - barH / 2} width={(w / 16) * 0.7} height={barH} className="fill-current" />
                })}
              </g>
            ))}
          </g>
        )

      case 'perlin':
      case 'crystals':
        return (
          <g>
            {Array.from({ length: 6 }).map((_, i) => {
              const x = w * 0.1 + (i / 5) * w * 0.8
              const bh = bars[i * 4] * h * 0.8
              return (
                <polygon
                  key={i}
                  points={`${x},${h * 0.9} ${x - w * 0.06},${h * 0.9 - bh * 0.4} ${x},${h * 0.9 - bh} ${x + w * 0.06},${h * 0.9 - bh * 0.4}`}
                  className="fill-current"
                  opacity={0.6 + bars[i * 4] * 0.4}
                />
              )
            })}
          </g>
        )

      case 'bloom':
      case 'fire':
        return (
          <g>
            {Array.from({ length: 7 }).map((_, i) => {
              const x = w * 0.1 + (i / 6) * w * 0.8
              const bh = bars[i * 3] * h * 0.75
              return (
                <ellipse
                  key={i}
                  cx={x}
                  cy={h * 0.85 - bh / 2}
                  rx={w * 0.05}
                  ry={bh / 2}
                  className="fill-current"
                  opacity={0.5 + bars[i * 3] * 0.5}
                />
              )
            })}
          </g>
        )

      default:
        // Default fallback to bars
        return (
          <g>
            {bars.map((bh, i) => {
              const barH = bh * (dimensions.h * 0.8)
              const x = (i / 24) * w + w * 0.02
              const barW = (w / 24) * 0.7
              return (
                <rect
                  key={i}
                  x={x}
                  y={cy - barH / 2}
                  width={barW}
                  height={barH}
                  rx={barW / 3}
                  className="fill-current"
                />
              )
            })}
          </g>
        )
    }
  }

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn(
        "rounded-lg border border-gray-200 bg-white text-gray-800",
        size === 'small' ? 'w-12 h-6' : 'w-20 h-10'
      )}
    >
      {renderStyle()}
    </svg>
  )
}

const waveformStyles: { value: WaveformStyle; label: string; description: string }[] = [
  { value: 'bars', label: 'Bars', description: 'Classic vertical bars' },
  { value: 'smooth', label: 'Smooth', description: 'Flowing curves' },
  { value: 'circular', label: 'Circular', description: 'Circular visualization' },
  { value: 'image-mask', label: 'Image Mask', description: 'Image clipped by waveform' },
]

export const StyleCustomizer = memo(function StyleCustomizer() {
  const waveformStyle = useCustomizerStore((state) => state.waveformStyle)
  const setWaveformStyle = useCustomizerStore((state) => state.setWaveformStyle)
  const barWidth = useCustomizerStore((state) => state.barWidth)
  const barGap = useCustomizerStore((state) => state.barGap)
  const barRounded = useCustomizerStore((state) => state.barRounded)
  const circleRadius = useCustomizerStore((state) => state.circleRadius)
  const waveformHeightMultiplier = useCustomizerStore((state) => state.waveformHeightMultiplier)
  const setBarWidth = useCustomizerStore((state) => state.setBarWidth)
  const setBarGap = useCustomizerStore((state) => state.setBarGap)
  const setBarRounded = useCustomizerStore((state) => state.setBarRounded)
  const setCircleRadius = useCustomizerStore((state) => state.setCircleRadius)
  const setWaveformHeightMultiplier = useCustomizerStore((state) => state.setWaveformHeightMultiplier)
  
  // Mirror two-color settings
  const mirrorUseTwoColors = useCustomizerStore((state) => state.mirrorUseTwoColors)
  const mirrorSecondaryColor = useCustomizerStore((state) => state.mirrorSecondaryColor)
  const setMirrorUseTwoColors = useCustomizerStore((state) => state.setMirrorUseTwoColors)
  const setMirrorSecondaryColor = useCustomizerStore((state) => state.setMirrorSecondaryColor)
  
  // Check if current style uses bars
  const usesBarSettings = ['bars', 'gradient-bars', 'mirror', 'spectrum', 'frequency', 'equalizer', 'neon', 'glow'].includes(waveformStyle)
  
  // Check if current style uses circle radius
  const usesCircleSettings = ['circular', 'galaxy', 'vinyl', 'spectrum'].includes(waveformStyle)
  
  // Circular styles need bar thickness and height controls too
  const isCircularStyle = ['circular', 'soundwave'].includes(waveformStyle)
  
  // Mirror style specific
  const isMirrorStyle = waveformStyle === 'mirror'
  
  // Image mask specific
  const isImageMaskStyle = waveformStyle === 'image-mask'
  const imageMaskImage = useCustomizerStore((state) => state.imageMaskImage)
  const imageMaskShape = useCustomizerStore((state) => state.imageMaskShape)
  const imageMaskFocalPoint = useCustomizerStore((state) => state.imageMaskFocalPoint)
  const setImageMaskImage = useCustomizerStore((state) => state.setImageMaskImage)
  const setImageMaskShape = useCustomizerStore((state) => state.setImageMaskShape)
  const setImageMaskFocalPoint = useCustomizerStore((state) => state.setImageMaskFocalPoint)
  
  // File input ref for image mask upload
  const imageMaskInputRef = useRef<HTMLInputElement>(null)
  const imageMaskFocalPointRef = useRef<HTMLImageElement>(null)
  
  const handleImageMaskUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        setImageMaskImage(dataUrl)
        setImageMaskFocalPoint(null) // Reset focal point when new image uploaded
      }
      reader.readAsDataURL(file)
    }
  }, [setImageMaskImage, setImageMaskFocalPoint])

  const handleMaskFocalPointClick = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageMaskFocalPointRef.current) return
    
    const rect = imageMaskFocalPointRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setImageMaskFocalPoint({ x, y })
  }, [setImageMaskFocalPoint])

  return (
    <div className="space-y-6">
      {/* Waveform Style Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <label className="text-sm font-semibold">Waveform Style</label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {waveformStyles.map((style) => (
            <button
              key={style.value}
              onClick={() => {
                setWaveformStyle(style.value)
                // Set specific defaults for circular style
                if (style.value === 'circular') {
                  setBarWidth(1)
                  setBarGap(4)
                }
              }}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                waveformStyle === style.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex flex-col gap-2">
                <WaveformPreviewIcon style={style.value} />
                <div>
                  <div className="font-medium text-sm">{style.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {style.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Bar Settings - only show for bar-based styles */}
      {usesBarSettings && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            <label className="text-sm font-semibold">Bar Settings</label>
          </div>
          
          {/* Bar Thickness */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Bar thickness</span>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {barWidth}
              </span>
            </div>
            <Slider
              value={[barWidth]}
              onValueChange={(v) => setBarWidth(v[0])}
              min={1}
              max={30}
              step={1}
              className="w-full"
            />
          </div>

          {/* Bar Gap */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Space between bars</span>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {barGap}
              </span>
            </div>
            <Slider
              value={[barGap]}
              onValueChange={(v) => setBarGap(v[0])}
              min={0}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          {/* Rounded Bars Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Rounded bars</span>
            <button
              onClick={() => setBarRounded(!barRounded)}
              title={barRounded ? 'Disable rounded bars' : 'Enable rounded bars'}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                barRounded ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  barRounded ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Height Multiplier */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Volume / Height</span>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {waveformHeightMultiplier}%
              </span>
            </div>
            <Slider
              value={[waveformHeightMultiplier]}
              onValueChange={(v) => setWaveformHeightMultiplier(v[0])}
              min={50}
              max={300}
              step={10}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Mirror Two-Color Settings - only show for mirror style */}
      {isMirrorStyle && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <label className="text-sm font-semibold">Mirror Colors</label>
          </div>
          
          {/* Two-Color Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Use different colors</span>
            <button
              onClick={() => setMirrorUseTwoColors(!mirrorUseTwoColors)}
              className={cn(
                "w-10 h-6 rounded-full transition-colors relative",
                mirrorUseTwoColors ? "bg-primary" : "bg-muted"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
                  mirrorUseTwoColors ? "translate-x-5" : "translate-x-1"
                )}
              />
            </button>
          </div>
          
          {/* Secondary Color Picker - only show when two colors enabled */}
          {mirrorUseTwoColors && (
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Bottom half color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={mirrorSecondaryColor}
                  onChange={(e) => setMirrorSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-border"
                />
                <input
                  type="text"
                  value={mirrorSecondaryColor}
                  onChange={(e) => setMirrorSecondaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background"
                  placeholder="#888888"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Top half uses the main waveform color from the Colors panel
              </p>
            </div>
          )}
        </div>
      )}

      {/* Image Mask Settings - only show for image-mask style */}
      {isImageMaskStyle && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <label className="text-sm font-semibold">Image Mask Settings</label>
          </div>
          
          {/* Mask Shape Selector */}
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Mask shape</span>
            <div className="flex gap-2">
              <button
                onClick={() => setImageMaskShape('normal')}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all",
                  imageMaskShape === 'normal'
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                Normal
              </button>
              <button
                onClick={() => setImageMaskShape('circular')}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all",
                  imageMaskShape === 'circular'
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                Circular
              </button>
            </div>
          </div>
          
          {/* Image Upload */}
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Mask image</span>
            <input
              ref={imageMaskInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageMaskUpload}
              className="hidden"
            />
            
            {imageMaskImage ? (
              <div className="space-y-3">
                {/* Focal Point Picker - primary UI when image is uploaded */}
                <div className="space-y-2">
                  <div className="relative rounded-lg overflow-hidden border-2 border-primary">
                    <img
                      ref={imageMaskFocalPointRef}
                      src={imageMaskImage}
                      alt="Click to set focal point"
                      className="w-full h-auto object-contain cursor-crosshair"
                      onClick={handleMaskFocalPointClick}
                    />
                    {imageMaskFocalPoint && (
                      <div
                        className="absolute w-6 h-6 -ml-3 -mt-3 pointer-events-none"
                        style={{
                          left: `${imageMaskFocalPoint.x}%`,
                          top: `${imageMaskFocalPoint.y}%`,
                        }}
                      >
                        <div className="absolute inset-0 rounded-full border-2 border-white shadow-lg" />
                        <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-1 h-1 bg-primary rounded-full" />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {imageMaskFocalPoint 
                      ? 'Click to change focal point' 
                      : 'Click to set where to center the view'}
                  </p>
                </div>
                
                {/* Change/Remove buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => imageMaskInputRef.current?.click()}
                    className="flex-1 py-2 px-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 text-sm font-medium transition-all"
                  >
                    Change Image
                  </button>
                  <button
                    onClick={() => {
                      setImageMaskImage(null)
                      setImageMaskFocalPoint(null)
                    }}
                    className="py-2 px-3 rounded-lg border border-destructive/50 text-destructive hover:bg-destructive/10 text-sm font-medium transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => imageMaskInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload an image</span>
              </button>
            )}
          </div>
          
          {/* Circular Controls - show when circular mask shape is selected */}
          {imageMaskShape === 'circular' && (
            <div className="space-y-4 pt-2">
              <span className="text-sm font-medium text-muted-foreground">Circular Settings</span>
              
              {/* Circle Size / Inner Radius */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Center size</span>
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {circleRadius}%
                  </span>
                </div>
                <Slider
                  value={[circleRadius]}
                  onValueChange={(v) => setCircleRadius(v[0])}
                  min={20}
                  max={200}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Size of the center circle
                </p>
              </div>
              
              {/* Bar Thickness */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bar thickness</span>
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {barWidth}
                  </span>
                </div>
                <Slider
                  value={[barWidth]}
                  onValueChange={(v) => setBarWidth(v[0])}
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>
              
              {/* Bar Gap / Spacing */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bar spacing</span>
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {barGap}
                  </span>
                </div>
                <Slider
                  value={[barGap]}
                  onValueChange={(v) => setBarGap(v[0])}
                  min={0}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Higher = fewer bars, more spacing
                </p>
              </div>
              
              {/* Rounded Bars Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rounded bars</span>
                <button
                  onClick={() => setBarRounded(!barRounded)}
                  title={barRounded ? 'Disable rounded bars' : 'Enable rounded bars'}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    barRounded ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      barRounded ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Bar Length / Height Multiplier */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Bar length</span>
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {waveformHeightMultiplier}%
                  </span>
                </div>
                <Slider
                  value={[waveformHeightMultiplier]}
                  onValueChange={(v) => setWaveformHeightMultiplier(v[0])}
                  min={10}
                  max={200}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Scales how far bars extend outward
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Circle Settings - only show for circular/radial styles */}
      {usesCircleSettings && (
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Circle className="h-4 w-4" />
            <label className="text-sm font-semibold">Circle Settings</label>
          </div>
          
          {/* Circle Radius */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Circle size</span>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {circleRadius}%
              </span>
            </div>
            <Slider
              value={[circleRadius]}
              onValueChange={(v) => setCircleRadius(v[0])}
              min={20}
              max={200}
              step={5}
              className="w-full"
            />
          </div>
          
          {/* Bar Thickness for circular styles */}
          {isCircularStyle && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Bar thickness</span>
                <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {barWidth}
                </span>
              </div>
              <Slider
                value={[barWidth]}
                onValueChange={(v) => setBarWidth(v[0])}
                min={1}
                max={30}
                step={1}
                className="w-full"
              />
            </div>
          )}
          
          {/* Bar Gap for circular styles */}
          {isCircularStyle && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Space between bars</span>
                <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {barGap}
                </span>
              </div>
              <Slider
                value={[barGap]}
                onValueChange={(v) => setBarGap(v[0])}
                min={0}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
          )}
          
          {/* Rounded Bars Toggle for circular styles */}
          {isCircularStyle && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rounded bars</span>
              <button
                onClick={() => setBarRounded(!barRounded)}
                title={barRounded ? 'Disable rounded bars' : 'Enable rounded bars'}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  barRounded ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    barRounded ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
          
          {/* Height Multiplier for circular styles */}
          {isCircularStyle && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Bar height</span>
                <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {waveformHeightMultiplier}%
                </span>
              </div>
              <Slider
                value={[waveformHeightMultiplier]}
                onValueChange={(v) => setWaveformHeightMultiplier(v[0])}
                min={50}
                max={300}
                step={10}
                className="w-full"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
})
