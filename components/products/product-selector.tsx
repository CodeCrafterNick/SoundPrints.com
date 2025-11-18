'use client'

import { useCustomizerStore, ProductType } from '@/lib/stores/customizer-store'
import { cn } from '@/lib/utils'

const products = [
  {
    id: 'poster' as ProductType,
    name: 'Poster',
    description: 'Premium quality print',
    sizes: ['12x16', '18x24', '24x36'],
    basePrice: 29.99,
  },
  {
    id: 't-shirt' as ProductType,
    name: 'T-Shirt',
    description: 'Soft cotton tee',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    basePrice: 34.99,
  },
  {
    id: 't-shirt-white-model' as ProductType,
    name: 'T-Shirt (Model)',
    description: 'White tee on model',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    basePrice: 34.99,
  },
  {
    id: 'mug' as ProductType,
    name: 'Mug',
    description: 'Ceramic coffee mug',
    sizes: ['11oz', '15oz'],
    basePrice: 19.99,
  },
  {
    id: 'canvas' as ProductType,
    name: 'Canvas',
    description: 'Stretched canvas print',
    sizes: ['16x20', '20x24', '24x36'],
    basePrice: 49.99,
  },
  {
    id: 'hoodie' as ProductType,
    name: 'Hoodie',
    description: 'Comfortable pullover',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    basePrice: 49.99,
  },
]

export function ProductSelector() {
  const selectedProduct = useCustomizerStore((state) => state.selectedProduct)
  const selectedSize = useCustomizerStore((state) => state.selectedSize)
  const setSelectedProduct = useCustomizerStore((state) => state.setSelectedProduct)
  const setSelectedSize = useCustomizerStore((state) => state.setSelectedSize)

  const currentProduct = products.find((p) => p.id === selectedProduct)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground">PRODUCT TYPE</h3>
        <div className="grid grid-cols-2 gap-2">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => {
                setSelectedProduct(product.id)
                setSelectedSize(product.sizes[0])
              }}
              className={cn(
                'p-3 border-2 rounded-lg text-left transition-all hover:border-primary',
                selectedProduct === product.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              )}
            >
              <div className="font-semibold text-sm">{product.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                ${product.basePrice}
              </div>
            </button>
          ))}
        </div>
      </div>

      {currentProduct && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">SIZE</h3>
          <div className="flex flex-wrap gap-2">
            {currentProduct.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  'px-4 py-2 border-2 rounded-md text-sm transition-all hover:border-primary',
                  selectedSize === size
                    ? 'border-primary bg-primary/5 font-semibold'
                    : 'border-border'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
