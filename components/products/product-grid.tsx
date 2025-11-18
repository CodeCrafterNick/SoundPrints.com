'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Check, Loader2 } from 'lucide-react'
import { getProductInfo } from '@/lib/product-catalog'
import { useCartStore } from '@/lib/stores/cart-store'
import { toast } from 'sonner'

interface GeneratedMockup {
  templateId: string
  name: string
  category: string
  url: string
  cached: boolean
  renderTime: number
}

interface ProductGridProps {
  mockups: GeneratedMockup[]
  designDataUrl?: string  // For fallback/legacy
  onProductSelect?: (mockup: GeneratedMockup) => void
}

export function ProductGrid({ mockups, designDataUrl, onProductSelect }: ProductGridProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const addItem = useCartStore(state => state.addItem)

  const handleAddToCart = async (mockup: GeneratedMockup) => {
    setAddingToCart(mockup.templateId)
    
    try {
      const productInfo = getProductInfo(mockup.templateId)
      
      if (!productInfo) {
        throw new Error('Product not found')
      }

      // Add to cart (map to expected cart item format)
      addItem({
        audioFileName: 'Waveform Design',
        audioFileUrl: mockup.url,
        waveformColor: '#000000',  // Will be updated from actual design
        backgroundColor: '#ffffff',
        productType: productInfo.productType as any,
        size: productInfo.size,
        price: productInfo.price,
        thumbnailUrl: mockup.url
      })

      toast.success(`Added ${productInfo.name} to cart!`)
      setSelectedTemplateId(mockup.templateId)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      toast.error('Failed to add to cart')
    } finally {
      setAddingToCart(null)
    }
  }

  const handleProductClick = (mockup: GeneratedMockup) => {
    setSelectedTemplateId(mockup.templateId)
    onProductSelect?.(mockup)
  }

  // Group mockups by category
  const wallArt = mockups.filter(m => m.category === 'wall-art')
  const apparel = mockups.filter(m => m.category === 'apparel')

  return (
    <div className="space-y-8">
      {/* Wall Art */}
      {wallArt.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Wall Art</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallArt.map((mockup) => {
              const productInfo = getProductInfo(mockup.templateId)
              const isSelected = selectedTemplateId === mockup.templateId
              const isAdding = addingToCart === mockup.templateId

              return (
                <div
                  key={mockup.templateId}
                  className={`
                    group relative border rounded-lg overflow-hidden cursor-pointer
                    transition-all duration-200 hover:shadow-lg
                    ${isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:border-primary/50'}
                  `}
                  onClick={() => handleProductClick(mockup)}
                >
                  {/* Mockup Image */}
                  <div className="relative aspect-[3/4] bg-gray-100">
                    <Image
                      src={mockup.url}
                      alt={mockup.name}
                      fill
                      className="object-contain p-4"
                      unoptimized
                    />
                    
                    {/* Cached Badge */}
                    {mockup.cached && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Cached
                      </div>
                    )}
                    
                    {/* Selected Badge */}
                    {isSelected && (
                      <div className="absolute top-2 left-2 bg-primary text-white p-1.5 rounded-full">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">
                          {productInfo?.name || mockup.name}
                        </h4>
                        {productInfo?.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {productInfo.description}
                          </p>
                        )}
                      </div>
                      <div className="text-lg font-bold ml-2 flex-shrink-0">
                        ${productInfo?.price.toFixed(2) || '—'}
                      </div>
                    </div>

                    {/* Render Time */}
                    {mockup.renderTime && (
                      <div className="text-xs text-muted-foreground">
                        Generated in {mockup.renderTime}ms
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddToCart(mockup)
                      }}
                      disabled={isAdding}
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Apparel */}
      {apparel.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-4">Apparel</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apparel.map((mockup) => {
              const productInfo = getProductInfo(mockup.templateId)
              const isSelected = selectedTemplateId === mockup.templateId
              const isAdding = addingToCart === mockup.templateId

              return (
                <div
                  key={mockup.templateId}
                  className={`
                    group relative border rounded-lg overflow-hidden cursor-pointer
                    transition-all duration-200 hover:shadow-lg
                    ${isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:border-primary/50'}
                  `}
                  onClick={() => handleProductClick(mockup)}
                >
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={mockup.url}
                      alt={mockup.name}
                      fill
                      className="object-contain p-4"
                      unoptimized
                    />
                    
                    {mockup.cached && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Cached
                      </div>
                    )}
                    
                    {isSelected && (
                      <div className="absolute top-2 left-2 bg-primary text-white p-1.5 rounded-full">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">
                          {productInfo?.name || mockup.name}
                        </h4>
                        {productInfo?.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {productInfo.description}
                          </p>
                        )}
                      </div>
                      <div className="text-lg font-bold ml-2 flex-shrink-0">
                        ${productInfo?.price.toFixed(2) || '—'}
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddToCart(mockup)
                      }}
                      disabled={isAdding}
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {mockups.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No mockups generated yet. Click "Generate All Products" to create mockups.</p>
        </div>
      )}
    </div>
  )
}
