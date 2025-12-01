'use client'

import { useCustomizerStore, type WaveformStyle } from '@/lib/stores/customizer-store'
import { Sparkles } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

// Export the preview component for use in accordion trigger
export { WaveformPreviewIcon }

// Mini waveform preview component
function WaveformPreviewIcon({ style, size = 'normal' }: { style: WaveformStyle; size?: 'small' | 'normal' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Use device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1
    const displayWidth = size === 'small' ? 48 : 80
    const displayHeight = size === 'small' ? 24 : 40
    
    canvas.width = displayWidth * dpr
    canvas.height = displayHeight * dpr
    canvas.style.width = `${displayWidth}px`
    canvas.style.height = `${displayHeight}px`
    ctx.scale(dpr, dpr)

    const width = displayWidth
    const height = displayHeight
    const centerY = height / 2

    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#000'

    // Generate simple preview based on style
    const points = 30
    const spacing = width / points

    switch (style) {
      case 'bars':
        for (let i = 0; i < points; i++) {
          const h = Math.random() * height * 0.8
          const x = i * spacing
          ctx.fillRect(x, centerY - h / 2, spacing * 0.6, h)
        }
        break

      case 'smooth':
      case 'mountain':
        ctx.beginPath()
        ctx.moveTo(0, centerY)
        for (let i = 0; i <= points; i++) {
          const x = i * spacing
          const y = centerY + (Math.sin(i * 0.5) * Math.random() * height * 0.3)
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 2
        ctx.stroke()
        break

      case 'circular':
      case 'radial':
      case 'soundwave':
        const radius = Math.min(width, height) * 0.35
        for (let i = 0; i < 360; i += 30) {
          const angle = (i * Math.PI) / 180
          const r = radius + Math.random() * 10
          const x1 = width / 2 + Math.cos(angle) * radius
          const y1 = height / 2 + Math.sin(angle) * radius
          const x2 = width / 2 + Math.cos(angle) * r
          const y2 = height / 2 + Math.sin(angle) * r
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.strokeStyle = '#000'
          ctx.lineWidth = 2
          ctx.stroke()
        }
        break

      case 'dots':
        for (let i = 0; i < points; i++) {
          const x = i * spacing + spacing / 2
          const y = centerY + (Math.random() - 0.5) * height * 0.6
          ctx.beginPath()
          ctx.arc(x, y, 2, 0, Math.PI * 2)
          ctx.fill()
        }
        break

      case 'mirror':
        for (let i = 0; i < points; i++) {
          const h = Math.random() * height * 0.35
          const x = i * spacing
          ctx.fillRect(x, centerY - h, spacing * 0.6, h)
          ctx.fillRect(x, centerY, spacing * 0.6, h)
        }
        break

      default:
        // Default to bars for other styles
        for (let i = 0; i < points; i++) {
          const h = Math.random() * height * 0.8
          const x = i * spacing
          ctx.fillRect(x, centerY - h / 2, spacing * 0.6, h)
        }
    }
  }, [style, size])

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "rounded border border-border bg-background",
        size === 'small' ? 'w-12 h-6' : 'w-20 h-10'
      )}
    />
  )
}

const waveformStyles: { value: WaveformStyle; label: string; description: string }[] = [
  { value: 'bars', label: 'Bars', description: 'Classic vertical bars' },
  { value: 'smooth', label: 'Smooth', description: 'Flowing curves' },
  { value: 'mirror', label: 'Mirror', description: 'Mirrored waveform' },
  { value: 'circular', label: 'Circular', description: 'Circular visualization' },
  { value: 'dots', label: 'Dots', description: 'Dotted pattern' },
  { value: 'radial', label: 'Radial', description: 'Radial burst effect' },
  { value: 'frequency', label: 'Frequency', description: 'Frequency spectrum' },
  { value: 'gradient-bars', label: 'Gradient', description: 'Color gradient bars' },
  { value: 'heartbeat', label: 'Heartbeat', description: 'ECG monitor style' },
  { value: 'mountain', label: 'Mountain', description: 'Layered silhouettes' },
  { value: 'ribbon', label: 'Ribbon', description: 'Flowing silk' },
  { value: 'pulse', label: 'Pulse', description: 'Pulsing hearts' },
]

export function StyleCustomizer() {
  const waveformStyle = useCustomizerStore((state) => state.waveformStyle)
  const setWaveformStyle = useCustomizerStore((state) => state.setWaveformStyle)

  return (
    <div className="space-y-6">
      {/* Waveform Style Selection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <label className="text-sm font-semibold">Waveform Style</label>
        </div>
        <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-2">
          {waveformStyles.map((style) => (
            <button
              key={style.value}
              onClick={() => setWaveformStyle(style.value)}
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
    </div>
  )
}
