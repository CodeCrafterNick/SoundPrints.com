'use client'

import { Star, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ProductCardProps {
  name: string
  description?: string
  price: string
  originalPrice?: string | null
  rating: number
  reviews: number
  badge?: string | null
  colors?: string[]
  sizes?: string[]
  waveformStyle?: 'bars' | 'circular' | 'smooth' | 'dna' | 'vinyl'
  featured?: boolean
}

export function ProductCard({
  name,
  description,
  price,
  originalPrice,
  rating,
  reviews,
  badge,
  colors = ['#f43f5e', '#fbbf24'],
  waveformStyle = 'bars',
  featured = false
}: ProductCardProps) {
  const renderWaveform = () => {
    switch (waveformStyle) {
      case 'bars':
        return (
          <svg viewBox="0 0 100 50" className="w-3/4 h-1/3">
            <defs>
              <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colors[0]} />
                <stop offset="100%" stopColor={colors[1]} />
              </linearGradient>
            </defs>
            {Array.from({ length: 35 }).map((_, i) => {
              const height = 5 + Math.sin(i * 0.4) * 15 + (i % 3) * 5
              return (
                <rect
                  key={i}
                  x={i * 2.85}
                  y={25 - height / 2}
                  width="2"
                  height={height}
                  rx="1"
                  fill="url(#barGrad)"
                />
              )
            })}
          </svg>
        )
      case 'circular':
        return (
          <svg viewBox="0 0 100 100" className="w-1/2 h-1/2">
            <defs>
              <linearGradient id="circGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors[0]} />
                <stop offset="100%" stopColor={colors[1]} />
              </linearGradient>
            </defs>
            {Array.from({ length: 36 }).map((_, i) => {
              const angle = (i / 36) * Math.PI * 2
              const len = 8 + Math.sin(i * 0.5) * 6
              const x1 = 50 + Math.cos(angle) * 25
              const y1 = 50 + Math.sin(angle) * 25
              const x2 = 50 + Math.cos(angle) * (25 + len)
              const y2 = 50 + Math.sin(angle) * (25 + len)
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#circGrad)" strokeWidth="2" strokeLinecap="round" />
            })}
          </svg>
        )
      case 'smooth':
        const points = Array.from({ length: 50 }).map((_, i) => {
          const x = i * 2
          const y = 25 + Math.sin(i * 0.3) * 15 + Math.sin(i * 0.1) * 5
          return `${x},${y}`
        }).join(' ')
        return (
          <svg viewBox="0 0 100 50" className="w-3/4 h-1/3">
            <defs>
              <linearGradient id="smoothGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={colors[0]} />
                <stop offset="100%" stopColor={colors[1]} />
              </linearGradient>
            </defs>
            <polyline points={points} fill="none" stroke="url(#smoothGrad)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )
      case 'dna':
        return (
          <svg viewBox="0 0 60 100" className="w-1/4 h-2/3">
            {Array.from({ length: 8 }).map((_, i) => {
              const y = i * 12 + 6
              const offset = Math.sin(i * 0.8) * 12
              return (
                <g key={i}>
                  <circle cx={30 - offset} cy={y} r="4" fill={colors[0]} />
                  <circle cx={30 + offset} cy={y} r="4" fill={colors[1]} />
                  <line x1={30 - offset} y1={y} x2={30 + offset} y2={y} stroke={colors[0]} strokeWidth="1" opacity="0.5" />
                </g>
              )
            })}
          </svg>
        )
      case 'vinyl':
        return (
          <svg viewBox="0 0 100 100" className="w-1/2 h-1/2">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#374151" strokeWidth="2" />
            <circle cx="50" cy="50" r="32" fill="none" stroke="#374151" strokeWidth="1" />
            <circle cx="50" cy="50" r="24" fill="none" stroke="#374151" strokeWidth="1" />
            <circle cx="50" cy="50" r="16" fill="none" stroke="#374151" strokeWidth="1" />
            <circle cx="50" cy="50" r="10" fill={colors[0]} />
            <circle cx="50" cy="50" r="4" fill="#111827" />
          </svg>
        )
      default:
        return null
    }
  }
  
  return (
    <div className={`group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
      featured 
        ? 'shadow-xl hover:shadow-2xl border-2 border-rose-200' 
        : 'shadow-sm hover:shadow-lg border border-gray-100'
    }`}>
      {/* Featured indicator */}
      {featured && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-amber-500" />
      )}
      
      {/* Badge */}
      {badge && (
        <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-medium ${
          badge === 'Bestseller' ? 'bg-rose-500 text-white' :
          badge === 'New' ? 'bg-amber-500 text-white' :
          badge === 'Sale' ? 'bg-red-500 text-white' :
          'bg-gray-900 text-white'
        }`}>
          {badge}
        </div>
      )}
      
      {/* Image/Preview */}
      <div className="aspect-square bg-gray-900 relative overflow-hidden flex items-center justify-center">
        {renderWaveform()}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link href="/create">
            <Button className="bg-white text-gray-900 hover:bg-gray-100 gap-2">
              <ShoppingCart className="h-4 w-4" />
              Customize
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium text-gray-900">{rating}</span>
          <span className="text-sm text-gray-500">({reviews} reviews)</span>
        </div>
        
        {/* Name */}
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-rose-500 transition-colors">
          {name}
        </h3>
        
        {/* Description */}
        {description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{description}</p>
        )}
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">{price}</span>
          {originalPrice && (
            <span className="text-sm text-gray-500 line-through">{originalPrice}</span>
          )}
          {originalPrice && (
            <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded">
              Sale
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Example usage showcase
export function ProductCardShowcase() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Product Cards</h2>
          <p className="text-gray-600">Reusable product card component with various styles</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <ProductCard
            name="Classic Waveform"
            description="Turn your favorite song into beautiful wall art"
            price="$49"
            originalPrice="$59"
            rating={4.9}
            reviews={423}
            badge="Bestseller"
            waveformStyle="bars"
          />
          <ProductCard
            name="Circular Sound Art"
            description="360° visualization of your audio"
            price="$59"
            rating={4.8}
            reviews={289}
            badge="New"
            waveformStyle="circular"
            colors={['#06b6d4', '#8b5cf6']}
          />
          <ProductCard
            name="DNA Helix Print"
            description="Unique double helix sound visualization"
            price="$54"
            rating={4.7}
            reviews={156}
            waveformStyle="dna"
            colors={['#10b981', '#3b82f6']}
            featured
          />
          <ProductCard
            name="Vinyl Record Style"
            description="Retro-inspired sound art"
            price="$49"
            rating={4.9}
            reviews={312}
            badge="Popular"
            waveformStyle="vinyl"
            colors={['#f43f5e']}
          />
        </div>
      </div>
    </section>
  )
}
