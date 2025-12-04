'use client'

import { useState } from 'react'
import { Star, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const priceRanges = [
  { id: 'under25', label: 'Under $25', min: 0, max: 25 },
  { id: '25-50', label: '$25 - $50', min: 25, max: 50 },
  { id: '50-75', label: '$50 - $75', min: 50, max: 75 },
  { id: '75-100', label: '$75 - $100', min: 75, max: 100 },
  { id: 'over100', label: '$100+', min: 100, max: Infinity },
]

const recipients = [
  { id: 'her', label: 'For Her', emoji: '👩' },
  { id: 'him', label: 'For Him', emoji: '👨' },
  { id: 'baby', label: 'For Baby', emoji: '👶' },
  { id: 'couple', label: 'For Couples', emoji: '💑' },
  { id: 'family', label: 'For Family', emoji: '👨‍👩‍👧‍👦' },
  { id: 'friend', label: 'For Friends', emoji: '🤝' },
]

interface Product {
  id: number
  title: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  recipient: string[]
  bestseller?: boolean
  colors: string[]
}

const products: Product[] = [
  { id: 1, title: 'Classic Sound Wave Print', price: 39, rating: 4.9, reviews: 234, recipient: ['her', 'him'], colors: ['#f43f5e', '#fbbf24'] },
  { id: 2, title: 'Wedding Vows Canvas', price: 69, originalPrice: 89, rating: 4.8, reviews: 189, recipient: ['couple'], bestseller: true, colors: ['#ec4899', '#f97316'] },
  { id: 3, title: 'Baby Heartbeat Frame', price: 49, rating: 4.9, reviews: 312, recipient: ['baby', 'family'], bestseller: true, colors: ['#06b6d4', '#8b5cf6'] },
  { id: 4, title: 'Pet Portrait Sound Art', price: 54, rating: 4.7, reviews: 156, recipient: ['her', 'him', 'family'], colors: ['#10b981', '#3b82f6'] },
  { id: 5, title: 'Vinyl Record Style Print', price: 79, rating: 4.8, reviews: 98, recipient: ['him', 'friend'], colors: ['#6366f1', '#a855f7'] },
  { id: 6, title: 'Galaxy Spiral Canvas', price: 99, originalPrice: 119, rating: 4.9, reviews: 76, recipient: ['her', 'him', 'friend'], colors: ['#14b8a6', '#f43f5e'] },
  { id: 7, title: 'Mini Desk Print', price: 24, rating: 4.6, reviews: 445, recipient: ['friend', 'him', 'her'], colors: ['#f43f5e', '#fbbf24'] },
  { id: 8, title: 'First Dance Poster', price: 45, rating: 4.8, reviews: 267, recipient: ['couple'], bestseller: true, colors: ['#ec4899', '#fbbf24'] },
]

export function PriceFilterSection() {
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null)
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null)
  
  const filteredProducts = products.filter(product => {
    if (selectedPrice) {
      const range = priceRanges.find(r => r.id === selectedPrice)
      if (range && (product.price < range.min || product.price > range.max)) {
        return false
      }
    }
    if (selectedRecipient && !product.recipient.includes(selectedRecipient)) {
      return false
    }
    return true
  })
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Budget</h2>
          <p className="text-gray-600">Perfect gifts at every price point</p>
        </div>
        
        {/* Price range selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {priceRanges.map(range => (
            <button
              key={range.id}
              onClick={() => setSelectedPrice(selectedPrice === range.id ? null : range.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                selectedPrice === range.id
                  ? 'bg-rose-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
        
        {/* Recipient filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {recipients.map(recipient => (
            <button
              key={recipient.id}
              onClick={() => setSelectedRecipient(selectedRecipient === recipient.id ? null : recipient.id)}
              className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${
                selectedRecipient === recipient.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <span>{recipient.emoji}</span>
              <span>{recipient.label}</span>
            </button>
          ))}
        </div>
        
        {/* Products grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="aspect-square bg-gray-900 relative">
                {product.bestseller && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-amber-400 text-xs font-bold rounded-full z-10">
                    BESTSELLER
                  </span>
                )}
                {product.originalPrice && (
                  <span className="absolute top-3 right-3 px-2 py-1 bg-rose-500 text-white text-xs font-bold rounded-full z-10">
                    SALE
                  </span>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 50" className="w-3/4 h-1/3">
                    <defs>
                      <linearGradient id={`ggrad-${product.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={product.colors[0]} />
                        <stop offset="100%" stopColor={product.colors[1]} />
                      </linearGradient>
                    </defs>
                    {Array.from({ length: 35 }).map((_, i) => {
                      const height = 5 + Math.sin(i * 0.3 + product.id) * 15
                      return (
                        <rect
                          key={i}
                          x={i * 2.85}
                          y={25 - height / 2}
                          width="2"
                          height={height}
                          rx="1"
                          fill={`url(#ggrad-${product.id})`}
                        />
                      )
                    })}
                  </svg>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-sm text-gray-400">({product.reviews})</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2 group-hover:text-rose-500 transition-colors">
                  {product.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No products match your filters</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => { setSelectedPrice(null); setSelectedRecipient(null) }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
