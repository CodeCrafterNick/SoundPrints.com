'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Grid, LayoutGrid, Star, SlidersHorizontal, X } from 'lucide-react'

const categories = ['All', 'Wedding', 'Baby', 'Anniversary', 'Memorial', 'Voice', 'Podcast']
const styles = ['All Styles', 'Classic Bars', 'Circular', 'Smooth Wave', 'DNA Helix', 'Vinyl', 'Galaxy Spiral']
const sortOptions = ['Most Popular', 'Newest', 'Highest Rated', 'Most Liked']

interface FilterState {
  category: string
  style: string
  priceRange: [number, number]
  sortBy: string
}

const products = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  title: `Sound Print Design ${i + 1}`,
  category: categories[Math.floor(Math.random() * (categories.length - 1)) + 1],
  style: styles[Math.floor(Math.random() * (styles.length - 1)) + 1],
  price: 49 + Math.floor(Math.random() * 30),
  rating: 4.5 + Math.random() * 0.5,
  reviews: Math.floor(Math.random() * 300) + 50,
  colors: ['#f43f5e', '#fbbf24'],
}))

export function FilteredGallery() {
  const [filters, setFilters] = useState<FilterState>({
    category: 'All',
    style: 'All Styles',
    priceRange: [0, 100],
    sortBy: 'Most Popular',
  })
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  const activeFiltersCount = [
    filters.category !== 'All',
    filters.style !== 'All Styles',
    filters.priceRange[0] > 0 || filters.priceRange[1] < 100,
  ].filter(Boolean).length
  
  const clearFilters = () => {
    setFilters({
      category: 'All',
      style: 'All Styles',
      priceRange: [0, 100],
      sortBy: 'Most Popular',
    })
  }
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Browse Designs</h2>
            <p className="text-gray-500 mt-1">{products.length} designs found</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Filter toggle (mobile) */}
            <Button
              variant="outline"
              className="md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
            
            {/* Sort dropdown */}
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              {sortOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            
            {/* View mode toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('large')}
                className={`p-2 ${viewMode === 'large' ? 'bg-gray-100' : 'bg-white'}`}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex gap-8">
          {/* Sidebar filters (desktop) */}
          <div className={`w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-rose-500 hover:text-rose-600"
                  >
                    Clear all
                  </button>
                )}
              </div>
              
              {/* Category filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setFilters({ ...filters, category })}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filters.category === category
                          ? 'bg-rose-50 text-rose-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Style filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Style</h4>
                <div className="space-y-2">
                  {styles.map(style => (
                    <button
                      key={style}
                      onClick={() => setFilters({ ...filters, style })}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filters.style === style
                          ? 'bg-rose-50 text-rose-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Price range */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => setFilters({ ...filters, priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]] })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({ ...filters, priceRange: [filters.priceRange[0], parseInt(e.target.value) || 100] })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Product grid */}
          <div className="flex-1">
            {/* Active filters */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.category !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm">
                    {filters.category}
                    <button onClick={() => setFilters({ ...filters, category: 'All' })}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.style !== 'All Styles' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm">
                    {filters.style}
                    <button onClick={() => setFilters({ ...filters, style: 'All Styles' })}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
            
            {/* Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1 md:grid-cols-2'
            }`}>
              {products.map(product => (
                <div key={product.id} className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                  {/* Image */}
                  <div className="aspect-square bg-gray-900 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg viewBox="0 0 100 50" className="w-3/4 h-1/3">
                        <defs>
                          <linearGradient id={`pgrad-${product.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
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
                              fill={`url(#pgrad-${product.id})`}
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
                      <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                      <span className="text-sm text-gray-400">({product.reviews})</span>
                    </div>
                    <h3 className="font-medium text-gray-900 group-hover:text-rose-500 transition-colors">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-500">{product.category}</span>
                      <span className="font-bold text-gray-900">${product.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
