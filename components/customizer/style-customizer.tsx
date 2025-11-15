'use client'

import { useCustomizerStore, type WaveformStyle } from '@/lib/stores/customizer-store'
import { Sparkles, Maximize2 } from 'lucide-react'
import { Slider } from '@/components/ui/slider'

const waveformStyles: { value: WaveformStyle; label: string; description: string }[] = [
  { value: 'bars', label: 'Bars', description: 'Classic vertical bars' },
  { value: 'smooth', label: 'Smooth', description: 'Flowing curves' },
  { value: 'soundwave-lines', label: 'Soundwave Lines ⭐', description: 'Spotify canvas style' },
  { value: 'mountain', label: 'Mountain ⭐', description: 'Layered silhouettes' },
  { value: 'heartbeat', label: 'Heartbeat ⭐', description: 'ECG monitor style' },
  { value: 'constellation', label: 'Constellation ⭐', description: 'Connected stars' },
  { value: 'ribbon', label: 'Ribbon ⭐', description: 'Flowing silk' },
  { value: 'spectrum', label: 'Spectrum ⭐', description: 'Concentric circles' },
  { value: 'mirror', label: 'Mirror', description: 'Mirrored waveform' },
  { value: 'circular', label: 'Circular', description: 'Circular visualization' },
  { value: 'dots', label: 'Dots', description: 'Dotted pattern' },
  { value: 'radial', label: 'Radial', description: 'Radial burst effect' },
  { value: 'galaxy', label: 'Galaxy', description: 'Cosmic galaxy effect' },
  { value: 'frequency', label: 'Frequency', description: 'Frequency spectrum' },
  { value: 'particle', label: 'Particle', description: 'Particle cloud' },
  { value: 'ripple', label: 'Ripple', description: 'Water ripple effect' },
  { value: 'soundwave', label: 'Soundwave', description: 'Concentric rings' },
  { value: 'wave3d', label: 'Wave 3D', description: '3D wave perspective' },
  { value: 'neon', label: 'Neon', description: 'Neon glow effect' },
  { value: 'gradient-bars', label: 'Gradient', description: 'Color gradient bars' },
  { value: 'vinyl', label: 'Vinyl', description: 'Vinyl record grooves' },
  { value: 'equalizer', label: 'Equalizer', description: 'Stacked equalizer' },
  { value: 'pulse', label: 'Pulse', description: 'Pulsing hearts' },
  { value: 'geometric', label: 'Geometric', description: 'Geometric shapes' },
  { value: 'dna', label: 'DNA', description: 'DNA helix strand' },
  { value: 'moire', label: 'Moire', description: 'Hypnotic interference' },
  { value: 'fluid', label: 'Fluid', description: 'Liquid organic shapes' },
  { value: 'kaleidoscope', label: 'Kaleidoscope', description: 'Mirrored symmetry' },
  { value: 'glitch', label: 'Glitch', description: 'Digital distortion' },
  { value: 'perlin', label: 'Perlin', description: 'Organic noise flow' },
  { value: 'crystals', label: 'Crystals', description: 'Faceted geometry' },
  { value: 'tunnel', label: 'Tunnel', description: 'Infinite perspective' },
  { value: 'bloom', label: 'Bloom', description: 'Light bloom effect' },
  { value: 'aurora', label: 'Aurora', description: 'Northern lights' },
  { value: 'fire', label: 'Fire', description: 'Flame particles' },
]

export function StyleCustomizer() {
  const waveformStyle = useCustomizerStore((state) => state.waveformStyle)
  const setWaveformStyle = useCustomizerStore((state) => state.setWaveformStyle)
  const waveformSize = useCustomizerStore((state) => state.waveformSize)
  const setWaveformSize = useCustomizerStore((state) => state.setWaveformSize)

  return (
    <div className="space-y-6">
      {/* Waveform Size Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Maximize2 className="h-4 w-4" />
            <label className="text-sm font-semibold">Waveform Size</label>
          </div>
          <span className="text-xs font-mono text-muted-foreground">{waveformSize}%</span>
        </div>
        <Slider
          value={[waveformSize]}
          onValueChange={(value) => setWaveformSize(value[0])}
          min={0}
          max={100}
          step={5}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Adjust waveform size (maintains 1" minimum margin from edges)
        </p>
      </div>

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
              <div className="font-medium text-sm">{style.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {style.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
