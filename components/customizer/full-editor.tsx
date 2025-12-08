'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { useCartStore } from '@/lib/stores/cart-store'
import { AudioUploader } from '@/components/customizer/audio-uploader'
import { type WaveformEditorHandle } from '@/components/customizer/waveform-editor'
import { UndoRedoToolbar, useUndoRedoKeyboard } from '@/components/customizer/undo-redo-toolbar'
import { PresetSelector } from '@/components/customizer/preset-selector'
import { SavedDesignsDrawer, SaveDesignDialog } from '@/components/customizer/saved-designs'
import { useSavedDesignsStore } from '@/lib/stores/saved-designs-store'
import { extractDesignState } from '@/lib/types/saved-design'
import { type ProductMockupRef } from '@/components/products/product-mockup'
import { type InteractiveCanvasEditorKonvaRef } from '@/components/products/interactive-canvas-editor-konva'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// =============================================================================
// DYNAMIC IMPORTS - Heavy components loaded on-demand for faster initial load
// =============================================================================

// WaveformEditor uses wavesurfer.js (~80kB) - only needed after audio upload
const WaveformEditor = dynamic(
  () => import('@/components/customizer/waveform-editor').then(m => ({ default: m.WaveformEditor })),
  { ssr: false, loading: () => <div className="h-32 animate-pulse bg-gray-100 rounded" /> }
)

// InteractiveCanvasEditor uses Konva for smooth 60fps dragging
const InteractiveCanvasEditor = dynamic(
  () => import('@/components/products/interactive-canvas-editor-konva').then(m => ({ default: m.InteractiveCanvasEditorKonva })),
  { ssr: false, loading: () => <div className="absolute inset-0 animate-pulse bg-gray-50" /> }
)

// ProductMockup - large component with QRCode (~25kB) and canvas rendering
const ProductMockup = dynamic(
  () => import('@/components/products/product-mockup').then(m => ({ default: m.ProductMockup })),
  { ssr: false }
)

// Code-split customizer panels for faster initial load
const StyleCustomizer = dynamic(
  () => import('@/components/customizer/style-customizer').then(m => ({ default: m.StyleCustomizer })),
  { loading: () => <div className="animate-pulse h-48 bg-gray-100 rounded" /> }
)
const ColorCustomizer = dynamic(
  () => import('@/components/customizer/color-customizer').then(m => ({ default: m.ColorCustomizer })),
  { loading: () => <div className="animate-pulse h-48 bg-gray-100 rounded" /> }
)
const TextCustomizer = dynamic(
  () => import('@/components/customizer/text-customizer').then(m => ({ default: m.TextCustomizer })),
  { loading: () => <div className="animate-pulse h-48 bg-gray-100 rounded" /> }
)
const BorderTextCustomizer = dynamic(
  () => import('@/components/customizer/border-text-customizer').then(m => ({ default: m.BorderTextCustomizer })),
  { loading: () => <div className="animate-pulse h-32 bg-gray-100 rounded" /> }
)
const BackgroundCustomizer = dynamic(
  () => import('@/components/customizer/background-customizer').then(m => ({ default: m.BackgroundCustomizer })),
  { loading: () => <div className="animate-pulse h-48 bg-gray-100 rounded" /> }
)
const QRCodeCustomizer = dynamic(
  () => import('@/components/customizer/qrcode-customizer').then(m => ({ default: m.QRCodeCustomizer })),
  { loading: () => <div className="animate-pulse h-48 bg-gray-100 rounded" /> }
)

import {
  Music,
  Sparkles,
  Palette,
  Type,
  Image,
  QrCode,
  Download,
  Maximize,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Check,
  Layers,
  Square,
  ShoppingCart,
  ZoomIn,
  ZoomOut,
  Loader2,
  FileText,
  Frame,
  Clock,
  Sun,
  Waves,
  Newspaper,
  GalleryVertical,
  Home,
  FolderOpen,
  Save,
  RectangleVertical,
  RectangleHorizontal,
  ImageIcon,
  Paintbrush,
  type LucideIcon,
} from 'lucide-react'
import { 
  PRINTIFY_PRODUCTS, 
  type PrintifyProduct,
  type ProductSize 
} from '@/lib/printify-product-catalog'

// Format time in seconds to mm:ss format
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Icon map for product icons
const productIcons: Record<string, LucideIcon> = {
  FileText,
  File: FileText,
  Image,
  Frame,
  Palette,
  Clock,
  Sparkles,
  Sun,
  Waves,
  Layers,
  Square,
  Newspaper,
  GalleryVertical,
}

// ProductIcon component
function ProductIcon({ icon, className }: { icon: string; className?: string }) {
  const IconComponent = productIcons[icon] || FileText
  return <IconComponent className={className} />
}

type SidebarSection = 'audio' | 'style' | 'canvas' | 'colors' | 'bg' | 'text' | 'qrcode' | 'inroom' | null

// Printify mockup types
interface MockupSet {
  front?: string
  front2?: string
  closeUp?: string
  context1?: string
}

interface ColorVariant {
  variantId: number
  color?: string
  mockups: MockupSet
}

interface CachedMockups {
  primary: MockupSet
  colorVariants?: ColorVariant[]
}

interface FullEditorProps {
  mockupRef: React.RefObject<ProductMockupRef | null>
  waveformEditorRef: React.RefObject<WaveformEditorHandle | null>
  selectedWallArtSize: { width: number; height: number }
  selectedProduct: PrintifyProduct
  setSelectedProduct: (product: PrintifyProduct) => void
  selectedSize: ProductSize
  setSelectedSize: (size: ProductSize) => void
  setSelectedWallArtSize: (size: { width: number; height: number }) => void
  selectedFrameColor: 'black' | 'white' | 'walnut'
  setSelectedFrameColor: (color: 'black' | 'white' | 'walnut') => void
}

