'use client'

import { useState } from 'react'
import { Check, X, ChevronDown, Info, Star, ArrowRight } from 'lucide-react'

interface Product {
  id: string
  name: string
  image: string
  price: number
  description: string
  rating: number
  reviews: number
}

interface Feature {
  name: string
  description?: string
  category: string
}

const products: Product[] = [
  {
    id: 'canvas-premium',
    name: 'Premium Canvas',
    image: '/products/canvas.jpg',
    price: 79.99,
    description: 'Museum-quality canvas with archival inks',
    rating: 4.9,
    reviews: 2547
  },
  {
    id: 'art-print',
    name: 'Art Print',
    image: '/products/poster.jpg',
    price: 39.99,
    description: 'Premium matte paper with vivid colors',
    rating: 4.8,
    reviews: 1823
  },
  {
    id: 'metal-print',
    name: 'Metal Print',
    image: '/products/metal.jpg',
    price: 129.99,
    description: 'Modern aluminum finish with HD detail',
    rating: 4.9,
    reviews: 892
  },
  {
    id: 'acrylic',
    name: 'Acrylic Print',
    image: '/products/acrylic.jpg',
    price: 149.99,
    description: 'Crystal-clear acrylic with depth effect',
    rating: 4.9,
    reviews: 634
  }
]

const features: Feature[] = [
  { name: 'Fade Resistance', description: 'How well the print resists fading over time', category: 'Durability' },
  { name: 'UV Protection', description: 'Protection against sun damage', category: 'Durability' },
  { name: 'Water Resistant', description: 'Resistance to moisture and humidity', category: 'Durability' },
  { name: 'Ready to Hang', description: 'Comes with mounting hardware', category: 'Convenience' },
  { name: 'Frame Included', description: 'Includes a frame', category: 'Convenience' },
  { name: 'Gallery Wrapped', description: 'Image wraps around edges', category: 'Style' },
  { name: 'Glass Finish Available', description: 'Optional protective glass', category: 'Style' },
  { name: 'Multiple Sizes', description: 'Available in 5+ size options', category: 'Options' },
  { name: 'Custom Sizes', description: 'Can be made to custom dimensions', category: 'Options' },
  { name: 'Rush Production', description: '2-day rush option available', category: 'Options' }
]

const featureMatrix: Record<string, Record<string, boolean | string>> = {
  'canvas-premium': {
    'Fade Resistance': true,
    'UV Protection': true,
    'Water Resistant': 'Partial',
    'Ready to Hang': true,
    'Frame Included': false,
    'Gallery Wrapped': true,
    'Glass Finish Available': false,
    'Multiple Sizes': true,
    'Custom Sizes': true,
    'Rush Production': true
  },
  'art-print': {
    'Fade Resistance': true,
    'UV Protection': false,
    'Water Resistant': false,
    'Ready to Hang': false,
    'Frame Included': false,
    'Gallery Wrapped': false,
    'Glass Finish Available': true,
    'Multiple Sizes': true,
    'Custom Sizes': false,
    'Rush Production': true
  },
  'metal-print': {
    'Fade Resistance': true,
    'UV Protection': true,
    'Water Resistant': true,
    'Ready to Hang': true,
    'Frame Included': false,
    'Gallery Wrapped': false,
    'Glass Finish Available': false,
    'Multiple Sizes': true,
    'Custom Sizes': true,
    'Rush Production': false
  },
  'acrylic': {
    'Fade Resistance': true,
    'UV Protection': true,
    'Water Resistant': true,
    'Ready to Hang': true,
    'Frame Included': false,
    'Gallery Wrapped': false,
    'Glass Finish Available': false,
    'Multiple Sizes': true,
    'Custom Sizes': true,
    'Rush Production': false
  }
}

export function CompareTable() {
  const [selectedProducts, setSelectedProducts] = useState<string[]>(['canvas-premium', 'art-print', 'metal-print'])

  const toggleProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      if (selectedProducts.length > 2) {
        setSelectedProducts(prev => prev.filter(id => id !== productId))
      }
    } else if (selectedProducts.length < 4) {
      setSelectedProducts(prev => [...prev, productId])
    }
  }

  const selectedProductData = products.filter(p => selectedProducts.includes(p.id))
  const categories = [...new Set(features.map(f => f.category))]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Compare Products</h2>
          <p className="text-gray-600">Find the perfect print type for your space</p>
        </div>

        {/* Product Selector */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedProducts.includes(product.id)
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {product.name}
            </button>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Product Headers */}
            <thead>
              <tr>
                <th className="p-4 text-left bg-gray-50 sticky left-0 z-10 min-w-[200px]">
                  <span className="sr-only">Feature</span>
                </th>
                {selectedProductData.map((product) => (
                  <th key={product.id} className="p-4 text-center min-w-[200px]">
                    <div className="bg-gray-100 rounded-xl p-4 mb-4 h-32 flex items-center justify-center text-gray-400">
                      Product Image
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-sm text-gray-400">({product.reviews})</span>
                    </div>
                    <p className="text-2xl font-bold text-rose-500">${product.price}</p>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {categories.map((category) => (
                <>
                  {/* Category Header */}
                  <tr key={`cat-${category}`}>
                    <td
                      colSpan={selectedProductData.length + 1}
                      className="p-4 bg-gray-50 font-semibold text-gray-700"
                    >
                      {category}
                    </td>
                  </tr>

                  {/* Features in Category */}
                  {features
                    .filter(f => f.category === category)
                    .map((feature) => (
                      <tr key={feature.name} className="border-b border-gray-100">
                        <td className="p-4 bg-white sticky left-0 z-10">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700">{feature.name}</span>
                            {feature.description && (
                              <div className="group relative">
                                <Info className="h-4 w-4 text-gray-400" />
                                <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                                  {feature.description}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        {selectedProductData.map((product) => {
                          const value = featureMatrix[product.id][feature.name]
                          return (
                            <td key={product.id} className="p-4 text-center">
                              {value === true ? (
                                <Check className="h-6 w-6 text-green-500 mx-auto" />
                              ) : value === false ? (
                                <X className="h-6 w-6 text-gray-300 mx-auto" />
                              ) : (
                                <span className="text-sm text-gray-600">{value}</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                </>
              ))}

              {/* CTA Row */}
              <tr>
                <td className="p-4 bg-white sticky left-0 z-10"></td>
                {selectedProductData.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <a
                      href={`/create?product=${product.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
                    >
                      Create Now
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export function CompareCards() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Perfect Print</h2>
          <p className="text-gray-600">Each option offers unique benefits for different spaces</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                <span className="text-rose-300">Product Image</span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{product.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                  <a
                    href={`/create?product=${product.id}`}
                    className="text-rose-500 hover:text-rose-600 font-medium text-sm"
                  >
                    Create →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CompareQuickView() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-rose-500 hover:text-rose-600"
      >
        Compare Products
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50">
          <h4 className="font-semibold text-gray-900 mb-4">Quick Compare</h4>
          <div className="space-y-3">
            {products.slice(0, 3).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">{product.name}</span>
                  <span className="text-sm text-gray-500 ml-2">${product.price}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs">{product.rating}</span>
                </div>
              </div>
            ))}
          </div>
          <a
            href="/compare"
            className="block text-center text-rose-500 hover:text-rose-600 text-sm font-medium mt-4"
          >
            View Full Comparison →
          </a>
        </div>
      )}
    </div>
  )
}
