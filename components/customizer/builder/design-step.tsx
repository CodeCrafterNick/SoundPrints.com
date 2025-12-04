'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { AudioUploader } from '@/components/customizer/audio-uploader'
import { WaveformEditor, type WaveformEditorHandle } from '@/components/customizer/waveform-editor'
import { StyleCustomizer, WaveformPreviewIcon } from '@/components/customizer/style-customizer'
import { ColorCustomizer } from '@/components/customizer/color-customizer'
import { TextCustomizer } from '@/components/customizer/text-customizer'
import { BackgroundCustomizer } from '@/components/customizer/background-customizer'
import { QRCodeCustomizer } from '@/components/customizer/qrcode-customizer'
import { PresetSelector } from '@/components/customizer/preset-selector'
import { UndoRedoToolbar } from '@/components/customizer/undo-redo-toolbar'
import { LiveWaveformPreview } from '@/components/products/live-waveform-preview'
import { InteractiveCanvasEditorKonva as InteractiveCanvasEditor } from '@/components/products/interactive-canvas-editor-konva'
import { ProductMockup, type ProductMockupRef } from '@/components/products/product-mockup'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  ChevronDown,
  Upload,
  Sparkles,
  Palette,
  Type,
  Image,
  QrCode,
  Activity,
  Maximize2,
  Play,
  Pause,
  RotateCcw,
  Check,
  ArrowRight,
  Layers,
  Newspaper,
  Square,
  GalleryVertical,
  Waves,
  Clock,
  type LucideIcon
} from 'lucide-react'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { cn } from '@/lib/utils'
import { 
  PRINTIFY_PRODUCTS, 
  type PrintifyProduct,
  type ProductSize 
} from '@/lib/printify-product-catalog'

// Icon map for product icons
const productIcons: Record<string, LucideIcon> = {
  Layers,
  Sparkles,
  Newspaper,
  Square,
  GalleryVertical,
  Palette,
  Waves,
  Clock,
}

// ProductIcon component
function ProductIcon({ icon, className }: { icon: string; className?: string }) {
  const IconComponent = productIcons[icon] || Layers
  return <IconComponent className={className} />
}

