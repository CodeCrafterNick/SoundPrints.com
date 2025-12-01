'use client'

import { useCustomizerStore, type ArtisticTextStyle } from '@/lib/stores/customizer-store'
import { MessageSquare, Sparkles, Type, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useState, useEffect } from 'react'

const artisticTextStyles: { value: ArtisticTextStyle; label: string; description: string }[] = [
  { value: 'none', label: 'None', description: 'No artistic text' },
  { value: 'wordcloud', label: 'Word Cloud', description: 'Classic word cloud layout' },
  { value: 'spiral', label: 'Spiral', description: 'Words in spiral pattern' },
  { value: 'wave', label: 'Wave', description: 'Flowing wave pattern' },
  { value: 'circular', label: 'Circular', description: 'Circular arrangement' },
  { value: 'scattered', label: 'Scattered', description: 'Random artistic scatter' },
]

export function ArtisticTextCustomizer() {
  const audioFile = useCustomizerStore((state) => state.audioFile)
  const detectedWords = useCustomizerStore((state) => state.detectedWords)
  const showArtisticText = useCustomizerStore((state) => state.showArtisticText)
  const artisticTextStyle = useCustomizerStore((state) => state.artisticTextStyle)
  const artisticTextColor = useCustomizerStore((state) => state.artisticTextColor)
  const artisticTextOpacity = useCustomizerStore((state) => state.artisticTextOpacity)
  
  const setDetectedWords = useCustomizerStore((state) => state.setDetectedWords)
  const setShowArtisticText = useCustomizerStore((state) => state.setShowArtisticText)
  const setArtisticTextStyle = useCustomizerStore((state) => state.setArtisticTextStyle)
  const setArtisticTextColor = useCustomizerStore((state) => state.setArtisticTextColor)
  const setArtisticTextOpacity = useCustomizerStore((state) => state.setArtisticTextOpacity)

  const [textInput, setTextInput] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null)
  const [lastTranscribedFile, setLastTranscribedFile] = useState<File | null>(null)
  const [tempColor, setTempColor] = useState(artisticTextColor)
  const [tempOpacity, setTempOpacity] = useState(artisticTextOpacity)

  // Sync temp values when store values change
  useEffect(() => {
    setTempColor(artisticTextColor)
  }, [artisticTextColor])

  useEffect(() => {
    setTempOpacity(artisticTextOpacity)
  }, [artisticTextOpacity])

  // Auto-detect when audio file is uploaded (only once per unique file)
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
        setTextInput(data.text)
        setShowInput(true) // Show the textarea with detected text
        setLastTranscribedFile(audioFile)
      }
    } catch (error: any) {
      console.error('Transcription error:', error)
      setTranscriptionError(error.message || 'Failed to transcribe audio')
      setLastTranscribedFile(audioFile) // Don't retry on error
    } finally {
      setIsTranscribing(false)
    }
  }

  const processText = (text?: string) => {
    const textToProcess = text || textInput
    if (!textToProcess.trim()) return

    // Split into words and filter out empty strings
    // Keep numbers with decimals intact (e.g., 95.9)
    const words = textToProcess
      .toLowerCase()
      .replace(/[^\w\s.]/g, ' ') // Remove punctuation but keep periods for decimals
      .split(/\s+/)
      .filter((w: string) => w.length > 0) // Keep all words, even short ones

    console.log('Generated artistic words:', words)
    setDetectedWords(words)
    setShowArtisticText(true)
    console.log('Show artistic text set to:', true, 'detectedWords count:', words.length)
    setShowInput(false)
    console.log('showInput set to false')
  }

  const clearWords = () => {
    setDetectedWords([])
    setShowArtisticText(false)
    setTextInput('')
    setLastTranscribedFile(null)
    setTranscriptionError(null)
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

      {/* Text Input Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <label className="text-sm font-semibold">Artistic Text</label>
          </div>
          {!isTranscribing && audioFile && audioFile !== lastTranscribedFile && (
            <Button
              onClick={detectSpeech}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Auto-Detect
            </Button>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground">
          Speech is automatically detected from your audio. Review and edit the text before generating.
        </p>
        
        {!showInput && detectedWords.length === 0 && !isTranscribing && audioFile && textInput.length === 0 && (
          <div className="p-3 rounded-lg bg-muted/50 border border-dashed">
            <p className="text-xs text-center text-muted-foreground">
              Waiting for automatic speech detection...
            </p>
          </div>
        )}
        
        {!showInput && detectedWords.length === 0 && !isTranscribing && !audioFile && (
          <div className="p-3 rounded-lg bg-muted/50 border border-dashed">
            <p className="text-xs text-center text-muted-foreground">
              Upload an audio file to begin
            </p>
          </div>
        )}
        
        {showInput && (
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Detected Text</label>
                <span className="text-xs text-muted-foreground">
                  {textInput.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Edit the detected text or paste your own lyrics..."
                className="w-full h-40 p-3 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => processText()}
                disabled={!textInput.trim()}
                className="flex-1"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Artistic Text
              </Button>
              <Button
                onClick={() => {
                  setShowInput(false)
                  setTextInput('')
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {detectedWords.length > 0 && !showInput && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium">Artistic Words ({detectedWords.length}):</p>
                <div className="flex gap-1">
                  <Button
                    onClick={() => setShowInput(true)}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    Edit Text
                  </Button>
                  <Button
                    onClick={clearWords}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {detectedWords.slice(0, 20).map((word, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 bg-background rounded-md"
                  >
                    {word}
                  </span>
                ))}
                {detectedWords.length > 20 && (
                  <span className="text-xs px-2 py-1 text-muted-foreground">
                    +{detectedWords.length - 20} more
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {detectedWords.length > 0 && (
        <>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showArtisticText"
                checked={showArtisticText}
                onChange={(e) => setShowArtisticText(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="showArtisticText" className="text-sm font-medium">
                Show Artistic Text Overlay
              </label>
            </div>
          </div>
          
          {showArtisticText && (
            <>
              <div className="space-y-3">
                <label className="text-sm font-semibold">Text Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {artisticTextStyles.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => setArtisticTextStyle(style.value)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        artisticTextStyle === style.value
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
              
              <div className="space-y-3">
                <label className="text-sm font-semibold">Text Color</label>
                <input
                  type="color"
                  value={tempColor}
                  onChange={(e) => setTempColor(e.target.value)}
                  onBlur={(e) => setArtisticTextColor(e.target.value)}
                  onMouseUp={(e) => setArtisticTextColor((e.target as HTMLInputElement).value)}
                  className="w-full h-10 rounded-lg border border-input cursor-pointer"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Opacity</label>
                  <span className="text-xs font-mono text-muted-foreground">
                    {Math.round(tempOpacity * 100)}%
                  </span>
                </div>
                <Slider
                  value={[tempOpacity * 100]}
                  onValueChange={(value) => setTempOpacity(value[0] / 100)}
                  onValueCommit={(value) => setArtisticTextOpacity(value[0] / 100)}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
