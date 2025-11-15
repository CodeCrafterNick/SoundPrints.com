import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ProductType = 'poster' | 't-shirt' | 'mug' | 'canvas' | 'hoodie'
export type WaveformStyle = 'bars' | 'smooth' | 'soundwave-lines' | 'mountain' | 'heartbeat' | 'constellation' | 'ribbon' | 'spectrum' | 'mirror' | 'circular' | 'dots' | 'radial' | 'galaxy' | 'frequency' | 'particle' | 'ripple' | 'soundwave' | 'wave3d' | 'neon' | 'gradient-bars' | 'vinyl' | 'equalizer' | 'pulse' | 'geometric' | 'dna' | 'moire' | 'fluid' | 'kaleidoscope' | 'glitch' | 'perlin' | 'crystals' | 'tunnel' | 'bloom' | 'aurora' | 'fire'
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
  waveformSize: number // 0-100, percentage of available space (after minimum margins)
  
  // QR Code
  showQRCode: boolean
  qrCodeUrl: string
  qrCodePosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  
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
  setShowQRCode: (show: boolean) => void
  setQRCodeUrl: (url: string) => void
  setQRCodePosition: (position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => void
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
  waveformSize: 80, // 80% of available space
  selectedProduct: 'poster' as ProductType,
  selectedSize: '18x24',
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
  fontSize: 24,
  fontFamily: 'Inter',
  showQRCode: false,
  qrCodeUrl: '',
  qrCodePosition: 'bottom-right' as const,
  detectedWords: [],
  showArtisticText: false,
  artisticTextStyle: 'wordcloud' as ArtisticTextStyle,
  artisticTextColor: '#000000',
  artisticTextOpacity: 0.7,
}

export const useCustomizerStore = create<CustomizerState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setAudioFile: (file) => set({ 
        audioFile: file,
        audioFileName: file?.name || null,
        audioFileSize: file?.size || null,
        audioUrl: file ? URL.createObjectURL(file) : null 
      }),
      setAudioUrl: (url) => set({ audioUrl: url }),
      setAudioDuration: (duration) => set({ audioDuration: duration }),
      setSelectedRegion: (region) => set({ selectedRegion: region }),
      setWaveformColor: (color) => set({ waveformColor: color }),
      setWaveformUseGradient: (use) => set({ waveformUseGradient: use }),
      setWaveformGradientStops: (stops) => set({ waveformGradientStops: stops }),
      setWaveformGradientDirection: (direction) => set({ waveformGradientDirection: direction }),
      setBackgroundColor: (color) => set({ backgroundColor: color }),
      setBackgroundUseGradient: (use) => set({ backgroundUseGradient: use }),
      setBackgroundGradientStops: (stops) => set({ backgroundGradientStops: stops }),
      setBackgroundGradientDirection: (direction) => set({ backgroundGradientDirection: direction }),
      setBackgroundImage: (image) => set({ backgroundImage: image }),
      setBackgroundImagePosition: (position) => set({ backgroundImagePosition: position }),
      setBackgroundFocalPoint: (point) => set({ backgroundFocalPoint: point }),
      setWaveformStyle: (style) => set({ waveformStyle: style }),
      setWaveformSize: (size) => {
        const clamped = Math.max(0, Math.min(100, size))
        console.log('📏 setWaveformSize called:', size, '→', clamped)
        set({ waveformSize: clamped })
      },
      setSelectedProduct: (product) => set({ selectedProduct: product }),
      setSelectedSize: (size) => set({ selectedSize: size }),
      setCustomText: (text) => set({ customText: text }),
      setSongTitle: (title) => set({ songTitle: title }),
      setArtistName: (name) => set({ artistName: name }),
      setCustomDate: (date) => set({ customDate: date }),
      setTextColor: (color) => set({ textColor: color }),
      setTextUseGradient: (use) => set({ textUseGradient: use }),
      setTextGradientStops: (stops) => set({ textGradientStops: stops }),
      setTextGradientDirection: (direction) => set({ textGradientDirection: direction }),
      setShowText: (show) => set({ showText: show }),
      setTextPosition: (position) => set({ textPosition: position }),
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
      setFontSize: (size) => set({ fontSize: size }),
      setFontFamily: (family) => set({ fontFamily: family }),
      setShowQRCode: (show) => set({ showQRCode: show }),
      setQRCodeUrl: (url) => set({ qrCodeUrl: url }),
      setQRCodePosition: (position) => set({ qrCodePosition: position }),
      setDetectedWords: (words) => set({ detectedWords: words }),
      setShowArtisticText: (show) => set({ showArtisticText: show }),
      setArtisticTextStyle: (style) => {
        console.log('🎨 Setting artistic text style to:', style)
        set({ artisticTextStyle: style })
      },
      setArtisticTextColor: (color) => set({ artisticTextColor: color }),
      setArtisticTextOpacity: (opacity) => set({ artisticTextOpacity: Math.max(0, Math.min(1, opacity)) }),
      reset: () => set(initialState),
    }),
    {
      name: 'soundprints-customizer',
      partialize: (state) => ({
        audioUrl: state.audioUrl, // Persist the Supabase URL
        audioFileName: state.audioFileName,
        audioFileSize: state.audioFileSize,
        waveformColor: state.waveformColor,
        backgroundColor: state.backgroundColor,
        waveformStyle: state.waveformStyle,
        selectedProduct: state.selectedProduct,
        selectedSize: state.selectedSize,
        textColor: state.textColor,
        showText: state.showText,
      }),
    }
  )
)
