import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DesignPreset } from '../design-presets'

// Simple debounce utility for slider values
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>()
const debounce = <T extends (...args: Parameters<T>) => void>(
  key: string,
  fn: T,
  delay: number
): T => {
  return ((...args: Parameters<T>) => {
    const existing = debounceTimers.get(key)
    if (existing) clearTimeout(existing)
    debounceTimers.set(key, setTimeout(() => fn(...args), delay))
  }) as T
}

export type ProductType = 'poster' | 'canvas' | 'framed-poster' | 't-shirt' | 'mug' | 'hoodie' | 'digital-download'
export type WaveformStyle = 'bars' | 'smooth' | 'soundwave-lines' | 'mountain' | 'heartbeat' | 'constellation' | 'ribbon' | 'spectrum' | 'mirror' | 'circular' | 'dots' | 'galaxy' | 'frequency' | 'particle' | 'ripple' | 'soundwave' | 'wave3d' | 'neon' | 'gradient-bars' | 'vinyl' | 'equalizer' | 'pulse' | 'geometric' | 'dna' | 'moire' | 'fluid' | 'kaleidoscope' | 'glitch' | 'perlin' | 'crystals' | 'tunnel' | 'bloom' | 'aurora' | 'fire' | 'wave' | 'glow' | 'image-mask'
export type ArtisticTextStyle = 'none' | 'wordcloud' | 'spiral' | 'wave' | 'circular' | 'scattered'

export interface GradientStop {
  color: string
  position: number // 0 to 1
}

// Text element for multiple text support
export interface TextElement {
  id: string
  text: string
  x: number // 0-100 percentage
  y: number // 0-100 percentage
  fontSize: number
  fontFamily: string
  color: string
  useGradient: boolean
  gradientStops: GradientStop[]
  gradientDirection: 'horizontal' | 'vertical' | 'diagonal' | 'radial'
  visible: boolean
}

interface CustomizerState {
  // Audio
  audioFile: File | null
  audioFileName: string | null
  audioFileSize: number | null
  audioUrl: string | null
  audioDuration: number
  selectedRegion: { start: number; end: number } | null
  
  // Waveform customization
  waveformColor: string
  waveformUseGradient: boolean
  waveformGradientStops: GradientStop[]
  waveformGradientDirection: 'horizontal' | 'vertical' | 'diagonal' | 'radial'
  backgroundColor: string
  backgroundUseGradient: boolean
  backgroundGradientStops: GradientStop[]
  backgroundGradientDirection: 'horizontal' | 'vertical' | 'diagonal' | 'radial'
  backgroundImage: string | null
  backgroundImagePosition: 'center' | 'top' | 'bottom' | 'left' | 'right'
  backgroundFocalPoint: { x: number; y: number } | null // 0-100 percentage coordinates
  waveformStyle: WaveformStyle
  waveformSize: number // 20-100, percentage of available space (after minimum margins, internally doubled for height)
  waveformHeightMultiplier: number // 50-300, additional height multiplier independent of width
  waveformX: number // 0-100, X position as percentage (50 = centered)
  waveformY: number // 0-100, Y position as percentage (50 = centered)
  barWidth: number // 1-30, thickness of waveform bars
  barGap: number // 0-20, space between bars
  barRounded: boolean // Whether bars have rounded corners
  circleRadius: number // 20-200, inner radius for circular waveforms
  mirrorUseTwoColors: boolean // Whether mirror style uses different colors for top/bottom
  mirrorSecondaryColor: string // Secondary color for mirror bottom half
  imageMaskImage: string | null // Image to clip behind the waveform mask
  imageMaskShape: 'normal' | 'circular' // Shape of the mask - normal or circular
  imageMaskFocalPoint: { x: number; y: number } | null // 0-100 percentage coordinates for image mask
  canvasAspectRatio: string // e.g. '3:2', '2:1', '1:1', '2:3'
  
  // QR Code
  showQRCode: boolean
  qrCodeUrl: string
  qrCodePosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  qrCodeSize: number // 5-20 percentage of canvas width
  qrCodeX: number // 0-100 percentage from left
  qrCodeY: number // 0-100 percentage from top
  
  // Product selection
  selectedProduct: ProductType
  selectedSize: string
  
  // Text customization (legacy single text - kept for backward compatibility)
  customText: string
  songTitle: string
  artistName: string
  customDate: string
  textColor: string
  textUseGradient: boolean
  textGradientStops: GradientStop[]
  textGradientDirection: 'horizontal' | 'vertical' | 'diagonal' | 'radial'
  showText: boolean
  textPosition: 'top' | 'bottom' | 'center'
  textX: number // 0-100 percentage from left
  textY: number // 0-100 percentage from top
  fontSize: number
  fontFamily: string
  
