import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DesignPreset } from '../design-presets'

export type ProductType = 'poster' | 'canvas' | 'framed-poster' | 't-shirt' | 'mug' | 'hoodie'
export type WaveformStyle = 'bars' | 'smooth' | 'soundwave-lines' | 'mountain' | 'heartbeat' | 'constellation' | 'ribbon' | 'spectrum' | 'mirror' | 'circular' | 'dots' | 'radial' | 'galaxy' | 'frequency' | 'particle' | 'ripple' | 'soundwave' | 'wave3d' | 'neon' | 'gradient-bars' | 'vinyl' | 'equalizer' | 'pulse' | 'geometric' | 'dna' | 'moire' | 'fluid' | 'kaleidoscope' | 'glitch' | 'perlin' | 'crystals' | 'tunnel' | 'bloom' | 'aurora' | 'fire' | 'wave' | 'glow'
export type ArtisticTextStyle = 'none' | 'wordcloud' | 'spiral' | 'wave' | 'circular' | 'scattered'

export interface GradientStop {
  color: string
  position: number // 0 to 1
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
  
  // Text customization
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
  waveformSize: 100, // 100% of available space
  waveformHeightMultiplier: 100, // 100% = default height
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
  'waveformStyle', 'waveformSize', 'waveformHeightMultiplier',
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
      setWaveformUseGradient: (use) => {
        console.log('🎨 setWaveformUseGradient called:', use)
        set({ waveformUseGradient: use, hasUnsavedChanges: true })
      },
      setWaveformGradientStops: (stops) => {
        console.log('🎨 setWaveformGradientStops called:', stops)
        set({ waveformGradientStops: stops, hasUnsavedChanges: true })
      },
      setWaveformGradientDirection: (direction) => {
        console.log('🎨 setWaveformGradientDirection called:', direction)
        set({ waveformGradientDirection: direction, hasUnsavedChanges: true })
      },
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
