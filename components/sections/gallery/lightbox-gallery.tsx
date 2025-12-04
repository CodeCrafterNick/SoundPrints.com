'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, Download, Share2, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GalleryItem {
  id: number
  title: string
  subtitle?: string
  category: string
  style: 'bars' | 'circular' | 'smooth' | 'dna' | 'vinyl' | 'heartbeat' | 'galaxy'
  colors: string[]
  likes: number
}

const galleryItems: GalleryItem[] = [
  { id: 1, title: 'Our Wedding Song', subtitle: '"At Last" by Etta James', category: 'Wedding', style: 'circular', colors: ['#f43f5e', '#fbbf24'], likes: 234 },
  { id: 2, title: "Baby's First Words", subtitle: '"Mama" - 14 months', category: 'Baby', style: 'bars', colors: ['#06b6d4', '#8b5cf6'], likes: 189 },
  { id: 3, title: '25th Anniversary', subtitle: '"Wonderful Tonight"', category: 'Anniversary', style: 'smooth', colors: ['#f43f5e', '#f97316'], likes: 312 },
  { id: 4, title: "Grandma's Voice", subtitle: 'Last voicemail', category: 'Memorial', style: 'heartbeat', colors: ['#10b981', '#3b82f6'], likes: 456 },
  { id: 5, title: 'First Dance', subtitle: '"Perfect" by Ed Sheeran', category: 'Wedding', style: 'dna', colors: ['#f43f5e', '#ec4899'], likes: 278 },
  { id: 6, title: 'Favorite Podcast', subtitle: 'The Daily - Episode 1', category: 'Voice', style: 'vinyl', colors: ['#6366f1', '#a855f7'], likes: 145 },
  { id: 7, title: 'Graduation Speech', subtitle: 'Class of 2024', category: 'Voice', style: 'galaxy', colors: ['#14b8a6', '#f43f5e'], likes: 198 },
  { id: 8, title: 'Our Song', subtitle: '"Can\'t Help Falling in Love"', category: 'Anniversary', style: 'circular', colors: ['#eab308', '#f43f5e'], likes: 367 },
  { id: 9, title: 'Baby Laughter', subtitle: 'First giggles - 6 months', category: 'Baby', style: 'smooth', colors: ['#ec4899', '#f97316'], likes: 412 },
  { id: 10, title: 'Mom\'s Lullaby', subtitle: 'Rock-a-bye Baby', category: 'Memorial', style: 'bars', colors: ['#8b5cf6', '#06b6d4'], likes: 289 },
  { id: 11, title: 'Proposal Song', subtitle: '"Marry Me" by Train', category: 'Wedding', style: 'heartbeat', colors: ['#f43f5e', '#fbbf24'], likes: 523 },
  { id: 12, title: 'Father\'s Day', subtitle: 'Dad\'s favorite song', category: 'Voice', style: 'galaxy', colors: ['#3b82f6', '#10b981'], likes: 176 },
]

const categories = ['All', 'Wedding', 'Baby', 'Anniversary', 'Memorial', 'Voice']

