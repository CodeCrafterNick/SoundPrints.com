'use client'

import { HexColorPicker } from 'react-colorful'
import GradientPicker from 'react-best-gradient-color-picker'
import { useCustomizerStore, type GradientStop } from '@/lib/stores/customizer-store'
import { Palette, Sparkles } from 'lucide-react'

const presetColors = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Charcoal', value: '#36454F' },
  { name: 'Navy', value: '#1E3A8A' },
  { name: 'Crimson', value: '#DC2626' },
  { name: 'Forest', value: '#059669' },
  { name: 'Purple', value: '#7C3AED' },
  { name: 'Orange', value: '#EA580C' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Teal', value: '#0D9488' },
  { name: 'Gold', value: '#CA8A04' },
  { name: 'Slate', value: '#64748B' },
]

export function ColorCustomizer() {
  const waveformColor = useCustomizerStore((state) => state.waveformColor)
  const waveformUseGradient = useCustomizerStore((state) => state.waveformUseGradient)
  const waveformGradientStops = useCustomizerStore((state) => state.waveformGradientStops)
  const waveformGradientDirection = useCustomizerStore((state) => state.waveformGradientDirection)
  const backgroundColor = useCustomizerStore((state) => state.backgroundColor)
  const backgroundUseGradient = useCustomizerStore((state) => state.backgroundUseGradient)
  const backgroundGradientStops = useCustomizerStore((state) => state.backgroundGradientStops)
  const backgroundGradientDirection = useCustomizerStore((state) => state.backgroundGradientDirection)
  const setWaveformColor = useCustomizerStore((state) => state.setWaveformColor)
  const setWaveformUseGradient = useCustomizerStore((state) => state.setWaveformUseGradient)
  const setWaveformGradientStops = useCustomizerStore((state) => state.setWaveformGradientStops)
  const setWaveformGradientDirection = useCustomizerStore((state) => state.setWaveformGradientDirection)
  const setBackgroundColor = useCustomizerStore((state) => state.setBackgroundColor)
  const setBackgroundUseGradient = useCustomizerStore((state) => state.setBackgroundUseGradient)
  const setBackgroundGradientStops = useCustomizerStore((state) => state.setBackgroundGradientStops)
  const setBackgroundGradientDirection = useCustomizerStore((state) => state.setBackgroundGradientDirection)
  
  // Convert our GradientStop[] to CSS gradient string
  const stopsToGradientString = (stops: GradientStop[], direction: string) => {
    const angle = direction === 'horizontal' ? '90deg' : direction === 'vertical' ? '180deg' : direction === 'diagonal' ? '135deg' : '180deg'
    const sortedStops = [...stops].sort((a, b) => a.position - b.position)
    const colorStops = sortedStops.map(s => `${s.color} ${s.position * 100}%`).join(', ')
    return direction === 'radial' 
      ? `radial-gradient(circle at center, ${colorStops})` 
      : `linear-gradient(${angle}, ${colorStops})`
  }
  
  // Parse CSS gradient string back to our format
  const gradientStringToStops = (gradientStr: string): GradientStop[] => {
    const match = gradientStr.match(/gradient\((?:[^,]+,\s*)?(.+)\)/)
    if (!match) return [{ color: '#000000', position: 0 }, { color: '#FF0000', position: 1 }]
    
    const stopsString = match[1]
    const stops = stopsString.split(/,\s*(?![^(]*\))/).map(stop => {
      const parts = stop.trim().match(/^(\S+)\s+(.+)$/)
      if (!parts) return { color: '#000000', position: 0 }
      const color = parts[1]
      const position = parseFloat(parts[2]) / 100
      return { color, position }
    })
    
    return stops.length >= 2 ? stops : [{ color: '#000000', position: 0 }, { color: '#FF0000', position: 1 }]
  }

  return (
    <div className="space-y-8">
      {/* Waveform Color */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <label className="text-sm font-semibold">Waveform Color</label>
          </div>
          <button
            onClick={() => setWaveformUseGradient(!waveformUseGradient)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              waveformUseGradient
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Gradient
          </button>
        </div>
        
        {waveformUseGradient ? (
          <>
            <div className="w-full">
              <GradientPicker
                value={stopsToGradientString(waveformGradientStops, waveformGradientDirection)}
                onChange={(gradient: string) => {
                  const newStops = gradientStringToStops(gradient)
                  setWaveformGradientStops(newStops)
                }}
                width="100%"
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Direction</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'horizontal', label: 'Horizontal', icon: '→' },
                  { value: 'vertical', label: 'Vertical', icon: '↓' },
                  { value: 'diagonal', label: 'Diagonal', icon: '↘' },
                  { value: 'radial', label: 'Radial', icon: '◉' },
                ].map((dir) => (
                  <button
                    key={dir.value}
                    onClick={() => setWaveformGradientDirection(dir.value as any)}
                    className={`p-2 rounded-lg border-2 text-center transition-all ${
                      waveformGradientDirection === dir.value
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-lg mb-1">{dir.icon}</div>
                    <div className="text-xs font-medium">{dir.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="relative">
              <HexColorPicker 
                color={waveformColor} 
                onChange={setWaveformColor} 
                className="!w-full !h-48 rounded-lg shadow-sm"
                style={{ width: '100%' }}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Presets</p>
              <div className="grid grid-cols-6 gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color.value}
                    className="group relative aspect-square rounded-lg border-2 hover:scale-105 transition-all shadow-sm hover:shadow-md"
                    style={{ 
                      backgroundColor: color.value, 
                      borderColor: waveformColor === color.value ? 'hsl(var(--primary))' : 'transparent'
                    }}
                    onClick={() => setWaveformColor(color.value)}
                    aria-label={`Select ${color.name}`}
                    title={color.name}
                  >
                    {waveformColor === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white shadow-lg" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={waveformColor}
                onChange={(e) => setWaveformColor(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg text-sm font-mono bg-background shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="#000000"
              />
              <div 
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded border shadow-sm"
                style={{ backgroundColor: waveformColor }}
              />
            </div>
          </>
        )}
      </div>

      {/* Background Color */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
            <label className="text-sm font-semibold">Background Color</label>
          </div>
          <button
            onClick={() => setBackgroundUseGradient(!backgroundUseGradient)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              backgroundUseGradient
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Gradient
          </button>
        </div>
        
        {backgroundUseGradient ? (
          <>
            <div className="w-full">
              <GradientPicker
                value={stopsToGradientString(backgroundGradientStops, backgroundGradientDirection)}
                onChange={(gradient: string) => {
                  const newStops = gradientStringToStops(gradient)
                  setBackgroundGradientStops(newStops)
                }}
                width="100%"
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Direction</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'horizontal', label: 'Horizontal', icon: '→' },
                  { value: 'vertical', label: 'Vertical', icon: '↓' },
                  { value: 'diagonal', label: 'Diagonal', icon: '↘' },
                  { value: 'radial', label: 'Radial', icon: '◉' },
                ].map((dir) => (
                  <button
                    key={dir.value}
                    onClick={() => setBackgroundGradientDirection(dir.value as any)}
                    className={`p-2 rounded-lg border-2 text-center transition-all ${
                      backgroundGradientDirection === dir.value
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-lg mb-1">{dir.icon}</div>
                    <div className="text-xs font-medium">{dir.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="relative">
              <HexColorPicker 
                color={backgroundColor} 
                onChange={setBackgroundColor} 
                className="!w-full !h-48 rounded-lg shadow-sm"
                style={{ width: '100%' }}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Presets</p>
              <div className="grid grid-cols-6 gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color.value}
                    className="group relative aspect-square rounded-lg border-2 hover:scale-105 transition-all shadow-sm hover:shadow-md"
                    style={{ 
                      backgroundColor: color.value, 
                      borderColor: backgroundColor === color.value ? 'hsl(var(--primary))' : 'transparent'
                    }}
                    onClick={() => setBackgroundColor(color.value)}
                    aria-label={`Select ${color.name}`}
                    title={color.name}
                  >
                    {backgroundColor === color.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white shadow-lg" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg text-sm font-mono bg-background shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="#FFFFFF"
              />
              <div 
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded border shadow-sm"
                style={{ backgroundColor: backgroundColor }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
