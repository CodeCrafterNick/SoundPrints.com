'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { useCartStore } from '@/lib/stores/cart-store'
import { AudioUploader } from '@/components/customizer/audio-uploader'
import { type WaveformEditorHandle } from '@/components/customizer/waveform-editor'
import { UndoRedoToolbar } from '@/components/customizer/undo-redo-toolbar'
import { PresetSelector } from '@/components/customizer/preset-selector'
import { SavedDesignsDrawer, SaveDesignDialog } from '@/components/customizer/saved-designs'
import { useSavedDesignsStore } from '@/lib/stores/saved-designs-store'
import { extractDesignState } from '@/lib/types/saved-design'
import { type ProductMockupRef } from '@/components/products/product-mockup'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// =============================================================================
// DYNAMIC IMPORTS - Heavy components loaded on-demand for faster initial load
// =============================================================================

// WaveformEditor uses wavesurfer.js (~80kB) - only needed after audio upload
const WaveformEditor = dynamic(
  () => import('@/components/customizer/waveform-editor').then(m => ({ default: m.WaveformEditor })),
  { ssr: false, loading: () => <div className="h-32 animate-pulse bg-gray-100 rounded-lg" /> }
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
  { loading: () => <div className="animate-pulse h-48 bg-gray-100 rounded-lg" /> }
)
const ColorCustomizer = dynamic(
  () => import('@/components/customizer/color-customizer').then(m => ({ default: m.ColorCustomizer })),
  { loading: () => <div className="animate-pulse h-48 bg-gray-100 rounded-lg" /> }
)
const TextCustomizer = dynamic(
  () => import('@/components/customizer/text-customizer').then(m => ({ default: m.TextCustomizer })),
  { loading: () => <div className="animate-pulse h-48 bg-gray-100 rounded-lg" /> }
)
const BackgroundCustomizer = dynamic(
  () => import('@/components/customizer/background-customizer').then(m => ({ default: m.BackgroundCustomizer })),
  { loading: () => <div className="animate-pulse h-48 bg-gray-100 rounded-lg" /> }
)
const QRCodeCustomizer = dynamic(
  () => import('@/components/customizer/qrcode-customizer').then(m => ({ default: m.QRCodeCustomizer })),
  { loading: () => <div className="animate-pulse h-48 bg-gray-100 rounded-lg" /> }
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
  Crosshair,
  Focus,
  type LucideIcon,
} from 'lucide-react'
import { 
  PRINTIFY_PRODUCTS, 
  type PrintifyProduct,
  type ProductSize 
} from '@/lib/printify-product-catalog'

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
  const [activeSection, setActiveSection] = useState<SidebarSection>('audio')
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [hasAutoSwitched, setHasAutoSwitched] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isAddingDownload, setIsAddingDownload] = useState(false)
  
  // Saved designs state
  const [isSavedDesignsOpen, setIsSavedDesignsOpen] = useState(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const saveCurrentDesign = useSavedDesignsStore((state) => state.saveCurrentDesign)
  
  // Printify mockup state
  const [printifyMockups, setPrintifyMockups] = useState<Record<string, CachedMockups>>({})
  const [mockupsLoading, setMockupsLoading] = useState(false)
  const [mockupsFailed, setMockupsFailed] = useState<Set<string>>(new Set())
  const [cachedDesignUrl, setCachedDesignUrl] = useState<string | null>(null)
  const [selectedMockupIndex, setSelectedMockupIndex] = useState(0)
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null)
  
  // Store values
  const audioUrl = useCustomizerStore((state) => state.audioUrl)
  const audioFileName = useCustomizerStore((state) => state.audioFile?.name || '')
  const audioDuration = useCustomizerStore((state) => state.audioDuration)
  const selectedRegion = useCustomizerStore((state) => state.selectedRegion)
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
  
  // Cart store
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)
  
  const isCircular = ['circular', 'soundwave'].includes(waveformStyle)
  const usesBarSettings = ['bars', 'gradient-bars', 'mirror', 'spectrum', 'frequency', 'equalizer', 'neon', 'glow'].includes(waveformStyle)

  // Update preview thumbnail when in inroom section
  useEffect(() => {
    if (activeSection !== 'inroom' || !audioUrl) return
    
    const updateThumbnail = () => {
      if (mockupRef.current?.canvas) {
        const canvas = mockupRef.current.canvas
        const thumbCanvas = document.createElement('canvas')
        thumbCanvas.width = 240
        thumbCanvas.height = Math.round(240 * (canvas.height / canvas.width))
        const ctx = thumbCanvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height)
          setPreviewThumbnail(thumbCanvas.toDataURL('image/png', 0.8))
        }
      }
    }
    
    // Initial update
    updateThumbnail()
    
    // Update periodically while viewing inroom
    const interval = setInterval(updateThumbnail, 500)
    return () => clearInterval(interval)
  }, [activeSection, audioUrl, mockupRef])

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

  // Sync isPlaying state
  useEffect(() => {
    const interval = setInterval(() => {
      if (waveformEditorRef.current) {
        const playing = waveformEditorRef.current.isPlaying()
        if (playing !== isPlaying) {
          setIsPlaying(playing)
        }
      }
    }, 100)
    return () => clearInterval(interval)
  }, [isPlaying, waveformEditorRef])

  // Reset everything
  const handleReset = useCallback(() => {
    if (waveformEditorRef.current) {
      waveformEditorRef.current.pause()
    }
    setIsPlaying(false)
    setPrintifyMockups({})
    setCachedDesignUrl(null)
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
    
    try {
      let designUrl = cachedDesignUrl

      // Only upload if we don't have a cached design URL
      if (!designUrl) {
        const canvas = mockupRef.current.canvas
        if (!canvas) {
          throw new Error('Canvas not available')
        }

        const dataUrl = canvas.toDataURL('image/png', 1.0)

        const uploadResponse = await fetch('/api/upload-artwork', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artworkDataUrl: dataUrl }),
        })

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text().catch(() => 'Unknown error')
          console.error('Upload failed:', uploadResponse.status, errorText)
          throw new Error(`Failed to upload design: ${uploadResponse.status}`)  
        }

        const result = await uploadResponse.json()
        designUrl = result.artworkUrl
        setCachedDesignUrl(designUrl)
      }

      toast.loading(`Generating ${selectedProduct.shortName} ${selectedSize.label} preview...`, { id: 'mockups' })

      const response = await fetch('/api/preview-mockups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          designUrl,
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
  }, [cachedDesignUrl, mockupsFailed, printifyMockups, selectedProduct.blueprintId, selectedProduct.shortName, selectedSize.label, selectedSize.value, mockupRef])

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

    const uploadingToast = toast.loading('Uploading design...')
    
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
                "w-16 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all",
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
          {/* Saved Designs */}
          <button
            onClick={() => setIsSavedDesignsOpen(true)}
            className="w-16 h-12 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            title="Saved Designs"
          >
            <FolderOpen className="w-5 h-5" />
            <span className="text-[10px] font-medium">Designs</span>
          </button>
          
          {/* Save Current */}
          {audioUrl && (
            <button
              onClick={() => setIsSaveDialogOpen(true)}
              className="w-16 h-12 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-emerald-400 hover:bg-gray-800 transition-all"
              title="Save Design"
            >
              <Save className="w-5 h-5" />
              <span className="text-[10px] font-medium">Save</span>
            </button>
          )}
          
          <UndoRedoToolbar variant="vertical" />
          <button
            onClick={handleReset}
            className="w-16 h-12 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-red-400 hover:bg-gray-800 transition-all"
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
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-semibold text-gray-900">
                {sidebarItems.find(i => i.id === activeSection)?.label}
              </h2>
              <button
                onClick={() => setIsPanelCollapsed(true)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                title="Collapse panel"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

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
                  <StyleCustomizer />
                  
                  {/* Waveform Size */}
                  <div className="pt-3 border-t border-gray-100">
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Waveform Size</label>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Width</span>
                        <span>{waveformSize}%</span>
                      </div>
                      <Slider
                        value={[waveformSize]}
                        onValueChange={(v) => setWaveformSize(v[0])}
                        min={20}
                        max={150}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'canvas' && (
                <div className="space-y-4">
                  {/* Material Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Material</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'poster', label: 'Poster', icon: 'Layers', productIds: ['poster-vertical', 'poster-horizontal', 'satin-poster'] },
                        { id: 'canvas', label: 'Canvas', icon: 'Square', productIds: ['stretched-canvas'] },
                        { id: 'framed', label: 'Framed', icon: 'GalleryVertical', productIds: ['framed-vertical', 'framed-horizontal'] },
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
                              }
                            }}
                            className={cn(
                              'flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-all',
                              isSelected
                                ? 'bg-gray-900 text-white'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300'
                            )}
                          >
                            <ProductIcon icon={group.icon} className={cn('w-4 h-4', isSelected ? 'text-white' : 'text-gray-500')} />
                            <span className="text-[11px] font-semibold">{group.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* Orientation Selection - Vertical or Horizontal */}
                  {(selectedProduct.category === 'poster' || selectedProduct.category === 'framed') && selectedProduct.finish !== 'satin' && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Orientation</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'vertical', label: 'Vertical', icon: '▯', desc: 'Portrait' },
                          { id: 'horizontal', label: 'Horizontal', icon: '▭', desc: 'Landscape' },
                        ].map((orient) => {
                          const isSelected = selectedProduct.orientation === orient.id
                          return (
                            <button
                              key={orient.id}
                              onClick={() => {
                                // Find matching product with different orientation
                                const baseId = selectedProduct.id.replace('-vertical', '').replace('-horizontal', '')
                                const targetId = `${baseId}-${orient.id}`
                                const targetProduct = PRINTIFY_PRODUCTS.find(p => p.id === targetId)
                                if (targetProduct) {
                                  setSelectedProduct(targetProduct)
                                  const newSize = targetProduct.sizes.find(s => s.popular) || targetProduct.sizes[0]
                                  setSelectedSize(newSize)
                                  setSelectedWallArtSize({ width: newSize.width, height: newSize.height })
                                }
                              }}
                              className={cn(
                                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all',
                                isSelected
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300'
                              )}
                            >
                              <span className="text-lg">{orient.icon}</span>
                              <span className="text-[11px] font-semibold">{orient.label}</span>
                              <span className="text-[9px] opacity-70">{orient.desc}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Poster Finish Selection - Matte or Satin */}
                  {selectedProduct.category === 'poster' && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Finish</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { id: 'matte', label: 'Matte', productIds: ['poster-vertical', 'poster-horizontal'], desc: 'No glare' },
                          { id: 'satin', label: 'Satin', productIds: ['satin-poster'], desc: 'Elegant sheen' },
                        ].map((finish) => {
                          const isSelected = finish.productIds.includes(selectedProduct.id)
                          return (
                            <button
                              key={finish.id}
                              onClick={() => {
                                // Keep current orientation when switching finish
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
                                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all',
                                isSelected
                                  ? 'bg-gray-900 text-white'
                                  : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300'
                              )}
                            >
                              <span className="text-[11px] font-semibold">{finish.label}</span>
                              <span className="text-[9px] opacity-70">{finish.desc}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Size Selection */}
                  <div className="pt-3 border-t border-gray-100">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Size</label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProduct.sizes.map((size) => {
                        const isSelected = selectedSize.value === size.value
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
                              "relative px-2.5 py-1.5 rounded-lg border-2 text-xs font-medium transition-all",
                              isSelected
                                ? "border-rose-500 bg-rose-50 text-rose-700"
                                : "border-gray-200 hover:border-gray-300 text-gray-600",
                              size.popular && !isSelected && "ring-1 ring-amber-200"
                            )}
                          >
                            {size.label} - ${size.price.toFixed(2)}
                            {size.popular && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* Frame Color */}
                  {selectedProduct.category === 'framed' && (
                    <div className="pt-3 border-t border-gray-100">
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Frame Color</label>
                      <div className="flex gap-2">
                        {([
                          { id: 'black', name: 'Black', hex: '#1a1a1a' },
                          { id: 'white', name: 'White', hex: '#ffffff' },
                          { id: 'walnut', name: 'Walnut', hex: '#5c4033' },
                        ] as const).map((fc) => (
                          <button
                            key={fc.id}
                            onClick={() => setSelectedFrameColor(fc.id)}
                            className={cn(
                              "w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center",
                              selectedFrameColor === fc.id
                                ? "border-rose-500 ring-2 ring-rose-200"
                                : "border-gray-300"
                            )}
                            style={{ backgroundColor: fc.hex }}
                            title={fc.name}
                          >
                            {selectedFrameColor === fc.id && (
                              <Check className={cn("w-3.5 h-3.5", fc.id === 'white' ? 'text-gray-800' : 'text-white')} />
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
                <TextCustomizer />
              )}

              {activeSection === 'qrcode' && (
                <QRCodeCustomizer />
              )}

              {activeSection === 'inroom' && (
                <div className="space-y-4">
                  {/* Preview Snapshot */}
                  {previewThumbnail && (
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 shadow-sm">
                      <img 
                        src={previewThumbnail} 
                        alt="Design preview" 
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full">
                        {selectedSize.label}
                      </div>
                    </div>
                  )}
                  
                  {/* Info Box - Direct to Dimensions Tab */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700 text-center">
                      💡 Change product options in the <button onClick={() => setActiveSection('canvas')} className="font-semibold underline hover:text-blue-900">Dimensions</button> tab
                    </p>
                  </div>
                  
                  {/* Current Selection Summary */}
                  <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl border border-rose-100">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <ProductIcon icon={selectedProduct.icon} className="w-5 h-5 text-rose-500" />
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
                      className="w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white"
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
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Toolbar with Progress Indicator */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-1 mb-2">
            {[
              { step: 1, label: 'Upload', complete: !!audioUrl },
              { step: 2, label: 'Style', complete: !!audioUrl && waveformStyle !== 'bars' },
              { step: 3, label: 'Customize', complete: !!audioUrl && (waveformColor !== '#000000' || backgroundColor !== '#FFFFFF' || backgroundImage) },
              { step: 4, label: 'Preview', complete: !!audioUrl && activeSection === 'inroom' },
            ].map((item, idx, arr) => (
              <div key={item.step} className="flex items-center">
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all",
                  item.complete 
                    ? "bg-emerald-100 text-emerald-700" 
                    : audioUrl || item.step === 1
                      ? "bg-gray-100 text-gray-600"
                      : "bg-gray-50 text-gray-400"
                )}>
                  {item.complete ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <span className="w-3 h-3 flex items-center justify-center text-[9px]">{item.step}</span>
                  )}
                  <span className="hidden sm:inline">{item.label}</span>
                </div>
                {idx < arr.length - 1 && (
                  <div className={cn(
                    "w-4 h-0.5 mx-0.5",
                    item.complete ? "bg-emerald-300" : "bg-gray-200"
                  )} />
                )}
              </div>
            ))}
          </div>
          
          {/* Main Toolbar Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPanelCollapsed && activeSection && (
                <button
                  onClick={() => setIsPanelCollapsed(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                  title="Expand panel"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              {audioUrl && (
                <>
                  <PresetSelector />
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-gray-500 w-12 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
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
            activeSection === 'inroom' ? (
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
                  
                  const validIndex = mockupImages.length > 0 ? Math.min(selectedMockupIndex, mockupImages.length - 1) : 0
                  const currentMockup = mockupImages[validIndex]
                  
                  return (
                    <div className="w-full max-w-4xl mx-auto space-y-4">
                      {/* Main Image */}
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
                        {mockupsLoading ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-8">
                            <div className="flex items-end gap-1 h-12 mb-4">
                              <div className="w-1.5 bg-rose-500 rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '30%', animationDelay: '0ms' }} />
                              <div className="w-1.5 bg-rose-500 rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '60%', animationDelay: '80ms' }} />
                              <div className="w-1.5 bg-rose-500 rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '100%', animationDelay: '160ms' }} />
                              <div className="w-1.5 bg-rose-500 rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '70%', animationDelay: '240ms' }} />
                              <div className="w-1.5 bg-rose-500 rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '90%', animationDelay: '320ms' }} />
                              <div className="w-1.5 bg-rose-500 rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '50%', animationDelay: '400ms' }} />
                              <div className="w-1.5 bg-rose-500 rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '80%', animationDelay: '480ms' }} />
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
                              className="px-4 py-2 bg-rose-500 text-white text-sm font-medium rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
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
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-all"
                              aria-label="Previous mockup"
                            >
                              <ChevronLeft className="w-5 h-5 text-gray-700" />
                            </button>
                            <button
                              onClick={() => setSelectedMockupIndex((prev) => (prev === mockupImages.length - 1 ? 0 : prev + 1))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-all"
                              aria-label="Next mockup"
                            >
                              <ChevronRight className="w-5 h-5 text-gray-700" />
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
                      
                      {/* Thumbnail Strip */}
                      {mockupImages.length > 0 && (
                        <div className="flex gap-2 justify-center flex-wrap">
                          {mockupImages.map((mockup, index) => (
                            <button
                              key={mockup.id}
                              onClick={() => setSelectedMockupIndex(index)}
                              className={cn(
                                'relative w-16 h-12 rounded-lg overflow-hidden transition-all',
                                validIndex === index
                                  ? 'ring-2 ring-rose-500 ring-offset-2'
                                  : 'opacity-60 hover:opacity-100'
                              )}
                            >
                              <img 
                                src={mockup.url} 
                                alt={mockup.name}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            ) : (
              /* Interactive Canvas Editor */
              <div className="absolute inset-0">
                <InteractiveCanvasEditor 
                  mockupRef={mockupRef} 
                  selectedSize={selectedWallArtSize}
                />
              </div>
            )
          ) : (
            /* Empty State */
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 rounded-3xl bg-rose-500 flex items-center justify-center mb-6 mx-auto shadow-xl shadow-rose-500/30">
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
        
        {/* Mini Waveform Timeline - Always visible when audio loaded */}
        {audioUrl && activeSection !== 'inroom' && (
          <div className="bg-white border-t border-gray-200 px-4 py-2 flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Play/Pause Button */}
              <button
                onClick={togglePlay}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              
              {/* Mini Timeline */}
              <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative cursor-pointer" onClick={() => setActiveSection('audio')}>
                {/* Waveform visualization placeholder */}
                <div className="absolute inset-0 flex items-end justify-around px-1 gap-[1px]">
                  {Array.from({ length: 60 }).map((_, i) => {
                    const height = 20 + Math.sin(i * 0.3) * 30 + Math.random() * 20
                    return (
                      <div 
                        key={i} 
                        className="flex-1 bg-rose-400 rounded-t-sm opacity-60"
                        style={{ height: `${height}%` }}
                      />
                    )
                  })}
                </div>
                
                {/* Selection region indicator */}
                {selectedRegion && (
                  <div 
                    className="absolute top-0 bottom-0 bg-rose-500/30 border-x-2 border-rose-500"
                    style={{
                      left: `${(selectedRegion.start / (audioDuration || 1)) * 100}%`,
                      width: `${((selectedRegion.end - selectedRegion.start) / (audioDuration || 1)) * 100}%`,
                    }}
                  />
                )}
                
                {/* Edit hint */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity">
                  <span className="text-white text-xs font-medium">Click to edit selection</span>
                </div>
              </div>
              
              {/* Duration */}
              <span className="text-xs text-gray-500 font-mono w-16 text-right">
                {selectedRegion ? `${Math.floor(selectedRegion.end - selectedRegion.start)}s` : audioDuration ? `${Math.floor(audioDuration)}s` : '--'}
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Floating Add to Cart CTA - Always visible when audio loaded */}
      {audioUrl && activeSection !== 'inroom' && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          {/* Quick Actions */}
          <div className="flex gap-2 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
            <button
              onClick={() => {
                // Center waveform action
                const actions = useCustomizerStore.getState()
                actions.setWaveformPosition(50, 50)
              }}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
              title="Center Waveform"
            >
              <Crosshair className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                // Reset waveform size
                const actions = useCustomizerStore.getState()
                actions.setWaveformSize(100)
              }}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors"
              title="Reset Size"
            >
              <Focus className="w-4 h-4" />
            </button>
          </div>
          
          {/* Main CTA Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="flex items-center gap-3 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-xl shadow-rose-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
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
    </div>
  )
}
