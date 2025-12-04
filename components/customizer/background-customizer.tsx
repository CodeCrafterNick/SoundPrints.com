'use client'

import { useCustomizerStore, type GradientStop } from '@/lib/stores/customizer-store'
import { Image as ImageIcon, Upload, Sparkles, Palette } from 'lucide-react'
import { useState, useRef, memo } from 'react'
import { HexColorPicker } from 'react-colorful'
import { cn } from '@/lib/utils'

type BackgroundMode = 'solid' | 'gradient' | 'image'

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

const bgGradientPresets = [
  { name: 'Midnight', colors: ['#0F2027', '#2C5364'] },
  { name: 'Dawn', colors: ['#FFEFBA', '#FFFFFF'] },
  { name: 'Sky', colors: ['#E0EAFC', '#CFDEF3'] },
  { name: 'Lavender', colors: ['#DDD6F3', '#FAACA8'] },
  { name: 'Mint', colors: ['#AAFFA9', '#11FFBD'] },
  { name: 'Peach', colors: ['#FFECD2', '#FCB69F'] },
]

const presetBackgrounds = [
  { id: 'gradient-waves', name: 'Gradient Waves', path: '/backgrounds/gradient-waves.svg' },
  { id: 'sunset-glow', name: 'Sunset Glow', path: '/backgrounds/sunset-glow.svg' },
  { id: 'ocean-dots', name: 'Ocean Dots', path: '/backgrounds/ocean-dots.svg' },
  { id: 'geometric-pink', name: 'Geometric Pink', path: '/backgrounds/geometric-pink.svg' },
  { id: 'mint-waves', name: 'Mint Waves', path: '/backgrounds/mint-waves.svg' },
  { id: 'radial-bubbles', name: 'Radial Bubbles', path: '/backgrounds/radial-bubbles.svg' },
  { id: 'dark-grid', name: 'Dark Grid', path: '/backgrounds/dark-grid.svg' },
  { id: 'aurora-waves', name: 'Aurora Waves', path: '/backgrounds/aurora-waves.svg' },
  { id: 'peach-squares', name: 'Peach Squares', path: '/backgrounds/peach-squares.svg' },
  { id: 'cosmic-stars', name: 'Cosmic Stars', path: '/backgrounds/cosmic-stars.svg' },
]