export function FullEditor({ 
  mockupRef, 
  waveformEditorRef,
  selectedWallArtSize,
  selectedProduct,
  setSelectedProduct,
  selectedSize,
  setSelectedSize,
  setSelectedWallArtSize,
  selectedFrameColor,
  setSelectedFrameColor,
}: FullEditorProps) {
  // Enable keyboard shortcuts for undo/redo (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z)
  useUndoRedoKeyboard()
  
  // Ref for Konva editor export
  const konvaEditorRef = useRef<InteractiveCanvasEditorKonvaRef>(null)
  
  const [activeSection, setActiveSection] = useState<SidebarSection>('audio')
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [hasAutoSwitched, setHasAutoSwitched] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddingDownload, setIsAddingDownload] = useState(false)
  const [isEditorReady, setIsEditorReady] = useState(false)
  
  // Mark editor as ready after initial render
  useEffect(() => {
    const timer = setTimeout(() => setIsEditorReady(true), 500)
    return () => clearTimeout(timer)
  }, [])
  
  // Saved designs state
  const [isSavedDesignsOpen, setIsSavedDesignsOpen] = useState(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [isThemesOpen, setIsThemesOpen] = useState(false)
  const [currentPlayTime, setCurrentPlayTime] = useState(0)
  const saveCurrentDesign = useSavedDesignsStore((state) => state.saveCurrentDesign)
  
  // Printify mockup state
  const [printifyMockups, setPrintifyMockups] = useState<Record<string, CachedMockups>>({})
  const [mockupsLoading, setMockupsLoading] = useState(false)
  const [mockupsFailed, setMockupsFailed] = useState<Set<string>>(new Set())
  const [selectedMockupIndex, setSelectedMockupIndex] = useState(0)
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null)
  
  // Store values
  const audioUrl = useCustomizerStore((state) => state.audioUrl)
  const audioFileName = useCustomizerStore((state) => state.audioFile?.name || '')
  const audioDuration = useCustomizerStore((state) => state.audioDuration)
  const selectedRegion = useCustomizerStore((state) => state.selectedRegion)
  const setSelectedRegion = useCustomizerStore((state) => state.setSelectedRegion)
  const waveformStyle = useCustomizerStore((state) => state.waveformStyle)
  const waveformColor = useCustomizerStore((state) => state.waveformColor)
  const backgroundColor = useCustomizerStore((state) => state.backgroundColor)
  const backgroundImage = useCustomizerStore((state) => state.backgroundImage)
  const barWidth = useCustomizerStore((state) => state.barWidth)
  const barGap = useCustomizerStore((state) => state.barGap)
  const circleRadius = useCustomizerStore((state) => state.circleRadius)
  const waveformSize = useCustomizerStore((state) => state.waveformSize)
  const waveformHeightMultiplier = useCustomizerStore((state) => state.waveformHeightMultiplier)
  const canvasAspectRatio = useCustomizerStore((state) => state.canvasAspectRatio)
  const setBarWidth = useCustomizerStore((state) => state.setBarWidth)
  const setBarGap = useCustomizerStore((state) => state.setBarGap)
  const setCircleRadius = useCustomizerStore((state) => state.setCircleRadius)
  const setWaveformSize = useCustomizerStore((state) => state.setWaveformSize)
  const setWaveformHeightMultiplier = useCustomizerStore((state) => state.setWaveformHeightMultiplier)
  const setCanvasAspectRatio = useCustomizerStore((state) => state.setCanvasAspectRatio)
  const resetStore = useCustomizerStore((state) => state.reset)
  const customText = useCustomizerStore((state) => state.customText)
  const waveformUseGradient = useCustomizerStore((state) => state.waveformUseGradient)
  const waveformGradientStops = useCustomizerStore((state) => state.waveformGradientStops)
  const backgroundUseGradient = useCustomizerStore((state) => state.backgroundUseGradient)
  const backgroundGradientStops = useCustomizerStore((state) => state.backgroundGradientStops)
  const waveformX = useCustomizerStore((state) => state.waveformX)
  const waveformY = useCustomizerStore((state) => state.waveformY)
  const textElements = useCustomizerStore((state) => state.textElements)
  const showQRCode = useCustomizerStore((state) => state.showQRCode)
  const qrCodeUrl = useCustomizerStore((state) => state.qrCodeUrl)
  const qrCodeX = useCustomizerStore((state) => state.qrCodeX)
  const qrCodeY = useCustomizerStore((state) => state.qrCodeY)
  const qrCodeSize = useCustomizerStore((state) => state.qrCodeSize)
  const barRounded = useCustomizerStore((state) => state.barRounded)
  const computedWaveformData = useCustomizerStore((state) => state.computedWaveformData)
  
  // Cart store
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)
  
  const isCircular = ['circular', 'soundwave'].includes(waveformStyle)
  const usesBarSettings = ['bars', 'gradient-bars', 'mirror', 'spectrum', 'frequency', 'equalizer', 'neon', 'glow', 'soundcloud', 'blocks', 'matrix', 'spectrogram', 'crystals'].includes(waveformStyle)

  // Invalidate mockup cache when any design property changes
  // This ensures re-generation when user makes changes and returns to In Room tab
  const designHash = JSON.stringify({
    selectedRegion,
    waveformStyle, waveformColor, waveformUseGradient, waveformGradientStops,
    backgroundColor, backgroundUseGradient, backgroundGradientStops, backgroundImage,
    barWidth, barGap, barRounded, circleRadius, waveformSize, waveformHeightMultiplier,
    waveformX, waveformY,
    textElements: textElements.map(t => ({ text: t.text, x: t.x, y: t.y, fontSize: t.fontSize, fontFamily: t.fontFamily, color: t.color })),
    showQRCode, qrCodeUrl, qrCodeX, qrCodeY, qrCodeSize,
  })
  
  const prevDesignHashRef = useRef<string | null>(null)
  
  useEffect(() => {
    // Skip on initial mount
    if (prevDesignHashRef.current === null) {
      prevDesignHashRef.current = designHash
      return
    }
    
    // If design changed and we have cached mockups, invalidate them
    if (prevDesignHashRef.current !== designHash) {
      console.log('[Mockups] Design changed, invalidating cache')
      setPrintifyMockups({})
      setMockupsFailed(new Set())
    }
    
    prevDesignHashRef.current = designHash
  }, [designHash])

  // Update preview thumbnail when in inroom section - use Konva export for accurate preview
  useEffect(() => {
    if (activeSection !== 'inroom' || !audioUrl) return
    
    const updateThumbnail = async () => {
      // Try Konva export first (matches what user sees with QR and text)
      if (konvaEditorRef.current) {
        try {
          // Use pixelRatio of 2 for better quality, cropToDesign=true to exclude padding
          const dataUrl = await konvaEditorRef.current.exportImage(2, true)
          setPreviewThumbnail(dataUrl)
          return
        } catch (e) {
          console.log('[Thumbnail] Konva export failed, falling back to mockup')
        }
      }
      
      // Fallback to mockupRef canvas
      if (mockupRef.current?.canvas) {
        const canvas = mockupRef.current.canvas
        // Check if canvas has actual content (not just empty)
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        
        // Sample a few pixels to check if canvas has content
        const imageData = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1)
        const hasContent = imageData.data.some(val => val !== 0)
        
        if (hasContent || canvas.width > 0) {
          const thumbCanvas = document.createElement('canvas')
          thumbCanvas.width = 240
          thumbCanvas.height = Math.round(240 * (canvas.height / canvas.width))
          const thumbCtx = thumbCanvas.getContext('2d')
          if (thumbCtx) {
            thumbCtx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height)
            setPreviewThumbnail(thumbCanvas.toDataURL('image/png', 0.8))
          }
        }
      }
    }
    
    // Give the canvas a moment to render before initial capture
    const initialTimeout = setTimeout(updateThumbnail, 100)
    
    // Update periodically while viewing inroom
    const interval = setInterval(updateThumbnail, 500)
    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [activeSection, audioUrl, mockupRef, waveformStyle, waveformColor, backgroundColor, selectedRegion])

  // Auto-open style section when audio is FIRST loaded (only once)
  useEffect(() => {
    if (audioUrl && activeSection === 'audio' && !hasAutoSwitched) {
      const timer = setTimeout(() => {
        setActiveSection('style')
        setHasAutoSwitched(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [audioUrl, activeSection, hasAutoSwitched])

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (waveformEditorRef.current) {
      waveformEditorRef.current.togglePlayPause()
      setIsPlaying(waveformEditorRef.current.isPlaying())
    }
  }, [waveformEditorRef])

  // Sync isPlaying state and current time
  useEffect(() => {
    const interval = setInterval(() => {
      if (waveformEditorRef.current) {
        const playing = waveformEditorRef.current.isPlaying()
        if (playing !== isPlaying) {
          setIsPlaying(playing)
        }
        // Update playhead position when playing
        if (playing) {
          setCurrentPlayTime(waveformEditorRef.current.getCurrentTime())
        }
      }
    }, 50) // Update more frequently for smooth playhead
    return () => clearInterval(interval)
  }, [isPlaying, waveformEditorRef])

  // Reset everything
  const handleReset = useCallback(() => {
    if (waveformEditorRef.current) {
      waveformEditorRef.current.pause()
    }
    setIsPlaying(false)
    setPrintifyMockups({})
    setMockupsFailed(new Set())
    resetStore()
    setActiveSection('audio')
    setHasAutoSwitched(false) // Reset so auto-switch works again for new audio
    useSavedDesignsStore.getState().setActiveDesignId(null)
  }, [resetStore, waveformEditorRef])
  
  // Handle saving design with thumbnail
  const handleSaveDesign = useCallback((name?: string) => {
    let thumbnailUrl = ''
    
    // Generate thumbnail from the mockup canvas
    if (mockupRef.current?.canvas) {
      const canvas = mockupRef.current.canvas
      const thumbCanvas = document.createElement('canvas')
      thumbCanvas.width = 200
      thumbCanvas.height = Math.round(200 * (canvas.height / canvas.width))
      const ctx = thumbCanvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height)
        thumbnailUrl = thumbCanvas.toDataURL('image/jpeg', 0.8)
      }
    }
    
    saveCurrentDesign(name, thumbnailUrl)
    toast.success('Design saved!', {
      description: name ? `Saved as "${name}"` : 'Your design has been saved locally',
    })
  }, [mockupRef, saveCurrentDesign])

  // Fetch Printify mockups for In Room preview
  const fetchPrintifyMockups = useCallback(async () => {
    if (!mockupRef.current) {
      toast.error('Design preview not ready')
      return
    }

    const cacheKey = `${selectedProduct.blueprintId}-${selectedSize.value}`
    
    // Check if we already have mockups for this product/size
    if (printifyMockups[cacheKey]) {
      console.log(`[Mockups] Using cached mockup for ${cacheKey}`)
      return
    }

    // Don't retry if this combination already failed
    if (mockupsFailed.has(cacheKey)) {
      console.log(`[Mockups] Skipping ${cacheKey} - previously failed`)
      return
    }

    setMockupsLoading(true)
    const startTime = performance.now()
    
    try {
      // Export the design as base64 - skip Supabase upload for faster mockup generation
      let printDataUrl: string
      
      // Use Konva export for accurate rendering that matches the editor (includes QR/text)
      if (konvaEditorRef.current) {
        // Use pixelRatio of 2 for preview quality (faster than 4, still good for mockups)
        printDataUrl = await konvaEditorRef.current.exportImage(2, true)
        console.log('[Printify] Using Konva export for design (cropped to design)')
      } else if (mockupRef.current) {
        // Fallback to ProductMockup
        printDataUrl = await mockupRef.current.getPrintFile()
        console.log('[Printify] Using ProductMockup fallback for design')
      } else {
        throw new Error('No export method available')
      }

      toast.loading(`Generating ${selectedProduct.shortName} ${selectedSize.label} preview...`, { id: 'mockups' })

      // Send base64 directly to Printify (faster than URL-based upload via Supabase)
      const response = await fetch('/api/preview-mockups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          designBase64: printDataUrl, // Direct base64 upload - faster!
          blueprintId: selectedProduct.blueprintId,
          size: selectedSize.value,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Mockup generation failed:', errorData)
        throw new Error('Failed to generate mockups')
      }

      const data = await response.json()
      const totalTime = Math.round(performance.now() - startTime)
      
      if (data.mockup) {
        const cachedData: CachedMockups = {
          primary: data.mockup.mockups,
          colorVariants: data.colorVariants || [],
        }
        setPrintifyMockups(prev => ({
          ...prev,
          [cacheKey]: cachedData,
        }))
        const variantCount = data.colorVariants?.length || 0
        const variantText = variantCount > 1 ? ` (${variantCount} color options)` : ''
        console.log(`[Mockups] Generated in ${totalTime}ms`)
        toast.success(`Generated ${selectedProduct.shortName} ${selectedSize.label} preview${variantText}`, { id: 'mockups' })
      } else {
        setMockupsFailed(prev => new Set(prev).add(cacheKey))
        toast.error(`No mockup available for ${selectedProduct.shortName} ${selectedSize.label}`, { id: 'mockups' })
      }

    } catch (error) {
      console.error('Failed to fetch mockups:', error)
      setMockupsFailed(prev => new Set(prev).add(cacheKey))
      toast.error('Failed to generate room preview', { id: 'mockups' })
    } finally {
      setMockupsLoading(false)
    }
  }, [mockupsFailed, printifyMockups, selectedProduct.blueprintId, selectedProduct.shortName, selectedSize.label, selectedSize.value, mockupRef])

  // Auto-fetch mockups when viewing inroom tab
  useEffect(() => {
    const cacheKey = `${selectedProduct.blueprintId}-${selectedSize.value}`
    const shouldFetch = audioUrl && !mockupsLoading && !printifyMockups[cacheKey] && !mockupsFailed.has(cacheKey)
    
    if (activeSection === 'inroom' && shouldFetch) {
      fetchPrintifyMockups()
    }
  }, [selectedProduct.blueprintId, selectedSize.value, activeSection, audioUrl, mockupsLoading, printifyMockups, mockupsFailed, fetchPrintifyMockups])

  // Add to cart handler
  const handleAddToCart = useCallback(async () => {
    if (!audioUrl || !mockupRef.current?.canvas) return

    setIsAddingToCart(true)
    const canvas = mockupRef.current.canvas
    
    // Create thumbnail for cart display
    const thumbCanvas = document.createElement('canvas')
    const thumbSize = 400
    const aspectRatio = canvas.width / canvas.height
    thumbCanvas.width = thumbSize
    thumbCanvas.height = thumbSize / aspectRatio
    const thumbCtx = thumbCanvas.getContext('2d')
    if (thumbCtx) {
      thumbCtx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height)
    }
    const thumbnailUrl = thumbCanvas.toDataURL('image/png', 0.9)

    const uploadingToast = toast.loading('Saving design...')
    
    let designUrl = ''
    try {
      const printFileDataUrl = canvas.toDataURL('image/png', 1.0)
      
      const uploadResponse = await fetch('/api/upload-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworkDataUrl: printFileDataUrl })
      })
      
      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json()
        designUrl = uploadData.artworkUrl
      } else {
        toast.dismiss(uploadingToast)
        toast.error('Failed to upload design. Please try again.')
        setIsAddingToCart(false)
        return
      }
    } catch (uploadError) {
      console.error('[Add to Cart] Upload error:', uploadError)
      toast.dismiss(uploadingToast)
      toast.error('Failed to upload design. Please try again.')
      setIsAddingToCart(false)
      return
    }

    toast.dismiss(uploadingToast)

    // Extract the current design state for recreating later
    const customizerState = useCustomizerStore.getState()
    const designState = extractDesignState(customizerState as unknown as Record<string, unknown>)

    addItem({
      audioFileName,
      audioFileUrl: audioUrl,
      audioSelectionStart: selectedRegion?.start,
      audioSelectionEnd: selectedRegion?.end,
      waveformColor,
      backgroundColor,
      productType: selectedProduct.category === 'framed' ? 'framed-poster' : selectedProduct.category as 'poster' | 'canvas',
      size: selectedSize.label,
      customText,
      price: selectedSize.price,
      thumbnailUrl: designUrl || thumbnailUrl,
      designUrl,
      printifyBlueprintId: String(selectedProduct.blueprintId),
      printifyVariantId: selectedSize.value,
      waveformStyle: waveformStyle,
      designPreset: undefined,
      productColor: undefined,
      mockupUrl: designUrl,
      designState, // Include full design state for recreating the design
    })

    toast.success('Added to cart!', {
      description: `${selectedProduct.name} (${selectedSize.label}) added to your cart.`,
    })

    setIsAddingToCart(false)
    openCart()
  }, [audioUrl, mockupRef, audioFileName, selectedRegion, waveformColor, backgroundColor, selectedProduct, selectedSize, customText, waveformStyle, addItem, openCart])

  // Add hi-def digital download to cart
  const handleAddDigitalDownload = useCallback(async () => {
    if (!audioUrl || !mockupRef.current?.canvas) return

    setIsAddingDownload(true)
    const canvas = mockupRef.current.canvas
    
    // Generate hi-res version - 4000x6000 or larger based on aspect ratio
    const hiResWidth = 4000
    const aspectRatio = canvas.height / canvas.width
    const hiResHeight = Math.round(hiResWidth * aspectRatio)
    
    // Create a high-res canvas
    const hiResCanvas = document.createElement('canvas')
    hiResCanvas.width = hiResWidth
    hiResCanvas.height = hiResHeight
    const hiResCtx = hiResCanvas.getContext('2d')
    
    if (!hiResCtx) {
      toast.error('Failed to create hi-res canvas')
      setIsAddingDownload(false)
      return
    }
    
    // Draw scaled up version
    hiResCtx.imageSmoothingEnabled = true
    hiResCtx.imageSmoothingQuality = 'high'
    hiResCtx.drawImage(canvas, 0, 0, hiResWidth, hiResHeight)
    
    // Also create a thumbnail
    const thumbCanvas = document.createElement('canvas')
    const thumbSize = 400
    thumbCanvas.width = thumbSize
    thumbCanvas.height = thumbSize / (canvas.width / canvas.height)
    const thumbCtx = thumbCanvas.getContext('2d')
    if (thumbCtx) {
      thumbCtx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height)
    }
    const thumbnailUrl = thumbCanvas.toDataURL('image/png', 0.9)

    const uploadingToast = toast.loading('Preparing hi-def download...')
    
    let designUrl = ''
    try {
      const printFileDataUrl = hiResCanvas.toDataURL('image/png', 1.0)
      
      const uploadResponse = await fetch('/api/upload-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworkDataUrl: printFileDataUrl })
      })
      
      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json()
        designUrl = uploadData.artworkUrl
      } else {
        toast.dismiss(uploadingToast)
        toast.error('Failed to upload design. Please try again.')
        setIsAddingDownload(false)
        return
      }
    } catch (uploadError) {
      console.error('[Digital Download] Upload error:', uploadError)
      toast.dismiss(uploadingToast)
      toast.error('Failed to upload design. Please try again.')
      setIsAddingDownload(false)
      return
    }

    toast.dismiss(uploadingToast)

    // Extract the current design state for recreating later
    const customizerState = useCustomizerStore.getState()
    const designState = extractDesignState(customizerState as unknown as Record<string, unknown>)

    addItem({
      audioFileName: audioFileName || 'SoundPrint',
      audioFileUrl: audioUrl,
      audioSelectionStart: selectedRegion?.start,
      audioSelectionEnd: selectedRegion?.end,
      waveformColor,
      backgroundColor,
      productType: 'digital-download',
      size: `${hiResWidth}×${hiResHeight} px`,
      customText,
      price: 1.00, // $1 for hi-def download
      thumbnailUrl: designUrl || thumbnailUrl,
      designUrl,
      waveformStyle: waveformStyle,
      designState,
    })

    toast.success('Hi-Def Download added!', {
      description: `You'll get a download link (${hiResWidth}×${hiResHeight}) after checkout.`,
    })

    setIsAddingDownload(false)
    openCart()
  }, [audioUrl, mockupRef, audioFileName, selectedRegion, waveformColor, backgroundColor, customText, waveformStyle, addItem, openCart])

  // Test download - generates and downloads the print file directly using Konva export
  const [isTestDownloading, setIsTestDownloading] = useState(false)
  const handleTestDownload = useCallback(async () => {
    // Try Konva export first (matches what user sees), fallback to ProductMockup
    if (!konvaEditorRef.current && !mockupRef.current) {
      toast.error('Design not ready')
      return
    }
    
    setIsTestDownloading(true)
    const downloadToast = toast.loading('Generating hi-res download...')
    
    try {
      let printDataUrl: string
      
      if (konvaEditorRef.current) {
        // Use Konva export with cropToDesign - matches what Printify receives
        // pixelRatio of 4 gives us 4x resolution (e.g., 500px editor -> 2000px export)
        printDataUrl = await konvaEditorRef.current.exportImage(4, true)
        console.log('[Download] Used Konva export (cropped to design)')
      } else if (mockupRef.current) {
        // Fallback to ProductMockup
        printDataUrl = await mockupRef.current.getPrintFile()
        console.log('[Download] Used ProductMockup fallback')
      } else {
        throw new Error('No export method available')
      }
      
      // Create download link
      const link = document.createElement('a')
      link.href = printDataUrl
      link.download = `soundprint-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Download started!', { id: downloadToast })
    } catch (error) {
      console.error('Test download error:', error)
      toast.error('Download failed', { id: downloadToast })
    } finally {
      setIsTestDownloading(false)
    }
  }, [konvaEditorRef, mockupRef])

  const sidebarItems = [
    { id: 'audio' as const, icon: Music, label: 'Audio', hasContent: !!audioUrl },
    { id: 'style' as const, icon: Sparkles, label: 'Style', disabled: !audioUrl },
    { id: 'canvas' as const, icon: Maximize, label: 'Dimensions', disabled: !audioUrl },
    { id: 'colors' as const, icon: Palette, label: 'Colors', disabled: !audioUrl },
    { id: 'bg' as const, icon: Image, label: 'Background', disabled: !audioUrl },
    { id: 'text' as const, icon: Type, label: 'Text', disabled: !audioUrl },
    { id: 'qrcode' as const, icon: QrCode, label: 'QR', disabled: !audioUrl },
    { id: 'inroom' as const, icon: Home, label: 'In Room', disabled: !audioUrl },
  ]

  // Full-screen loader until editor is ready
  if (!isEditorReady) {
    return (
      <div className="flex h-[calc(100vh-57px)] bg-gray-100 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-end gap-1.5 h-16">
            <div className="w-2 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '30%', animationDelay: '0ms' }} />
            <div className="w-2 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '60%', animationDelay: '80ms' }} />
            <div className="w-2 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '100%', animationDelay: '160ms' }} />
            <div className="w-2 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '70%', animationDelay: '240ms' }} />
            <div className="w-2 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '90%', animationDelay: '320ms' }} />
            <div className="w-2 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '50%', animationDelay: '400ms' }} />
            <div className="w-2 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '80%', animationDelay: '480ms' }} />
          </div>
          <p className="text-lg font-medium text-gray-700">Loading SoundPrint Studio...</p>
          <p className="text-sm text-gray-500">Preparing your creative workspace</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-57px)] bg-gray-100 overflow-hidden">
      {/* Icon Sidebar - Always visible */}
      <div className="w-20 bg-gray-900 flex flex-col items-center py-3 gap-1 flex-shrink-0">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          const isDisabled = item.disabled
          
          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && setActiveSection(isActive ? null : item.id)}
              disabled={isDisabled}
              className={cn(
                "w-16 h-12 rounded flex flex-col items-center justify-center gap-0.5 transition-all",
                isActive 
                  ? "bg-white text-gray-900" 
                  : isDisabled
                    ? "text-gray-600 cursor-not-allowed opacity-50"
                    : "text-gray-400 hover:text-white hover:bg-gray-800",
                item.hasContent && !isActive && "text-emerald-400"
              )}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </button>
          )
        })}
        
        {/* Spacer */}
        <div className="flex-1" />
        
        {/* Bottom actions */}
        <div className="space-y-1">
          {/* Themes */}
          {audioUrl && (
            <button
              onClick={() => setIsThemesOpen(true)}
              className="w-16 h-12 rounded flex flex-col items-center justify-center text-gray-400 hover:text-amber-400 hover:bg-gray-800 transition-all"
              title="Design Themes"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-[10px] font-medium">Themes</span>
            </button>
          )}
          
          {/* Saved Designs */}
          <button
            onClick={() => setIsSavedDesignsOpen(true)}
            className="w-16 h-12 rounded flex flex-col items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            title="Saved Designs"
          >
            <FolderOpen className="w-5 h-5" />
            <span className="text-[10px] font-medium">Designs</span>
          </button>
          
          {/* Save Current */}
          {audioUrl && (
            <button
              onClick={() => setIsSaveDialogOpen(true)}
              className="w-16 h-12 rounded flex flex-col items-center justify-center text-gray-400 hover:text-emerald-400 hover:bg-gray-800 transition-all"
              title="Save Design"
            >
              <Save className="w-5 h-5" />
              <span className="text-[10px] font-medium">Save</span>
            </button>
          )}
          
          <UndoRedoToolbar variant="vertical" />
          <button
            onClick={handleReset}
            className="w-16 h-12 rounded flex flex-col items-center justify-center text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-all"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="text-[10px] font-medium">Reset</span>
          </button>
        </div>
      </div>

      {/* Expandable Panel */}
      <div 
        className={cn(
          "bg-white border-r border-gray-200 overflow-hidden transition-all duration-300 ease-in-out flex-shrink-0",
          activeSection && !isPanelCollapsed ? "w-80" : "w-0"
        )}
      >
        {activeSection && !isPanelCollapsed && (
          <div className="w-80 h-full flex flex-col">
            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeSection === 'audio' && (
                <div className="space-y-4">
                  <AudioUploader />
                </div>
              )}
              
              {/* Keep WaveformEditor mounted to prevent reloading - just hide when not on audio tab */}
              {audioUrl && (
                <div className={activeSection === 'audio' ? 'pt-4 border-t border-gray-100' : 'hidden'}>
                  <WaveformEditor ref={waveformEditorRef} />
                </div>
              )}

              {activeSection === 'style' && (
                <div className="space-y-4">
                  {/* Waveform Size - at top for visibility */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Waveform Size</label>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Scale</span>
                        <span>{Math.round(waveformSize)}%</span>
                      </div>
                      <Slider
                        value={[waveformSize]}
                        onValueChange={(v) => setWaveformSize(v[0])}
                        min={20}
                        max={200}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-100">
                    <StyleCustomizer />
                  </div>
                </div>
              )}

              {activeSection === 'canvas' && (
                <div className="space-y-4">
                  {/* Material with icons */}
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-2 block">Material</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'poster', label: 'Poster', Icon: ImageIcon, productIds: ['poster-vertical', 'poster-horizontal', 'satin-poster'] },
                        { id: 'canvas', label: 'Canvas', Icon: Paintbrush, productIds: ['stretched-canvas'] },
                        { id: 'framed', label: 'Framed', Icon: Frame, productIds: ['framed-vertical', 'framed-horizontal'] },
                      ].map((group) => {
                        const isSelected = group.productIds.includes(selectedProduct.id)
                        return (
                          <button
                            key={group.id}
                            onClick={() => {
                              const product = PRINTIFY_PRODUCTS.find(p => group.productIds.includes(p.id))
                              if (product) {
                                setSelectedProduct(product)
                                const newSize = product.sizes.find(s => s.popular) || product.sizes[0]
                                setSelectedSize(newSize)
                                setSelectedWallArtSize({ width: newSize.width, height: newSize.height })
                                // Update canvas aspect ratio
                                const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
                                const d = gcd(newSize.width, newSize.height)
                                setCanvasAspectRatio(`${newSize.width / d}:${newSize.height / d}`)
                              }
                            }}
                            className={cn(
                              'flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded border-2 transition-all',
                              isSelected
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                            )}
                          >
                            <group.Icon className={cn('w-6 h-6', isSelected ? 'text-primary' : 'text-gray-400')} />
                            <span className="text-xs font-semibold">{group.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* Orientation - big icon buttons */}
                  {(selectedProduct.category === 'poster' || selectedProduct.category === 'framed') && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-2 block">Orientation</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'vertical', label: 'Portrait', Icon: RectangleVertical },
                          { id: 'horizontal', label: 'Landscape', Icon: RectangleHorizontal },
                        ].map((orient) => {
                          const currentSizeIsVertical = selectedSize.height > selectedSize.width
                          const currentOrientation = currentSizeIsVertical ? 'vertical' : 'horizontal'
                          const isSelected = selectedProduct.orientation === 'both' 
                            ? currentOrientation === orient.id
                            : selectedProduct.orientation === orient.id
                          return (
                            <button
                              key={orient.id}
                              onClick={() => {
                                if (selectedProduct.orientation === 'both') {
                                  const orientedSizes = selectedProduct.sizes.filter(s => 
                                    orient.id === 'vertical' ? s.height > s.width : s.width > s.height
                                  )
                                  if (orientedSizes.length > 0) {
                                    const newSize = orientedSizes.find(s => s.popular) || orientedSizes[0]
                                    setSelectedSize(newSize)
                                    setSelectedWallArtSize({ width: newSize.width, height: newSize.height })
                                    // Update canvas aspect ratio
                                    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
                                    const d = gcd(newSize.width, newSize.height)
                                    setCanvasAspectRatio(`${newSize.width / d}:${newSize.height / d}`)
                                  }
                                } else {
                                  const baseId = selectedProduct.id.replace('-vertical', '').replace('-horizontal', '')
                                  const targetId = `${baseId}-${orient.id}`
                                  const targetProduct = PRINTIFY_PRODUCTS.find(p => p.id === targetId)
                                  if (targetProduct) {
                                    setSelectedProduct(targetProduct)
                                    const newSize = targetProduct.sizes.find(s => s.popular) || targetProduct.sizes[0]
                                    setSelectedSize(newSize)
                                    setSelectedWallArtSize({ width: newSize.width, height: newSize.height })
                                    // Update canvas aspect ratio
                                    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
                                    const d = gcd(newSize.width, newSize.height)
                                    setCanvasAspectRatio(`${newSize.width / d}:${newSize.height / d}`)
                                  }
                                }
                              }}
                              className={cn(
                                'flex flex-col items-center justify-center gap-1.5 py-3 px-4 rounded border-2 transition-all',
                                isSelected
                                  ? 'border-primary bg-primary/10 text-primary'
                                  : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                              )}
                            >
                              <orient.Icon className={cn('w-8 h-8', isSelected ? 'text-primary' : 'text-gray-400')} />
                              <span className="text-xs font-semibold">{orient.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Finish - compact for posters */}
                  {selectedProduct.category === 'poster' && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block">Finish</label>
                      <div className="flex bg-gray-100 rounded p-0.5">
                        {[
                          { id: 'matte', label: 'Matte', productIds: ['poster-vertical', 'poster-horizontal'] },
                          { id: 'satin', label: 'Satin', productIds: ['satin-poster'] },
                        ].map((finish) => {
                          const isSelected = finish.productIds.includes(selectedProduct.id)
                          return (
                            <button
                              key={finish.id}
                              onClick={() => {
                                const isHorizontal = selectedProduct.orientation === 'horizontal'
                                const targetProduct = PRINTIFY_PRODUCTS.find(p => 
                                  finish.productIds.includes(p.id) && 
                                  (p.orientation === (isHorizontal ? 'horizontal' : 'vertical') || p.orientation === 'both')
                                ) || PRINTIFY_PRODUCTS.find(p => finish.productIds.includes(p.id))
                                if (targetProduct) {
                                  setSelectedProduct(targetProduct)
                                  const newSize = targetProduct.sizes.find(s => s.popular) || targetProduct.sizes[0]
                                  setSelectedSize(newSize)
                                  setSelectedWallArtSize({ width: newSize.width, height: newSize.height })
                                }
                              }}
                              className={cn(
                                'flex-1 py-1.5 rounded text-[10px] font-semibold transition-all',
                                isSelected
                                  ? 'bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-500 hover:text-gray-700'
                              )}
                            >
                              {finish.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Size Selection - 2-column grid with bigger icons */}
                  <div className="pt-3 border-t border-gray-100">
                    <label className="text-xs font-medium text-gray-500 mb-2 block">Size</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(() => {
                        const maxDimension = Math.max(...selectedProduct.sizes.map(s => Math.max(s.width, s.height)))
                        const scaleFactor = 50 / maxDimension
                        
                        return selectedProduct.sizes.map((size) => {
                          const isSelected = selectedSize.value === size.value
                          const visualW = Math.max(20, Math.round(size.width * scaleFactor))
                          const visualH = Math.max(20, Math.round(size.height * scaleFactor))
                          
                          return (
                            <button
                              key={size.value}
                              onClick={() => {
                                setSelectedSize(size)
                                setSelectedWallArtSize({ width: size.width, height: size.height })
                                const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
                                const d = gcd(size.width, size.height)
                                setCanvasAspectRatio(`${size.width / d}:${size.height / d}`)
                              }}
                              className={cn(
                                "relative flex items-center gap-3 px-3 py-2.5 rounded border-2 transition-all",
                                isSelected
                                  ? "border-primary bg-primary/10"
                                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                                size.popular && !isSelected && "ring-2 ring-amber-200/50"
                              )}
                            >
                              {/* Visual proportional size icon - bigger */}
                              <div 
                                className={cn(
                                  "border-2 flex-shrink-0 rounded-sm",
                                  isSelected 
                                    ? "border-primary bg-primary/20" 
                                    : "border-gray-400 bg-gray-100"
                                )}
                                style={{ 
                                  width: `${visualW}px`, 
                                  height: `${visualH}px`,
                                }}
                              />
                              {/* Size label and price */}
                              <div className="flex flex-col items-start min-w-0 flex-1">
                                <span className={cn(
                                  "text-xs font-semibold",
                                  isSelected ? "text-primary" : "text-gray-700"
                                )}>
                                  {size.label}
                                </span>
                                <span className={cn(
                                  "text-[11px] font-medium",
                                  isSelected ? "text-primary/90" : "text-gray-500"
                                )}>
                                  ${size.price.toFixed(0)}
                                </span>
                              </div>
                              {size.popular && (
                                <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-900 rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">★</span>
                              )}
                            </button>
                          )
                        })
                      })()}
                    </div>
                  </div>
                  
                  {/* Frame Color - compact */}
                  {selectedProduct.category === 'framed' && (
                    <div className="pt-2 border-t border-gray-100">
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block">Frame</label>
                      <div className="flex gap-1.5">
                        {([
                          { id: 'black', name: 'Black', hex: '#1a1a1a' },
                          { id: 'white', name: 'White', hex: '#ffffff' },
                          { id: 'walnut', name: 'Walnut', hex: '#5c4033' },
                        ] as const).map((fc) => (
                          <button
                            key={fc.id}
                            onClick={() => setSelectedFrameColor(fc.id)}
                            className={cn(
                              "w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center",
                              selectedFrameColor === fc.id
                                ? "border-primary ring-2 ring-primary/30"
                                : "border-gray-300"
                            )}
                            style={{ backgroundColor: fc.hex }}
                            title={fc.name}
                          >
                            {selectedFrameColor === fc.id && (
                              <Check className={cn("w-3 h-3", fc.id === 'white' ? 'text-gray-800' : 'text-white')} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'colors' && (
                <div className="space-y-4">
                  <ColorCustomizer />
                </div>
              )}

              {activeSection === 'bg' && (
                <div className="space-y-4">
                  <BackgroundCustomizer />
                </div>
              )}

              {activeSection === 'text' && (
                <div className="space-y-4">
                  <TextCustomizer />
                  <div className="border-t border-gray-100 pt-4">
                    <BorderTextCustomizer />
                  </div>
                </div>
              )}

              {activeSection === 'qrcode' && (
                <QRCodeCustomizer />
              )}

              {activeSection === 'inroom' && (
                <div className="space-y-4">
                  {/* Preview Snapshot - use actual design aspect ratio */}
                  <div 
                    className="relative rounded overflow-hidden bg-[#f5f5f5] border border-gray-200 shadow-sm"
                    style={{ 
                      aspectRatio: `${selectedWallArtSize.width} / ${selectedWallArtSize.height}`,
                      backgroundImage: 'radial-gradient(circle at 1px 1px, #e0e0e0 1px, transparent 0)', 
                      backgroundSize: '12px 12px' 
                    }}
                  >
                    {previewThumbnail ? (
                      <img 
                        src={previewThumbnail} 
                        alt="Design preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span className="text-xs">Loading preview...</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full">
                      {selectedSize.label}
                    </div>
                  </div>
                  
                  {/* Info Box - Direct to Dimensions Tab */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-2">
                    <button 
                      onClick={() => setActiveSection('canvas')} 
                      className="flex items-center justify-center gap-1.5 w-full text-xs text-blue-700 font-medium hover:text-blue-900"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      Change Dimensions
                    </button>
                  </div>
                  
                  {/* Current Selection Summary */}
                  <div className="flex items-center gap-3 p-3 bg-primary/10 rounded border border-primary/20">
                    <div className="w-10 h-10 rounded bg-white flex items-center justify-center shadow-sm">
                      <ProductIcon icon={selectedProduct.icon} className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{selectedProduct.shortName}</h3>
                      <p className="text-xs text-gray-600">
                        {selectedSize.label}
                        {selectedProduct.category === 'framed' 
                          ? ` • ${selectedFrameColor.charAt(0).toUpperCase() + selectedFrameColor.slice(1)}`
                          : ''
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${selectedSize.price.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {/* Generate Mockups Button */}
                  {!printifyMockups[`${selectedProduct.blueprintId}-${selectedSize.value}`] && (
                    <button
                      onClick={fetchPrintifyMockups}
                      disabled={!audioUrl || mockupsLoading}
                      className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {mockupsLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                      ) : (
                        <><Home className="w-4 h-4" /> Generate Room Preview</>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Add to Cart Button */}
            {audioUrl && (
              <div className="p-4 border-t border-gray-100 flex-shrink-0 space-y-2">
                {/* Quick Summary */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>{selectedProduct.shortName} • {selectedSize.label}</span>
                  <span className="font-semibold text-gray-900">${selectedSize.price.toFixed(2)}</span>
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding to Cart...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                
                {/* Digital Download Option */}
                <Button
                  onClick={handleAddDigitalDownload}
                  disabled={isAddingDownload}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {isAddingDownload ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Hi-Def Download — $1
                    </>
                  )}
                </Button>
                <p className="text-[10px] text-gray-400 text-center">
                  4000×6000px PNG • 24hr download link
                </p>
                
                {/* Test Download Button (Dev) */}
                <Button
                  onClick={handleTestDownload}
                  disabled={isTestDownloading}
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-gray-400 hover:text-gray-600 mt-2"
                >
                  {isTestDownloading ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3 mr-1" />
                      Test Download (Free)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
          {/* Main Toolbar Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPanelCollapsed && activeSection && (
                <button
                  onClick={() => setIsPanelCollapsed(false)}
                  className="p-2 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                  title="Expand panel"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {audioUrl && (
                <>
                  <UndoRedoToolbar variant="horizontal" className="mr-1" />
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="p-2 rounded hover:bg-gray-100 text-gray-500 transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-gray-500 w-12 text-center">{Math.round(zoom)}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="p-2 rounded hover:bg-gray-100 text-gray-500 transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-xs text-gray-500">
              {selectedWallArtSize.width}" × {selectedWallArtSize.height}"
            </div>
          </div>
        </div>

        {/* Canvas Preview Area */}
        <div className="flex-1 relative overflow-hidden bg-[#f5f5f5]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #e0e0e0 1px, transparent 0)', backgroundSize: '20px 20px' }}>
          {/* Hidden ProductMockup for canvas generation - hideOverlays when InteractiveCanvasEditor is active */}
          {audioUrl && (
            <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none" aria-hidden="true">
              <ProductMockup 
                ref={mockupRef} 
                canvasWidth={selectedWallArtSize.width * 300} 
                canvasHeight={selectedWallArtSize.height * 300}
                hideOverlays={activeSection !== 'inroom'} 
              />
            </div>
          )}
          
          {audioUrl ? (
            <>
              {/* Interactive Canvas Editor - always mounted for exports, hidden when in inroom */}
              <div className={cn("absolute inset-0", activeSection === 'inroom' && "invisible pointer-events-none")}>
                <InteractiveCanvasEditor 
                  ref={konvaEditorRef}
                  mockupRef={mockupRef} 
                  selectedSize={selectedWallArtSize}
                />
              </div>
              
              {activeSection === 'inroom' && (
              /* Printify Mockup Gallery View */
              <div className="absolute inset-0 p-6 overflow-auto">
                {(() => {
                  // Camera type labels for display
                  const cameraLabels: Record<string, string> = {
                    'front': 'Front View',
                    'front2': 'Front View 2',
                    'closeUp': 'Close-up Detail',
                    'context1': 'In Room Context',
                  }
                  
                  // Get mockups for current product/size
                  const cacheKey = `${selectedProduct.blueprintId}-${selectedSize.value}`
                  const currentMockupsData = printifyMockups[cacheKey]
                  
                  // Build array of all mockup images
                  interface MockupImage {
                    id: string
                    name: string
                    url: string
                    color?: string
                  }
                  const mockupImages: MockupImage[] = []
                  
                  // Map selectedFrameColor to variant color name
                  const frameColorMap: Record<string, string> = {
                    'black': 'Black',
                    'white': 'White', 
                    'walnut': 'Walnut',
                  }
                  const targetColor = frameColorMap[selectedFrameColor]
                  
                  if (currentMockupsData) {
                    const hasColorVariants = currentMockupsData.colorVariants && currentMockupsData.colorVariants.length > 1
                    
                    if (hasColorVariants && currentMockupsData.colorVariants) {
                      const matchingVariant = currentMockupsData.colorVariants.find(v => v.color === targetColor) 
                        || currentMockupsData.colorVariants.find(v => v.mockups.front)
                      
                      if (matchingVariant) {
                        for (const [camera, url] of Object.entries(matchingVariant.mockups)) {
                          if (url) {
                            mockupImages.push({
                              id: `${matchingVariant.variantId}-${camera}`,
                              name: camera === 'front' 
                                ? (matchingVariant.color ? `${matchingVariant.color} Frame` : 'Front View')
                                : (cameraLabels[camera] || camera),
                              url: url as string,
                              color: camera === 'front' ? matchingVariant.color : undefined,
                            })
                          }
                        }
                      }
                    } else {
                      const primary = currentMockupsData.primary
                      if (primary) {
                        for (const [camera, url] of Object.entries(primary)) {
                          if (url) {
                            mockupImages.push({
                              id: camera,
                              name: cameraLabels[camera] || camera,
                              url: url as string,
                            })
                          }
                        }
                      }
                    }
                  }
                  
                  // Add "Your Design" as the first option using the same image sent to Printify
                  if (previewThumbnail) {
                    mockupImages.unshift({
                      id: 'your-design',
                      name: 'Your Design',
                      url: previewThumbnail,
                    })
                  }
                  
                  const validIndex = mockupImages.length > 0 ? Math.min(selectedMockupIndex, mockupImages.length - 1) : 0
                  const currentMockup = mockupImages[validIndex]
                  
                  // Use exact aspect ratio from selected size for accurate preview
                  const isPortrait = selectedWallArtSize.height > selectedWallArtSize.width
                  const aspectRatio = `${selectedWallArtSize.width} / ${selectedWallArtSize.height}`
                  
                  return (
                    <div className="w-full max-w-4xl mx-auto space-y-4">
                      {/* Main Image - aspect ratio matches selected orientation */}
                      <div 
                        className="relative rounded overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg mx-auto"
                        style={{ 
                          aspectRatio,
                          maxWidth: isPortrait ? '70%' : '100%',
                        }}
                      >
                        {mockupsLoading ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-8">
                            <div className="flex items-end gap-1 h-12 mb-4">
                              <div className="w-1.5 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '30%', animationDelay: '0ms' }} />
                              <div className="w-1.5 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '60%', animationDelay: '80ms' }} />
                              <div className="w-1.5 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '100%', animationDelay: '160ms' }} />
                              <div className="w-1.5 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '70%', animationDelay: '240ms' }} />
                              <div className="w-1.5 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '90%', animationDelay: '320ms' }} />
                              <div className="w-1.5 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '50%', animationDelay: '400ms' }} />
                              <div className="w-1.5 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '80%', animationDelay: '480ms' }} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-1">Generating Mockup</h3>
                            <p className="text-sm text-gray-500 text-center max-w-xs">
                              Creating {selectedProduct.shortName} {selectedSize.label} preview...
                            </p>
                          </div>
                        ) : currentMockup ? (
                          <img 
                            src={currentMockup.url} 
                            alt={`${selectedProduct.name} - ${currentMockup.name}`}
                            className="w-full h-full object-contain bg-white"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-8">
                            <div className="w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-4">
                              <ProductIcon icon={selectedProduct.icon} className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-1">Preview Mockups</h3>
                            <p className="text-sm text-gray-500 text-center max-w-xs mb-4">
                              Generate professional mockups from Printify
                            </p>
                            <button
                              onClick={fetchPrintifyMockups}
                              disabled={!audioUrl || mockupsLoading}
                              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                              Generate Mockups
                            </button>
                          </div>
                        )}
                        
                        {/* Navigation Arrows */}
                        {mockupImages.length > 1 && (
                          <>
                            <button
                              onClick={() => setSelectedMockupIndex((prev) => (prev === 0 ? mockupImages.length - 1 : prev - 1))}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white transition-all hover:scale-110"
                              aria-label="Previous mockup"
                            >
                              <ChevronLeft className="w-8 h-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                            </button>
                            <button
                              onClick={() => setSelectedMockupIndex((prev) => (prev === mockupImages.length - 1 ? 0 : prev + 1))}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white transition-all hover:scale-110"
                              aria-label="Next mockup"
                            >
                              <ChevronRight className="w-8 h-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                            </button>
                          </>
                        )}
                        
                        {/* Mockup Label */}
                        {currentMockup && (
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                            {currentMockup.name} • {selectedSize.label}
                          </div>
                        )}
                      </div>
                      
                      {/* Thumbnail Strip - larger thumbnails */}
                      {mockupImages.length > 0 && (
                        <div className="flex gap-3 justify-center flex-wrap">
                          {mockupImages.map((mockup, index) => (
                            <button
                              key={mockup.id}
                              onClick={() => setSelectedMockupIndex(index)}
                              className={cn(
                                'relative w-28 h-20 rounded overflow-hidden transition-all bg-gray-100',
                                validIndex === index
                                  ? 'ring-2 ring-primary ring-offset-2 shadow-lg scale-105'
                                  : 'opacity-70 hover:opacity-100 hover:shadow-md hover:scale-102'
                              )}
                            >
                              {/* Loading skeleton */}
                              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" 
                                style={{ backgroundSize: '200% 100%' }}
                              />
                              <img 
                                src={mockup.url} 
                                alt={mockup.name}
                                className="relative w-full h-full object-cover"
                                onLoad={(e) => {
                                  // Hide shimmer when image loads
                                  const parent = e.currentTarget.parentElement
                                  const shimmer = parent?.querySelector('.animate-shimmer') as HTMLElement
                                  if (shimmer) shimmer.style.display = 'none'
                                }}
                              />
                              {/* Selection indicator */}
                              {validIndex === index && (
                                <div className="absolute inset-0 border-2 border-primary rounded" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Loading state for thumbnails */}
                      {mockupsLoading && (
                        <div className="flex gap-3 justify-center">
                          {[1, 2, 3, 4].map((i) => (
                            <div 
                              key={i}
                              className="w-28 h-20 rounded overflow-hidden bg-gray-100"
                            >
                              <div 
                                className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"
                                style={{ backgroundSize: '200% 100%', animationDelay: `${i * 100}ms` }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center mb-6 mx-auto shadow-xl shadow-primary/30">
                  <div className="flex items-end gap-1 h-10">
                    {[40, 70, 100, 60, 80, 50, 90].map((h, i) => (
                      <div 
                        key={i}
                        className="w-1.5 bg-white/90 rounded-full animate-pulse"
                        style={{ 
                          height: `${h}%`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Upload Your Audio
                </h3>
                <p className="text-gray-500 mb-6">
                  Transform your favorite song, voice message, or any audio into beautiful wall art
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['MP3', 'WAV', 'M4A', 'OGG', 'FLAC'].map((format) => (
                    <span 
                      key={format}
                      className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Interactive Audio Selection Bar - Always visible when audio loaded */}
        {audioUrl && activeSection !== 'inroom' && (
          <div className="bg-white border-t border-gray-200 px-4 py-3 flex-shrink-0">
            <div className="flex items-start gap-3">
              {/* Play/Pause Button */}
              <button
                onClick={togglePlay}
                className="p-2.5 rounded bg-primary hover:bg-primary/90 text-white transition-colors flex-shrink-0"
                title={isPlaying ? 'Pause' : 'Play selection'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              
              {/* Interactive Selection Timeline */}
              <div className="flex-1 flex flex-col gap-1">
                <div 
                  className="h-10 bg-gray-100 rounded overflow-hidden relative cursor-ew-resize select-none"
                  onMouseDown={(e) => {
                    if (!audioDuration) return
                    const rect = e.currentTarget.getBoundingClientRect()
                    const clickX = e.clientX - rect.left
                    const clickPercent = clickX / rect.width
                    const clickTime = clickPercent * audioDuration
                    
                    // Check if clicking on handles
                    const startPercent = selectedRegion ? selectedRegion.start / audioDuration : 0
                    const endPercent = selectedRegion ? selectedRegion.end / audioDuration : 1
                    const startX = startPercent * rect.width
                    const endX = endPercent * rect.width
                    
                    const handleWidth = 12
                    
                    // Store initial state for dragging
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const newX = moveEvent.clientX - rect.left
                      const newPercent = Math.max(0, Math.min(1, newX / rect.width))
                      const newTime = newPercent * audioDuration
                      
                      if (Math.abs(clickX - startX) < handleWidth) {
                        // Dragging start handle
                        const end = selectedRegion?.end || audioDuration
                        if (newTime < end - 1) {
                          setSelectedRegion({ start: newTime, end })
                        }
                      } else if (Math.abs(clickX - endX) < handleWidth) {
                        // Dragging end handle
                        const start = selectedRegion?.start || 0
                        if (newTime > start + 1) {
                          setSelectedRegion({ start, end: newTime })
                        }
                      } else if (clickX > startX + handleWidth && clickX < endX - handleWidth) {
                        // Dragging the middle - move entire selection
                        const duration = (selectedRegion?.end || audioDuration) - (selectedRegion?.start || 0)
                        let newStart = newTime - duration / 2
                        let newEnd = newTime + duration / 2
                        
                        if (newStart < 0) {
                          newStart = 0
                          newEnd = duration
                        }
                        if (newEnd > audioDuration) {
                          newEnd = audioDuration
                          newStart = audioDuration - duration
                        }
                        setSelectedRegion({ start: newStart, end: newEnd })
                      }
                    }
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove)
                      document.removeEventListener('mouseup', handleMouseUp)
                    }
                    
                    document.addEventListener('mousemove', handleMouseMove)
                    document.addEventListener('mouseup', handleMouseUp)
                  }}
                >
                  {/* Waveform visualization - matches wavesurfer style from audio tab */}
                  <div className="absolute inset-0 flex items-center px-0">
                    <div className="flex items-center w-full h-full">
                      {(() => {
                        // Get actual waveform data or use placeholder
                        const amplitudes = computedWaveformData?.normalizedAmplitudes
                        // Use more bars for finer detail like wavesurfer
                        const barCount = 200
                        
                        if (!amplitudes || amplitudes.length === 0) {
                          // Fallback to placeholder bars while loading
                          return Array.from({ length: barCount }).map((_, i) => {
                            const seed = Math.sin(i * 12.9898 + i * 78.233) * 43758.5453
                            const amplitude = 0.15 + Math.sin(i * 0.3) * 0.3 + (seed - Math.floor(seed)) * 0.25
                            const barHeight = amplitude * 95
                            return (
                              <div 
                                key={i} 
                                className="flex-1 bg-gray-300"
                                style={{ 
                                  height: `${barHeight}%`,
                                  minWidth: '1px',
                                  marginRight: '1px',
                                  borderRadius: '1px',
                                }}
                              />
                            )
                          })
                        }
                        
                        // Resample waveform data to match bar count
                        const step = amplitudes.length / barCount
                        return Array.from({ length: barCount }).map((_, i) => {
                          // Get the amplitude at this position (average if needed)
                          const startIdx = Math.floor(i * step)
                          const endIdx = Math.min(Math.floor((i + 1) * step), amplitudes.length)
                          let sum = 0
                          let count = 0
                          for (let j = startIdx; j < endIdx; j++) {
                            sum += amplitudes[j]
                            count++
                          }
                          const amplitude = count > 0 ? sum / count : amplitudes[startIdx] || 0
                          
                          // Scale height - amplitude 0-1 maps to 5-95% height
                          const barHeight = 5 + amplitude * 90
                          
                          // Check if this bar is in selection
                          const inSelection = selectedRegion && audioDuration
                            ? (i / barCount) >= (selectedRegion.start / audioDuration) && (i / barCount) <= (selectedRegion.end / audioDuration)
                            : true
                          
                          return (
                            <div 
                              key={i} 
                              className={`flex-1 transition-colors ${inSelection ? 'bg-primary/70' : 'bg-gray-300'}`}
                              style={{ 
                                height: `${barHeight}%`,
                                minWidth: '1px',
                                marginRight: '1px',
                                borderRadius: '1px',
                              }}
                            />
                          )
                        })
                      })()}
                    </div>
                  </div>
                  
                  {/* Selection region overlay */}
                  {selectedRegion && audioDuration && (
                    <>
                      {/* Left dimmed area - darker for better visibility */}
                      <div 
                        className="absolute top-0 bottom-0 left-0 bg-gray-900/50"
                        style={{ width: `${(selectedRegion.start / audioDuration) * 100}%` }}
                      />
                      {/* Right dimmed area - darker for better visibility */}
                      <div 
                        className="absolute top-0 bottom-0 right-0 bg-gray-900/50"
                        style={{ width: `${((audioDuration - selectedRegion.end) / audioDuration) * 100}%` }}
                      />
                      {/* Selection border highlight */}
                      <div 
                        className="absolute top-0 bottom-0 border-2 border-primary bg-primary/10 pointer-events-none"
                        style={{ 
                          left: `${(selectedRegion.start / audioDuration) * 100}%`,
                          width: `${((selectedRegion.end - selectedRegion.start) / audioDuration) * 100}%`
                        }}
                      />
                      {/* Selection handles - larger and more visible */}
                      <div 
                        className="absolute top-0 bottom-0 w-1.5 bg-primary cursor-ew-resize hover:bg-primary/90 transition-colors shadow-lg"
                        style={{ left: `calc(${(selectedRegion.start / audioDuration) * 100}% - 3px)` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-4 h-8 bg-primary rounded-sm shadow-md border border-primary/90" />
                      </div>
                      <div 
                        className="absolute top-0 bottom-0 w-1.5 bg-primary cursor-ew-resize hover:bg-primary/90 transition-colors shadow-lg"
                        style={{ left: `calc(${(selectedRegion.end / audioDuration) * 100}% - 3px)` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-4 h-8 bg-primary rounded-sm shadow-md border border-primary/90" />
                      </div>
                    </>
                  )}
                  
                  {/* Playhead indicator */}
                  {isPlaying && audioDuration > 0 && (
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_4px_rgba(0,0,0,0.5)] pointer-events-none z-10 transition-[left] duration-75"
                      style={{ left: `${(currentPlayTime / audioDuration) * 100}%` }}
                    >
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow" />
                    </div>
                  )}
                </div>
                
                {/* Time labels */}
                <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                  <span>{selectedRegion ? formatTime(selectedRegion.start) : '0:00'}</span>
                  <span className="text-primary/90 font-semibold">
                    {selectedRegion 
                      ? `${formatTime(selectedRegion.end - selectedRegion.start)} selected`
                      : audioDuration ? `${formatTime(audioDuration)} total` : '--'
                    }
                  </span>
                  <span>{selectedRegion ? formatTime(selectedRegion.end) : audioDuration ? formatTime(audioDuration) : '--'}</span>
                </div>
              </div>
              
              {/* Reset Selection */}
              <button
                onClick={() => {
                  if (audioDuration) {
                    setSelectedRegion({ start: 0, end: audioDuration })
                  }
                }}
                className="p-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors text-xs"
                title="Reset to full audio"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Floating Add to Cart CTA - Always visible when audio loaded */}
      {audioUrl && (
        <div className="fixed bottom-36 right-6 z-50 flex flex-col items-end gap-2">
          {/* Main CTA Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="flex items-center gap-3 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded shadow-xl shadow-primary/30 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isAddingToCart ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
            <div className="text-left">
              <div className="text-sm font-bold">${selectedSize.price.toFixed(2)}</div>
              <div className="text-[10px] opacity-80">{selectedProduct.shortName} • {selectedSize.label}</div>
            </div>
          </button>
        </div>
      )}
      
      {/* Saved Designs Drawer */}
      <SavedDesignsDrawer
        isOpen={isSavedDesignsOpen}
        onClose={() => setIsSavedDesignsOpen(false)}
        onNewDesign={() => {
          setIsSavedDesignsOpen(false)
          handleReset()
        }}
        onSaveCurrentDesign={(name) => {
          handleSaveDesign(name)
          setIsSavedDesignsOpen(false)
        }}
      />
      
      {/* Save Design Dialog */}
      <SaveDesignDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={(name) => {
          handleSaveDesign(name)
          setIsSaveDialogOpen(false)
        }}
        defaultName={audioFileName ? `${audioFileName.replace(/\.[^/.]+$/, '')}` : undefined}
      />
      
      {/* Themes Dialog */}
      <PresetSelector 
        open={isThemesOpen} 
        onOpenChange={setIsThemesOpen} 
        showTrigger={false} 
      />
    </div>
  )
}
