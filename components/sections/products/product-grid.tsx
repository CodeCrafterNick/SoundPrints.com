'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Star, Eye } from 'lucide-react'
import Link from 'next/link'

const categories = ['All', 'Songs', 'Voices', 'Wedding', 'Baby', 'Memorial']

const products = [
  {
    id: 1,
    name: 'First Dance',
    category: 'Wedding',
    price: '$59',
    rating: 5.0,
    style: 'bars'
  },
  {
    id: 2,
    name: 'Baby\'s First Words',
    category: 'Baby',
    price: '$49',
    rating: 4.9,
    style: 'smooth'
  },
  {
    id: 3,
    name: 'Our Song',
    category: 'Songs',
    price: '$49',
    rating: 4.8,
    style: 'circular'
  },
  {
    id: 4,
    name: 'Grandma\'s Voice',
    category: 'Memorial',
    price: '$59',
    rating: 5.0,
    style: 'heartbeat'
  },
  {
    id: 5,
    name: 'Wedding Vows',
    category: 'Wedding',
    price: '$69',
    rating: 4.9,
    style: 'dna'
  },
  {
    id: 6,
    name: 'Lullaby',
    category: 'Baby',
    price: '$49',
    rating: 4.7,
    style: 'smooth'
  },
  {
    id: 7,
    name: 'Anniversary Song',
    category: 'Songs',
    price: '$54',
    rating: 4.8,
    style: 'vinyl'
  },
  {
    id: 8,
    name: 'Voice Message',
    category: 'Voices',
    price: '$49',
    rating: 4.9,
    style: 'bars'
  }
]

function ProductCard({ product }: { product: typeof products[0] }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <div className="aspect-square bg-gray-900 rounded-2xl overflow-hidden relative mb-4">
        {/* Waveform preview */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 100 50" className="w-3/4 h-1/3">
            {Array.from({ length: 40 }).map((_, i) => {
              const height = 5 + Math.sin(i * 0.3 + product.id) * 15 + Math.random() * 5
              return (
                <rect
                  key={i}
                  x={i * 2.5}
                  y={25 - height / 2}
                  width="1.8"
                  height={height}
                  rx="0.9"
                  className="fill-rose-500"
                  opacity={0.5 + Math.random() * 0.5}
                />
              )
            })}
          </svg>
        </div>
        
        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-black/60 flex items-center justify-center gap-3 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Link href="/create">
            <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100">
              Customize
            </Button>
          </Link>
          <Button size="sm" variant="outline" className="border-white text-white hover:bg-white/10">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Info */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-rose-500 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500">{product.category}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900">{product.price}</p>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs text-gray-500">{product.rating}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductGrid() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory)
  
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-rose-500 font-medium mb-4">Browse Collection</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Popular Designs
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get inspired by our most loved designs and create your own masterpiece.
          </p>
        </div>
        
        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Products grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/create">
            <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-6 text-lg shadow-lg shadow-rose-500/25">
              Create Your Own
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
