'use client'

import { useCustomizerStore, type TextElement } from '@/lib/stores/customizer-store'
import { Type, Loader2, RotateCcw, Plus, Trash2, Copy, Eye, EyeOff, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { useState, useEffect, memo } from 'react'
import { HexColorPicker } from 'react-colorful'
import { cn } from '@/lib/utils'

// Popular Google Fonts organized by style
const FONT_CATEGORIES = {
  'Modern': ['Inter', 'Montserrat', 'Poppins', 'Raleway'],
  'Classic': ['Playfair Display', 'Merriweather', 'Lora', 'Georgia'],
  'Bold': ['Bebas Neue', 'Oswald', 'Anton', 'Impact'],
  'Script': ['Dancing Script', 'Pacifico', 'Great Vibes', 'Caveat'],
}

const COLOR_PRESETS = [
  '#000000', '#FFFFFF', '#EF4444', '#3B82F6', '#10B981', 
  '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'
]

const TextCustomizerBase = memo(function TextCustomizer() {
  const audioFile = useCustomizerStore((state) => state.audioFile)
  
  // Multiple text elements
  const textElements = useCustomizerStore((state) => state.textElements)
  const selectedTextElementId = useCustomizerStore((state) => state.selectedTextElementId)
  const addTextElement = useCustomizerStore((state) => state.addTextElement)
  const removeTextElement = useCustomizerStore((state) => state.removeTextElement)
  const updateTextElement = useCustomizerStore((state) => state.updateTextElement)
  const selectTextElement = useCustomizerStore((state) => state.selectTextElement)
  const duplicateTextElement = useCustomizerStore((state) => state.duplicateTextElement)

  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null)
  const [lastTranscribedFile, setLastTranscribedFile] = useState<File | null>(null)
  const [expandedElementId, setExpandedElementId] = useState<string | null>(null)
  const [showColorPickerFor, setShowColorPickerFor] = useState<string | null>(null)

  // Load Google Fonts for all text elements
  useEffect(() => {
    const loadedFonts = new Set<string>()
    textElements.forEach((element) => {
      if (element.fontFamily && !loadedFonts.has(element.fontFamily)) {
        if (!document.querySelector(`link[href*="${element.fontFamily.replace(/ /g, '+')}"`)) {
          const link = document.createElement('link')
          link.href = `https://fonts.googleapis.com/css2?family=${element.fontFamily.replace(/ /g, '+')}:wght@400;700&display=swap`
          link.rel = 'stylesheet'
          document.head.appendChild(link)
        }
        loadedFonts.add(element.fontFamily)
      }
    })
  }, [textElements])

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
        // Add as a new text element
        addTextElement()
        // Get the newly added element and update its text
        setTimeout(() => {
          const elements = useCustomizerStore.getState().textElements
          const lastElement = elements[elements.length - 1]
          if (lastElement) {
            updateTextElement(lastElement.id, { text: data.text })
            setExpandedElementId(lastElement.id)
          }
        }, 0)
        setLastTranscribedFile(audioFile)
      }
    } catch (error: unknown) {
      console.error('Transcription error:', error)
      setTranscriptionError(error instanceof Error ? error.message : 'Failed to transcribe audio')
      setLastTranscribedFile(audioFile)
    } finally {
      setIsTranscribing(false)
    }
  }

  // Auto-expand first element when adding
  const handleAddTextElement = () => {
    addTextElement()
    setTimeout(() => {
      const elements = useCustomizerStore.getState().textElements
      const lastElement = elements[elements.length - 1]
      if (lastElement) {
        setExpandedElementId(lastElement.id)
        selectTextElement(lastElement.id)
      }
    }, 0)
  }

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium">Text Elements</span>
          <span className="text-xs text-gray-400">({textElements.length})</span>
        </div>
        <button
          onClick={handleAddTextElement}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Text
        </button>
      </div>

      {/* Transcription Options */}
      {audioFile && (
        <div className="flex items-center gap-2">
          <button
            onClick={detectSpeech}
            disabled={isTranscribing}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-all w-full justify-center",
              isTranscribing 
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            )}
          >
            {isTranscribing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Detecting speech...
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                Transcribe Audio to Text
              </>
            )}
          </button>
        </div>
      )}

      {/* Transcription Error */}
      {transcriptionError && !isTranscribing && (
        <div className="p-2 bg-red-50 rounded-lg border border-red-100">
          <p className="text-xs text-red-700">{transcriptionError}</p>
        </div>
      )}

      {/* Text Elements List */}
      {textElements.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Type className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-1">No text elements yet</p>
          <p className="text-xs text-gray-400 mb-3">Add text to customize your design</p>
          <button
            onClick={handleAddTextElement}
            className="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Add Your First Text
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {textElements.map((element, index) => (
            <TextElementCard
              key={element.id}
              element={element}
              index={index}
              isSelected={selectedTextElementId === element.id}
              isExpanded={expandedElementId === element.id}
              showColorPicker={showColorPickerFor === element.id}
              onSelect={() => selectTextElement(element.id)}
              onToggleExpand={() => {
                selectTextElement(element.id)
                setExpandedElementId(expandedElementId === element.id ? null : element.id)
              }}
              onToggleColorPicker={() => {
                setShowColorPickerFor(showColorPickerFor === element.id ? null : element.id)
              }}
              onUpdate={(updates) => updateTextElement(element.id, updates)}
              onDuplicate={() => duplicateTextElement(element.id)}
              onDelete={() => removeTextElement(element.id)}
            />
          ))}
        </div>
      )}

      {/* Help Text */}
      {textElements.length > 0 && (
        <p className="text-[10px] text-gray-400 text-center">
          Tip: Drag text directly on the canvas to reposition
        </p>
      )}
    </div>
  )
})