function WaveformPreview({ item }: { item: GalleryItem }) {
  switch (item.style) {
    case 'bars':
      return (
        <svg viewBox="0 0 100 50" className="w-3/4 h-1/3">
          <defs>
            <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={item.colors[0]} />
              <stop offset="100%" stopColor={item.colors[1]} />
            </linearGradient>
          </defs>
          {Array.from({ length: 40 }).map((_, i) => {
            const height = 5 + Math.sin(i * 0.3 + item.id) * 15 + (i % 3) * 5
            return (
              <rect
                key={i}
                x={i * 2.5}
                y={25 - height / 2}
                width="2"
                height={height}
                rx="1"
                fill={`url(#grad-${item.id})`}
              />
            )
          })}
        </svg>
      )
    case 'circular':
      return (
        <svg viewBox="0 0 100 100" className="w-1/2 h-1/2">
          <defs>
            <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={item.colors[0]} />
              <stop offset="100%" stopColor={item.colors[1]} />
            </linearGradient>
          </defs>
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = (i / 36) * Math.PI * 2
            const len = 8 + Math.sin(i * 0.5 + item.id) * 8
            const x1 = 50 + Math.cos(angle) * 25
            const y1 = 50 + Math.sin(angle) * 25
            const x2 = 50 + Math.cos(angle) * (25 + len)
            const y2 = 50 + Math.sin(angle) * (25 + len)
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={`url(#grad-${item.id})`} strokeWidth="2.5" strokeLinecap="round" />
          })}
        </svg>
      )
    case 'smooth':
      const points = Array.from({ length: 50 }).map((_, i) => {
        const x = i * 2
        const y = 25 + Math.sin(i * 0.3 + item.id) * 15
        return `${x},${y}`
      }).join(' ')
      return (
        <svg viewBox="0 0 100 50" className="w-3/4 h-1/3">
          <defs>
            <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={item.colors[0]} />
              <stop offset="100%" stopColor={item.colors[1]} />
            </linearGradient>
          </defs>
          <polyline points={points} fill="none" stroke={`url(#grad-${item.id})`} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )
    case 'heartbeat':
      return (
        <svg viewBox="0 0 100 40" className="w-3/4 h-1/4">
          <defs>
            <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={item.colors[0]} />
              <stop offset="100%" stopColor={item.colors[1]} />
            </linearGradient>
          </defs>
          <path
            d="M0 20 L20 20 L25 5 L30 35 L35 20 L50 20 L55 10 L60 30 L65 20 L100 20"
            fill="none"
            stroke={`url(#grad-${item.id})`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'dna':
      return (
        <svg viewBox="0 0 60 100" className="w-1/4 h-2/3">
          {Array.from({ length: 10 }).map((_, i) => {
            const y = i * 10 + 5
            const offset = Math.sin(i * 0.8 + item.id) * 12
            return (
              <g key={i}>
                <circle cx={30 - offset} cy={y} r="4" fill={item.colors[0]} />
                <circle cx={30 + offset} cy={y} r="4" fill={item.colors[1]} />
                <line x1={30 - offset} y1={y} x2={30 + offset} y2={y} stroke={item.colors[0]} strokeWidth="1.5" opacity="0.5" />
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
          <circle cx="50" cy="50" r="12" fill={item.colors[0]} />
          <circle cx="50" cy="50" r="5" fill="#111827" />
        </svg>
      )
    case 'galaxy':
      return (
        <svg viewBox="0 0 100 100" className="w-1/2 h-1/2">
          <defs>
            <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={item.colors[0]} />
              <stop offset="100%" stopColor={item.colors[1]} />
            </linearGradient>
          </defs>
          {Array.from({ length: 60 }).map((_, i) => {
            const t = (i / 60) * Math.PI * 5
            const r = 5 + t * 2.5
            const x = 50 + Math.cos(t) * r
            const y = 50 + Math.sin(t) * r
            return <circle key={i} cx={x} cy={y} r="1.5" fill={`url(#grad-${item.id})`} opacity={0.3 + i / 80} />
          })}
        </svg>
      )
    default:
      return null
  }
}

interface LightboxGalleryProps {
  items?: GalleryItem[]
}

export function LightboxGallery({ items = galleryItems }: LightboxGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null)
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set())
  
  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory)
  
  const currentIndex = lightboxItem ? filteredItems.findIndex(item => item.id === lightboxItem.id) : -1
  
  const goToPrev = () => {
    if (currentIndex > 0) {
      setLightboxItem(filteredItems[currentIndex - 1])
    }
  }
  
  const goToNext = () => {
    if (currentIndex < filteredItems.length - 1) {
      setLightboxItem(filteredItems[currentIndex + 1])
    }
  }
  
  const toggleLike = (id: number) => {
    setLikedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Customer Gallery</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get inspired by beautiful sound art created by our customers
          </p>
        </div>
        
        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-rose-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Gallery grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="group relative aspect-square bg-gray-900 rounded-xl overflow-hidden cursor-pointer"
              onClick={() => setLightboxItem(item)}
            >
              {/* Waveform */}
              <div className="absolute inset-0 flex items-center justify-center">
                <WaveformPreview item={item} />
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <ZoomIn className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-gray-300">{item.category}</p>
                </div>
              </div>
              
              {/* Like button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleLike(item.id)
                }}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
              >
                <Heart className={`h-4 w-4 ${likedItems.has(item.id) ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
              </button>
            </div>
          ))}
        </div>
        
        {/* Lightbox */}
        {lightboxItem && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={() => setLightboxItem(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            
            {/* Navigation */}
            {currentIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); goToPrev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="h-8 w-8 text-white" />
              </button>
            )}
            {currentIndex < filteredItems.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goToNext() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="h-8 w-8 text-white" />
              </button>
            )}
            
            {/* Content */}
            <div 
              className="max-w-4xl w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              {/* Image */}
              <div className="bg-gray-900 rounded-2xl aspect-[4/3] flex items-center justify-center mb-6">
                <WaveformPreview item={lightboxItem} />
              </div>
              
              {/* Info */}
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{lightboxItem.title}</h3>
                    {lightboxItem.subtitle && (
                      <p className="text-gray-500">{lightboxItem.subtitle}</p>
                    )}
                    <span className="inline-block mt-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                      {lightboxItem.category}
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleLike(lightboxItem.id)}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${likedItems.has(lightboxItem.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                      {lightboxItem.likes + (likedItems.has(lightboxItem.id) ? 1 : 0)}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
                
                {/* Create similar CTA */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <Button className="w-full bg-rose-500 hover:bg-rose-600">
                    Create Similar Design
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
