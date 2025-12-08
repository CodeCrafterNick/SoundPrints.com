'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/stores/cart-store'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  PRINTIFY_PRODUCTS,
  getProductById,
  type PrintifyProduct,
  type ProductSize,
} from '@/lib/printify-product-catalog'
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Pencil,
  Check,
  Truck,
  Shield,
  FileText,
  Image,
  Frame,
  Sparkles,
  Clock,
  Palette,
  Loader2,
  type LucideIcon,
} from 'lucide-react'

// Icon map for product categories
const iconMap: Record<string, LucideIcon> = {
  FileText,
  Image,
  Frame,
  Sparkles,
  Clock,
  Palette,
  Gem: Sparkles,
  Shirt: FileText,
}

// Product icon component
function ProductIcon({ icon, className }: { icon: string; className?: string }) {
  const Icon = iconMap[icon] || FileText
  return <Icon className={className} />
}

// Default waveform style for quick add to cart
const DEFAULT_WAVEFORM_STYLE = 'bars'
const DEFAULT_WAVEFORM_COLOR = '#1a1a2e'
const DEFAULT_BACKGROUND_COLOR = '#ffffff'

// Mockup types
interface MockupSet {
  front?: string
  front2?: string
  closeUp?: string
  context1?: string
}

interface ColorVariant {
  variantId: number
  color: string
  mockups: MockupSet
}

interface CachedMockups {
  primary: MockupSet
  colorVariants?: ColorVariant[]
}

interface MockupImage {
  id: string
  name: string
  url: string
  color?: string
}

// Camera type labels
const cameraLabels: Record<string, string> = {
  'front': 'Front View',
  'front2': 'Front View 2', 
  'closeUp': 'Close-up Detail',
  'context1': 'In Room',
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
}

export default function SoundPrintProductPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SoundPrintProductContent />
    </Suspense>
  )
}

function SoundPrintProductContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get product ID from URL or default to first product
  const productIdParam = searchParams.get('product')
  const sizeParam = searchParams.get('size')
  
  // State
  const [selectedProduct, setSelectedProduct] = useState<PrintifyProduct>(() => {
    return productIdParam 
      ? getProductById(productIdParam) || PRINTIFY_PRODUCTS[0]
      : PRINTIFY_PRODUCTS[0]
  })
  const [selectedSize, setSelectedSize] = useState<ProductSize>(() => {
    if (sizeParam && selectedProduct) {
      const size = selectedProduct.sizes.find(s => s.value === sizeParam)
      if (size) return size
    }
    return selectedProduct.sizes.find(s => s.popular) || selectedProduct.sizes[0]
  })
  const [selectedFrameColor, setSelectedFrameColor] = useState<'black' | 'white' | 'walnut'>('black')
  const [selectedMockupIndex, setSelectedMockupIndex] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  
  // Mockup state
  const [printifyMockups, setPrintifyMockups] = useState<Record<string, CachedMockups>>({})
  const [mockupsLoading, setMockupsLoading] = useState(false)
  const [mockupsFailed, setMockupsFailed] = useState<Set<string>>(new Set())
  
  // Cart store
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)
  
  // Customizer store - check if user has audio loaded
  const audioUrl = useCustomizerStore((state) => state.audioUrl)
  
  // Update URL when product/size changes
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('product', selectedProduct.id)
    params.set('size', selectedSize.value)
    router.replace(`/soundprint?${params.toString()}`, { scroll: false })
  }, [selectedProduct.id, selectedSize.value, router])
  
  // Fetch Printify mockups for preview
  const fetchPrintifyMockups = useCallback(async () => {
    const cacheKey = `${selectedProduct.blueprintId}-${selectedSize.value}`
    
    // Check if already cached or failed
    if (printifyMockups[cacheKey] || mockupsFailed.has(cacheKey)) {
      return
    }
    
    setMockupsLoading(true)
    
    try {
      // Use a demo/sample image for preview (in production, use user's design)
      const sampleDesignUrl = '/mockups/sample-waveform.png'
      
      const response = await fetch('/api/printify/mockups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blueprintId: selectedProduct.blueprintId,
          sizeValue: selectedSize.value,
          imageUrl: sampleDesignUrl,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate mockups')
      }
      
      const data = await response.json()
      
      if (data.mockups || data.colorVariants) {
        setPrintifyMockups(prev => ({
          ...prev,
          [cacheKey]: {
            primary: data.mockups || {},
            colorVariants: data.colorVariants,
          }
        }))
      } else {
        setMockupsFailed(prev => new Set([...prev, cacheKey]))
      }
    } catch (error) {
      console.error('Failed to fetch mockups:', error)
      setMockupsFailed(prev => new Set([...prev, cacheKey]))
    } finally {
      setMockupsLoading(false)
    }
  }, [selectedProduct.blueprintId, selectedSize.value, printifyMockups, mockupsFailed])
  
  // Auto-fetch mockups when product/size changes
  useEffect(() => {
    const cacheKey = `${selectedProduct.blueprintId}-${selectedSize.value}`
    const shouldFetch = !printifyMockups[cacheKey] && !mockupsFailed.has(cacheKey) && !mockupsLoading
    
    if (shouldFetch) {
      fetchPrintifyMockups()
    }
  }, [selectedProduct.blueprintId, selectedSize.value, printifyMockups, mockupsFailed, mockupsLoading, fetchPrintifyMockups])
  
  // Build mockup images array
  const mockupImages: MockupImage[] = []
  const cacheKey = `${selectedProduct.blueprintId}-${selectedSize.value}`
  const currentMockupsData = printifyMockups[cacheKey]
  
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
  
  // Determine aspect ratio based on selected size
  const isPortrait = selectedSize.height > selectedSize.width
  const aspectRatio = isPortrait ? '3/4' : '4/3'
  
  // Handle product change
  const handleProductChange = useCallback((product: PrintifyProduct) => {
    setSelectedProduct(product)
    const newSize = product.sizes.find(s => s.popular) || product.sizes[0]
    setSelectedSize(newSize)
    setSelectedMockupIndex(0)
  }, [])
  
  // Handle customize - navigate to builder with current settings
  const handleCustomize = useCallback(() => {
    // Set the selected product and size in the customizer store
    useCustomizerStore.getState().setSelectedProduct(selectedProduct.id as any)
    useCustomizerStore.getState().setSelectedSize(selectedSize.value)
    useCustomizerStore.getState().setSelectedFrameColor(selectedFrameColor)
    
    // Navigate to builder
    router.push('/create')
  }, [selectedProduct, selectedSize, selectedFrameColor, router])
  
  // Handle add to cart with default style
  const handleAddToCart = useCallback(async () => {
    setIsAddingToCart(true)
    
    try {
      addItem({
        audioFileName: 'Custom SoundPrint',
        waveformColor: DEFAULT_WAVEFORM_COLOR,
        backgroundColor: DEFAULT_BACKGROUND_COLOR,
        productType: selectedProduct.category as any,
        size: selectedSize.label,
        price: selectedSize.price,
        printifyBlueprintId: String(selectedProduct.blueprintId),
        printifyVariantId: selectedSize.value,
        waveformStyle: DEFAULT_WAVEFORM_STYLE,
      })
      
      toast.success('Added to cart!', {
        description: `${selectedProduct.name} (${selectedSize.label}) - Customize in cart or checkout`,
        action: {
          label: 'View Cart',
          onClick: () => openCart(),
        },
      })
    } catch {
      toast.error('Failed to add to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }, [selectedProduct, selectedSize, addItem, openCart])
  
  // Check if product has frame color options
  const hasFrameColors = selectedProduct.category === 'framed'
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SiteHeader />
      
      <main className="flex-1 pt-20 bg-white">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6">
            <Link href="/" className="text-gray-500 hover:text-gray-900">Home</Link>
            <span className="text-gray-300">/</span>
            <Link href="/products" className="text-gray-500 hover:text-gray-900">Products</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">{selectedProduct.name}</span>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Image Gallery with Printify Mockups */}
            <div className="space-y-4">
              {/* Main Image */}
              <div 
                className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg mx-auto"
                style={{ 
                  aspectRatio,
                  maxWidth: isPortrait ? '80%' : '100%',
                }}
              >
                {mockupsLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                    <div className="flex items-end gap-1 h-12 mb-4">
                      <div className="w-2 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '30%', animationDelay: '0ms' }} />
                      <div className="w-2 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '60%', animationDelay: '80ms' }} />
                      <div className="w-2 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '100%', animationDelay: '160ms' }} />
                      <div className="w-2 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '70%', animationDelay: '240ms' }} />
                      <div className="w-2 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '90%', animationDelay: '320ms' }} />
                      <div className="w-2 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '50%', animationDelay: '400ms' }} />
                      <div className="w-2 bg-primary rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '80%', animationDelay: '480ms' }} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">Loading Preview</h3>
                    <p className="text-sm text-gray-500 text-center max-w-xs">
                      Generating {selectedProduct.shortName} {selectedSize.label} preview...
                    </p>
                  </div>
                ) : currentMockup ? (
                  <motion.img 
                    key={currentMockup.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    src={currentMockup.url} 
                    alt={`${selectedProduct.name} - ${currentMockup.name}`}
                    className="w-full h-full object-contain bg-white"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                    <ProductIcon icon={selectedProduct.icon} className="w-24 h-24 text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">{selectedProduct.name}</p>
                    <p className="text-gray-400 text-sm">{selectedSize.label}</p>
                    <p className="text-gray-400 text-xs mt-2">Click Customize to add your audio</p>
                  </div>
                )}
                
                {/* Navigation Arrows */}
                {mockupImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedMockupIndex(prev => prev === 0 ? mockupImages.length - 1 : prev - 1)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedMockupIndex(prev => prev === mockupImages.length - 1 ? 0 : prev + 1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
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
                <div className="flex gap-3 justify-center flex-wrap">
                  {mockupImages.map((mockup, index) => (
                    <button
                      key={mockup.id}
                      onClick={() => setSelectedMockupIndex(index)}
                      title={mockup.name}
                      aria-label={`View ${mockup.name}`}
                      className={cn(
                        'relative w-24 h-18 rounded-lg overflow-hidden transition-all bg-gray-100',
                        validIndex === index
                          ? 'ring-2 ring-primary ring-offset-2 shadow-lg scale-105'
                          : 'opacity-70 hover:opacity-100 hover:shadow-md'
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
              
              {/* Placeholder thumbnails when no mockups */}
              {mockupImages.length === 0 && !mockupsLoading && (
                <div className="flex gap-3 justify-center">
                  {['Front', 'Detail', 'In Room'].map((label) => (
                    <div
                      key={label}
                      className="w-24 h-18 rounded-lg bg-gray-100 flex items-center justify-center"
                    >
                      <ProductIcon icon={selectedProduct.icon} className="w-6 h-6 text-gray-300" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Right: Product Details & Options */}
            <div className="space-y-6">
              {/* Product Title & Price */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {selectedProduct.popular && (
                    <span className="px-2 py-0.5 bg-primary/20 text-primary/90 text-xs font-medium rounded-full">
                      POPULAR
                    </span>
                  )}
                  {selectedProduct.premium && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-medium rounded-full">
                      PREMIUM
                    </span>
                  )}
                  {selectedProduct.new && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs font-medium rounded-full">
                      NEW
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h1>
                <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">${selectedSize.price.toFixed(2)}</span>
                  <span className="text-gray-500">+ Free Shipping</span>
                </div>
              </div>
              
              {/* Product Type Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Product Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRINTIFY_PRODUCTS.slice(0, 6).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductChange(product)}
                      className={cn(
                        'p-3 rounded-lg border-2 text-left transition-all',
                        selectedProduct.id === product.id
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <ProductIcon icon={product.icon} className="w-5 h-5 mb-1 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900 block">{product.shortName}</span>
                      <span className="text-xs text-gray-500">From ${product.basePrice}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Size Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Size</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {selectedProduct.sizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => {
                        setSelectedSize(size)
                        setSelectedMockupIndex(0)
                      }}
                      className={cn(
                        'p-3 rounded-lg border-2 text-center transition-all relative',
                        selectedSize.value === size.value
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {size.popular && (
                        <span className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full">
                          ★
                        </span>
                      )}
                      <span className="text-sm font-medium text-gray-900 block">{size.label}</span>
                      <span className="text-xs text-gray-500">${size.price}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Frame Color Selector (for framed products) */}
              {hasFrameColors && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Frame Color</label>
                  <div className="flex gap-3">
                    {(['black', 'white', 'walnut'] as const).map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setSelectedFrameColor(color)
                          setSelectedMockupIndex(0)
                        }}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all',
                          selectedFrameColor === color
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div 
                          className={cn(
                            'w-5 h-5 rounded-full border',
                            color === 'black' && 'bg-gray-900 border-gray-900',
                            color === 'white' && 'bg-white border-gray-300',
                            color === 'walnut' && 'bg-amber-700 border-amber-800'
                          )}
                        />
                        <span className="text-sm font-medium capitalize">{color}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCustomize}
                  variant="outline"
                  size="lg"
                  className="flex-1 gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Customize
                </Button>
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  size="lg"
                  className="flex-1 gap-2 bg-primary hover:bg-primary/90"
                >
                  {isAddingToCart ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-4 h-4" />
                  )}
                  {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </Button>
              </div>
              
              {/* Audio Status Indicator */}
              {audioUrl && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-700">You have audio loaded - click Customize to see your design!</span>
                </div>
              )}
              
              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Free Shipping</p>
                    <p className="text-xs text-gray-500">On orders over $50</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Quality Guarantee</p>
                    <p className="text-xs text-gray-500">100% satisfaction</p>
                  </div>
                </div>
              </div>
              
              {/* Product Details Accordion */}
              <div className="border rounded-lg divide-y">
                <details className="group" open>
                  <summary className="flex items-center justify-between p-4 cursor-pointer">
                    <span className="font-medium text-gray-900">Product Details</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="p-4 pt-0 text-sm text-gray-600">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        {selectedProduct.finish.charAt(0).toUpperCase() + selectedProduct.finish.slice(1)} finish
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Professional printing
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        Ready to frame/hang
                      </li>
                    </ul>
                  </div>
                </details>
                <details className="group">
                  <summary className="flex items-center justify-between p-4 cursor-pointer">
                    <span className="font-medium text-gray-900">Shipping & Returns</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="p-4 pt-0 text-sm text-gray-600">
                    <p>Ships within 3-5 business days. Free returns within 30 days.</p>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  )
}
