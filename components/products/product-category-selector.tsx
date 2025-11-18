'use client'

import { useState } from 'react'
import { useCustomizerStore } from '@/lib/stores/customizer-store'
import { Frame, Coffee, Shirt } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

type ProductCategory = 'wall-art' | 'drinkware' | 'apparel'

interface ProductOption {
  id: string
  name: string
  sizes: string[]
  mockupImage?: string
}

const categoryProducts: Record<ProductCategory, ProductOption[]> = {
  'wall-art': [
    { id: 'poster', name: 'Poster', sizes: ['12x16', '18x24', '24x36'] },
    { id: 'canvas', name: 'Canvas', sizes: ['16x20', '20x24'] },
  ],
  'drinkware': [
    { id: 'mug', name: 'Classic Mug', sizes: ['11oz', '15oz'] },
    { id: 'travel-mug', name: 'Travel Mug', sizes: ['12oz', '16oz'] },
  ],
  'apparel': [
    { id: 't-shirt-black', name: 'T-Shirt Black', sizes: ['S', 'M', 'L', 'XL', 'XXL'], mockupImage: '/mockups/mannequin-black.png' },
    { id: 't-shirt-white', name: 'T-Shirt White', sizes: ['S', 'M', 'L', 'XL', 'XXL'], mockupImage: '/mockups/mannequin-white.png' },
    { id: 't-shirt-blue', name: 'T-Shirt Blue', sizes: ['S', 'M', 'L', 'XL', 'XXL'], mockupImage: '/mockups/mannequin-blue.png' },
  ],
}

export function ProductCategorySelector() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('wall-art')
  const { selectedProduct, setSelectedProduct, setSelectedSize } = useCustomizerStore()

  const handleCategoryChange = (category: ProductCategory) => {
    setSelectedCategory(category)
    // Auto-select first product in new category
    const firstProduct = categoryProducts[category][0]
    setSelectedProduct(firstProduct.id as any)
    setSelectedSize(firstProduct.sizes[0])
  }

  const handleProductSelect = (productId: string, defaultSize: string) => {
    setSelectedProduct(productId as any)
    setSelectedSize(defaultSize)
  }

  const currentProducts = categoryProducts[selectedCategory]
  const selectedProductData = currentProducts.find(p => p.id === selectedProduct) || currentProducts[0]

  return (
    <div className="w-full space-y-6">
      {/* Category Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          onClick={() => handleCategoryChange('wall-art')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all',
            selectedCategory === 'wall-art'
              ? 'bg-background shadow-sm'
              : 'hover:bg-background/50'
          )}
        >
          <Frame className="h-4 w-4" />
          <span className="font-medium">Wall Art</span>
        </button>
        <button
          onClick={() => handleCategoryChange('drinkware')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all',
            selectedCategory === 'drinkware'
              ? 'bg-background shadow-sm'
              : 'hover:bg-background/50'
          )}
        >
          <Coffee className="h-4 w-4" />
          <span className="font-medium">Drinkware</span>
        </button>
        <button
          onClick={() => handleCategoryChange('apparel')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md transition-all',
            selectedCategory === 'apparel'
              ? 'bg-background shadow-sm'
              : 'hover:bg-background/50'
          )}
        >
          <Shirt className="h-4 w-4" />
          <span className="font-medium">Apparel</span>
        </button>
      </div>

      {/* Product Thumbnails */}
      <div className="grid grid-cols-2 gap-4">
        {currentProducts.map((product) => (
          <button
            key={product.id}
            onClick={() => handleProductSelect(product.id, product.sizes[0])}
            className={cn(
              'group relative aspect-square rounded-lg border-2 transition-all overflow-hidden',
              selectedProduct === product.id
                ? 'border-primary shadow-lg'
                : 'border-border hover:border-primary/50'
            )}
          >
            {/* Product mockup image or placeholder */}
            {product.mockupImage ? (
              <div className="relative w-full h-full bg-white">
                <Image
                  src={product.mockupImage}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                {selectedCategory === 'wall-art' && <Frame className="h-12 w-12 text-muted-foreground" />}
                {selectedCategory === 'drinkware' && <Coffee className="h-12 w-12 text-muted-foreground" />}
                {selectedCategory === 'apparel' && <Shirt className="h-12 w-12 text-muted-foreground" />}
              </div>
            )}
            
            {/* Product Name */}
            <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur p-2">
              <p className="text-sm font-medium text-center">{product.name}</p>
            </div>

            {/* Selected Indicator */}
            {selectedProduct === product.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-primary-foreground"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Size Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Size</label>
        <div className="flex flex-wrap gap-2">
          {selectedProductData?.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={cn(
                'px-4 py-2 rounded-md border-2 transition-all font-medium',
                useCustomizerStore.getState().selectedSize === size
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