interface DesignStepProps {
  onContinue: () => void
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

export function DesignStep({ 
  onContinue, 
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
}: DesignStepProps) {
  // State
  const [openAccordion, setOpenAccordion] = useState<string>('upload')
  const [hasAutoAdvanced, setHasAutoAdvanced] = useState({ upload: false, style: false })
  const [isInteractiveMode, setIsInteractiveMode] = useState(false)
  const [showSizeControls, setShowSizeControls] = useState(false)
  const [isAudioSectionCompact, setIsAudioSectionCompact] = useState(false)
  const [isAudioSectionSticky, setIsAudioSectionSticky] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioSectionRef = useRef<HTMLDivElement>(null)

  // Store values
  const audioUrl = useCustomizerStore((state) => state.audioUrl)
  const waveformStyle = useCustomizerStore((state) => state.waveformStyle)
  const waveformColor = useCustomizerStore((state) => state.waveformColor)
  const backgroundColor = useCustomizerStore((state) => state.backgroundColor)
  const backgroundImage = useCustomizerStore((state) => state.backgroundImage)
  const waveformSize = useCustomizerStore((state) => state.waveformSize)
  const setWaveformSize = useCustomizerStore((state) => state.setWaveformSize)
  const waveformHeightMultiplier = useCustomizerStore((state) => state.waveformHeightMultiplier)
  const setWaveformHeightMultiplier = useCustomizerStore((state) => state.setWaveformHeightMultiplier)
  const audioFileName = useCustomizerStore((state) => state.audioFile?.name || '')
  const resetStore = useCustomizerStore((state) => state.reset)
  const saveToHistory = useCustomizerStore((state) => state.saveToHistory)

  // Detect when audio section becomes sticky
  useEffect(() => {
    if (!audioSectionRef.current) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAudioSectionSticky(!entry.isIntersecting)
      },
      {
        threshold: 1.0,
        rootMargin: '-80px 0px 0px 0px'
      }
    )
    
    observer.observe(audioSectionRef.current)
    
    return () => observer.disconnect()
  }, [audioUrl])

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (waveformEditorRef.current) {
      waveformEditorRef.current.togglePlayPause()
      setIsPlaying(waveformEditorRef.current.isPlaying())
    }
  }, [waveformEditorRef])

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
  }, [isPlaying, waveformEditorRef])

  // Reset everything
  const handleReset = useCallback(() => {
    if (waveformEditorRef.current) {
      waveformEditorRef.current.pause()
    }
    setIsPlaying(false)
    resetStore()
  }, [resetStore, waveformEditorRef])

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

  return (
    <div className="grid lg:grid-cols-[380px_1fr] xl:grid-cols-[400px_1fr] gap-6">
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
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0">
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
                    className="h-7 w-7 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
                    className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
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
                    className="flex items-center justify-between w-full text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
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
                          <label className="text-xs font-medium text-gray-600">Width</label>
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
                          <label className="text-xs font-medium text-gray-600">Volume</label>
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
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-rose-200 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">1</span>
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
                      ? 'bg-emerald-500' 
                      : 'bg-gray-100'
                  )}>
                    {audioUrl ? (
                      <Check className="h-4 w-4 text-white" />
                    ) : (
                      <Upload className="h-4 w-4 text-gray-500" />
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
                  <div className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center">
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
                  <div className="w-9 h-9 rounded-xl bg-cyan-500 flex items-center justify-center">
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
                  <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
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
                  <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center">
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

        {/* Continue Button */}
        {audioUrl && (
          <Button
            onClick={onContinue}
            className="w-full h-12 bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-lg"
          >
            Continue to Preview
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Right Side - Live Preview */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        {/* Hidden ProductMockup for canvas generation */}
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
          <>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Preview Header */}
            <div className="bg-gray-900 px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-semibold text-lg">Design Preview</h2>
                  <p className="text-gray-400 text-xs mt-0.5">See your design in real-time</p>
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
                  <div className="hidden sm:flex items-center gap-1 border-l border-white/20 pl-2 ml-1">
                    <UndoRedoToolbar />
                    <PresetSelector />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Preview Area */}
            <div className="bg-gray-50 flex-1">
              <div className="relative h-full min-h-[400px]">
                {/* Decorative grid background */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                  backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />
                
                {isInteractiveMode ? (
                  <div className="absolute inset-0">
                    <InteractiveCanvasEditor
                      mockupRef={mockupRef as React.RefObject<{ canvas: HTMLCanvasElement | null }>}
                      selectedSize={selectedWallArtSize}
                    />
                  </div>
                ) : (
                  <div className="relative z-10 flex items-center justify-center h-full p-4">
                    <div 
                      className="relative flex items-center justify-center"
                      style={{
                        width: selectedWallArtSize 
                          ? selectedWallArtSize.width >= selectedWallArtSize.height 
                            ? '100%' 
                            : `${(selectedWallArtSize.width / selectedWallArtSize.height) * 50}vh`
                          : '75%',
                        height: selectedWallArtSize 
                          ? selectedWallArtSize.width >= selectedWallArtSize.height 
                            ? `${(selectedWallArtSize.height / selectedWallArtSize.width) * 100}%`
                            : '50vh'
                          : '86.67%',
                        maxWidth: '100%',
                        maxHeight: '50vh',
                      }}
                    >
                      <div className="relative w-full h-full">
                        <LiveWaveformPreview 
                          mockupRef={mockupRef} 
                          selectedSize={selectedWallArtSize} 
                        />
                      </div>
                      {/* Size indicator */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-lg">
                        {selectedWallArtSize.width}" × {selectedWallArtSize.height}"
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Material & Size Selector - Below Preview */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden p-4 mt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Material & Size</h3>
            
            {/* Material/Category Grid */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {(['poster', 'canvas', 'framed'] as const).map((category) => {
                const isSelected = selectedProduct.category === category
                const product = PRINTIFY_PRODUCTS.find(p => p.category === category)
                return (
                  <button
                    key={category}
                    onClick={() => {
                      if (product) setSelectedProduct(product)
                    }}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 px-2 rounded-lg border-2 transition-all duration-200 text-xs font-medium",
                      isSelected
                        ? "border-rose-500 bg-rose-50 text-rose-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-600"
                    )}
                  >
                    {category === 'poster' && <Layers className="w-4 h-4 mb-1" />}
                    {category === 'canvas' && <Sparkles className="w-4 h-4 mb-1" />}
                    {category === 'framed' && <Square className="w-4 h-4 mb-1" />}
                    <span className="capitalize">{category}</span>
                  </button>
                )
              })}
            </div>
            
            {/* Size Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedProduct.sizes.map((size, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedSize(size)
                    setSelectedWallArtSize({ width: size.width, height: size.height })
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border-2 transition-all text-xs font-medium",
                    selectedSize.value === size.value
                      ? "border-rose-500 bg-rose-50 text-rose-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  )}
                >
                  {size.label}
                </button>
              ))}
            </div>
            
            {/* Frame Color Picker - only for framed category */}
            {selectedProduct.category === 'framed' && (
              <div>
                <div className="text-xs font-medium text-gray-600 mb-2">Frame Color</div>
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
                        "w-8 h-8 rounded-full border-2 transition-all relative flex items-center justify-center",
                        selectedFrameColor === fc.id
                          ? "border-rose-500 ring-2 ring-rose-200"
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
          </>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="flex flex-col items-center justify-center p-12 text-center min-h-[600px] relative">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, #374151 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }} />
              
              <div className="relative z-10">
                {/* Animated waveform icon */}
                <div className="w-24 h-24 rounded-3xl bg-rose-500 flex items-center justify-center mb-8 shadow-xl shadow-rose-500/30 mx-auto">
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
                  <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm">MP3</span>
                  <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm">WAV</span>
                  <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm">M4A</span>
                  <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm">OGG</span>
                  <span className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm">FLAC</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
