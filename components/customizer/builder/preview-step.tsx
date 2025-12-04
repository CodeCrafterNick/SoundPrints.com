'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ProductMockup, type ProductMockupRef } from '@/components/products/product-mockup'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { 
  PRINTIFY_PRODUCTS, 
  type PrintifyProduct,
  type ProductSize 
} from '@/lib/printify-product-catalog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  Grid3X3,
  Check,
  FileText,
  File,
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
  type LucideIcon
} from 'lucide-react'

// Icon map for product icons
const productIcons: Record<string, LucideIcon> = {
  FileText,
  File,
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

// ProductIcon component to render icons from icon names
function ProductIcon({ icon, className }: { icon: string; className?: string }) {
  const IconComponent = productIcons[icon] || FileText
  return <IconComponent className={className} />
}

// Types for mockup cache (shared with page.tsx)
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

interface PreviewStepProps {
  onBack: () => void
  onContinue: () => void
  mockupRef: React.RefObject<ProductMockupRef | null>
  selectedProduct: PrintifyProduct
  setSelectedProduct: (product: PrintifyProduct) => void
  selectedSize: ProductSize
  setSelectedSize: (size: ProductSize) => void
  selectedWallArtSize: { width: number; height: number }
  setSelectedWallArtSize: (size: { width: number; height: number }) => void
  selectedFrameColor: 'black' | 'white' | 'walnut'
  setSelectedFrameColor: (color: 'black' | 'white' | 'walnut') => void
  // Mockup cache props - lifted from component state to persist across step changes
  mockupCache: Record<string, CachedMockups>
  setMockupCache: React.Dispatch<React.SetStateAction<Record<string, CachedMockups>>>
  cachedDesignUrl: string | null
  setCachedDesignUrl: React.Dispatch<React.SetStateAction<string | null>>
  mockupsFailed: Set<string>
  setMockupsFailed: React.Dispatch<React.SetStateAction<Set<string>>>
}

export function PreviewStep({
  onBack,
  onContinue,
  mockupRef,
  selectedProduct,
  setSelectedProduct,
  selectedSize,
  setSelectedSize,
  selectedWallArtSize,
  setSelectedWallArtSize,
  selectedFrameColor,
  setSelectedFrameColor,
  mockupCache,
  setMockupCache,
  cachedDesignUrl,
  setCachedDesignUrl,
  mockupsFailed,
  setMockupsFailed,
}: PreviewStepProps) {
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0)
  
  // Mockups loading state (local, doesn't need to persist)
  const [mockupsLoading, setMockupsLoading] = useState(false)

  const audioUrl = useCustomizerStore((state) => state.audioUrl)

  // Handle product selection
  const handleProductSelect = (product: PrintifyProduct, size: ProductSize) => {
    setSelectedProduct(product)
    setSelectedSize(size)
    setSelectedWallArtSize({ width: size.width, height: size.height })
  }

  // Fetch Printify mockups
  const fetchPrintifyMockups = useCallback(async () => {
    if (!mockupRef.current) {
      toast.error('Design preview not ready')
      return
    }

    const cacheKey = `${selectedProduct.blueprintId}-${selectedSize.value}`
    
    if (mockupCache[cacheKey]) {
      return
    }

    if (mockupsFailed.has(cacheKey)) {
      return
    }

    setMockupsLoading(true)
    
    try {
      let designUrl = cachedDesignUrl

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
        throw new Error('Failed to generate mockups')
      }

      const data = await response.json()
      
      if (data.mockup) {
        const cachedData: CachedMockups = {
          primary: data.mockup.mockups,
          colorVariants: data.colorVariants || [],
        }
        setMockupCache(prev => ({
          ...prev,
          [cacheKey]: cachedData,
        }))
        toast.success(`Generated ${selectedProduct.shortName} ${selectedSize.label} preview`, { id: 'mockups' })
      } else {
        setMockupsFailed(prev => new Set(prev).add(cacheKey))
        toast.error(`No mockup available for ${selectedProduct.shortName} ${selectedSize.label}`, { id: 'mockups' })
      }

    } catch (error) {
      console.error('Failed to fetch mockups:', error)
      const cacheKey = `${selectedProduct.blueprintId}-${selectedSize.value}`
      setMockupsFailed(prev => new Set(prev).add(cacheKey))
      toast.error('Failed to generate room preview', { id: 'mockups' })
    } finally {
      setMockupsLoading(false)
    }
  }, [cachedDesignUrl, mockupsFailed, mockupRef, mockupCache, selectedProduct.blueprintId, selectedProduct.shortName, selectedSize.label, selectedSize.value, setCachedDesignUrl, setMockupCache, setMockupsFailed])

  // Auto-fetch mockups when product/size changes
  useEffect(() => {
    const cacheKey = `${selectedProduct.blueprintId}-${selectedSize.value}`
    const shouldFetch = audioUrl && !mockupsLoading && !mockupCache[cacheKey] && !mockupsFailed.has(cacheKey)
    
    if (shouldFetch) {
      // Small delay to allow canvas to render
      const timer = setTimeout(() => {
        fetchPrintifyMockups()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [selectedProduct.blueprintId, selectedSize.value, audioUrl, mockupsLoading, mockupCache, mockupsFailed, fetchPrintifyMockups])

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hidden ProductMockup for canvas generation */}
      <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none" aria-hidden="true">
        <ProductMockup 
          ref={mockupRef} 
          canvasWidth={selectedWallArtSize.width * 300} 
          canvasHeight={selectedWallArtSize.height * 300} 
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Preview Header */}
        <div className="bg-gray-900 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-semibold text-lg">Choose Your Product</h2>
              <p className="text-gray-400 text-xs mt-0.5">Select material and size for your SoundPrint</p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
              <Grid3X3 className="w-4 h-4 text-white/70" />
              <span className="text-xs font-medium text-white/90">Room Preview</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6 p-5">
          {/* Left - Preview Area */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="relative rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200 min-h-[550px]">
              {/* Decorative grid background */}
              <div className="absolute inset-0 opacity-[0.02]" style={{
                backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
              
              <div className="relative z-10 flex items-center justify-center min-h-[550px] p-4">
                {/* In Room Gallery View */}
                <div className="w-full space-y-4">
                    {(() => {
                      const cameraLabels: Record<string, string> = {
                        'front': 'Front View',
                        'front2': 'Front View 2',
                        'closeUp': 'Close-up Detail',
                        'context1': 'In Room Context',
                      }
                      
                      const cacheKey = `${selectedProduct.blueprintId}-${selectedSize.value}`
                      const currentMockupsData = mockupCache[cacheKey]
                      
                      interface MockupImage {
                        id: string
                        name: string
                        url: string
                        color?: string
                      }
                      const mockupImages: MockupImage[] = []
                      
                      const frameColorMap: Record<string, string> = {
                        'black': 'Black',
                        'white': 'White', 
                        'walnut': 'Walnut',
                      }
                      const reverseColorMap: Record<string, 'black' | 'white' | 'walnut'> = {
                        'Black': 'black',
                        'White': 'white',
                        'Walnut': 'walnut',
                      }
                      const targetColor = frameColorMap[selectedFrameColor]
                      
                      // Collect all available color variants for thumbnail display
                      const availableColorVariants: Array<{ color: string; frontUrl: string; variantId: number }> = []
                      
                      if (currentMockupsData) {
                        const hasColorVariants = currentMockupsData.colorVariants && currentMockupsData.colorVariants.length > 1
                        
                        if (hasColorVariants && currentMockupsData.colorVariants) {
                          // Collect all color variants with front mockups
                          for (const variant of currentMockupsData.colorVariants) {
                            if (variant.color && variant.mockups.front) {
                              availableColorVariants.push({
                                color: variant.color,
                                frontUrl: variant.mockups.front,
                                variantId: variant.variantId,
                              })
                            }
                          }
                          
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
                      
                      const validIndex = mockupImages.length > 0 ? Math.min(selectedRoomIndex, mockupImages.length - 1) : 0
                      const currentMockup = mockupImages[validIndex]
                      
                      // Check if we have the selected color in our variants
                      const hasSelectedColorMockup = availableColorVariants.some(v => v.color === targetColor)
                      
                      return (
                        <>
                          <div className="relative aspect-[4/3] min-h-[450px] rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                            {mockupsLoading ? (
                              <div className="w-full h-full flex flex-col items-center justify-center p-8">
                                <div className="flex items-end gap-1 h-12 mb-4">
                                  <div className="w-1.5 bg-rose-500 rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '30%', animationDelay: '0ms' }} />
                                  <div className="w-1.5 bg-rose-500 rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '60%', animationDelay: '80ms' }} />
                                  <div className="w-1.5 bg-rose-500 rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '100%', animationDelay: '160ms' }} />
                                  <div className="w-1.5 bg-rose-500 rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '70%', animationDelay: '240ms' }} />
                                  <div className="w-1.5 bg-rose-500 rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '90%', animationDelay: '320ms' }} />
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
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-4">
                                  <ProductIcon icon={selectedProduct.icon} className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-700 mb-1">Preview Mockups</h3>
                                <p className="text-sm text-gray-500 text-center max-w-xs mb-4">
                                  Click to generate professional mockups
                                </p>
                                <button
                                  onClick={fetchPrintifyMockups}
                                  disabled={mockupsLoading}
                                  className="px-4 py-2 bg-rose-500 text-white text-sm font-medium rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
                                >
                                  Generate Mockups
                                </button>
                              </div>
                            )}
                            
                            {mockupImages.length > 1 && (
                              <>
                                <button
                                  onClick={() => setSelectedRoomIndex((prev) => (prev === 0 ? mockupImages.length - 1 : prev - 1))}
                                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-all"
                                  aria-label="Previous mockup"
                                >
                                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                                </button>
                                <button
                                  onClick={() => setSelectedRoomIndex((prev) => (prev === mockupImages.length - 1 ? 0 : prev + 1))}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-all rotate-180"
                                  aria-label="Next mockup"
                                >
                                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                                </button>
                              </>
                            )}
                            
                            {currentMockup && (
                              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                                {currentMockup.name} • {selectedSize.label}
                              </div>
                            )}
                          </div>
                          
                          {/* Color Variant Thumbnails - Show when multiple colors available */}
                          {availableColorVariants.length > 1 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-[10px] text-gray-400 font-medium">Frame Color:</span>
                              </div>
                              <div className="flex gap-2 justify-center flex-wrap">
                                {availableColorVariants.map((variant) => {
                                  const colorKey = reverseColorMap[variant.color]
                                  const isSelected = selectedFrameColor === colorKey
                                  return (
                                    <button
                                      key={variant.variantId}
                                      onClick={() => {
                                        if (colorKey) {
                                          setSelectedFrameColor(colorKey)
                                          setSelectedRoomIndex(0) // Reset to first image when changing color
                                        }
                                      }}
                                      className={cn(
                                        'relative w-24 h-[72px] rounded-lg overflow-hidden transition-all',
                                        isSelected
                                          ? 'ring-2 ring-rose-500 ring-offset-2 scale-105'
                                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                                      )}
                                      title={`${variant.color} Frame`}
                                    >
                                      <img 
                                        src={variant.frontUrl} 
                                        alt={`${variant.color} Frame`}
                                        className="w-full h-full object-contain bg-white"
                                      />
                                      {isSelected && (
                                        <div className="absolute inset-0 bg-rose-500/10" />
                                      )}
                                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-medium py-0.5 text-center">
                                        {variant.color}
                                      </div>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          
                          {/* Camera Angle Thumbnails */}
                          {mockupImages.length > 1 && (
                            <div className="flex gap-2 justify-center flex-wrap">
                              {mockupImages.map((mockup, index) => (
                                <button
                                  key={mockup.id}
                                  onClick={() => setSelectedRoomIndex(index)}
                                  className={cn(
                                    'relative w-20 h-14 rounded-lg overflow-hidden transition-all',
                                    validIndex === index
                                      ? 'ring-2 ring-rose-500 ring-offset-2'
                                      : 'opacity-60 hover:opacity-100'
                                  )}
                                >
                                  <img 
                                    src={mockup.url} 
                                    alt={mockup.name}
                                    className="w-full h-full object-contain bg-white"
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
              </div>
            </div>
          </div>

          {/* Right - Product Selection */}
          <div className="space-y-4">
            {/* Material/Product Type Selector */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Material</span>
                <span className="text-[10px] text-gray-400">{
                  selectedProduct.id === 'poster-vertical' || selectedProduct.id === 'poster-horizontal' ? 'Smooth matte finish, no glare' :
                  selectedProduct.id === 'satin-poster' ? 'Slight sheen, vibrant colors' :
                  selectedProduct.id === 'paper-poster' ? 'Affordable classic print' :
                  selectedProduct.category === 'canvas' ? 'Gallery wrapped, ready to hang' :
                  selectedProduct.category === 'framed' ? 'Elegant frame included' :
                  selectedProduct.id === 'giclee-art' ? 'Archival museum-quality' :
                  selectedProduct.category === 'tapestry' ? 'Soft fabric wall hanging' :
                  'Functional art piece'
                }</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'poster', label: 'Matte', icon: 'Layers', productIds: ['poster-vertical', 'poster-horizontal'], desc: 'No glare' },
                  { id: 'satin', label: 'Glossy', icon: 'Sparkles', productIds: ['satin-poster'], desc: 'Shiny' },
                  { id: 'paper', label: 'Basic', icon: 'Newspaper', productIds: ['paper-poster'], desc: 'Budget' },
                  { id: 'canvas', label: 'Canvas', icon: 'Square', productIds: ['stretched-canvas'], desc: 'Textured' },
                  { id: 'framed', label: 'Framed', icon: 'GalleryVertical', productIds: ['framed-vertical', 'framed-horizontal'], desc: 'Ready' },
                ].map((group) => {
                  const isSelected = group.productIds.includes(selectedProduct.id)
                  return (
                    <button
                      key={group.id}
                      onClick={() => {
                        const product = PRINTIFY_PRODUCTS.find(p => group.productIds.includes(p.id))
                        if (product) {
                          const newSize = product.sizes.find(s => s.popular) || product.sizes[0]
                          handleProductSelect(product, newSize)
                        }
                      }}
                      className={cn(
                        'relative flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all duration-200',
                        isSelected
                          ? 'bg-gray-900 text-white shadow-md'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300 hover:shadow-sm'
                      )}
                    >
                      <ProductIcon icon={group.icon} className={cn('w-4 h-4', isSelected ? 'text-white' : 'text-gray-500')} />
                      <span className="text-[11px] font-semibold">{group.label}</span>
                      <span className={cn('text-[9px]', isSelected ? 'text-gray-300' : 'text-gray-400')}>{group.desc}</span>
                      {isSelected && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                      )}
                    </button>
                  )
                })}
              </div>
              
              {/* More Materials Row */}
              <div className="flex items-center justify-center gap-1.5 mt-1.5">
                {[
                  { id: 'giclee', label: 'Fine Art', icon: 'Palette', productIds: ['giclee-art'], premium: true },
                  { id: 'tapestry', label: 'Tapestry', icon: 'Waves', productIds: ['wall-tapestry'], isNew: true },
                  { id: 'clock', label: 'Clock', icon: 'Clock', productIds: ['wall-clock'], isNew: true },
                ].map((group) => {
                  const isSelected = group.productIds.includes(selectedProduct.id)
                  return (
                    <button
                      key={group.id}
                      onClick={() => {
                        const product = PRINTIFY_PRODUCTS.find(p => group.productIds.includes(p.id))
                        if (product) {
                          const newSize = product.sizes.find(s => s.popular) || product.sizes[0]
                          handleProductSelect(product, newSize)
                        }
                      }}
                      className={cn(
                        'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all',
                        isSelected
                          ? 'bg-gray-900 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      <ProductIcon icon={group.icon} className={cn('w-3.5 h-3.5', isSelected ? 'text-white' : 'text-gray-500')} />
                      <span className="text-[11px] font-medium">{group.label}</span>
                      {group.premium && (
                        <span className={cn('text-[8px] font-bold px-1 py-0.5 rounded', 
                          isSelected ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-600'
                        )}>PRO</span>
                      )}
                      {group.isNew && (
                        <span className={cn('text-[8px] font-bold px-1 py-0.5 rounded',
                          isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600'
                        )}>NEW</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
            
            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Size</span>
                <span className="text-[10px] text-rose-600 font-medium">{selectedSize.label} — ${selectedSize.price.toFixed(2)}</span>
              </div>
              <div className="bg-white rounded-xl p-3 border border-gray-200">
                <div className="flex gap-3">
                  <div className="flex-1 flex flex-wrap items-end justify-center gap-2">
                    {(() => {
                      const relatedProducts = selectedProduct.category === 'poster' 
                        ? PRINTIFY_PRODUCTS.filter(p => p.category === 'poster' && p.finish === selectedProduct.finish)
                        : selectedProduct.category === 'framed'
                        ? PRINTIFY_PRODUCTS.filter(p => p.category === 'framed')
                        : [selectedProduct]
                      
                      const allSizes = relatedProducts.flatMap(p => 
                        p.sizes.map(s => ({ ...s, productId: p.id }))
                      )
                      
                      const uniqueSizes = allSizes.filter((size, index, arr) => 
                        arr.findIndex(s => s.width === size.width && s.height === size.height) === index
                      )
                      
                      uniqueSizes.sort((a, b) => (a.width * a.height) - (b.width * b.height))
                      
                      const maxDimension = Math.max(...uniqueSizes.map(s => Math.max(s.width, s.height)))
                      const scaleFactor = 52 / maxDimension
                      
                      return uniqueSizes.map((size) => {
                        const isSelected = selectedSize.width === size.width && selectedSize.height === size.height
                        const visualWidth = Math.max(16, Math.round(size.width * scaleFactor))
                        const visualHeight = Math.max(16, Math.round(size.height * scaleFactor))
                        
                        return (
                          <button
                            key={size.value}
                            onClick={() => {
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
                              'group relative flex flex-col items-center transition-all duration-200',
                              isSelected ? 'scale-110' : 'hover:scale-105'
                            )}
                          >
                            <div 
                              className={cn(
                                'rounded border-2 transition-all mb-1 flex items-center justify-center',
                                isSelected
                                  ? 'bg-rose-50 border-rose-500 shadow-md shadow-rose-500/20'
                                  : 'bg-gray-50 border-gray-300 group-hover:border-gray-400 group-hover:bg-gray-100'
                              )}
                              style={{ 
                                width: `${visualWidth}px`, 
                                height: `${visualHeight}px`
                              }}
                            >
                              {isSelected && (
                                <Check className="w-3 h-3 text-rose-600" />
                              )}
                            </div>
                            <span className={cn(
                              'text-[10px] font-medium whitespace-nowrap',
                              isSelected ? 'text-rose-700' : 'text-gray-600'
                            )}>
                              {size.label.replace('" × "', '×').replace('" ', '')}
                            </span>
                            <span className={cn(
                              'text-[9px]',
                              isSelected ? 'text-rose-600 font-medium' : 'text-gray-400'
                            )}>
                              ${size.price.toFixed(0)}
                            </span>
                            {size.popular && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-white" />
                            )}
                          </button>
                        )
                      })
                    })()}
                  </div>
                  
                  {/* Frame/Clock Color */}
                  {(selectedProduct.category === 'framed' || selectedProduct.id === 'wall-clock') && (
                    <div className="flex flex-col items-center gap-2.5 pl-4 border-l border-gray-200">
                      <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wide">
                        {selectedProduct.category === 'framed' ? 'Frame' : 'Style'}
                      </span>
                      {[
                        { id: 'black', label: 'Black', bg: 'bg-gray-900', selected: 'ring-gray-900' },
                        { id: 'white', label: 'White', bg: 'bg-white border border-gray-300', selected: 'ring-gray-400' },
                        ...(selectedProduct.category === 'framed' ? [{ id: 'walnut', label: 'Walnut', bg: 'bg-amber-700', selected: 'ring-amber-700' }] : []),
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedFrameColor(opt.id as 'black' | 'white' | 'walnut')}
                          className={cn(
                            'w-8 h-8 rounded-lg transition-all shadow-sm',
                            opt.bg,
                            selectedFrameColor === opt.id 
                              ? `ring-2 ring-offset-2 ${opt.selected} scale-110` 
                              : 'hover:scale-110 opacity-60 hover:opacity-100'
                          )}
                          title={opt.label}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Size tip */}
                <div className="flex items-center justify-center gap-2 mt-3 pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1 text-[9px] text-gray-400">
                    <span className="w-2 h-2 bg-amber-400 rounded-full" /> Popular choice
                  </span>
                  <span className="text-[9px] text-gray-300">•</span>
                  <span className="text-[9px] text-gray-400">
                    {selectedSize.width}" × {selectedSize.height}" actual print size
                  </span>
                </div>
              </div>
            </div>

            {/* Selected Product Summary */}
            <div className="flex items-center gap-4 p-3 bg-rose-50 rounded-xl border border-rose-200">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                <ProductIcon icon={selectedProduct.icon} className="w-6 h-6 text-rose-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm truncate">{selectedProduct.name}</h3>
                <p className="text-xs text-gray-600">
                  {selectedSize.label}
                  {(selectedProduct.category === 'framed' || selectedProduct.id === 'wall-clock') 
                    ? ` • ${selectedFrameColor.charAt(0).toUpperCase() + selectedFrameColor.slice(1)}`
                    : ''
                  }
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-bold text-gray-900">${selectedSize.price.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Design
            </Button>
            <Button
              onClick={onContinue}
              className="bg-rose-500 hover:bg-rose-600 gap-2"
            >
              Continue to Checkout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
