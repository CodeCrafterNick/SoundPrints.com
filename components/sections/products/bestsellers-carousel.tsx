'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

const products = [
  {
    id: 1,
    name: 'Classic Waveform Print',
    price: '$49',
    originalPrice: '$59',
    rating: 4.9,
    reviews: 423,
    badge: 'Bestseller',
    style: 'bars'
  },
  {
    id: 2,
    name: 'Circular Sound Art',
    price: '$59',
    originalPrice: null,
    rating: 4.8,
    reviews: 289,
    badge: null,
    style: 'circular'
  },
  {
    id: 3,
    name: 'Galaxy Spiral Print',
    price: '$69',
    originalPrice: '$79',
    rating: 5.0,
    reviews: 156,
    badge: 'New',
    style: 'galaxy'
  },
  {
    id: 4,
    name: 'DNA Helix Sound Art',
    price: '$59',
    originalPrice: null,
    rating: 4.7,
    reviews: 201,
    badge: null,
    style: 'dna'
  },
  {
    id: 5,
    name: 'Vinyl Record Style',
    price: '$54',
    originalPrice: '$64',
    rating: 4.9,
    reviews: 312,
    badge: 'Popular',
    style: 'vinyl'
  },
  {
    id: 6,
    name: 'Heartbeat Print',
    price: '$49',
    originalPrice: null,
    rating: 4.8,
    reviews: 267,
    badge: null,
    style: 'heartbeat'
  }
]

function ProductCard({ product }: { product: typeof products[0] }) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Generate waveform preview based on style
  const renderWaveform = () => {
    switch (product.style) {
      case 'bars':
        return (
          <svg viewBox="0 0 100 50" className="w-3/4 h-1/3">
            {Array.from({ length: 30 }).map((_, i) => {
              const height = 5 + Math.sin(i * 0.4 + product.id) * 15 + (i % 3) * 5
              return (
                <rect
                  key={i}
                  x={i * 3.3}
                  y={25 - height / 2}
                  width="2.5"
                  height={height}
                  rx="1"
                  className="fill-rose-500"
                />
              )
            })}
          </svg>
        )
      case 'circular':
        return (
          <svg viewBox="0 0 100 100" className="w-1/2 h-1/2">
            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" className="text-rose-200" strokeWidth="2" />
            {Array.from({ length: 36 }).map((_, i) => {
              const angle = (i / 36) * Math.PI * 2
              const len = 8 + Math.sin(i * 0.5 + product.id) * 6
              const x1 = 50 + Math.cos(angle) * 30
              const y1 = 50 + Math.sin(angle) * 30
              const x2 = 50 + Math.cos(angle) * (30 + len)
              const y2 = 50 + Math.sin(angle) * (30 + len)
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-rose-500" strokeWidth="2" />
            })}
          </svg>
        )
      case 'galaxy':
        return (
          <svg viewBox="0 0 100 100" className="w-1/2 h-1/2">
            {Array.from({ length: 50 }).map((_, i) => {
              const t = i / 50 * Math.PI * 4
              const r = 5 + t * 3
              const x = 50 + Math.cos(t) * r
              const y = 50 + Math.sin(t) * r
              return <circle key={i} cx={x} cy={y} r="1.5" className="fill-rose-500" opacity={0.3 + i / 60} />
            })}
          </svg>
        )
      case 'dna':
        return (
          <svg viewBox="0 0 60 100" className="w-1/4 h-2/3">
            {Array.from({ length: 10 }).map((_, i) => {
              const y = i * 10 + 5
              const offset = Math.sin(i * 0.8) * 10
              return (
                <g key={i}>
                  <circle cx={30 - offset} cy={y} r="3" className="fill-rose-500" />
                  <circle cx={30 + offset} cy={y} r="3" className="fill-amber-500" />
                  <line x1={30 - offset} y1={y} x2={30 + offset} y2={y} className="stroke-rose-300" strokeWidth="1" />
                </g>
              )
            })}
          </svg>
        )
      case 'vinyl':
        return (
          <svg viewBox="0 0 100 100" className="w-1/2 h-1/2">
            <circle cx="50" cy="50" r="40" fill="none" className="stroke-gray-700" strokeWidth="2" />
            <circle cx="50" cy="50" r="30" fill="none" className="stroke-gray-700" strokeWidth="1" />
            <circle cx="50" cy="50" r="20" fill="none" className="stroke-gray-700" strokeWidth="1" />
            <circle cx="50" cy="50" r="10" className="fill-rose-500" />
            <circle cx="50" cy="50" r="5" className="fill-gray-900" />
          </svg>
        )
      case 'heartbeat':
        return (
          <svg viewBox="0 0 100 40" className="w-3/4 h-1/4">
            <path
              d="M0 20 L20 20 L25 5 L30 35 L35 20 L45 20 L50 10 L55 30 L60 20 L100 20"
              fill="none"
              className="stroke-rose-500"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )
      default:
        return null
    }
  }
  
  return (
    <div 
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge */}
      {product.badge && (
        <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-medium ${
          product.badge === 'Bestseller' ? 'bg-rose-500 text-white' :
          product.badge === 'New' ? 'bg-amber-500 text-white' :
          'bg-gray-900 text-white'
        }`}>
          {product.badge}
        </div>
      )}
      
      {/* Image/Preview area */}
      <div className="aspect-square bg-gray-900 relative overflow-hidden flex items-center justify-center">
        {renderWaveform()}
        
        {/* Quick add overlay */}
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
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
          <span className="text-sm font-medium text-gray-900">{product.rating}</span>
          <span className="text-sm text-gray-500">({product.reviews})</span>
        </div>
        
        {/* Name */}
        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-rose-500 transition-colors">
          {product.name}
        </h3>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">{product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export function BestsellersCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerPage = 3
  const maxIndex = Math.ceil(products.length / itemsPerPage) - 1
  
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-rose-500 font-medium mb-2">Shop Our Collection</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Bestselling Prints
            </h2>
          </div>
          
          {/* Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentIndex(Math.min(maxIndex, currentIndex + 1))}
              disabled={currentIndex === maxIndex}
              className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Products grid */}
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-out gap-6"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage + 2)}%)` }}
          >
            {products.map((product) => (
              <div key={product.id} className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
        
        {/* View all link */}
        <div className="text-center mt-12">
          <Link href="/gallery">
            <Button variant="outline" size="lg" className="px-8">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
