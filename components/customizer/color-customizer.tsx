'use client'

import { useState } from 'react'
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
  const [activeTab, setActiveTab] = useState<'waveform' | 'background'>('waveform')
  
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
      const trimmed = stop.trim()
      // Match either "color percentage" or just "color"
      // Color can be hex, rgb(), rgba(), hsl(), etc.
      const parts = trimmed.match(/^(.+?)\s+([\d.]+%)$/)
      if (!parts) {
        // If no percentage found, assume it's just a color at position 0 or 1
        return { color: trimmed, position: 0 }
      }
      const color = parts[1].trim()
      const position = parseFloat(parts[2]) / 100
      return { color, position }
    })
    
    return stops.length >= 2 ? stops : [{ color: '#000000', position: 0 }, { color: '#FF0000', position: 1 }]
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('waveform')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'waveform'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Palette className="w-4 h-4" />
          Waveform
        </button>
        <button
          onClick={() => setActiveTab('background')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            activeTab === 'background'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Background
        </button>
      </div>

      {/* Waveform Tab Content */}
      {activeTab === 'waveform' && (
        <div className="space-y-4">
          <div className="w-full">
            <GradientPicker
              value={waveformUseGradient 
                ? stopsToGradientString(waveformGradientStops, waveformGradientDirection)
                : waveformColor
              }
              onChange={(value: string) => {
                if (value.includes('gradient')) {
                  const newStops = gradientStringToStops(value)
                  setWaveformGradientStops(newStops)
                  setWaveformUseGradient(true)
                } else {
                  setWaveformColor(value)
                  setWaveformUseGradient(false)
                }
              }}
            />
          </div>
          
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Gradient Presets</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Sunset', gradient: 'linear-gradient(90deg, #FF512F 0%, #DD2476 100%)' },
                { name: 'Ocean', gradient: 'linear-gradient(90deg, #2E3192 0%, #1BFFFF 100%)' },
                { name: 'Forest', gradient: 'linear-gradient(90deg, #134E5E 0%, #71B280 100%)' },
                { name: 'Fire', gradient: 'linear-gradient(90deg, #F00000 0%, #FFA500 100%)' },
                { name: 'Purple Haze', gradient: 'linear-gradient(90deg, #360033 0%, #0B8793 100%)' },
                { name: 'Cotton Candy', gradient: 'linear-gradient(90deg, #FFA6C9 0%, #89CFF0 100%)' },
              ].map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    const newStops = gradientStringToStops(preset.gradient)
                    setWaveformGradientStops(newStops)
                    setWaveformUseGradient(true)
                  }}
                  className="h-10 rounded-lg border-2 border-border hover:border-primary transition-all shadow-sm hover:shadow-md relative overflow-hidden group"
                  style={{ background: preset.gradient }}
                  title={preset.name}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="text-[10px] font-medium text-white drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">{preset.name}</span>
                  </div>
                </button>
              ))}
            </div>
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
        </div>
      )}

      {/* Background Tab Content */}
      {activeTab === 'background' && (
        <div className="space-y-4">
          <div className="w-full">
            <GradientPicker
              value={backgroundUseGradient 
                ? stopsToGradientString(backgroundGradientStops, backgroundGradientDirection)
                : backgroundColor
              }
              onChange={(value: string) => {
                if (value.includes('gradient')) {
                  const newStops = gradientStringToStops(value)
                  setBackgroundGradientStops(newStops)
                  setBackgroundUseGradient(true)
                } else {
                  setBackgroundColor(value)
                  setBackgroundUseGradient(false)
                }
              }}
            />
          </div>
          
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Gradient Presets</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Midnight', gradient: 'linear-gradient(180deg, #0F2027 0%, #203A43 50%, #2C5364 100%)' },
                { name: 'Dawn', gradient: 'linear-gradient(180deg, #FFEFBA 0%, #FFFFFF 100%)' },
                { name: 'Sky', gradient: 'linear-gradient(180deg, #E0EAFC 0%, #CFDEF3 100%)' },
                { name: 'Lavender', gradient: 'linear-gradient(180deg, #DDD6F3 0%, #FAACA8 100%)' },
                { name: 'Mint', gradient: 'linear-gradient(180deg, #AAFFA9 0%, #11FFBD 100%)' },
                { name: 'Peach', gradient: 'linear-gradient(180deg, #FFECD2 0%, #FCB69F 100%)' },
              ].map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    const newStops = gradientStringToStops(preset.gradient)
                    setBackgroundGradientStops(newStops)
                    setBackgroundUseGradient(true)
                  }}
                  className="h-10 rounded-lg border-2 border-border hover:border-primary transition-all shadow-sm hover:shadow-md relative overflow-hidden group"
                  style={{ background: preset.gradient }}
                  title={preset.name}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="text-[10px] font-medium text-gray-800 drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">{preset.name}</span>
                  </div>
                </button>
              ))}
            </div>
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
        </div>
      )}
    </div>
  )
}
