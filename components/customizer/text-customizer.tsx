'use client'

import { useCustomizerStore, type GradientStop } from '@/lib/stores/customizer-store'
import { Type, Move, Loader2 } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import GradientPicker from 'react-best-gradient-color-picker'

// Popular Google Fonts
const GOOGLE_FONTS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Oswald',
  'Raleway',
  'Poppins',
  'Playfair Display',
  'Merriweather',
  'Bebas Neue',
  'Dancing Script',
  'Pacifico',
  'Caveat',
  'Great Vibes',
]

export function TextCustomizer() {
  const audioFile = useCustomizerStore((state) => state.audioFile)
  const customText = useCustomizerStore((state) => state.customText)
  const textColor = useCustomizerStore((state) => state.textColor)
  const textUseGradient = useCustomizerStore((state) => state.textUseGradient)
  const textGradientStops = useCustomizerStore((state) => state.textGradientStops)
  const textGradientDirection = useCustomizerStore((state) => state.textGradientDirection)
  const showText = useCustomizerStore((state) => state.showText)
  const textX = useCustomizerStore((state) => state.textX)
  const textY = useCustomizerStore((state) => state.textY)
  const fontSize = useCustomizerStore((state) => state.fontSize)
  const fontFamily = useCustomizerStore((state) => state.fontFamily)
  
  const setCustomText = useCustomizerStore((state) => state.setCustomText)
  const setTextColor = useCustomizerStore((state) => state.setTextColor)
  const setTextUseGradient = useCustomizerStore((state) => state.setTextUseGradient)
  const setTextGradientStops = useCustomizerStore((state) => state.setTextGradientStops)
  const setTextGradientDirection = useCustomizerStore((state) => state.setTextGradientDirection)
  const setShowText = useCustomizerStore((state) => state.setShowText)
  const setTextX = useCustomizerStore((state) => state.setTextX)
  const setTextY = useCustomizerStore((state) => state.setTextY)
  const setFontSize = useCustomizerStore((state) => state.setFontSize)
  const setFontFamily = useCustomizerStore((state) => state.setFontFamily)

  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null)
  const [lastTranscribedFile, setLastTranscribedFile] = useState<File | null>(null)

  // Convert our GradientStop[] to CSS gradient string for the gradient picker
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
    if (!match) return [{ color: '#000000', position: 0 }, { color: '#FFFFFF', position: 1 }]
    
    const stopsString = match[1]
    const stops = stopsString.split(/,\s*(?![^(]*\))/).map(stop => {
      const trimmed = stop.trim()
      const parts = trimmed.match(/^(.+?)\s+([\d.]+%)$/)
      if (!parts) {
        return { color: trimmed, position: 0 }
      }
      const color = parts[1].trim()
      const position = parseFloat(parts[2]) / 100
      return { color, position }
    })
    
    return stops.length >= 2 ? stops : [{ color: '#000000', position: 0 }, { color: '#FFFFFF', position: 1 }]
  }

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
    <div className="space-y-6">
      {/* Transcription Status */}
      {isTranscribing && (
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Detecting speech from audio...
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                This may take a moment depending on audio length
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transcription Error */}
      {transcriptionError && !isTranscribing && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
          <p className="text-sm font-medium text-red-900 dark:text-red-100">
            {transcriptionError}
          </p>
          <Button
            onClick={detectSpeech}
            variant="ghost"
            size="sm"
            className="mt-2 h-7 text-xs"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Show Text Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-muted-foreground" />
          <label className="text-sm font-semibold">Add Text</label>
        </div>
        <button
          onClick={() => setShowText(!showText)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            showText ? 'bg-primary' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showText ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {showText && (
        <div className="space-y-6">
          {/* Message */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Message</label>
              {audioFile && !isTranscribing && (
                <Button
                  onClick={detectSpeech}
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                >
                  Re-transcribe
                </Button>
              )}
            </div>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="Enter text or upload audio to auto-detect..."
              rows={5}
            />
          </div>

          {/* Text Position */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Move className="w-4 h-4 text-muted-foreground" />
              <label className="text-xs font-medium text-muted-foreground">Position</label>
            </div>
            
            {/* X Position */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Horizontal</span>
                <span className="text-xs font-mono text-muted-foreground">{textX}%</span>
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

            {/* Y Position */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Vertical</span>
                <span className="text-xs font-mono text-muted-foreground">{textY}%</span>
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
            
            {/* Position Presets */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <button
                onClick={() => { setTextX(50); setTextY(15); }}
                className="px-3 py-2 text-xs font-medium rounded-lg border-2 border-border hover:border-primary transition-all"
              >
                Top Center
              </button>
              <button
                onClick={() => { setTextX(50); setTextY(50); }}
                className="px-3 py-2 text-xs font-medium rounded-lg border-2 border-border hover:border-primary transition-all"
              >
                Center
              </button>
              <button
                onClick={() => { setTextX(50); setTextY(85); }}
                className="px-3 py-2 text-xs font-medium rounded-lg border-2 border-border hover:border-primary transition-all"
              >
                Bottom Center
              </button>
              <button
                onClick={() => { setTextX(15); setTextY(50); }}
                className="px-3 py-2 text-xs font-medium rounded-lg border-2 border-border hover:border-primary transition-all"
              >
                Left
              </button>
              <button
                onClick={() => { setTextX(85); setTextY(50); }}
                className="px-3 py-2 text-xs font-medium rounded-lg border-2 border-border hover:border-primary transition-all"
              >
                Right
              </button>
              <button
                onClick={() => { setTextX(15); setTextY(15); }}
                className="px-3 py-2 text-xs font-medium rounded-lg border-2 border-border hover:border-primary transition-all"
              >
                Top Left
              </button>
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Font</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-background shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              {GOOGLE_FONTS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Font Size</label>
              <span className="text-xs font-mono text-muted-foreground">{fontSize}px</span>
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
              min={12}
              max={120}
              step={1}
              className="w-full"
            />
          </div>

          {/* Text Color */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Text Color</label>
              <button
                onClick={() => setTextUseGradient(!textUseGradient)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  textUseGradient
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:border-primary'
                }`}
              >
                {textUseGradient ? 'Gradient' : 'Solid'}
              </button>
            </div>
            
            {textUseGradient ? (
              <div className="space-y-2">
                <GradientPicker
                  value={stopsToGradientString(textGradientStops, textGradientDirection)}
                  onChange={(gradientStr) => {
                    const stops = gradientStringToStops(gradientStr)
                    setTextGradientStops(stops)
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setTextGradientDirection('horizontal')}
                    className={`flex-1 px-2 py-1.5 text-xs rounded border transition-colors ${
                      textGradientDirection === 'horizontal'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    Horizontal
                  </button>
                  <button
                    onClick={() => setTextGradientDirection('vertical')}
                    className={`flex-1 px-2 py-1.5 text-xs rounded border transition-colors ${
                      textGradientDirection === 'vertical'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    Vertical
                  </button>
                  <button
                    onClick={() => setTextGradientDirection('diagonal')}
                    className={`flex-1 px-2 py-1.5 text-xs rounded border transition-colors ${
                      textGradientDirection === 'diagonal'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    Diagonal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono bg-background shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="#000000"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
