'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { 
  PRINTIFY_PRODUCTS, 
  PRODUCT_CATEGORIES, 
  getProductsByCategory,
  type PrintifyProduct,
  type ProductSize
} from '@/lib/printify-product-catalog'
import { Check, Star, Sparkles, Clock, Frame, Image, Palette, ChevronDown, ChevronUp, Grid3X3, LayoutList } from 'lucide-react'

interface EnhancedProductSelectorProps {
  onProductSelect?: (product: PrintifyProduct, size: ProductSize) => void
  selectedProductId?: string
  selectedSizeValue?: string
  compact?: boolean
}

export function EnhancedProductSelector({ 
  onProductSelect, 
  selectedProductId,
  selectedSizeValue,
  compact = false 
}: EnhancedProductSelectorProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [expandedProduct, setExpandedProduct] = useState<string | null>(selectedProductId || null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showAllSizes, setShowAllSizes] = useState(false)

  const filteredProducts = useMemo(() => {
    return getProductsByCategory(activeCategory)
  }, [activeCategory])

  const handleProductClick = (product: PrintifyProduct) => {
    if (expandedProduct === product.id) {
      setExpandedProduct(null)
    } else {
      setExpandedProduct(product.id)
      // Auto-select first size if not already selected
      if (selectedProductId !== product.id) {
        const defaultSize = product.sizes.find(s => s.popular) || product.sizes[0]
        onProductSelect?.(product, defaultSize)
      }
    }
  }

  const handleSizeSelect = (product: PrintifyProduct, size: ProductSize) => {
    onProductSelect?.(product, size)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'poster': return <Image className="w-4 h-4" />
      case 'canvas': return <Palette className="w-4 h-4" />
      case 'framed': return <Frame className="w-4 h-4" />
      case 'art-print': return <Sparkles className="w-4 h-4" />
      case 'tapestry': return <Grid3X3 className="w-4 h-4" />
      case 'clock': return <Clock className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {PRODUCT_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
              activeCategory === category.id
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
            {category.id !== 'all' && category.count && (
              <span className="ml-1 text-[10px] opacity-70">({category.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
            )}
            title="Grid view"
            aria-label="Grid view"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'
            )}
            title="List view"
            aria-label="List view"
          >
            <LayoutList className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Products Grid/List */}
      <div className={cn(
        viewMode === 'grid' 
          ? 'grid grid-cols-2 gap-3' 
          : 'flex flex-col gap-2'
      )}>
        {filteredProducts.map((product) => {
          const isSelected = selectedProductId === product.id
          const isExpanded = expandedProduct === product.id
          const selectedSize = isSelected && selectedSizeValue 
            ? product.sizes.find(s => s.value === selectedSizeValue)
            : null

          return (
            <div
              key={product.id}
              className={cn(
                'rounded-xl border-2 transition-all overflow-hidden',
                isSelected
                  ? 'border-gray-900 bg-gray-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              )}
            >
              {/* Product Header */}
              <button
                onClick={() => handleProductClick(product)}
                className="w-full p-3 text-left"
              >
                <div className="flex items-start gap-3">
                  {/* Icon/Thumbnail */}
                  <div className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center text-2xl shrink-0',
                    isSelected ? 'bg-gray-900' : 'bg-gray-100'
                  )}>
                    {isSelected ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <span>{product.icon}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                        {product.shortName}
                      </h4>
                      {product.popular && (
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                      {product.new && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium shrink-0">
                          NEW
                        </span>
                      )}
                      {product.premium && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium shrink-0">
                          PREMIUM
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {product.finish.charAt(0).toUpperCase() + product.finish.slice(1)} • {product.sizes.length} sizes
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-gray-900">
                        From ${product.basePrice.toFixed(2)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </button>

              {/* Expanded Sizes */}
              {isExpanded && (
                <div className="px-3 pb-3 border-t border-gray-100 pt-3">
                  <p className="text-[11px] text-gray-500 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {product.sizes.slice(0, showAllSizes ? undefined : 4).map((size) => {
                      const isSizeSelected = isSelected && selectedSizeValue === size.value
                      
                      return (
                        <button
                          key={size.value}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSizeSelect(product, size)
                          }}
                          className={cn(
                            'flex items-center justify-between p-2 rounded-lg border transition-all text-left',
                            isSizeSelected
                              ? 'border-gray-900 bg-gray-900 text-white'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium">{size.label}</span>
                            {size.popular && (
                              <Star className={cn(
                                'w-2.5 h-2.5',
                                isSizeSelected ? 'text-amber-300 fill-amber-300' : 'text-amber-500 fill-amber-500'
                              )} />
                            )}
                          </div>
                          <span className={cn(
                            'text-xs font-bold',
                            isSizeSelected ? 'text-white' : 'text-gray-900'
                          )}>
                            ${size.price.toFixed(2)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  
                  {product.sizes.length > 4 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowAllSizes(!showAllSizes)
                      }}
                      className="w-full mt-2 text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
                    >
                      {showAllSizes ? (
                        <>Show less <ChevronUp className="w-3 h-3" /></>
                      ) : (
                        <>+{product.sizes.length - 4} more sizes <ChevronDown className="w-3 h-3" /></>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No products in this category</p>
        </div>
      )}
    </div>
  )
}
