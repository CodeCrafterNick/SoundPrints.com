'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Star, Heart, Loader2 } from 'lucide-react'

interface GalleryItem {
  id: number
  title: string
  category: string
  rating: number
  likes: number
  style: string
  colors: string[]
  height: 'short' | 'medium' | 'tall'
}

// Generate a larger dataset for infinite scroll demo
const generateItems = (startId: number, count: number): GalleryItem[] => {
  const categories = ['Wedding', 'Baby', 'Anniversary', 'Memorial', 'Voice']
  const styles = ['bars', 'circular', 'smooth', 'dna', 'vinyl', 'heartbeat', 'galaxy']
  const heights: ('short' | 'medium' | 'tall')[] = ['short', 'medium', 'tall']
  const colorPairs = [
    ['#f43f5e', '#fbbf24'],
    ['#06b6d4', '#8b5cf6'],
    ['#10b981', '#3b82f6'],
    ['#f97316', '#ec4899'],
    ['#6366f1', '#a855f7'],
    ['#14b8a6', '#f43f5e'],
  ]
  
  return Array.from({ length: count }).map((_, i) => ({
    id: startId + i,
    title: `Sound Print #${startId + i}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    rating: 4.5 + Math.random() * 0.5,
    likes: Math.floor(Math.random() * 500) + 50,
    style: styles[Math.floor(Math.random() * styles.length)],
    colors: colorPairs[Math.floor(Math.random() * colorPairs.length)],
    height: heights[Math.floor(Math.random() * heights.length)],
  }))
}

function MasonryCard({ item }: { item: GalleryItem }) {
  const [isLiked, setIsLiked] = useState(false)
  
  const heightClass = {
    short: 'aspect-square',
    medium: 'aspect-[3/4]',
    tall: 'aspect-[2/3]',
  }[item.height]
  
  return (
    <div className={`group relative bg-gray-900 rounded-xl overflow-hidden ${heightClass}`}>
      {/* Waveform background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-80">
        <svg viewBox="0 0 100 50" className="w-3/4 h-1/3">
          <defs>
            <linearGradient id={`mgrad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={item.colors[0]} />
              <stop offset="100%" stopColor={item.colors[1]} />
            </linearGradient>
          </defs>
          {Array.from({ length: 35 }).map((_, i) => {
            const height = 5 + Math.sin(i * 0.3 + item.id) * 15 + (i % 4) * 3
            return (
              <rect
                key={i}
                x={i * 2.85}
                y={25 - height / 2}
                width="2"
                height={height}
                rx="1"
                fill={`url(#mgrad-${item.id})`}
              />
            )
          })}
        </svg>
      </div>
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-medium text-sm mb-1">{item.title}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300">{item.category}</span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs text-white">{item.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Like button */}
      <button
        onClick={() => setIsLiked(!isLiked)}
        className="absolute top-3 right-3 p-2 rounded-full bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
      >
        <Heart className={`h-4 w-4 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
      </button>
    </div>
  )
}

export function MasonryGallery() {
  const [items, setItems] = useState<GalleryItem[]>(() => generateItems(1, 20))
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const loaderRef = useRef<HTMLDivElement>(null)
  
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return
    
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      const newItems = generateItems(items.length + 1, 12)
      setItems(prev => [...prev, ...newItems])
      setIsLoading(false)
      if (items.length >= 80) {
        setHasMore(false)
      }
    }, 1000)
  }, [isLoading, hasMore, items.length])
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )
    
    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }
    
    return () => observer.disconnect()
  }, [loadMore])
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Masonry Gallery</h2>
          <p className="text-gray-600">Scroll to load more designs</p>
        </div>
        
        {/* Masonry grid using CSS columns */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {items.map(item => (
            <div key={item.id} className="break-inside-avoid">
              <MasonryCard item={item} />
            </div>
          ))}
        </div>
        
        {/* Loading indicator */}
        <div ref={loaderRef} className="flex justify-center py-12">
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading more...</span>
            </div>
          )}
          {!hasMore && (
            <p className="text-gray-400">You&apos;ve seen all designs</p>
          )}
        </div>
      </div>
    </section>
  )
}
