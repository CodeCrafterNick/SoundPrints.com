'use client'

import { memo } from 'react'
import { HexColorPicker } from 'react-colorful'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

const waveformPresets = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Crimson', value: '#DC2626' },
  { name: 'Ocean', value: '#0EA5E9' },
  { name: 'Forest', value: '#059669' },
  { name: 'Purple', value: '#7C3AED' },
  { name: 'Gold', value: '#EAB308' },
  { name: 'Pink', value: '#EC4899' },
]

const gradientPresets = [
  { name: 'Sunset', colors: ['#FF512F', '#DD2476'] },
  { name: 'Ocean', colors: ['#2E3192', '#1BFFFF'] },
  { name: 'Forest', colors: ['#134E5E', '#71B280'] },
  { name: 'Fire', colors: ['#F00000', '#FFA500'] },
  { name: 'Candy', colors: ['#FFA6C9', '#89CFF0'] },
  { name: 'Galaxy', colors: ['#360033', '#0B8793'] },
]

export const ColorCustomizer = memo(function ColorCustomizer() {
  const waveformColor = useCustomizerStore((state) => state.waveformColor)
  const waveformUseGradient = useCustomizerStore((state) => state.waveformUseGradient)
  const waveformGradientStops = useCustomizerStore((state) => state.waveformGradientStops)
  const waveformGradientDirection = useCustomizerStore((state) => state.waveformGradientDirection)
  const setWaveformColor = useCustomizerStore((state) => state.setWaveformColor)
  const setWaveformUseGradient = useCustomizerStore((state) => state.setWaveformUseGradient)
  const setWaveformGradientStops = useCustomizerStore((state) => state.setWaveformGradientStops)
  const setWaveformGradientDirection = useCustomizerStore((state) => state.setWaveformGradientDirection)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium">Waveform Color</span>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setWaveformUseGradient(false)}
          className={cn(
            'flex-1 py-2 text-sm font-medium rounded-lg transition-all border-2',
            !waveformUseGradient
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          )}
        >
          Solid Color
        </button>
        <button
          onClick={() => setWaveformUseGradient(true)}
          className={cn(
            'flex-1 py-2 text-sm font-medium rounded-lg transition-all border-2',
            waveformUseGradient
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          )}
        >
          Gradient
        </button>
      </div>

      {/* Color Selection */}
      {!waveformUseGradient ? (
        <div className="space-y-4">
          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quick Colors</label>
            <div className="grid grid-cols-8 gap-1.5">
              {waveformPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setWaveformColor(preset.value)}
                  className={cn(
                    'aspect-square rounded-lg border-2 transition-all hover:scale-110',
                    waveformColor === preset.value
                      ? 'border-gray-900 ring-2 ring-gray-900/20'
                      : 'border-gray-200 hover:border-gray-400'
                  )}
                  style={{ backgroundColor: preset.value }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Custom Color</label>
            <div className="flex gap-3 items-start">
              <HexColorPicker 
                color={waveformColor} 
                onChange={setWaveformColor} 
                className="!w-full" 
                style={{ height: '120px' }}
              />
              <div className="flex flex-col gap-2">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-inner"
                  style={{ backgroundColor: waveformColor }}
                />
                <input 
                  type="text"
                  value={waveformColor} 
                  onChange={(e) => setWaveformColor(e.target.value)}
                  className="w-12 px-1 py-1 text-[10px] font-mono border border-gray-200 rounded text-center bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Gradient Presets */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gradient Presets</label>
            <div className="grid grid-cols-3 gap-2">
              {gradientPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setWaveformGradientStops([
                      { color: preset.colors[0], position: 0 },
                      { color: preset.colors[1], position: 1 }
                    ])
                  }}
                  className="h-12 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-all overflow-hidden group relative"
                  style={{ background: `linear-gradient(90deg, ${preset.colors[0]} 0%, ${preset.colors[1]} 100%)` }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Gradient Color Pickers */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Custom Colors</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-5 h-5 rounded border border-gray-300"
                    style={{ backgroundColor: waveformGradientStops[0]?.color || '#000000' }}
                  />
                  <span className="text-xs text-gray-500">Start</span>
                </div>
                <HexColorPicker 
                  color={waveformGradientStops[0]?.color || '#000000'} 
                  onChange={(color) => {
                    const newStops = [...waveformGradientStops]
                    newStops[0] = { ...newStops[0], color }
                    setWaveformGradientStops(newStops)
                  }}
                  className="!w-full"
                  style={{ height: '100px' }}
                />
                <input 
                  type="text"
                  value={waveformGradientStops[0]?.color || '#000000'} 
                  onChange={(e) => {
                    const newStops = [...waveformGradientStops]
                    newStops[0] = { ...newStops[0], color: e.target.value }
                    setWaveformGradientStops(newStops)
                  }}
                  className="w-full px-2 py-1 text-xs font-mono border border-gray-200 rounded text-center"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-5 h-5 rounded border border-gray-300"
                    style={{ backgroundColor: waveformGradientStops[1]?.color || '#FF0000' }}
                  />
                  <span className="text-xs text-gray-500">End</span>
                </div>
                <HexColorPicker 
                  color={waveformGradientStops[1]?.color || '#FF0000'} 
                  onChange={(color) => {
                    const newStops = [...waveformGradientStops]
                    newStops[1] = { ...newStops[1], color }
                    setWaveformGradientStops(newStops)
                  }}
                  className="!w-full"
                  style={{ height: '100px' }}
                />
                <input 
                  type="text"
                  value={waveformGradientStops[1]?.color || '#FF0000'} 
                  onChange={(e) => {
                    const newStops = [...waveformGradientStops]
                    newStops[1] = { ...newStops[1], color: e.target.value }
                    setWaveformGradientStops(newStops)
                  }}
                  className="w-full px-2 py-1 text-xs font-mono border border-gray-200 rounded text-center"
                />
              </div>
            </div>
          </div>

          {/* Gradient Direction */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Direction</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'horizontal', label: '→' },
                { value: 'vertical', label: '↓' },
                { value: 'diagonal', label: '↘' },
                { value: 'radial', label: '◉' },
              ].map((dir) => (
                <button
                  key={dir.value}
                  onClick={() => setWaveformGradientDirection(dir.value as 'horizontal' | 'vertical' | 'diagonal' | 'radial')}
                  className={cn(
                    'py-2 rounded-lg border-2 text-lg transition-all',
                    waveformGradientDirection === dir.value
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  )}
                >
                  {dir.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Preview</label>
            <div 
              className="h-10 rounded-lg border-2 border-gray-200"
              style={{ 
                background: waveformGradientDirection === 'radial'
                  ? `radial-gradient(circle at center, ${waveformGradientStops.map(s => `${s.color} ${s.position * 100}%`).join(', ')})`
                  : `linear-gradient(${
                      waveformGradientDirection === 'horizontal' ? '90deg' : 
                      waveformGradientDirection === 'vertical' ? '180deg' : '135deg'
                    }, ${waveformGradientStops.map(s => `${s.color} ${s.position * 100}%`).join(', ')})`
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
})
