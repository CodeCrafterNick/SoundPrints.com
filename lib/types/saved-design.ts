import type { 
  WaveformStyle, 
  ProductType, 
  GradientStop, 
  TextElement,
  ArtisticTextStyle 
} from '@/lib/stores/customizer-store'

// The serializable state that can be saved/loaded
export interface SavedDesignState {
  // Audio reference (URL to Supabase storage)
  audioUrl: string | null
  audioFileName: string | null
  audioFileSize: number | null
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
  backgroundFocalPoint: { x: number; y: number } | null
  waveformStyle: WaveformStyle
  waveformSize: number
  waveformHeightMultiplier: number
  waveformX: number
  waveformY: number
  barWidth: number
  barGap: number
  barRounded: boolean
  circleRadius: number
  mirrorUseTwoColors: boolean
  mirrorSecondaryColor: string
  canvasAspectRatio: string
  imageMaskImage: string | null
  imageMaskShape: 'normal' | 'circular'
  imageMaskFocalPoint: { x: number; y: number } | null
  
  // QR Code
  showQRCode: boolean
  qrCodeUrl: string
  qrCodePosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  qrCodeSize: number
  qrCodeX: number
  qrCodeY: number
  
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
  textX: number
  textY: number
  fontSize: number
  fontFamily: string
  
  // Multiple text elements
  textElements: TextElement[]
  
  // Artistic text
  showArtisticText: boolean
  artisticTextStyle: ArtisticTextStyle
  artisticTextColor: string
  artisticTextOpacity: number
}

// Saved design with metadata
export interface SavedDesign {
  id: string
  name: string
  thumbnailUrl?: string // Preview image of the design
  state: SavedDesignState
  createdAt: string // ISO date string
  updatedAt: string // ISO date string
  
  // Cloud sync info
  cloudId?: string // Database ID if synced to cloud
  cloudSyncedAt?: string // Last sync time
  isDirty?: boolean // Local changes not yet synced
  
  // Order reference (if created from an order)
  orderId?: string
  orderItemId?: string
}

// List item for displaying in UI (minimal data)
export interface SavedDesignListItem {
  id: string
  name: string
  thumbnailUrl?: string
  audioFileName: string | null
  waveformStyle: WaveformStyle
  createdAt: string
  updatedAt: string
  isSyncedToCloud: boolean
  orderId?: string
}

// API request/response types
export interface SaveDesignRequest {
  design: SavedDesign
  generateThumbnail?: boolean
}

export interface SaveDesignResponse {
  success: boolean
  cloudId: string
  thumbnailUrl?: string
  error?: string
}

export interface LoadDesignsResponse {
  success: boolean
  designs: SavedDesign[]
  error?: string
}

// Extract design state from customizer store
export function extractDesignState(state: Record<string, unknown>): SavedDesignState {
  return {
    audioUrl: state.audioUrl as string | null,
    audioFileName: state.audioFileName as string | null,
    audioFileSize: state.audioFileSize as number | null,
    audioDuration: state.audioDuration as number,
    selectedRegion: state.selectedRegion as { start: number; end: number } | null,
    waveformColor: state.waveformColor as string,
    waveformUseGradient: state.waveformUseGradient as boolean,
    waveformGradientStops: state.waveformGradientStops as GradientStop[],
    waveformGradientDirection: state.waveformGradientDirection as 'horizontal' | 'vertical' | 'diagonal' | 'radial',
    backgroundColor: state.backgroundColor as string,
    backgroundUseGradient: state.backgroundUseGradient as boolean,
    backgroundGradientStops: state.backgroundGradientStops as GradientStop[],
    backgroundGradientDirection: state.backgroundGradientDirection as 'horizontal' | 'vertical' | 'diagonal' | 'radial',
    backgroundImage: state.backgroundImage as string | null,
    backgroundImagePosition: state.backgroundImagePosition as 'center' | 'top' | 'bottom' | 'left' | 'right',
    backgroundFocalPoint: state.backgroundFocalPoint as { x: number; y: number } | null,
    waveformStyle: state.waveformStyle as WaveformStyle,
    waveformSize: state.waveformSize as number,
    waveformHeightMultiplier: state.waveformHeightMultiplier as number,
    waveformX: state.waveformX as number,
    waveformY: state.waveformY as number,
    barWidth: state.barWidth as number,
    barGap: state.barGap as number,
    barRounded: state.barRounded as boolean,
    circleRadius: state.circleRadius as number,
    mirrorUseTwoColors: state.mirrorUseTwoColors as boolean,
    mirrorSecondaryColor: state.mirrorSecondaryColor as string,
    canvasAspectRatio: state.canvasAspectRatio as string,
    imageMaskImage: state.imageMaskImage as string | null,
    imageMaskShape: state.imageMaskShape as 'normal' | 'circular',
    imageMaskFocalPoint: state.imageMaskFocalPoint as { x: number; y: number } | null,
    showQRCode: state.showQRCode as boolean,
    qrCodeUrl: state.qrCodeUrl as string,
    qrCodePosition: state.qrCodePosition as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    qrCodeSize: state.qrCodeSize as number,
    qrCodeX: state.qrCodeX as number,
    qrCodeY: state.qrCodeY as number,
    selectedProduct: state.selectedProduct as ProductType,
    selectedSize: state.selectedSize as string,
    customText: state.customText as string,
    songTitle: state.songTitle as string,
    artistName: state.artistName as string,
    customDate: state.customDate as string,
    textColor: state.textColor as string,
    textUseGradient: state.textUseGradient as boolean,
    textGradientStops: state.textGradientStops as GradientStop[],
    textGradientDirection: state.textGradientDirection as 'horizontal' | 'vertical' | 'diagonal' | 'radial',
    showText: state.showText as boolean,
    textPosition: state.textPosition as 'top' | 'bottom' | 'center',
    textX: state.textX as number,
    textY: state.textY as number,
    fontSize: state.fontSize as number,
    fontFamily: state.fontFamily as string,
    textElements: state.textElements as TextElement[],
    showArtisticText: state.showArtisticText as boolean,
    artisticTextStyle: state.artisticTextStyle as ArtisticTextStyle,
    artisticTextColor: state.artisticTextColor as string,
    artisticTextOpacity: state.artisticTextOpacity as number,
  }
}

// Generate unique ID for designs
export function generateDesignId(): string {
  return `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Create a new saved design from current state
export function createSavedDesign(
  state: Record<string, unknown>,
  name?: string,
  orderId?: string,
  orderItemId?: string
): SavedDesign {
  const now = new Date().toISOString()
  const designState = extractDesignState(state)
  
  // Generate name from audio file or date
  const defaultName = designState.audioFileName 
    ? `${designState.audioFileName.replace(/\.[^/.]+$/, '')} - ${new Date().toLocaleDateString()}`
    : `Design - ${new Date().toLocaleDateString()}`
  
  return {
    id: generateDesignId(),
    name: name || defaultName,
    state: designState,
    createdAt: now,
    updatedAt: now,
    orderId,
    orderItemId,
  }
}
