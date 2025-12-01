'use client'

import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { Type, Loader2, RotateCcw } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'
import { cn } from '@/lib/utils'

// Popular Google Fonts organized by style
const FONT_CATEGORIES = {
  'Modern': ['Inter', 'Montserrat', 'Poppins', 'Raleway'],
  'Classic': ['Playfair Display', 'Merriweather', 'Lora', 'Georgia'],
  'Bold': ['Bebas Neue', 'Oswald', 'Anton', 'Impact'],
  'Script': ['Dancing Script', 'Pacifico', 'Great Vibes', 'Caveat'],
}

const POSITION_PRESETS = [
  { label: 'Top', x: 50, y: 12 },
  { label: 'Center', x: 50, y: 50 },
  { label: 'Bottom', x: 50, y: 88 },
]

const COLOR_PRESETS = [
  '#000000', '#FFFFFF', '#EF4444', '#3B82F6', '#10B981', 
  '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'
]

export function TextCustomizer() {
  const audioFile = useCustomizerStore((state) => state.audioFile)
  const customText = useCustomizerStore((state) => state.customText)
  const textColor = useCustomizerStore((state) => state.textColor)
  const showText = useCustomizerStore((state) => state.showText)
  const textX = useCustomizerStore((state) => state.textX)
  const textY = useCustomizerStore((state) => state.textY)
  const fontSize = useCustomizerStore((state) => state.fontSize)
  const fontFamily = useCustomizerStore((state) => state.fontFamily)
  
  const setCustomText = useCustomizerStore((state) => state.setCustomText)
  const setTextColor = useCustomizerStore((state) => state.setTextColor)
  const setShowText = useCustomizerStore((state) => state.setShowText)
  const setTextX = useCustomizerStore((state) => state.setTextX)
  const setTextY = useCustomizerStore((state) => state.setTextY)
  const setFontSize = useCustomizerStore((state) => state.setFontSize)
  const setFontFamily = useCustomizerStore((state) => state.setFontFamily)

  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null)
  const [lastTranscribedFile, setLastTranscribedFile] = useState<File | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Load Google Font dynamically
  useEffect(() => {
    if (fontFamily && !document.querySelector(`link[href*="${fontFamily.replace(/ /g, '+')}"]`)) {
      const link = document.createElement('link')
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;700&display=swap`
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
  }, [fontFamily])

  // Auto-transcribe when audio file is uploaded
  useEffect(() => {
    if (audioFile && audioFile !== lastTranscribedFile && !isTranscribing) {
      detectSpeech()
    }
  }, [audioFile])

  const detectSpeech = async () => {
    if (!audioFile) {
      setTranscriptionError('No audio file uploaded')
      return
    }

    setIsTranscribing(true)
    setTranscriptionError(null)

    try {
      const formData = new FormData()
      formData.append('audio', audioFile)

      const response = await fetch('/api/transcribe-audio', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Transcription failed')
      }

      if (data.text) {
        setCustomText(data.text)
        setShowText(true)
        setLastTranscribedFile(audioFile)
      }
    } catch (error: any) {
      console.error('Transcription error:', error)
      setTranscriptionError(error.message || 'Failed to transcribe audio')
      setLastTranscribedFile(audioFile)
    } finally {
      setIsTranscribing(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Type className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-sm">Add Text Overlay</span>
        </div>
        <button
          onClick={() => setShowText(!showText)}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            showText ? 'bg-gray-900' : 'bg-gray-300'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm',
              showText ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>

      {/* Transcription Status */}
      {isTranscribing && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-700">Detecting speech from audio...</span>
        </div>
      )}

      {/* Transcription Error */}
      {transcriptionError && !isTranscribing && (
        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
          <p className="text-sm text-red-700">{transcriptionError}</p>
          <Button onClick={detectSpeech} variant="ghost" size="sm" className="mt-2 h-7 text-xs">
            Try Again
          </Button>
        </div>
      )}

      {showText && (
        <div className="space-y-5">
          {/* Message Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Message</label>
              {audioFile && !isTranscribing && (
                <button
                  onClick={detectSpeech}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Re-transcribe
                </button>
              )}
            </div>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all resize-none"
              placeholder="Enter your message..."
              rows={3}
            />
          </div>

          {/* Font Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Font Style</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(FONT_CATEGORIES).map(([category, fonts]) => (
                <div key={category} className="space-y-1">
                  <span className="text-[10px] text-gray-400 uppercase">{category}</span>
                  <div className="space-y-1">
                    {fonts.map((font) => (
                      <button
                        key={font}
                        onClick={() => setFontFamily(font)}
                        className={cn(
                          'w-full px-2 py-1.5 text-left text-sm rounded transition-all truncate',
                          fontFamily === font
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                        style={{ fontFamily: font }}
                      >
                        {font}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Size</label>
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{fontSize}px</span>
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
              min={24}
              max={400}
              step={4}
              className="w-full"
            />
          </div>

          {/* Position */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Position</label>
            <div className="flex gap-2">
              {POSITION_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => { setTextX(preset.x); setTextY(preset.y); }}
                  className={cn(
                    'flex-1 py-2 text-sm font-medium rounded-lg border-2 transition-all',
                    textY === preset.y && textX === 50
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            
            {/* Fine-tune controls */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Horizontal</span>
                  <span className="text-[10px] font-mono text-gray-400">{textX}%</span>
                </div>
                <Slider
                  value={[textX]}
                  onValueChange={(value) => setTextX(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Vertical</span>
                  <span className="text-[10px] font-mono text-gray-400">{textY}%</span>
                </div>
                <Slider
                  value={[textY]}
                  onValueChange={(value) => setTextY(value[0])}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Color</label>
            <div className="flex gap-1.5">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  onClick={() => setTextColor(color)}
                  className={cn(
                    'flex-1 aspect-square rounded-lg border-2 transition-all hover:scale-110',
                    textColor === color
                      ? 'border-gray-900 ring-2 ring-gray-900/20'
                      : 'border-gray-200 hover:border-gray-400'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className={cn(
                  'flex-1 aspect-square rounded-lg border-2 transition-all flex items-center justify-center text-xs font-bold',
                  showColorPicker
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-500 hover:border-gray-400'
                )}
              >
                +
              </button>
            </div>
            
            {showColorPicker && (
              <div className="pt-2 space-y-2">
                <HexColorPicker 
                  color={textColor} 
                  onChange={setTextColor} 
                  className="!w-full" 
                  style={{ height: '120px' }}
                />
                <input 
                  type="text"
                  value={textColor} 
                  onChange={(e) => setTextColor(e.target.value)}
                  placeholder="Hex color"
                  className="w-full px-3 py-1.5 text-sm font-mono border border-gray-200 rounded text-center"
                />
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Preview</label>
            <div 
              className="p-4 bg-gray-100 rounded-lg text-center overflow-hidden"
              style={{ 
                fontFamily: fontFamily,
                color: textColor,
                fontSize: Math.min(fontSize, 32) + 'px'
              }}
            >
              {customText || 'Your text here'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
