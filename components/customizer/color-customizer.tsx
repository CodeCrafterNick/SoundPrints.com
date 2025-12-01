'use client'

import { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { useCustomizerStore, type GradientStop } from '@/lib/stores/customizer-store'
import { Palette, Sparkles } from 'lucide-react'
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

const backgroundPresets = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Light', value: '#F3F4F6' },
  { name: 'Dark', value: '#1F2937' },
  { name: 'Black', value: '#000000' },
  { name: 'Cream', value: '#FEF3C7' },
  { name: 'Lavender', value: '#EDE9FE' },
  { name: 'Mint', value: '#D1FAE5' },
  { name: 'Rose', value: '#FCE7F3' },
]

const gradientPresets = [
  { name: 'Sunset', colors: ['#FF512F', '#DD2476'] },
  { name: 'Ocean', colors: ['#2E3192', '#1BFFFF'] },
  { name: 'Forest', colors: ['#134E5E', '#71B280'] },
  { name: 'Fire', colors: ['#F00000', '#FFA500'] },
  { name: 'Candy', colors: ['#FFA6C9', '#89CFF0'] },
  { name: 'Galaxy', colors: ['#360033', '#0B8793'] },
]

const bgGradientPresets = [
  { name: 'Midnight', colors: ['#0F2027', '#2C5364'] },
  { name: 'Dawn', colors: ['#FFEFBA', '#FFFFFF'] },
  { name: 'Sky', colors: ['#E0EAFC', '#CFDEF3'] },
  { name: 'Lavender', colors: ['#DDD6F3', '#FAACA8'] },
  { name: 'Mint', colors: ['#AAFFA9', '#11FFBD'] },
  { name: 'Peach', colors: ['#FFECD2', '#FCB69F'] },
]

export function ColorCustomizer() {
  const [activeSection, setActiveSection] = useState<'waveform' | 'background'>('waveform')
  
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

  const currentColor = activeSection === 'waveform' ? waveformColor : backgroundColor
  const currentSetColor = activeSection === 'waveform' ? setWaveformColor : setBackgroundColor
  const currentUseGradient = activeSection === 'waveform' ? waveformUseGradient : backgroundUseGradient
  const currentSetUseGradient = activeSection === 'waveform' ? setWaveformUseGradient : setBackgroundUseGradient
  const currentGradientStops = activeSection === 'waveform' ? waveformGradientStops : backgroundGradientStops
  const currentSetGradientStops = activeSection === 'waveform' ? setWaveformGradientStops : setBackgroundGradientStops
  const currentGradientDirection = activeSection === 'waveform' ? waveformGradientDirection : backgroundGradientDirection
  const currentSetGradientDirection = activeSection === 'waveform' ? setWaveformGradientDirection : setBackgroundGradientDirection
  const colorPresets = activeSection === 'waveform' ? waveformPresets : backgroundPresets
  const currentGradientPresets = activeSection === 'waveform' ? gradientPresets : bgGradientPresets

  return (
    <div className="space-y-4">
      {/* Section Toggle */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-lg">
        <button
          onClick={() => setActiveSection('waveform')}
          className={cn(
            'flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all',
            activeSection === 'waveform'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <Palette className="w-4 h-4" />
          Waveform
        </button>
        <button
          onClick={() => setActiveSection('background')}
          className={cn(
            'flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all',
            activeSection === 'background'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <Sparkles className="w-4 h-4" />
          Background
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            console.log('🔘 Solid Color clicked, activeSection:', activeSection)
            currentSetUseGradient(false)
          }}
          className={cn(
            'flex-1 py-2 text-sm font-medium rounded-lg transition-all border-2',
            !currentUseGradient
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          )}
        >
          Solid Color
        </button>
        <button
          onClick={() => {
            console.log('🔘 Gradient clicked, activeSection:', activeSection)
            currentSetUseGradient(true)
          }}
          className={cn(
            'flex-1 py-2 text-sm font-medium rounded-lg transition-all border-2',
            currentUseGradient
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          )}
        >
          Gradient
        </button>
      </div>

      {/* Color Selection */}
      {!currentUseGradient ? (
        <div className="space-y-4">
          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quick Colors</label>
            <div className="grid grid-cols-8 gap-1.5">
              {colorPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => currentSetColor(preset.value)}
                  className={cn(
                    'aspect-square rounded-lg border-2 transition-all hover:scale-110',
                    currentColor === preset.value
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
                color={currentColor} 
                onChange={currentSetColor} 
                className="!w-full" 
                style={{ height: '120px' }}
              />
              <div className="flex flex-col gap-2">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-inner"
                  style={{ backgroundColor: currentColor }}
                />
                <input 
                  type="text"
                  value={currentColor} 
                  onChange={(e) => currentSetColor(e.target.value)}
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
              {currentGradientPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    currentSetGradientStops([
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
                    style={{ backgroundColor: currentGradientStops[0]?.color || '#000000' }}
                  />
                  <span className="text-xs text-gray-500">Start</span>
                </div>
                <HexColorPicker 
                  color={currentGradientStops[0]?.color || '#000000'} 
                  onChange={(color) => {
                    const newStops = [...currentGradientStops]
                    newStops[0] = { ...newStops[0], color }
                    currentSetGradientStops(newStops)
                  }}
                  className="!w-full"
                  style={{ height: '100px' }}
                />
                <input 
                  type="text"
                  value={currentGradientStops[0]?.color || '#000000'} 
                  onChange={(e) => {
                    const newStops = [...currentGradientStops]
                    newStops[0] = { ...newStops[0], color: e.target.value }
                    currentSetGradientStops(newStops)
                  }}
                  className="w-full px-2 py-1 text-xs font-mono border border-gray-200 rounded text-center"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-5 h-5 rounded border border-gray-300"
                    style={{ backgroundColor: currentGradientStops[1]?.color || '#FF0000' }}
                  />
                  <span className="text-xs text-gray-500">End</span>
                </div>
                <HexColorPicker 
                  color={currentGradientStops[1]?.color || '#FF0000'} 
                  onChange={(color) => {
                    const newStops = [...currentGradientStops]
                    newStops[1] = { ...newStops[1], color }
                    currentSetGradientStops(newStops)
                  }}
                  className="!w-full"
                  style={{ height: '100px' }}
                />
                <input 
                  type="text"
                  value={currentGradientStops[1]?.color || '#FF0000'} 
                  onChange={(e) => {
                    const newStops = [...currentGradientStops]
                    newStops[1] = { ...newStops[1], color: e.target.value }
                    currentSetGradientStops(newStops)
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
                  onClick={() => currentSetGradientDirection(dir.value as 'horizontal' | 'vertical' | 'diagonal' | 'radial')}
                  className={cn(
                    'py-2 rounded-lg border-2 text-lg transition-all',
                    currentGradientDirection === dir.value
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
                background: currentGradientDirection === 'radial'
                  ? `radial-gradient(circle at center, ${currentGradientStops.map(s => `${s.color} ${s.position * 100}%`).join(', ')})`
                  : `linear-gradient(${
                      currentGradientDirection === 'horizontal' ? '90deg' : 
                      currentGradientDirection === 'vertical' ? '180deg' : '135deg'
                    }, ${currentGradientStops.map(s => `${s.color} ${s.position * 100}%`).join(', ')})`
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
