'use client'

import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import type { ProductMockupRef } from '@/components/products/product-mockup'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { LiveWaveformPreview } from '@/components/products/live-waveform-preview'
import type { PrintifyProduct, ProductSize } from '@/lib/printify-product-catalog'
import { 
  FileText, 
  Image, 
  Frame, 
  Palette, 
  Shirt, 
  Clock, 
  Sparkles, 
  Gem, 
  ShoppingBag,
  type LucideIcon 
} from 'lucide-react'

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

export interface WallArtPreviewRef {
  generateMockup: () => Promise<void>
}

interface WallArtPreviewProps {
  mockupRef?: React.RefObject<ProductMockupRef | null>
  onSizeChange?: (size: string, productType: string) => void
  showGenerateButton?: boolean
  onGenerate?: () => void
  isGenerating?: boolean
  onMockupGenerated?: (mockupUrl: string) => void
  showLivePreview?: boolean
  selectedProduct?: PrintifyProduct
  selectedSize?: ProductSize
}

export const WallArtPreview = forwardRef<WallArtPreviewRef, WallArtPreviewProps>(
  function WallArtPreview({ mockupRef, onSizeChange, showGenerateButton, onGenerate, isGenerating: externalIsGenerating, onMockupGenerated, showLivePreview, selectedProduct, selectedSize: propSelectedSize }, ref) {
  const [waveformDataUrl, setWaveformDataUrl] = useState<string | null>(null)
  const [mockupImage, setMockupImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Use props for product/size if provided, otherwise use defaults
  const displayProduct = selectedProduct
  const displaySize = propSelectedSize

  const {
    waveformColor,
    backgroundColor,
    waveformStyle,
    customText,
    showText,
    showQRCode,
    selectedRegion,
  } = useCustomizerStore()
  
  // Calculate aspect ratio based on selected size
  const aspectRatio = displaySize ? displaySize.width / displaySize.height : 3 / 4

  // Capture waveform from mockup canvas
  useEffect(() => {
    if (!mockupRef?.current?.canvas) return
    
    const captureWaveform = () => {
      try {
        const dataUrl = mockupRef.current?.canvas?.toDataURL('image/png')
        if (dataUrl) {
          setWaveformDataUrl(dataUrl)
        }
      } catch (error) {
        console.error('Failed to capture waveform:', error)
      }
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(captureWaveform)
    })
  }, [mockupRef, waveformColor, backgroundColor, waveformStyle, customText, showText, showQRCode, selectedRegion])

  // Manual mockup generation function
  const generateMockupInternal = async () => {
    if (!waveformDataUrl) {
      console.warn('No waveform data available for mockup generation')
      return
    }

    setIsGenerating(true)
    try {
      const canvas = mockupRef?.current?.canvas
      if (!canvas) {
        console.warn('Canvas not available')
        return
      }

      // Debug: Check if canvas has content
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const hasContent = imageData.data.some((value, index) => index % 4 === 3 && value > 0)
        console.log('Canvas dimensions:', canvas.width, 'x', canvas.height)
        console.log('Canvas has content:', hasContent)
        
        if (!hasContent) {
          console.error('Canvas is empty - no waveform rendered')
          setIsGenerating(false)
          return
        }
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b: Blob | null) => {
          if (b) {
            console.log('Blob created, size:', b.size, 'bytes')
            resolve(b)
          }
          else reject(new Error('Failed to convert canvas to blob'))
        }, 'image/png', 1.0)
      })

      const formData = new FormData()
      formData.append('image', blob, 'design.png')
      formData.append('orientation', 'landscape')
      formData.append('fitMode', 'cover')
      formData.append('focalX', '0.5')
      formData.append('focalY', '0.5')
      
      console.log('Sending mockup request with orientation: landscape')

      const response = await fetch('/api/test-psd-mockup', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        console.log('API Response:', result)
        
        if (result.success && result.mockups && result.mockups.length > 0) {
          // Use the first mockup URL from the response
          const mockupUrl = result.mockups[0].url
          console.log('Setting mockup image, first 100 chars:', mockupUrl.substring(0, 100))
          setMockupImage(mockupUrl)
          onMockupGenerated?.(mockupUrl)
        } else {
          console.error('No mockups generated:', result)
        }
      } else {
        console.error('Failed to generate mockup:', response.status)
        const errorData = await response.json().catch(() => ({}))
        console.error('Error details:', errorData)
      }
    } catch (error) {
      console.error('Failed to generate mockup:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Expose generateMockup function to parent via ref
  useImperativeHandle(ref, () => ({
    generateMockup: generateMockupInternal
  }))


  return (
    <div className="space-y-4">
      {/* Selected Product Info */}
      {displayProduct && displaySize && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-3 border border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
              <ProductIcon icon={displayProduct.icon} className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">{displayProduct.name}</h4>
              <p className="text-xs text-gray-500">
                {displaySize.label} • {displayProduct.finish} finish
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900">${displaySize.price.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Mockup Preview */}
      <div className="relative rounded overflow-hidden w-full flex items-center justify-center max-h-[800px]">
        <div 
          className="relative w-full transition-all duration-300" 
          style={{ 
            aspectRatio: aspectRatio,
            maxHeight: '800px'
          }}
        >
          {isGenerating ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-8">
              {/* Animated Soundwave Bars */}
              <div className="flex items-center justify-center gap-1.5 h-16">
                <div className="w-2 bg-primary rounded-full animate-[soundwave-pulse_1.2s_ease-in-out_0s_infinite] h-full" />
                <div className="w-2 bg-primary rounded-full animate-[soundwave-pulse_1.2s_ease-in-out_0.15s_infinite] h-full" />
                <div className="w-2 bg-primary rounded-full animate-[soundwave-pulse_1.2s_ease-in-out_0.3s_infinite] h-full" />
                <div className="w-2 bg-primary rounded-full animate-[soundwave-pulse_1.2s_ease-in-out_0.45s_infinite] h-full" />
                <div className="w-2 bg-primary rounded-full animate-[soundwave-pulse_1.2s_ease-in-out_0.6s_infinite] h-full" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-base font-medium text-foreground">Generating mockup...</p>
                <p className="text-xs text-muted-foreground">This may take a few seconds</p>
              </div>
            </div>
          ) : mockupImage ? (
            <img 
              src={mockupImage} 
              alt="Product mockup" 
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error('Failed to load mockup image')
                setMockupImage(null)
              }}
            />
          ) : showLivePreview && mockupRef ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-full h-full">
                <LiveWaveformPreview mockupRef={mockupRef} selectedSize={displaySize} />
              </div>
            </div>
          ) : waveformDataUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Ready to generate</p>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Upload audio to see preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Product Details */}
      {displayProduct && displaySize && (
        <div className="bg-muted/50 rounded p-2.5 grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Product:</span>
            <span className="font-medium">{displayProduct.name}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Size:</span>
            <span className="font-medium">{displaySize.label}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Finish:</span>
            <span className="font-medium capitalize">{displayProduct.finish}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Category:</span>
            <span className="font-medium capitalize">{displayProduct.category}</span>
          </div>
        </div>
      )}
    </div>
  )
})
