'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { AudioUploader } from '@/components/customizer/audio-uploader'
import { WaveformEditor, type WaveformEditorHandle } from '@/components/customizer/waveform-editor'
import { StyleCustomizer, WaveformPreviewIcon } from '@/components/customizer/style-customizer'
import { ColorCustomizer } from '@/components/customizer/color-customizer'
import { TextCustomizer } from '@/components/customizer/text-customizer'
import { BackgroundCustomizer } from '@/components/customizer/background-customizer'
import { QRCodeCustomizer } from '@/components/customizer/qrcode-customizer'
import { PresetSelector } from '@/components/customizer/preset-selector'
import { UndoRedoToolbar } from '@/components/customizer/undo-redo-toolbar'
import { WallArtPreview, type WallArtPreviewRef } from '@/components/products/wall-art-preview'
import { ProductMockup, type ProductMockupRef } from '@/components/products/product-mockup'
import { LiveWaveformPreview } from '@/components/products/live-waveform-preview'
import { InteractiveCanvasEditor } from '@/components/products/interactive-canvas-editor'
import { CartDialog } from '@/components/cart/cart-dialog'
import { Button } from '@/components/ui/button'
import { useKeyboardShortcuts } from '@/lib/hooks/use-keyboard-shortcuts'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { 
  ChevronLeft,
  ChevronDown,
  ShoppingCart, 
  Check, 
  Upload, 
  Sparkles, 
  Palette, 
  Type, 
  Image, 
  QrCode, 
  Loader2, 
  Activity, 
  Download, 
  Zap, 
  Maximize2,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Grid3X3,
  Package,
  FileText,
  Frame,
  Clock,
  Shirt,
  Gem,
  ShoppingBag,
  type LucideIcon
} from 'lucide-react'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { Slider } from '@/components/ui/slider'
import { useCartStore } from '@/lib/stores/cart-store'
import { toast } from 'sonner'
import { 
  PRINTIFY_PRODUCTS, 
  getProductById,
  type PrintifyProduct,
  type ProductSize 
} from '@/lib/printify-product-catalog'
import { cn } from '@/lib/utils'

// Icon map for product icons
const productIcons: Record<string, LucideIcon> = {
  FileText,
  Image,
  Frame,
  Palette,
  Shirt,
  Clock,
  Sparkles,
  Gem,
  ShoppingBag,
}

// ProductIcon component to render icons from icon names
function ProductIcon({ icon, className }: { icon: string; className?: string }) {
  const IconComponent = productIcons[icon] || FileText
  return <IconComponent className={className} />
}