  // Multiple text elements
  textElements: TextElement[]
  selectedTextElementId: string | null
  selectedTextElementIds: string[] // Multi-select support
  clipboardTextElements: TextElement[] // Clipboard for copy/paste
  
  // Speech detection and artistic text
  detectedWords: string[]
  showArtisticText: boolean
  artisticTextStyle: ArtisticTextStyle
  artisticTextColor: string
  artisticTextOpacity: number
  
  // Hydration
  _hasHydrated: boolean
  setHasHydrated: (hasHydrated: boolean) => void
  
  // Undo/Redo history
  _history: Partial<CustomizerState>[]
  _historyIndex: number
  _maxHistory: number
  canUndo: boolean
  canRedo: boolean
  
  // Preview generation
  hasUnsavedChanges: boolean
  setHasUnsavedChanges: (hasChanges: boolean) => void
  
  // Actions
  setAudioFile: (file: File | null) => void
  setAudioUrl: (url: string | null) => void
  setAudioDuration: (duration: number) => void
  setSelectedRegion: (region: { start: number; end: number } | null) => void
  setWaveformColor: (color: string) => void
  setWaveformUseGradient: (use: boolean) => void
  setWaveformGradientStops: (stops: GradientStop[]) => void
  setWaveformGradientDirection: (direction: 'horizontal' | 'vertical' | 'diagonal' | 'radial') => void
  setBackgroundColor: (color: string) => void
  setBackgroundUseGradient: (use: boolean) => void
  setBackgroundGradientStops: (stops: GradientStop[]) => void
  setBackgroundGradientDirection: (direction: 'horizontal' | 'vertical' | 'diagonal' | 'radial') => void
  setBackgroundImage: (image: string | null) => void
  setBackgroundImagePosition: (position: 'center' | 'top' | 'bottom' | 'left' | 'right') => void
  setBackgroundFocalPoint: (point: { x: number; y: number } | null) => void
  setWaveformStyle: (style: WaveformStyle) => void
  setWaveformSize: (size: number) => void
  setWaveformHeightMultiplier: (multiplier: number) => void
  setWaveformX: (x: number) => void
  setWaveformY: (y: number) => void
  setWaveformPosition: (x: number, y: number) => void // Combined for performance
  setBarWidth: (width: number) => void
  setBarGap: (gap: number) => void
  setBarRounded: (rounded: boolean) => void
  setCircleRadius: (radius: number) => void
  setMirrorUseTwoColors: (use: boolean) => void
  setMirrorSecondaryColor: (color: string) => void
  setImageMaskImage: (image: string | null) => void
  setImageMaskShape: (shape: 'normal' | 'circular') => void
  setImageMaskFocalPoint: (point: { x: number; y: number } | null) => void
  setCanvasAspectRatio: (ratio: string) => void
  setShowQRCode: (show: boolean) => void
  setQRCodeUrl: (url: string) => void
  setQRCodePosition: (position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => void
  setQRCodeSize: (size: number) => void
  setQRCodeX: (x: number) => void
  setQRCodeY: (y: number) => void
  setSelectedProduct: (product: ProductType) => void
  setSelectedSize: (size: string) => void
  setCustomText: (text: string) => void
  setSongTitle: (title: string) => void
  setArtistName: (name: string) => void
  setCustomDate: (date: string) => void
  setTextColor: (color: string) => void
  setTextUseGradient: (use: boolean) => void
  setTextGradientStops: (stops: GradientStop[]) => void
  setTextGradientDirection: (direction: 'horizontal' | 'vertical' | 'diagonal' | 'radial') => void
  setShowText: (show: boolean) => void
  setTextPosition: (position: 'top' | 'bottom' | 'center') => void
  setTextX: (x: number) => void
  setTextY: (y: number) => void
  setFontSize: (size: number) => void
  setFontFamily: (family: string) => void
  setDetectedWords: (words: string[]) => void
  setShowArtisticText: (show: boolean) => void
  setArtisticTextStyle: (style: ArtisticTextStyle) => void
  setArtisticTextColor: (color: string) => void
  setArtisticTextOpacity: (opacity: number) => void
  
  // Multiple text element actions
  addTextElement: () => void
  removeTextElement: (id: string) => void
  updateTextElement: (id: string, updates: Partial<TextElement>) => void
  selectTextElement: (id: string | null) => void
  duplicateTextElement: (id: string) => void
  toggleTextElementSelection: (id: string) => void // Multi-select with Shift+click
  selectAllTextElements: () => void
  clearTextSelection: () => void
  copySelectedTextElements: () => void
  pasteTextElements: () => void
  deleteSelectedTextElements: () => void
  
  // Undo/Redo actions
  undo: () => void
  redo: () => void
  saveToHistory: () => void
  
  // Preset actions
  applyPreset: (preset: DesignPreset) => void
  
  reset: () => void
}

const initialState = {
  audioFile: null,
  audioFileName: null,
  audioFileSize: null,
  audioUrl: null,
  audioDuration: 0,
  selectedRegion: null,
  waveformColor: '#000000',
  waveformUseGradient: false,
  waveformGradientStops: [
    { color: '#000000', position: 0 },
    { color: '#FF0000', position: 1 },
  ],
  waveformGradientDirection: 'horizontal' as const,
  backgroundColor: '#FFFFFF',
  backgroundUseGradient: false,
  backgroundGradientStops: [
    { color: '#FFFFFF', position: 0 },
    { color: '#000000', position: 1 },
  ],
  backgroundGradientDirection: 'vertical' as const,
  backgroundImage: null,
  backgroundImagePosition: 'center' as const,
  backgroundFocalPoint: null,
  waveformStyle: 'bars' as WaveformStyle,
  waveformSize: 133, // 133% to fill most of the canvas by default
  waveformHeightMultiplier: 100, // 100% = default height
  waveformX: 50, // Center horizontally
  waveformY: 50, // Center vertically
  barWidth: 8, // Default bar thickness
  barGap: 5, // Default spacing between bars
  barRounded: false, // Default to square bars
  circleRadius: 80, // Default inner radius for circular waveforms
  mirrorUseTwoColors: false, // Default to single color
  mirrorSecondaryColor: '#888888', // Default secondary color for mirror bottom
  imageMaskImage: null, // Image to clip behind the waveform mask
  imageMaskShape: 'normal' as const, // Default to normal shape
  imageMaskFocalPoint: null, // Focal point for image mask
  canvasAspectRatio: '3:2', // Default aspect ratio
  selectedProduct: 'poster' as ProductType,
  selectedSize: 'M',
  customText: '',
  songTitle: '',
  artistName: '',
  customDate: '',
  textColor: '#000000',
  textUseGradient: false,
  textGradientStops: [
    { color: '#000000', position: 0 },
    { color: '#FFFFFF', position: 1 },
  ],
  textGradientDirection: 'horizontal' as const,
  showText: false,
  textPosition: 'bottom' as const,
  textX: 50, // Center horizontally
  textY: 85, // Near bottom
  fontSize: 120,
  fontFamily: 'Inter',
  textElements: [] as TextElement[],
  selectedTextElementId: null as string | null,
  selectedTextElementIds: [] as string[],
  clipboardTextElements: [] as TextElement[],
  showQRCode: false,
  qrCodeUrl: '',
  qrCodePosition: 'bottom-right' as const,
  qrCodeSize: 8, // 8% of canvas width
  qrCodeX: 92, // 92% from left (bottom-right default)
  qrCodeY: 92, // 92% from top (bottom-right default)
  detectedWords: [],
  showArtisticText: false,
  artisticTextStyle: 'wordcloud' as ArtisticTextStyle,
  artisticTextColor: '#000000',
  artisticTextOpacity: 0.7,
  hasUnsavedChanges: false,
}

// Keys to track for undo/redo (excludes audio/file data and internal state)
const historyKeys = [
  'waveformColor', 'waveformUseGradient', 'waveformGradientStops', 'waveformGradientDirection',
  'backgroundColor', 'backgroundUseGradient', 'backgroundGradientStops', 'backgroundGradientDirection',
  'backgroundImage', 'backgroundImagePosition', 'backgroundFocalPoint',
  'waveformStyle', 'waveformSize', 'waveformHeightMultiplier', 'barWidth', 'barGap', 'barRounded', 'circleRadius', 'canvasAspectRatio',
  'imageMaskImage', 'imageMaskShape', 'imageMaskFocalPoint',
  'showText', 'customText', 'textColor', 'textUseGradient', 'textGradientStops', 'textGradientDirection',
  'textPosition', 'textX', 'textY', 'fontSize', 'fontFamily',
  'showQRCode', 'qrCodeUrl', 'qrCodePosition', 'qrCodeSize', 'qrCodeX', 'qrCodeY',
] as const

// Extract history-relevant state
const getHistoryState = (state: CustomizerState): Partial<CustomizerState> => {
  const result: Partial<CustomizerState> = {}
  for (const key of historyKeys) {
    (result as any)[key] = (state as any)[key]
  }
  return result
}

export const useCustomizerStore = create<CustomizerState>()(
  persist(
    (set, get) => ({
      ...initialState,
      _hasHydrated: false,
      
      // Undo/Redo state
      _history: [],
      _historyIndex: -1,
      _maxHistory: 50,
      canUndo: false,
      canRedo: false,
      
      setAudioFile: (file) => set({ 
        audioFile: file,
        audioFileName: file?.name || null,
        audioFileSize: file?.size || null,
        // Don't set audioUrl here - it should be set separately with the permanent Supabase URL
      }),
      setAudioUrl: (url) => set({ audioUrl: url }),
      setAudioDuration: (duration) => set({ audioDuration: duration }),
      setSelectedRegion: (region) => set({ selectedRegion: region, hasUnsavedChanges: true }),
      setWaveformColor: (color) => set({ waveformColor: color, hasUnsavedChanges: true }),
      setWaveformUseGradient: (use) => set({ waveformUseGradient: use, hasUnsavedChanges: true }),
      setWaveformGradientStops: (stops) => set({ waveformGradientStops: stops, hasUnsavedChanges: true }),
      setWaveformGradientDirection: (direction) => set({ waveformGradientDirection: direction, hasUnsavedChanges: true }),
      setBackgroundColor: (color) => set({ backgroundColor: color, hasUnsavedChanges: true }),
      setBackgroundUseGradient: (use) => set({ backgroundUseGradient: use, hasUnsavedChanges: true }),
      setBackgroundGradientStops: (stops) => set({ backgroundGradientStops: stops, hasUnsavedChanges: true }),
      setBackgroundGradientDirection: (direction) => set({ backgroundGradientDirection: direction }),
      setBackgroundImage: (image) => set({ backgroundImage: image }),
      setBackgroundImagePosition: (position) => set({ backgroundImagePosition: position }),
      setBackgroundFocalPoint: (point) => set({ backgroundFocalPoint: point }),
      setWaveformStyle: (style) => set({ waveformStyle: style, hasUnsavedChanges: true }),
      setWaveformSize: (size) => {
        const clamped = Math.max(0, Math.min(200, size))
        console.log('📏 setWaveformSize called:', size, '→', clamped)
        set({ waveformSize: clamped, hasUnsavedChanges: true })
      },
      setWaveformHeightMultiplier: (multiplier) => set({ waveformHeightMultiplier: multiplier, hasUnsavedChanges: true }),
      setWaveformX: (x) => set({ waveformX: Math.max(0, Math.min(100, x)), hasUnsavedChanges: true }),
      setWaveformY: (y) => set({ waveformY: Math.max(0, Math.min(100, y)), hasUnsavedChanges: true }),
      setWaveformPosition: (x, y) => set({ 
        waveformX: Math.max(0, Math.min(100, x)), 
        waveformY: Math.max(0, Math.min(100, y)), 
        hasUnsavedChanges: true 
      }),
      setBarWidth: (width) => set({ barWidth: Math.max(1, Math.min(30, width)), hasUnsavedChanges: true }),
      setBarGap: (gap) => set({ barGap: Math.max(0, Math.min(20, gap)), hasUnsavedChanges: true }),
      setBarRounded: (rounded) => set({ barRounded: rounded, hasUnsavedChanges: true }),
      setCircleRadius: (radius) => set({ circleRadius: Math.max(20, Math.min(200, radius)), hasUnsavedChanges: true }),
      setMirrorUseTwoColors: (use) => set({ mirrorUseTwoColors: use, hasUnsavedChanges: true }),
      setMirrorSecondaryColor: (color) => set({ mirrorSecondaryColor: color, hasUnsavedChanges: true }),
      setImageMaskImage: (image) => set({ imageMaskImage: image, hasUnsavedChanges: true }),
      setImageMaskShape: (shape) => set({ imageMaskShape: shape, hasUnsavedChanges: true }),
      setImageMaskFocalPoint: (point) => set({ imageMaskFocalPoint: point, hasUnsavedChanges: true }),
      setCanvasAspectRatio: (ratio) => set({ canvasAspectRatio: ratio, hasUnsavedChanges: true }),
      setSelectedProduct: (product) => set({ selectedProduct: product }),
      setSelectedSize: (size) => set({ selectedSize: size }),
      setCustomText: (text) => set({ customText: text, hasUnsavedChanges: true }),
      setSongTitle: (title) => set({ songTitle: title, hasUnsavedChanges: true }),
      setArtistName: (name) => set({ artistName: name, hasUnsavedChanges: true }),
      setCustomDate: (date) => set({ customDate: date, hasUnsavedChanges: true }),
      setTextColor: (color) => set({ textColor: color, hasUnsavedChanges: true }),
      setTextUseGradient: (use) => set({ textUseGradient: use, hasUnsavedChanges: true }),
      setTextGradientStops: (stops) => set({ textGradientStops: stops, hasUnsavedChanges: true }),
      setTextGradientDirection: (direction) => set({ textGradientDirection: direction, hasUnsavedChanges: true }),
      setShowText: (show) => set({ showText: show, hasUnsavedChanges: true }),
      setTextPosition: (position) => set({ textPosition: position, hasUnsavedChanges: true }),
      setTextX: (x) => {
        const clamped = Math.max(0, Math.min(100, x))
        console.log('📍 setTextX called:', x, '→', clamped)
        set({ textX: clamped })
      },
      setTextY: (y) => {
        const clamped = Math.max(0, Math.min(100, y))
        console.log('📍 setTextY called:', y, '→', clamped)
        set({ textY: clamped })
      },
      setFontSize: (size) => set({ fontSize: size, hasUnsavedChanges: true }),
      setFontFamily: (family) => set({ fontFamily: family, hasUnsavedChanges: true }),
      setShowQRCode: (show) => set({ showQRCode: show, hasUnsavedChanges: true }),
      setQRCodeUrl: (url) => set({ qrCodeUrl: url, hasUnsavedChanges: true }),
      setQRCodePosition: (position) => {
        // Also update X/Y when preset position changes
        const positions = {
          'top-left': { x: 8, y: 8 },
          'top-right': { x: 92, y: 8 },
          'bottom-left': { x: 8, y: 92 },
          'bottom-right': { x: 92, y: 92 },
        }
        const pos = positions[position]
        set({ qrCodePosition: position, qrCodeX: pos.x, qrCodeY: pos.y, hasUnsavedChanges: true })
      },
      setQRCodeSize: (size) => set({ qrCodeSize: Math.max(3, Math.min(20, size)), hasUnsavedChanges: true }),
      setQRCodeX: (x) => set({ qrCodeX: Math.max(0, Math.min(100, x)), hasUnsavedChanges: true }),
      setQRCodeY: (y) => set({ qrCodeY: Math.max(0, Math.min(100, y)), hasUnsavedChanges: true }),
      setDetectedWords: (words) => set({ detectedWords: words }),
      setShowArtisticText: (show) => set({ showArtisticText: show, hasUnsavedChanges: true }),
      setArtisticTextStyle: (style) => {
        console.log('🎨 Setting artistic text style to:', style)
        set({ artisticTextStyle: style, hasUnsavedChanges: true })
      },
      setArtisticTextColor: (color) => set({ artisticTextColor: color, hasUnsavedChanges: true }),
      setArtisticTextOpacity: (opacity) => set({ artisticTextOpacity: Math.max(0, Math.min(1, opacity)), hasUnsavedChanges: true }),
      
      // Multiple text element actions
      addTextElement: () => {
        const state = get()
        const newElement: TextElement = {
          id: `text-${Date.now()}`,
          text: 'New Text',
          x: 50,
          y: 50,
          fontSize: 80,
          fontFamily: state.fontFamily || 'Inter',
          color: state.textColor || '#000000',
          useGradient: false,
          gradientStops: [
            { color: '#000000', position: 0 },
            { color: '#FFFFFF', position: 1 },
          ],
          gradientDirection: 'horizontal',
          visible: true,
        }
        set({ 
          textElements: [...state.textElements, newElement],
          selectedTextElementId: newElement.id,
          hasUnsavedChanges: true 
        })
      },
      
      removeTextElement: (id) => {
        const state = get()
        set({ 
          textElements: state.textElements.filter(el => el.id !== id),
          selectedTextElementId: state.selectedTextElementId === id ? null : state.selectedTextElementId,
          hasUnsavedChanges: true 
        })
      },
      
      updateTextElement: (id, updates) => {
        const state = get()
        set({ 
          textElements: state.textElements.map(el => 
            el.id === id ? { ...el, ...updates } : el
          ),
          hasUnsavedChanges: true 
        })
      },
      
      selectTextElement: (id) => {
        set({ 
          selectedTextElementId: id,
          selectedTextElementIds: id ? [id] : []
        })
      },
      
      duplicateTextElement: (id) => {
        const state = get()
        const element = state.textElements.find(el => el.id === id)
        if (element) {
          const newElement: TextElement = {
            ...element,
            id: `text-${Date.now()}`,
            x: Math.min(element.x + 5, 95),
            y: Math.min(element.y + 5, 95),
          }
          set({ 
            textElements: [...state.textElements, newElement],
            selectedTextElementId: newElement.id,
            selectedTextElementIds: [newElement.id],
            hasUnsavedChanges: true 
          })
        }
      },
      
      // Multi-select: Toggle selection with Shift+click
      toggleTextElementSelection: (id) => {
        const state = get()
        const isSelected = state.selectedTextElementIds.includes(id)
        
        if (isSelected) {
          // Deselect this element
          const newSelection = state.selectedTextElementIds.filter(eid => eid !== id)
          set({ 
            selectedTextElementIds: newSelection,
            selectedTextElementId: newSelection.length > 0 ? newSelection[newSelection.length - 1] : null
          })
        } else {
          // Add to selection
          set({ 
            selectedTextElementIds: [...state.selectedTextElementIds, id],
            selectedTextElementId: id
          })
        }
      },
      
      selectAllTextElements: () => {
        const state = get()
        const allIds = state.textElements.map(el => el.id)
        set({ 
          selectedTextElementIds: allIds,
          selectedTextElementId: allIds.length > 0 ? allIds[allIds.length - 1] : null
        })
      },
      
      clearTextSelection: () => {
        set({ 
          selectedTextElementIds: [],
          selectedTextElementId: null
        })
      },
      
      // Clipboard operations
      copySelectedTextElements: () => {
        const state = get()
        const selectedIds = state.selectedTextElementIds.length > 0 
          ? state.selectedTextElementIds 
          : (state.selectedTextElementId ? [state.selectedTextElementId] : [])
        
        const elementsToCopy = state.textElements.filter(el => selectedIds.includes(el.id))
        if (elementsToCopy.length > 0) {
          set({ clipboardTextElements: elementsToCopy })
        }
      },
      
      pasteTextElements: () => {
        const state = get()
        if (state.clipboardTextElements.length === 0) return
        
        const newElements: TextElement[] = state.clipboardTextElements.map((el, index) => ({
          ...el,
          id: `text-${Date.now()}-${index}`,
          x: Math.min(el.x + 5, 95),
          y: Math.min(el.y + 5, 95),
        }))
        
        const newIds = newElements.map(el => el.id)
        
        set({ 
          textElements: [...state.textElements, ...newElements],
          selectedTextElementIds: newIds,
          selectedTextElementId: newIds[newIds.length - 1],
          hasUnsavedChanges: true 
        })
      },
      
      deleteSelectedTextElements: () => {
        const state = get()
        const selectedIds = state.selectedTextElementIds.length > 0 
          ? state.selectedTextElementIds 
          : (state.selectedTextElementId ? [state.selectedTextElementId] : [])
        
        if (selectedIds.length === 0) return
        
        set({ 
          textElements: state.textElements.filter(el => !selectedIds.includes(el.id)),
          selectedTextElementIds: [],
          selectedTextElementId: null,
          hasUnsavedChanges: true 
        })
      },
      
      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
      setHasUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),
      
      // Undo/Redo implementation
      saveToHistory: () => {
        const state = get()
        const historyState = getHistoryState(state)
        const newHistory = state._history.slice(0, state._historyIndex + 1)
        newHistory.push(historyState)
        
        // Limit history size
        if (newHistory.length > state._maxHistory) {
          newHistory.shift()
        }
        
        set({
          _history: newHistory,
          _historyIndex: newHistory.length - 1,
          canUndo: newHistory.length > 1,
          canRedo: false,
        })
      },
      
      undo: () => {
        const state = get()
        if (state._historyIndex <= 0) return
        
        const newIndex = state._historyIndex - 1
        const historyState = state._history[newIndex]
        
        set({
          ...historyState,
          _historyIndex: newIndex,
          canUndo: newIndex > 0,
          canRedo: true,
          hasUnsavedChanges: true,
        })
      },
      
      redo: () => {
        const state = get()
        if (state._historyIndex >= state._history.length - 1) return
        
        const newIndex = state._historyIndex + 1
        const historyState = state._history[newIndex]
        
        set({
          ...historyState,
          _historyIndex: newIndex,
          canUndo: true,
          canRedo: newIndex < state._history.length - 1,
          hasUnsavedChanges: true,
        })
      },
      
      // Apply design preset
      applyPreset: (preset) => {
        // Save current state to history first
        get().saveToHistory()
        
        set({
          waveformColor: preset.settings.waveformColor,
          waveformUseGradient: preset.settings.waveformUseGradient,
          waveformGradientStops: preset.settings.waveformGradientStops,
          waveformGradientDirection: preset.settings.waveformGradientDirection,
          waveformStyle: preset.settings.waveformStyle,
          backgroundColor: preset.settings.backgroundColor,
          backgroundUseGradient: preset.settings.backgroundUseGradient,
          backgroundGradientStops: preset.settings.backgroundGradientStops,
          backgroundGradientDirection: preset.settings.backgroundGradientDirection,
          textColor: preset.settings.textColor,
          fontFamily: preset.settings.fontFamily,
          hasUnsavedChanges: true,
        })
        
        // Save the new state to history
        get().saveToHistory()
      },
      
      reset: () => set(initialState),
    }),
    {
      name: 'soundprints-customizer',
      partialize: (state) => ({
        // Audio data
        audioUrl: state.audioUrl,
        audioFileName: state.audioFileName,
        audioFileSize: state.audioFileSize,
        audioDuration: state.audioDuration,
        selectedRegion: state.selectedRegion,
        
        // Waveform colors
        waveformColor: state.waveformColor,
        waveformUseGradient: state.waveformUseGradient,
        waveformGradientStops: state.waveformGradientStops,
        waveformGradientDirection: state.waveformGradientDirection,
        
        // Background colors
        backgroundColor: state.backgroundColor,
        backgroundUseGradient: state.backgroundUseGradient,
        backgroundGradientStops: state.backgroundGradientStops,
        backgroundGradientDirection: state.backgroundGradientDirection,
        backgroundImage: state.backgroundImage,
        backgroundImagePosition: state.backgroundImagePosition,
        backgroundFocalPoint: state.backgroundFocalPoint,
        
        // Waveform style
        waveformStyle: state.waveformStyle,
        waveformSize: state.waveformSize,
        waveformHeightMultiplier: state.waveformHeightMultiplier,
        barWidth: state.barWidth,
        barGap: state.barGap,
        barRounded: state.barRounded,
        circleRadius: state.circleRadius,
        canvasAspectRatio: state.canvasAspectRatio,
        
        // Product selection
        selectedProduct: state.selectedProduct,
        selectedSize: state.selectedSize,
        
        // Text settings
        customText: state.customText,
        songTitle: state.songTitle,
        artistName: state.artistName,
        customDate: state.customDate,
        textColor: state.textColor,
        textUseGradient: state.textUseGradient,
        textGradientStops: state.textGradientStops,
        textGradientDirection: state.textGradientDirection,
        showText: state.showText,
        textPosition: state.textPosition,
        textX: state.textX,
        textY: state.textY,
        fontSize: state.fontSize,
        fontFamily: state.fontFamily,
        
        // QR Code settings
        showQRCode: state.showQRCode,
        qrCodeUrl: state.qrCodeUrl,
        qrCodePosition: state.qrCodePosition,
        qrCodeSize: state.qrCodeSize,
        qrCodeX: state.qrCodeX,
        qrCodeY: state.qrCodeY,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated?.(true)
      },
    }
  )
)

// =============================================================================
// PERFORMANCE OPTIMIZED GROUPED SELECTORS
// Use these instead of individual selectors to reduce re-renders
// =============================================================================

import { useShallow } from 'zustand/react/shallow'

// Waveform visual config - for rendering the waveform
export const useWaveformConfig = () => useCustomizerStore(
  useShallow((state) => ({
    color: state.waveformColor,
    style: state.waveformStyle,
    size: state.waveformSize,
    heightMultiplier: state.waveformHeightMultiplier,
    barWidth: state.barWidth,
    barGap: state.barGap,
    barRounded: state.barRounded,
    circleRadius: state.circleRadius,
    useGradient: state.waveformUseGradient,
    gradientStops: state.waveformGradientStops,
    gradientDirection: state.waveformGradientDirection,
    x: state.waveformX,
    y: state.waveformY,
  }))
)

// Background config - for rendering background
export const useBackgroundConfig = () => useCustomizerStore(
  useShallow((state) => ({
    color: state.backgroundColor,
    useGradient: state.backgroundUseGradient,
    gradientStops: state.backgroundGradientStops,
    gradientDirection: state.backgroundGradientDirection,
    image: state.backgroundImage,
    imagePosition: state.backgroundImagePosition,
    focalPoint: state.backgroundFocalPoint,
  }))
)

// Text config - for rendering text overlays
export const useTextConfig = () => useCustomizerStore(
  useShallow((state) => ({
    showText: state.showText,
    customText: state.customText,
    textColor: state.textColor,
    textUseGradient: state.textUseGradient,
    textGradientStops: state.textGradientStops,
    textGradientDirection: state.textGradientDirection,
    textPosition: state.textPosition,
    textX: state.textX,
    textY: state.textY,
    fontSize: state.fontSize,
    fontFamily: state.fontFamily,
    textElements: state.textElements,
  }))
)

// QR Code config
export const useQRCodeConfig = () => useCustomizerStore(
  useShallow((state) => ({
    showQRCode: state.showQRCode,
    qrCodeUrl: state.qrCodeUrl,
    qrCodePosition: state.qrCodePosition,
    qrCodeSize: state.qrCodeSize,
    qrCodeX: state.qrCodeX,
    qrCodeY: state.qrCodeY,
  }))
)

// Audio config - for audio processing (changes less frequently)
export const useAudioConfig = () => useCustomizerStore(
  useShallow((state) => ({
    audioUrl: state.audioUrl,
    audioFileName: state.audioFileName,
    audioDuration: state.audioDuration,
    selectedRegion: state.selectedRegion,
  }))
)

// Image mask config
export const useImageMaskConfig = () => useCustomizerStore(
  useShallow((state) => ({
    imageMaskImage: state.imageMaskImage,
    imageMaskShape: state.imageMaskShape,
    imageMaskFocalPoint: state.imageMaskFocalPoint,
  }))
)

// Canvas/product config
export const useCanvasConfig = () => useCustomizerStore(
  useShallow((state) => ({
    canvasAspectRatio: state.canvasAspectRatio,
    selectedProduct: state.selectedProduct,
  }))
)

// ProductMockup comprehensive config - reduces 53 subscriptions to 1
export const useProductMockupConfig = () => useCustomizerStore(
  useShallow((state) => ({
    // Audio
    audioUrl: state.audioUrl,
    selectedRegion: state.selectedRegion,
    // Waveform
    waveformColor: state.waveformColor,
    waveformUseGradient: state.waveformUseGradient,
    waveformGradientStops: state.waveformGradientStops,
    waveformGradientDirection: state.waveformGradientDirection,
    waveformStyle: state.waveformStyle,
    waveformSize: state.waveformSize,
    waveformHeightMultiplier: state.waveformHeightMultiplier,
    waveformX: state.waveformX,
    waveformY: state.waveformY,
    barWidth: state.barWidth,
    barGap: state.barGap,
    barRounded: state.barRounded,
    circleRadius: state.circleRadius,
    mirrorUseTwoColors: state.mirrorUseTwoColors,
    mirrorSecondaryColor: state.mirrorSecondaryColor,
    // Background
    backgroundColor: state.backgroundColor,
    backgroundUseGradient: state.backgroundUseGradient,
    backgroundGradientStops: state.backgroundGradientStops,
    backgroundGradientDirection: state.backgroundGradientDirection,
    backgroundImage: state.backgroundImage,
    backgroundImagePosition: state.backgroundImagePosition,
    backgroundFocalPoint: state.backgroundFocalPoint,
    // Product
    selectedProduct: state.selectedProduct,
    selectedSize: state.selectedSize,
    // Text
    showText: state.showText,
    songTitle: state.songTitle,
    artistName: state.artistName,
    customDate: state.customDate,
    customText: state.customText,
    textColor: state.textColor,
    textUseGradient: state.textUseGradient,
    textGradientStops: state.textGradientStops,
    textGradientDirection: state.textGradientDirection,
    textX: state.textX,
    textY: state.textY,
    fontFamily: state.fontFamily,
    fontSize: state.fontSize,
    textElements: state.textElements,
    // QR Code
    showQRCode: state.showQRCode,
    qrCodeUrl: state.qrCodeUrl,
    qrCodePosition: state.qrCodePosition,
    qrCodeSize: state.qrCodeSize,
    qrCodeX: state.qrCodeX,
    qrCodeY: state.qrCodeY,
    // Artistic text
    detectedWords: state.detectedWords,
    showArtisticText: state.showArtisticText,
    artisticTextStyle: state.artisticTextStyle,
    artisticTextColor: state.artisticTextColor,
    artisticTextOpacity: state.artisticTextOpacity,
    // Image mask
    imageMaskImage: state.imageMaskImage,
    imageMaskShape: state.imageMaskShape,
    imageMaskFocalPoint: state.imageMaskFocalPoint,
  }))
)

// InteractiveCanvasEditor config - reduces 20 subscriptions to 1
export const useInteractiveCanvasConfig = () => useCustomizerStore(
  useShallow((state) => ({
    // Waveform position/size
    waveformX: state.waveformX,
    waveformY: state.waveformY,
    waveformSize: state.waveformSize,
    waveformHeightMultiplier: state.waveformHeightMultiplier,
    // Text elements
    textElements: state.textElements,
    selectedTextElementId: state.selectedTextElementId,
    selectedTextElementIds: state.selectedTextElementIds,
    clipboardTextElements: state.clipboardTextElements,
    // Legacy text
    showText: state.showText,
    customText: state.customText,
    textX: state.textX,
    textY: state.textY,
    fontSize: state.fontSize,
    fontFamily: state.fontFamily,
    textColor: state.textColor,
  }))
)

// InteractiveCanvasEditor actions (functions don't change, safe to select individually)
export const useInteractiveCanvasActions = () => useCustomizerStore(
  useShallow((state) => ({
    setWaveformPosition: state.setWaveformPosition,
    setWaveformSize: state.setWaveformSize,
    updateTextElement: state.updateTextElement,
    selectTextElement: state.selectTextElement,
    removeTextElement: state.removeTextElement,
    toggleTextElementSelection: state.toggleTextElementSelection,
    selectAllTextElements: state.selectAllTextElements,
    clearTextSelection: state.clearTextSelection,
    copySelectedTextElements: state.copySelectedTextElements,
    pasteTextElements: state.pasteTextElements,
    deleteSelectedTextElements: state.deleteSelectedTextElements,
    setTextX: state.setTextX,
    setTextY: state.setTextY,
    setFontSize: state.setFontSize,
    undo: state.undo,
    redo: state.redo,
    saveToHistory: state.saveToHistory,
  }))
)

// InteractiveCanvasEditor undo/redo state
export const useInteractiveCanvasUndoRedo = () => useCustomizerStore(
  useShallow((state) => ({
    canUndo: state.canUndo,
    canRedo: state.canRedo,
  }))
)
