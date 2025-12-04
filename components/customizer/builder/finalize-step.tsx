'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ProductMockup, type ProductMockupRef } from '@/components/products/product-mockup'
import { LiveWaveformPreview } from '@/components/products/live-waveform-preview'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { useCartStore } from '@/lib/stores/cart-store'
import { type PrintifyProduct, type ProductSize } from '@/lib/printify-product-catalog'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  ShoppingCart,
  ArrowLeft,
  Check,
  Download,
  Sparkles,
  FileText,
  File,
  Image,
  Frame,
  Palette,
  Shirt,
  Clock,
  Gem,
  ShoppingBag,
  Sun,
  Waves,
  type LucideIcon
} from 'lucide-react'

// Icon map for product icons
const productIcons: Record<string, LucideIcon> = {
  FileText,
  File,
  Image,
  Frame,
  Palette,
  Shirt,
  Clock,
  Sparkles,
  Gem,
  ShoppingBag,
  Sun,
  Waves,
}

// ProductIcon component
function ProductIcon({ icon, className }: { icon: string; className?: string }) {
  const IconComponent = productIcons[icon] || FileText
  return <IconComponent className={className} />
}

interface FinalizeStepProps {
  onBack: () => void
  mockupRef: React.RefObject<ProductMockupRef | null>
  selectedProduct: PrintifyProduct
  selectedSize: ProductSize
  selectedWallArtSize: { width: number; height: number }
  selectedFrameColor: 'black' | 'white' | 'walnut'
}

export function FinalizeStep({
  onBack,
  mockupRef,
  selectedProduct,
  selectedSize,
  selectedWallArtSize,
  selectedFrameColor,
}: FinalizeStepProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  // Store values
  const audioUrl = useCustomizerStore((state) => state.audioUrl)
  const audioFileName = useCustomizerStore((state) => state.audioFile?.name || '')
  const selectedRegion = useCustomizerStore((state) => state.selectedRegion)
  const waveformColor = useCustomizerStore((state) => state.waveformColor)
  const waveformStyle = useCustomizerStore((state) => state.waveformStyle)
  const backgroundColor = useCustomizerStore((state) => state.backgroundColor)
  const customText = useCustomizerStore((state) => state.customText)
  
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)

  // Add to cart handler
  const handleAddToCart = async () => {
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
      thumbnailUrl: designUrl || thumbnailUrl,
      designUrl,
      printifyBlueprintId: String(selectedProduct.blueprintId),
      printifyVariantId: selectedSize.value,
      waveformStyle: waveformStyle,
      designPreset: undefined,
      productColor: undefined,
      mockupUrl: designUrl,
    })

    toast.success('Added to cart!', {
      description: `${selectedProduct.name} (${selectedSize.label}) added to your cart.`,
    })

    setIsAddingToCart(false)
    openCart()
  }

  // Download handler
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
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Download complete!')
    } catch (error) {
      console.error('Failed to generate print file:', error)
      toast.error(`Failed to generate print file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hidden ProductMockup for canvas generation */}
      <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none" aria-hidden="true">
        <ProductMockup 
          ref={mockupRef} 
          canvasWidth={selectedWallArtSize.width * 300} 
          canvasHeight={selectedWallArtSize.height * 300} 
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 px-6 py-5">
          <h2 className="text-white font-semibold text-xl">Review Your Order</h2>
          <p className="text-gray-400 text-sm mt-1">Double-check your design and add to cart</p>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left - Design Preview */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Design</h3>
              <div className="relative rounded-xl overflow-hidden bg-white shadow-sm border border-gray-200">
                <div className="aspect-[3/4] flex items-center justify-center p-4">
                  <div 
                    className="relative w-full h-full flex items-center justify-center"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }}
                  >
                    <LiveWaveformPreview 
                      mockupRef={mockupRef} 
                      selectedSize={selectedWallArtSize} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Order Details */}
            <div className="space-y-6">
              {/* Product Card */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                    <ProductIcon icon={selectedProduct.icon} className="w-8 h-8 text-rose-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg">{selectedProduct.name}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {selectedSize.label}
                      {(selectedProduct.category === 'framed' || selectedProduct.id === 'wall-clock') && (
                        <> • {selectedFrameColor.charAt(0).toUpperCase() + selectedFrameColor.slice(1)} {selectedProduct.category === 'framed' ? 'frame' : 'style'}</>
                      )}
                    </p>
                    {selectedProduct.premium && (
                      <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-medium text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                        <Sparkles className="w-3 h-3" /> Premium Quality
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Order Summary</h4>
                <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-gray-600">Product</span>
                    <span className="text-sm font-medium text-gray-900">${selectedSize.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm text-gray-600">Shipping</span>
                    <span className="text-sm text-emerald-600 font-medium">
                      {selectedSize.price >= 50 ? 'FREE' : 'Calculated at checkout'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-4 bg-gray-50 rounded-b-xl">
                    <span className="text-base font-semibold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">${selectedSize.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Premium quality
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Fast shipping
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> 30-day returns
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className="w-full h-14 bg-rose-500 hover:bg-rose-600 text-lg font-semibold shadow-lg transform hover:scale-[1.02] transition-all"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="flex items-end gap-[2px] h-4 mr-3">
                        <div className="w-[3px] bg-white rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '40%' }} />
                        <div className="w-[3px] bg-white rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '80%', animationDelay: '100ms' }} />
                        <div className="w-[3px] bg-white rounded-full animate-[soundwave_0.8s_ease-in-out_infinite]" style={{ height: '60%', animationDelay: '200ms' }} />
                      </div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Proceed to Checkout — ${selectedSize.price.toFixed(2)}
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full h-11 border-2 border-gray-300 hover:bg-gray-50 text-gray-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Digital File
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <Button
            onClick={onBack}
            variant="ghost"
            className="gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Product Selection
          </Button>
        </div>
      </div>
    </div>
  )
}