export const BackgroundCustomizer = memo(function BackgroundCustomizer() {
  const backgroundImage = useCustomizerStore((state) => state.backgroundImage)
  const backgroundFocalPoint = useCustomizerStore((state) => state.backgroundFocalPoint)
  const setBackgroundImage = useCustomizerStore((state) => state.setBackgroundImage)
  const setBackgroundFocalPoint = useCustomizerStore((state) => state.setBackgroundFocalPoint)
  
  // Background color state
  const backgroundColor = useCustomizerStore((state) => state.backgroundColor)
  const backgroundUseGradient = useCustomizerStore((state) => state.backgroundUseGradient)
  const backgroundGradientStops = useCustomizerStore((state) => state.backgroundGradientStops)
  const backgroundGradientDirection = useCustomizerStore((state) => state.backgroundGradientDirection)
  const setBackgroundColor = useCustomizerStore((state) => state.setBackgroundColor)
  const setBackgroundUseGradient = useCustomizerStore((state) => state.setBackgroundUseGradient)
  const setBackgroundGradientStops = useCustomizerStore((state) => state.setBackgroundGradientStops)
  const setBackgroundGradientDirection = useCustomizerStore((state) => state.setBackgroundGradientDirection)
  
  const [uploading, setUploading] = useState(false)
  const [showPresets, setShowPresets] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)
  
  // Determine active mode from current state
  const getActiveMode = (): BackgroundMode => {
    if (backgroundImage) return 'image'
    if (backgroundUseGradient) return 'gradient'
    return 'solid'
  }
  const [activeMode, setActiveMode] = useState<BackgroundMode>(getActiveMode)
  
  const handleModeChange = (mode: BackgroundMode) => {
    setActiveMode(mode)
    if (mode === 'solid') {
      setBackgroundUseGradient(false)
      setBackgroundImage(null)
      setBackgroundFocalPoint(null)
    } else if (mode === 'gradient') {
      setBackgroundUseGradient(true)
      setBackgroundImage(null)
      setBackgroundFocalPoint(null)
    }
    // For 'image' mode, we keep any existing image or let user upload
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (20MB limit)
    const maxSize = 20 * 1024 * 1024 // 20MB in bytes
    if (file.size > maxSize) {
      alert('Image file size must be less than 20MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    setUploading(true)
    
    // Convert to base64 for preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setBackgroundImage(reader.result as string)
      setBackgroundFocalPoint(null) // Reset focal point when new image uploaded
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleFocalPointClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageRef.current) return
    
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    console.log('🎯 Setting focal point:', { x, y })
    setBackgroundFocalPoint({ x, y })
  }

  const handlePresetSelect = (path: string) => {
    setBackgroundImage(path)
    setBackgroundFocalPoint(null)
    setShowPresets(false)
  }

  return (
    <div className="space-y-6">
      {/* Background Mode Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <label className="text-sm font-semibold">Background</label>
        </div>

        {/* Mode Toggle - 3 tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => handleModeChange('solid')}
            className={cn(
              'flex-1 py-2 text-sm font-medium rounded-lg transition-all border-2',
              activeMode === 'solid'
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            )}
          >
            Solid
          </button>
          <button
            onClick={() => handleModeChange('gradient')}
            className={cn(
              'flex-1 py-2 text-sm font-medium rounded-lg transition-all border-2',
              activeMode === 'gradient'
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            )}
          >
            Gradient
          </button>
          <button
            onClick={() => handleModeChange('image')}
            className={cn(
              'flex-1 py-2 text-sm font-medium rounded-lg transition-all border-2',
              activeMode === 'image'
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            )}
          >
            Image
          </button>
        </div>

        {/* Solid Color Tab Content */}
        {activeMode === 'solid' && (
          <div className="space-y-4">
            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quick Colors</label>
              <div className="grid grid-cols-8 gap-1.5">
                {backgroundPresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setBackgroundColor(preset.value)}
                    className={cn(
                      'aspect-square rounded-lg border-2 transition-all hover:scale-110',
                      backgroundColor === preset.value
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
                  color={backgroundColor} 
                  onChange={setBackgroundColor} 
                  className="!w-full" 
                  style={{ height: '120px' }}
                />
                <div className="flex flex-col gap-2">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-inner"
                    style={{ backgroundColor: backgroundColor }}
                  />
                  <input 
                    type="text"
                    value={backgroundColor} 
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 px-1 py-1 text-[10px] font-mono border border-gray-200 rounded text-center bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gradient Tab Content */}
        {activeMode === 'gradient' && (
          <div className="space-y-4">
            {/* Gradient Presets */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gradient Presets</label>
              <div className="grid grid-cols-3 gap-2">
                {bgGradientPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setBackgroundGradientStops([
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
                      style={{ backgroundColor: backgroundGradientStops[0]?.color || '#000000' }}
                    />
                    <span className="text-xs text-gray-500">Start</span>
                  </div>
                  <HexColorPicker 
                    color={backgroundGradientStops[0]?.color || '#000000'} 
                    onChange={(color) => {
                      const newStops = [...backgroundGradientStops]
                      newStops[0] = { ...newStops[0], color }
                      setBackgroundGradientStops(newStops)
                    }}
                    className="!w-full"
                    style={{ height: '100px' }}
                  />
                  <input 
                    type="text"
                    value={backgroundGradientStops[0]?.color || '#000000'} 
                    onChange={(e) => {
                      const newStops = [...backgroundGradientStops]
                      newStops[0] = { ...newStops[0], color: e.target.value }
                      setBackgroundGradientStops(newStops)
                    }}
                    className="w-full px-2 py-1 text-xs font-mono border border-gray-200 rounded text-center"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-5 h-5 rounded border border-gray-300"
                      style={{ backgroundColor: backgroundGradientStops[1]?.color || '#FF0000' }}
                    />
                    <span className="text-xs text-gray-500">End</span>
                  </div>
                  <HexColorPicker 
                    color={backgroundGradientStops[1]?.color || '#FF0000'} 
                    onChange={(color) => {
                      const newStops = [...backgroundGradientStops]
                      newStops[1] = { ...newStops[1], color }
                      setBackgroundGradientStops(newStops)
                    }}
                    className="!w-full"
                    style={{ height: '100px' }}
                  />
                  <input 
                    type="text"
                    value={backgroundGradientStops[1]?.color || '#FF0000'} 
                    onChange={(e) => {
                      const newStops = [...backgroundGradientStops]
                      newStops[1] = { ...newStops[1], color: e.target.value }
                      setBackgroundGradientStops(newStops)
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
                    onClick={() => setBackgroundGradientDirection(dir.value as 'horizontal' | 'vertical' | 'diagonal' | 'radial')}
                    className={cn(
                      'py-2 rounded-lg border-2 text-lg transition-all',
                      backgroundGradientDirection === dir.value
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
                  background: backgroundGradientDirection === 'radial'
                    ? `radial-gradient(circle at center, ${backgroundGradientStops.map(s => `${s.color} ${s.position * 100}%`).join(', ')})`
                    : `linear-gradient(${
                        backgroundGradientDirection === 'horizontal' ? '90deg' : 
                        backgroundGradientDirection === 'vertical' ? '180deg' : '135deg'
                      }, ${backgroundGradientStops.map(s => `${s.color} ${s.position * 100}%`).join(', ')})`
                }}
              />
            </div>
          </div>
        )}

        {/* Image Tab Content */}
        {activeMode === 'image' && (
          <div className="space-y-4">
            {/* Preset Backgrounds Toggle */}
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="w-full py-2 px-4 border-2 border-dashed rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {showPresets ? 'Hide' : 'Show'} Preset Backgrounds
            </button>

            {/* Preset Backgrounds Grid */}
            {showPresets && (
              <div className="grid grid-cols-2 gap-3">
                {presetBackgrounds.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.path)}
                    className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all hover:scale-105 hover:border-primary ${
                      backgroundImage === preset.path ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                    }`}
                  >
                    <img
                      src={preset.path}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-xs font-medium text-white">{preset.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Upload Area */}
            <div className="space-y-4">
              <label className="block">
                <div className={`
                  relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-all hover:border-primary hover:bg-primary/5
                  ${backgroundImage ? 'border-primary bg-primary/5' : 'border-border'}
                `}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  
                  {uploading ? (
                    <div className="space-y-2">
                      <div className="animate-spin mx-auto w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    </div>
                  ) : backgroundImage ? (
                    <div className="space-y-3">
                      <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden border">
                        <img
                          src={backgroundImage}
                          alt="Background preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-primary">Background image uploaded</p>
                        <p className="text-xs text-muted-foreground">Click to change image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Upload background image</p>
                        <p className="text-xs text-muted-foreground">
                          Wedding photos, concert pics, or any image
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </label>

              {backgroundImage && (
                <>
                  {/* Focal Point Picker */}
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-muted-foreground">Focal Point</label>
                    
                    <div className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden border-2 border-primary">
                        <img
                          ref={imageRef}
                          src={backgroundImage}
                          alt="Click to set focal point"
                          className="w-full h-auto object-contain cursor-crosshair"
                          onClick={handleFocalPointClick}
                        />
                        {backgroundFocalPoint && (
                          <div
                            className="absolute w-8 h-8 -ml-4 -mt-4 pointer-events-none"
                            style={{
                              left: `${backgroundFocalPoint.x}%`,
                              top: `${backgroundFocalPoint.y}%`,
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
                        {backgroundFocalPoint 
                          ? 'Click on the image to change the focal point' 
                          : 'Click on the image where you want to center the view'}
                      </p>
                    </div>
                  </div>

                  {/* Remove Image Button */}
                  <button
                    onClick={() => {
                      setBackgroundImage(null)
                      setBackgroundFocalPoint(null)
                    }}
                    className="w-full py-2 px-4 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors text-sm font-medium"
                  >
                    Remove Background Image
                  </button>
                </>
              )}
            </div>

            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold">💡 Tips</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Use high-resolution images for best print quality</li>
                <li>Wedding photos and concert images work great</li>
                <li>Position controls help focus on important parts</li>
                <li>Recommended: Images with good contrast</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})