export default function CreatePage() {
  // State management
  const [openAccordion, setOpenAccordion] = useState<string>('upload')
  const [hasAutoAdvanced, setHasAutoAdvanced] = useState({ upload: false, style: false })
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [isInteractiveMode, setIsInteractiveMode] = useState(false)
  const [selectedPreviewTab, setSelectedPreviewTab] = useState<'design' | 'room'>('design')
  const [generatedMockupImage, setGeneratedMockupImage] = useState<string | null>(null)
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0)
  const [showSizeControls, setShowSizeControls] = useState(false)
  const [isAudioSectionCompact, setIsAudioSectionCompact] = useState(false)
  const [isAudioSectionSticky, setIsAudioSectionSticky] = useState(false)
  const audioSectionRef = useRef<HTMLDivElement>(null)
  
  // Product selection state
  const [selectedProduct, setSelectedProduct] = useState<PrintifyProduct>(PRINTIFY_PRODUCTS[0])
  const [selectedSize, setSelectedSize] = useState<ProductSize>(PRINTIFY_PRODUCTS[0].sizes[2]) // Default 18x24
  const [selectedWallArtSize, setSelectedWallArtSize] = useState({ width: 18, height: 24 })

  // Refs
  const mockupRef = useRef<ProductMockupRef>(null)
  const wallArtPreviewRef = useRef<WallArtPreviewRef>(null)
  const waveformEditorRef = useRef<WaveformEditorHandle>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false)

  // Store values
  const audioUrl = useCustomizerStore((state) => state.audioUrl)
  const selectedRegion = useCustomizerStore((state) => state.selectedRegion)
  const waveformStyle = useCustomizerStore((state) => state.waveformStyle)
  const waveformColor = useCustomizerStore((state) => state.waveformColor)
  const backgroundColor = useCustomizerStore((state) => state.backgroundColor)
  const backgroundImage = useCustomizerStore((state) => state.backgroundImage)
  const backgroundImagePosition = useCustomizerStore((state) => state.backgroundImagePosition)
  const waveformSize = useCustomizerStore((state) => state.waveformSize)
  const setWaveformSize = useCustomizerStore((state) => state.setWaveformSize)
  const waveformHeightMultiplier = useCustomizerStore((state) => state.waveformHeightMultiplier)
  const setWaveformHeightMultiplier = useCustomizerStore((state) => state.setWaveformHeightMultiplier)
  const hasUnsavedChanges = useCustomizerStore((state) => state.hasUnsavedChanges)
  const setHasUnsavedChanges = useCustomizerStore((state) => state.setHasUnsavedChanges)
  const audioFileName = useCustomizerStore((state) => state.audioFile?.name || '')
  const customText = useCustomizerStore((state) => state.customText)
  const saveToHistory = useCustomizerStore((state) => state.saveToHistory)
  const resetStore = useCustomizerStore((state) => state.reset)
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)

  // Initialize audio element for playback
  useEffect(() => {
    if (audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl)
      } else {
        audioRef.current.src = audioUrl
      }
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false)
      })
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [audioUrl])

  // Detect when audio section becomes sticky
  useEffect(() => {
    if (!audioSectionRef.current) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the element is not fully visible at the top, it's sticky
        setIsAudioSectionSticky(!entry.isIntersecting)
      },
      {
        threshold: 1.0,
        rootMargin: '-80px 0px 0px 0px' // Account for the sticky top-20 (80px)
      }
    )
    
    observer.observe(audioSectionRef.current)
    
    return () => observer.disconnect()
  }, [audioUrl]) // Re-run when audio is loaded

  // Toggle play/pause - uses WaveformEditor which shows the playhead
  const togglePlay = useCallback(() => {
    if (waveformEditorRef.current) {
      waveformEditorRef.current.togglePlayPause()
      setIsPlaying(waveformEditorRef.current.isPlaying())
    }
  }, [])

  // Sync isPlaying state with WaveformEditor
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
  }, [isPlaying])

  // Reset everything
  const handleReset = useCallback(() => {
    if (waveformEditorRef.current) {
      waveformEditorRef.current.pause()
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)
    resetStore()
  }, [resetStore])

  // Enable keyboard shortcuts (Cmd+Z for undo, arrow keys for nudging, space for play/pause)
  useKeyboardShortcuts({ enabled: true, onPlayPause: togglePlay })

  // Save initial state to history when audio is loaded
  useEffect(() => {
    if (audioUrl) {
      saveToHistory()
    }
  }, [audioUrl, saveToHistory])

  // Auto-advance accordion sections
  useEffect(() => {
    if (audioUrl && openAccordion === 'upload' && !hasAutoAdvanced.upload) {
      const timer = setTimeout(() => {
        setOpenAccordion('style')
        setHasAutoAdvanced(prev => ({ ...prev, upload: true }))
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [audioUrl, openAccordion, hasAutoAdvanced.upload])

  useEffect(() => {
    if (waveformStyle && audioUrl && openAccordion === 'style' && !hasAutoAdvanced.style) {
      const timer = setTimeout(() => {
        setOpenAccordion('colors')
        setHasAutoAdvanced(prev => ({ ...prev, style: true }))
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [waveformStyle, audioUrl, openAccordion, hasAutoAdvanced.style])

  // Handle product selection
  const handleProductSelect = (product: PrintifyProduct, size: ProductSize) => {
    setSelectedProduct(product)
    setSelectedSize(size)
    setSelectedWallArtSize({ width: size.width, height: size.height })
  }

  // Add to cart handler
  const handleAddToCart = () => {
    if (!audioUrl || !mockupRef.current?.canvas) return

    const canvas = mockupRef.current.canvas
    // Create a smaller thumbnail for display only
    const thumbCanvas = document.createElement('canvas')
    const thumbSize = 200 // Smaller thumbnail
    const aspectRatio = canvas.width / canvas.height
    thumbCanvas.width = thumbSize
    thumbCanvas.height = thumbSize / aspectRatio
    const thumbCtx = thumbCanvas.getContext('2d')
    if (thumbCtx) {
      thumbCtx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height)
    }
    // Use lower quality JPEG for smaller file size
    const thumbnailUrl = thumbCanvas.toDataURL('image/jpeg', 0.4)

    addItem({
      audioFileName,
      audioFileUrl: audioUrl,
      audioSelectionStart: selectedRegion?.start,
      audioSelectionEnd: selectedRegion?.end,
      waveformColor,
      backgroundColor,
      productType: selectedProduct.category as any,
      size: selectedSize.label,
      customText,
      price: selectedSize.price,
      thumbnailUrl,
      // Printify-specific fields for order fulfillment/resubmission
      printifyBlueprintId: String(selectedProduct.blueprintId),
      printifyVariantId: selectedSize.value, // Size value like '18x24'
      waveformStyle: waveformStyle,
      designPreset: undefined, // Could add preset tracking later
      productColor: undefined, // For apparel products
      mockupUrl: undefined, // Generated mockup URL if available
      // designUrl is generated on-demand at checkout, not stored
    })

    toast.success('Added to cart!', {
      description: `${selectedProduct.name} (${selectedSize.label}) added to your cart.`,
    })

    // Open cart modal after adding item
    openCart()
  }

  // Generate preview handler
  const handleGeneratePreview = async () => {
    if (!wallArtPreviewRef.current) {
      toast.error('Preview not ready')
      return
    }

    setIsGeneratingPreview(true)
    try {
      await wallArtPreviewRef.current.generateMockup()
      setHasUnsavedChanges(false)
      setSelectedPreviewTab('room')
      toast.success('Preview generated!')
    } catch (error) {
      console.error('Failed to generate preview:', error)
      toast.error('Failed to generate preview')
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  // Download design handler
  const handleDownload = async () => {
    if (!mockupRef.current?.getPrintFile) {
      toast.error('Preview not ready. Please wait for the design to load.')
      return
    }
    
    if (!audioUrl) {
      toast.error('Please upload an audio file first.')
      return
    }

    toast.info('Generating high-resolution print file...')
    
    try {
      const printFile = await mockupRef.current.getPrintFile()
      
      if (!printFile) {
        throw new Error('No print file generated')
      }
      
      const link = document.createElement('a')
      link.href = printFile
      link.download = `soundprint-${Date.now()}.png`
      // Append to body for Firefox compatibility
      document.body.appendChild(link)
      link.click()
      // Clean up
      document.body.removeChild(link)
      
      toast.success('Download complete!')
    } catch (error) {
      console.error('Failed to generate print file:', error)
      toast.error(`Failed to generate print file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Step-based progress for sidebar guidance
  const currentStep = useMemo(() => {
    if (!audioUrl) return 1 // Upload audio
    if (openAccordion === 'style') return 2 // Choose style
    if (openAccordion === 'colors') return 3 // Customize colors
    if (openAccordion === 'text') return 4 // Add text
    if (openAccordion === 'background') return 5 // Background
    if (openAccordion === 'qrcode') return 6 // QR code
    return 2 // Default to style after audio
  }, [audioUrl, openAccordion])
  
  const isReadyToOrder = !!audioUrl

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:text-gray-900">
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </Link>
              <div className="border-l border-gray-200 pl-4">
                <h1 className="text-lg font-bold text-gray-900">
                  Create Your SoundPrint
                </h1>
                {isReadyToOrder && (
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                    <Check className="h-3 w-3" />
                    Ready to order
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Undo/Redo and Themes */}
              <div className="hidden sm:flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
                <UndoRedoToolbar />
                <PresetSelector />
              </div>
              
              {isReadyToOrder && (
                <Button
                  onClick={handleAddToCart}
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">${selectedSize.price.toFixed(2)}</span>
                </Button>
              )}
              <CartDialog />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[420px_1fr] xl:grid-cols-[460px_1fr] gap-6">
          
          {/* Left Sidebar - Controls */}
          <div className="space-y-4">
            {/* Waveform Editor - Sticky when audio loaded */}
            {audioUrl && (
              <div 
                ref={audioSectionRef}
                className={cn(
                  "bg-white rounded-2xl shadow-sm border border-gray-200 sticky top-20 z-40 transition-all duration-200",
                  isAudioSectionCompact ? "p-2" : "p-4"
                )}
              >
                {/* Compact Mode */}
                {isAudioSectionCompact ? (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setIsAudioSectionCompact(false)}
                      className="flex items-center gap-2 flex-1 hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Activity className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 truncate">
                        {audioFileName || 'Audio Selection'}
                      </span>
                      <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    </button>
                    <div className="flex items-center gap-0.5 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={togglePlay}
                        className="h-7 w-7"
                        title={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? (
                          <Pause className="h-3.5 w-3.5" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleReset}
                        className="h-7 w-7 text-gray-500 hover:text-red-500"
                        title="Reset"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Expanded Mode */
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={() => setIsAudioSectionCompact(true)}
                        className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                          <Activity className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">Audio Selection</h3>
                          <p className="text-[10px] text-gray-500">Drag to select • Click to minimize</p>
                        </div>
                      </button>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={togglePlay}
                          className="h-8 w-8"
                          title={isPlaying ? 'Pause' : 'Play'}
                        >
                          {isPlaying ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleReset}
                          className="h-8 w-8 text-gray-500 hover:text-red-500"
                          title="Reset and start over"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <WaveformEditor ref={waveformEditorRef} />
                    
                    {/* Size Controls Toggle */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setShowSizeControls(!showSizeControls)}
                        className="flex items-center justify-between w-full text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Maximize2 className="w-3 h-3" />
                          Adjust Size
                        </span>
                        <ChevronDown className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          showSizeControls ? "rotate-180" : ""
                        )} />
                      </button>
                      
                      {showSizeControls && (
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium text-gray-700">Width</label>
                              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{waveformSize}%</span>
                            </div>
                            <Slider
                              value={[waveformSize]}
                              onValueChange={(value) => setWaveformSize(value[0])}
                              min={20}
                              max={200}
                              step={5}
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-medium text-gray-700">Height</label>
                              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{waveformHeightMultiplier}%</span>
                            </div>
                            <Slider
                              value={[waveformHeightMultiplier]}
                              onValueChange={(value) => setWaveformHeightMultiplier(value[0])}
                              min={50}
                              max={300}
                              step={10}
                              className="w-full"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Step Guidance */}
            {!audioUrl && (
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-200/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-violet-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Start by uploading your audio</h3>
                    <p className="text-xs text-gray-600 mt-0.5">Upload a song, voice memo, or any audio file to create your unique sound wave art.</p>
                  </div>
                </div>
              </div>
            )}



            {/* Customization Accordion */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <Accordion
                type="single"
                collapsible
                value={openAccordion}
                onValueChange={setOpenAccordion}
                className="w-full"
              >
                {/* Upload Audio */}
                <AccordionItem value="upload" className="border-b border-gray-100 last:border-b-0">
                  <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                        audioUrl 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                          : 'bg-gray-100'
                      )}>
                        {audioUrl ? (
                          <Check className="h-4 w-4 text-white" />
                        ) : (
                          <Upload className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm text-gray-900">Upload Audio</div>
                        <div className="text-xs text-gray-500">MP3, WAV, or M4A</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className={cn(
                    "px-4 pt-4 pb-4 sticky z-30 bg-white transition-all duration-200",
                    isAudioSectionSticky ? "top-[180px]" : "top-[280px]"
                  )}>
                    <AudioUploader />
                  </AccordionContent>
                </AccordionItem>

                {/* Waveform Style */}
                <AccordionItem value="style" disabled={!audioUrl} className="border-b border-gray-100 last:border-b-0">
                  <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 disabled:opacity-50">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left flex-1">
                        <div className="font-semibold text-sm text-gray-900">Waveform Style</div>
                        <div className="text-xs text-gray-500 capitalize">{waveformStyle.replace(/-/g, ' ')}</div>
                      </div>
                      {audioUrl && (
                        <div className="mr-2">
                          <WaveformPreviewIcon style={waveformStyle} size="small" />
                        </div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className={cn(
                    "px-4 pt-4 pb-4 sticky z-30 bg-white transition-all duration-200",
                    isAudioSectionSticky ? "top-[180px]" : "top-[280px]"
                  )}>
                    <StyleCustomizer />
                  </AccordionContent>
                </AccordionItem>

                {/* Colors */}
                <AccordionItem value="colors" disabled={!audioUrl} className="border-b border-gray-100 last:border-b-0">
                  <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 disabled:opacity-50">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center border-2 border-gray-200 relative overflow-hidden"
                        style={{ 
                          backgroundColor: backgroundColor,
                          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                          backgroundSize: 'cover',
                        }}
                      >
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: waveformColor }}
                        />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm text-gray-900">Colors</div>
                        <div className="text-xs text-gray-500">Waveform & background</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className={cn(
                    "px-4 pt-4 pb-4 sticky z-30 bg-white transition-all duration-200",
                    isAudioSectionSticky ? "top-[180px]" : "top-[280px]"
                  )}>
                    <ColorCustomizer />
                  </AccordionContent>
                </AccordionItem>

                {/* Text */}
                <AccordionItem value="text" disabled={!audioUrl} className="border-b border-gray-100 last:border-b-0">
                  <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 disabled:opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                        <Type className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm text-gray-900">Add Text</div>
                        <div className="text-xs text-gray-500">Title, date, or message</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className={cn(
                    "px-4 pt-4 pb-4 sticky z-30 bg-white transition-all duration-200",
                    isAudioSectionSticky ? "top-[180px]" : "top-[280px]"
                  )}>
                    <TextCustomizer />
                  </AccordionContent>
                </AccordionItem>

                {/* Background */}
                <AccordionItem value="background" disabled={!audioUrl} className="border-b border-gray-100 last:border-b-0">
                  <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 disabled:opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                        <Image className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm text-gray-900">Background</div>
                        <div className="text-xs text-gray-500">Add your own photo</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className={cn(
                    "px-4 pb-4 sticky z-30 bg-white transition-all duration-200",
                    isAudioSectionSticky ? "top-[180px]" : "top-[280px]"
                  )}>
                    <BackgroundCustomizer />
                  </AccordionContent>
                </AccordionItem>

                {/* QR Code */}
                <AccordionItem value="qrcode" disabled={!audioUrl} className="last:border-b-0">
                  <AccordionTrigger className="px-4 py-3 hover:bg-gray-50 disabled:opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                        <QrCode className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm text-gray-900">QR Code</div>
                        <div className="text-xs text-gray-500">Link to audio (optional)</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className={cn(
                    "px-4 pb-4 sticky z-30 bg-white transition-all duration-200",
                    isAudioSectionSticky ? "top-[180px]" : "top-[280px]"
                  )}>
                    <QRCodeCustomizer />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            {/* Hidden ProductMockup for canvas generation - positioned outside overflow container */}
            {audioUrl && (
              <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none" aria-hidden="true">
                <ProductMockup 
                  ref={mockupRef} 
                  canvasWidth={selectedWallArtSize.width * 300} 
                  canvasHeight={selectedWallArtSize.height * 300} 
                />
              </div>
            )}
            {audioUrl ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden">

                {/* Preview Header */}
                <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-white font-semibold text-lg">Preview Your Design</h2>
                      <p className="text-gray-400 text-xs mt-0.5">See how your SoundPrint will look</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsInteractiveMode(!isInteractiveMode)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5',
                          isInteractiveMode 
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                            : 'bg-white/10 text-white/80 hover:bg-white/20'
                        )}
                        title="Toggle interactive mode"
                      >
                        <Activity className="w-3.5 h-3.5" />
                        {isInteractiveMode ? 'Interactive' : 'Preview'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Preview Tabs */}
                  <div className="flex items-center gap-1 mt-4 bg-black/20 rounded-xl p-1">
                    <button
                      onClick={() => setSelectedPreviewTab('design')}
                      className={cn(
                        'flex-1 px-4 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5',
                        selectedPreviewTab === 'design'
                          ? 'bg-white text-gray-900 shadow-md'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      )}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Design
                    </button>
                    <button
                      onClick={() => setSelectedPreviewTab('room')}
                      className={cn(
                        'flex-1 px-4 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5',
                        selectedPreviewTab === 'room'
                          ? 'bg-white text-gray-900 shadow-md'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      )}
                    >
                      <Grid3X3 className="w-3.5 h-3.5" />
                      In Room
                    </button>
                  </div>
                </div>

                {/* Main Preview Area */}
                <div className="p-5 bg-gradient-to-b from-gray-50 to-white">
                  {/* Preview Content */}
                  <div className="relative rounded-2xl overflow-hidden bg-white shadow-inner border border-gray-100 min-h-[500px]">
                    {/* Decorative grid background */}
                    <div className="absolute inset-0 opacity-[0.02]" style={{
                      backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }} />
                    
                    <div className="relative z-10 flex items-center justify-center min-h-[480px] max-h-[80vh] p-6">
                      {selectedPreviewTab === 'design' ? (
                        isInteractiveMode ? (
                          <div className="w-full h-full flex items-center justify-center max-h-[70vh]">
                            <div 
                              className="relative h-full w-full flex items-center justify-center"
                            >
                              <div
                                className="relative"
                                style={{ 
                                  width: '100%',
                                  maxWidth: '100%',
                                  maxHeight: '100%',
                                  aspectRatio: selectedWallArtSize ? `${selectedWallArtSize.width} / ${selectedWallArtSize.height}` : '3 / 4'
                                }}
                              >
                                <InteractiveCanvasEditor
                                  mockupRef={mockupRef as React.RefObject<{ canvas: HTMLCanvasElement | null }>}
                                  selectedSize={selectedWallArtSize}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center max-h-[70vh]">
                            <div 
                              className="relative h-full w-full flex items-center justify-center"
                            >
                              <div
                                className="relative"
                                style={{ 
                                  width: '100%',
                                  maxWidth: '100%',
                                  maxHeight: '100%',
                                  aspectRatio: selectedWallArtSize ? `${selectedWallArtSize.width} / ${selectedWallArtSize.height}` : '3 / 4'
                                }}
                              >
                                <LiveWaveformPreview 
                                  mockupRef={mockupRef} 
                                  selectedSize={selectedWallArtSize} 
                                />
                              </div>
                              {/* Size indicator */}
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-lg">
                                {selectedSize.label}
                              </div>
                            </div>
                          </div>
                        )
                      ) : (
                        /* In Room Gallery View */
                        <div className="w-full space-y-4">
                          {/* Room Scenes - would come from mockup generation */}
                          {(() => {
                            const roomScenes = [
                              { id: 'living', name: 'Living Room', description: 'Modern living space with neutral tones' },
                              { id: 'bedroom', name: 'Bedroom', description: 'Cozy bedroom setting' },
                              { id: 'office', name: 'Home Office', description: 'Professional workspace' },
                              { id: 'minimal', name: 'Minimal', description: 'Clean white wall' },
                            ]
                            
                            return (
                              <>
                                {/* Main Image */}
                                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                  {generatedMockupImage ? (
                                    <img 
                                      src={generatedMockupImage} 
                                      alt={`${selectedProduct.name} in ${roomScenes[selectedRoomIndex].name}`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-8">
                                      <div className="w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-4">
                                        <ProductIcon icon={selectedProduct.icon} className="w-12 h-12 text-gray-400" />
                                      </div>
                                      <h3 className="text-lg font-semibold text-gray-700 mb-1">{roomScenes[selectedRoomIndex].name}</h3>
                                      <p className="text-sm text-gray-500 text-center max-w-xs mb-4">
                                        {roomScenes[selectedRoomIndex].description}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        Generate a mockup to see your design in this room
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Navigation Arrows */}
                                  <button
                                    onClick={() => setSelectedRoomIndex((prev) => (prev === 0 ? roomScenes.length - 1 : prev - 1))}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-all"
                                    aria-label="Previous room"
                                  >
                                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                                  </button>
                                  <button
                                    onClick={() => setSelectedRoomIndex((prev) => (prev === roomScenes.length - 1 ? 0 : prev + 1))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-all rotate-180"
                                    aria-label="Next room"
                                  >
                                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                                  </button>
                                  
                                  {/* Room Label */}
                                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                                    {roomScenes[selectedRoomIndex].name} • {selectedSize.label}
                                  </div>
                                </div>
                                
                                {/* Thumbnail Strip */}
                                <div className="flex gap-2 justify-center">
                                  {roomScenes.map((scene, index) => (
                                    <button
                                      key={scene.id}
                                      onClick={() => setSelectedRoomIndex(index)}
                                      className={cn(
                                        'relative w-16 h-12 rounded-lg overflow-hidden transition-all',
                                        selectedRoomIndex === index
                                          ? 'ring-2 ring-violet-500 ring-offset-2'
                                          : 'opacity-60 hover:opacity-100'
                                      )}
                                    >
                                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                        <span className="text-[8px] font-medium text-gray-600">{scene.name}</span>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Product & Size Selector - Always visible */}
                  <div className="mt-4 space-y-3">
                      {/* Material/Product Type Selector - Grouped by unique product types */}
                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {[
                          { id: 'poster', label: 'Poster', productIds: ['poster-vertical', 'poster-horizontal'] },
                          { id: 'satin', label: 'Satin', productIds: ['satin-poster'] },
                          { id: 'paper', label: 'Paper', productIds: ['paper-poster'] },
                          { id: 'canvas', label: 'Canvas', productIds: ['stretched-canvas'] },
                          { id: 'framed', label: 'Framed', productIds: ['framed-vertical', 'framed-horizontal'] },
                        ].map((group) => {
                          const isSelected = group.productIds.includes(selectedProduct.id)
                          return (
                            <button
                              key={group.id}
                              onClick={() => {
                                // Find the first product in this group
                                const product = PRINTIFY_PRODUCTS.find(p => group.productIds.includes(p.id))
                                if (product) {
                                  const newSize = product.sizes.find(s => s.popular) || product.sizes[0]
                                  handleProductSelect(product, newSize)
                                }
                              }}
                              className={cn(
                                'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                                isSelected
                                  ? 'bg-gray-900 text-white shadow-md'
                                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              )}
                            >
                              {group.label}
                            </button>
                          )
                        })}
                      </div>
                      
                      {/* Size Selector - Combined sizes from both orientations, deduped */}
                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        {(() => {
                          // Get all sizes from related products (both orientations)
                          const relatedProducts = selectedProduct.category === 'poster' 
                            ? PRINTIFY_PRODUCTS.filter(p => p.category === 'poster' && p.finish === selectedProduct.finish)
                            : selectedProduct.category === 'framed'
                            ? PRINTIFY_PRODUCTS.filter(p => p.category === 'framed')
                            : [selectedProduct]
                          
                          // Combine all sizes with product info
                          const allSizes = relatedProducts.flatMap(p => 
                            p.sizes.map(s => ({ ...s, productId: p.id }))
                          )
                          
                          // Deduplicate by dimensions (keep first occurrence)
                          const uniqueSizes = allSizes.filter((size, index, arr) => 
                            arr.findIndex(s => s.width === size.width && s.height === size.height) === index
                          )
                          
                          // Sort by area (smallest to largest)
                          uniqueSizes.sort((a, b) => (a.width * a.height) - (b.width * b.height))
                          
                          return uniqueSizes.map((size) => (
                            <button
                              key={size.value}
                              onClick={() => {
                                // Find the product that has this size
                                const product = PRINTIFY_PRODUCTS.find(p => p.id === size.productId)
                                if (product) {
                                  const productSize = product.sizes.find(s => s.value === size.value)
                                  if (productSize) {
                                    setSelectedProduct(product)
                                    setSelectedSize(productSize)
                                    setSelectedWallArtSize({ width: productSize.width, height: productSize.height })
                                  }
                                }
                              }}
                              className={cn(
                                'px-2.5 py-1 text-[11px] font-medium rounded-md transition-all relative',
                                selectedSize.width === size.width && selectedSize.height === size.height
                                  ? 'bg-violet-600 text-white shadow-sm'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              )}
                            >
                              {size.label}
                              {size.popular && (
                                <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-amber-400 rounded-full" />
                              )}
                            </button>
                          ))
                        })()}
                        <span className="text-xs text-gray-500 ml-2 font-medium">
                          ${selectedSize.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                </div>

                {/* Product Info & Actions */}
                <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50 px-5 py-5">
                  {/* Selected Product Display */}
                  <div className="flex items-center gap-4 mb-4 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0">
                      <ProductIcon icon={selectedProduct.icon} className="w-7 h-7 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{selectedProduct.name}</h3>
                      <p className="text-xs text-gray-500">
                        {selectedSize.label} • {selectedProduct.finish.charAt(0).toUpperCase() + selectedProduct.finish.slice(1)} finish
                      </p>
                      {selectedProduct.premium && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-medium text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md">
                          <Sparkles className="w-2.5 h-2.5" /> Premium Quality
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-bold text-gray-900">${selectedSize.price.toFixed(2)}</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Free shipping over $50</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="w-full h-11 border-2 hover:bg-gray-50"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      onClick={handleAddToCart}
                      className="w-full h-11 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 hover:from-gray-800 hover:via-gray-700 hover:to-gray-800 shadow-lg shadow-gray-900/20 transform hover:scale-[1.02] transition-all"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </div>
                  
                  {/* Trust Badges */}
                  <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-500" /> Premium quality
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-500" /> Fast shipping
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-500" /> 30-day returns
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200/80 overflow-hidden">
                <div className="flex flex-col items-center justify-center p-12 text-center min-h-[600px] relative">
                  {/* Background decoration */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                  }} />
                  
                  <div className="relative z-10">
                    {/* Animated waveform icon */}
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center mb-8 shadow-xl shadow-purple-500/30 mx-auto">
                      <div className="flex items-end gap-1 h-10">
                        <div className="w-1.5 bg-white/90 rounded-full animate-[soundwave_1s_ease-in-out_infinite]" style={{ height: '40%' }} />
                        <div className="w-1.5 bg-white/90 rounded-full animate-[soundwave_1s_ease-in-out_0.1s_infinite]" style={{ height: '70%' }} />
                        <div className="w-1.5 bg-white/90 rounded-full animate-[soundwave_1s_ease-in-out_0.2s_infinite]" style={{ height: '100%' }} />
                        <div className="w-1.5 bg-white/90 rounded-full animate-[soundwave_1s_ease-in-out_0.3s_infinite]" style={{ height: '60%' }} />
                        <div className="w-1.5 bg-white/90 rounded-full animate-[soundwave_1s_ease-in-out_0.4s_infinite]" style={{ height: '80%' }} />
                        <div className="w-1.5 bg-white/90 rounded-full animate-[soundwave_1s_ease-in-out_0.5s_infinite]" style={{ height: '50%' }} />
                        <div className="w-1.5 bg-white/90 rounded-full animate-[soundwave_1s_ease-in-out_0.6s_infinite]" style={{ height: '90%' }} />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Transform Sound Into Art
                    </h3>
                    <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
                      Upload your favorite song, voice message, or any meaningful audio to create a unique visual masterpiece
                    </p>
                    
                    {/* Supported formats */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                      <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm">MP3</span>
                      <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm">WAV</span>
                      <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm">M4A</span>
                      <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm">OGG</span>
                      <span className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm">FLAC</span>
                    </div>
                    
                    {/* Feature highlights */}
                    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center mx-auto mb-2">
                          <Sparkles className="w-5 h-5 text-violet-600" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium">35+ Styles</p>
                      </div>
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-2">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium">15 Products</p>
                      </div>
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                          <Check className="w-5 h-5 text-emerald-600" />
                        </div>
                        <p className="text-xs text-gray-600 font-medium">Premium Print</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product Quick Stats */}
            {audioUrl && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100 p-4 text-center group hover:shadow-md transition-all">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Package className="w-4 h-4 text-violet-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">15</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Products</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 p-4 text-center group hover:shadow-md transition-all">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Maximize2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">100+</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Sizes</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100 p-4 text-center group hover:shadow-md transition-all">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">35+</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Styles</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
