import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ProductType = 'poster' | 't-shirt' | 'mug' | 'canvas' | 'hoodie'
export type WaveformStyle = 'bars' | 'mirror' | 'circular' | 'dots' | 'radial' | 'galaxy' | 'frequency' | 'particle' | 'ripple' | 'soundwave' | 'wave3d' | 'neon' | 'gradient-bars' | 'vinyl' | 'equalizer' | 'pulse' | 'geometric' | 'dna' | 'moire' | 'fluid' | 'kaleidoscope' | 'glitch' | 'perlin' | 'crystals' | 'tunnel' | 'bloom' | 'aurora' | 'fire'

export interface GradientStop {
  color: string
  position: number // 0 to 1
}

interface CustomizerState {
  // Audio
  audioFile: File | null
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
  backgroundOpacity: number
  waveformStyle: WaveformStyle
  
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
  showText: boolean
  textPosition: 'top' | 'bottom' | 'center'
  fontSize: number
  
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
  setBackgroundOpacity: (opacity: number) => void
  setWaveformStyle: (style: WaveformStyle) => void
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
  setShowText: (show: boolean) => void
  setTextPosition: (position: 'top' | 'bottom' | 'center') => void
  setFontSize: (size: number) => void
  reset: () => void
}

const initialState = {
  audioFile: null,
  audioUrl: null,
  audioDuration: 0,
  selectedRegion: null,
  waveformColor: '#000000',
  waveformUseGradient: true,
  waveformGradientStops: [
    { color: '#000000', position: 0 },
    { color: '#FF0000', position: 1 },
  ],
  waveformGradientDirection: 'horizontal' as const,
  backgroundColor: '#FFFFFF',
  backgroundUseGradient: true,
  backgroundGradientStops: [
    { color: '#FFFFFF', position: 0 },
    { color: '#000000', position: 1 },
  ],
  backgroundGradientDirection: 'vertical' as const,
  backgroundImage: null,
  backgroundOpacity: 50,
  waveformStyle: 'bars' as WaveformStyle,
  selectedProduct: 'poster' as ProductType,
  selectedSize: '18x24',
  customText: '',
  songTitle: '',
  artistName: '',
  customDate: '',
  textColor: '#000000',
  showText: false,
  textPosition: 'bottom' as const,
  fontSize: 24,
  showQRCode: false,
  qrCodeUrl: '',
  qrCodePosition: 'bottom-right' as const,
}

export const useCustomizerStore = create<CustomizerState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setAudioFile: (file) => set({ 
        audioFile: file,
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
      setBackgroundOpacity: (opacity) => set({ backgroundOpacity: opacity }),
      setWaveformStyle: (style) => set({ waveformStyle: style }),
      setSelectedProduct: (product) => set({ selectedProduct: product }),
      setSelectedSize: (size) => set({ selectedSize: size }),
      setCustomText: (text) => set({ customText: text }),
      setSongTitle: (title) => set({ songTitle: title }),
      setArtistName: (name) => set({ artistName: name }),
      setCustomDate: (date) => set({ customDate: date }),
      setTextColor: (color) => set({ textColor: color }),
      setShowText: (show) => set({ showText: show }),
      setTextPosition: (position) => set({ textPosition: position }),
      setFontSize: (size) => set({ fontSize: size }),
      setShowQRCode: (show) => set({ showQRCode: show }),
      setQRCodeUrl: (url) => set({ qrCodeUrl: url }),
      setQRCodePosition: (position) => set({ qrCodePosition: position }),
      reset: () => set(initialState),
    }),
    {
      name: 'soundprints-customizer',
      partialize: (state) => ({
        audioUrl: state.audioUrl, // Persist the Supabase URL
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