// Separate component for each text element card
interface TextElementCardProps {
  element: TextElement
  index: number
  isSelected: boolean
  isExpanded: boolean
  showColorPicker: boolean
  onSelect: () => void
  onToggleExpand: () => void
  onToggleColorPicker: () => void
  onUpdate: (updates: Partial<TextElement>) => void
  onDuplicate: () => void
  onDelete: () => void
}

function TextElementCard({
  element,
  index,
  isSelected,
  isExpanded,
  showColorPicker,
  onToggleExpand,
  onToggleColorPicker,
  onUpdate,
  onDuplicate,
  onDelete,
}: TextElementCardProps) {
  return (
    <div 
      className={cn(
        'border rounded-lg overflow-hidden transition-all',
        isSelected ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-gray-200'
      )}
    >
      {/* Element Header */}
      <div 
        className="flex items-center gap-2 p-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={onToggleExpand}
      >
        <GripVertical className="w-3.5 h-3.5 text-gray-300" />
        
        <span className="text-xs text-gray-400 font-mono w-4">{index + 1}</span>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            onUpdate({ visible: !element.visible })
          }}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title={element.visible ? 'Hide' : 'Show'}
        >
          {element.visible ? (
            <Eye className="w-3.5 h-3.5 text-gray-600" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-gray-400" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <span 
            className={cn(
              "text-sm truncate block",
              !element.visible && "opacity-50"
            )}
            style={{ fontFamily: element.fontFamily, color: element.visible ? element.color : '#9ca3af' }}
          >
            {element.text || 'Empty text'}
          </span>
        </div>
        
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
            className="p-1.5 hover:bg-gray-200 rounded transition-colors"
            title="Duplicate"
          >
            <Copy className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-1.5 hover:bg-red-100 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400 ml-1" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
          )}
        </div>
      </div>
      
      {/* Element Editor (expanded) */}
      {isExpanded && (
        <div className="p-3 space-y-4 border-t border-gray-100 bg-white">
          {/* Text Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Text Content</label>
            <textarea
              value={element.text}
              onChange={(e) => onUpdate({ text: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none"
              placeholder="Enter your text..."
              rows={2}
            />
          </div>
          
          {/* Font Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Font Style</label>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(FONT_CATEGORIES).map(([category, fonts]) => (
                <div key={category} className="space-y-0.5">
                  <span className="text-[9px] text-gray-400 uppercase">{category}</span>
                  <div className="space-y-0.5">
                    {fonts.map((font) => (
                      <button
                        key={font}
                        onClick={() => onUpdate({ fontFamily: font })}
                        className={cn(
                          'w-full px-2 py-1 text-left text-xs rounded transition-all truncate',
                          element.fontFamily === font
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
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Size</label>
              <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{element.fontSize}px</span>
            </div>
            <Slider
              value={[element.fontSize]}
              onValueChange={(value) => onUpdate({ fontSize: value[0] })}
              min={16}
              max={400}
              step={4}
              className="w-full"
            />
          </div>
          
          {/* Position */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Position</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Horizontal (X)</span>
                  <span className="text-[10px] font-mono text-gray-400">{element.x.toFixed(2)}%</span>
                </div>
                <Slider
                  value={[element.x]}
                  onValueChange={(value) => onUpdate({ x: value[0] })}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">Vertical (Y)</span>
                  <span className="text-[10px] font-mono text-gray-400">{element.y.toFixed(2)}%</span>
                </div>
                <Slider
                  value={[element.y]}
                  onValueChange={(value) => onUpdate({ y: value[0] })}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          
          {/* Color */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Color</label>
            <div className="flex gap-1.5">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  onClick={() => onUpdate({ color })}
                  className={cn(
                    'flex-1 aspect-square rounded border-2 transition-all hover:scale-110',
                    element.color === color ? 'border-gray-900 ring-1 ring-gray-900/20' : 'border-gray-200'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
              <button
                onClick={onToggleColorPicker}
                className={cn(
                  'flex-1 aspect-square rounded border-2 transition-all flex items-center justify-center text-xs font-bold',
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
                  color={element.color} 
                  onChange={(color) => onUpdate({ color })} 
                  className="!w-full" 
                  style={{ height: '100px' }}
                />
                <input 
                  type="text"
                  value={element.color} 
                  onChange={(e) => onUpdate({ color: e.target.value })}
                  placeholder="Hex color"
                  className="w-full px-2 py-1 text-xs font-mono border border-gray-200 rounded text-center"
                />
              </div>
            )}
          </div>
          
          {/* Preview */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Preview</label>
            <div 
              className="p-3 bg-gray-100 rounded-lg text-center overflow-hidden"
              style={{ 
                fontFamily: element.fontFamily,
                color: element.color,
                fontSize: Math.min(element.fontSize, 24) + 'px'
              }}
            >
              {element.text || 'Your text here'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { TextCustomizerBase as TextCustomizer }
