'use client'

import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FeaturedPost {
  title: string
  excerpt: string
  category: string
  author: {
    name: string
    avatar?: string
  }
  publishedAt: string
  readTime: string
  slug: string
  colors: string[]
}

const featuredPost: FeaturedPost = {
  title: 'The Science Behind Sound Waves: How Audio Becomes Art',
  excerpt: 'Discover the fascinating physics of sound waves and how we transform invisible vibrations into stunning visual representations that capture the unique patterns of your favorite audio.',
  category: 'Behind the Scenes',
  author: {
    name: 'Sarah Chen',
  },
  publishedAt: 'December 15, 2024',
  readTime: '8 min read',
  slug: 'science-behind-sound-waves',
  colors: ['#f43f5e', '#fbbf24'],
}

export function FeaturedPostHero() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image/Preview */}
          <div className="relative">
            <div className="aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 200 80" className="w-3/4 h-1/2">
                  <defs>
                    <linearGradient id="featured-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={featuredPost.colors[0]} />
                      <stop offset="100%" stopColor={featuredPost.colors[1]} />
                    </linearGradient>
                  </defs>
                  {Array.from({ length: 100 }).map((_, i) => {
                    const height = 10 + Math.sin(i * 0.15) * 25 + Math.sin(i * 0.3) * 10
                    return (
                      <rect
                        key={i}
                        x={i * 2}
                        y={40 - height / 2}
                        width="1.5"
                        height={height}
                        rx="0.75"
                        fill="url(#featured-grad)"
                      />
                    )
                  })}
                </svg>
              </div>
            </div>
            
            {/* Category badge */}
            <div className="absolute top-4 left-4">
              <span className="px-4 py-2 bg-rose-500 text-white text-sm font-medium rounded-full">
                Featured
              </span>
            </div>
          </div>
          
          {/* Content */}
          <div>
            <span className="inline-block px-3 py-1 bg-rose-100 text-rose-600 text-sm font-medium rounded-full mb-4">
              {featuredPost.category}
            </span>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {featuredPost.title}
            </h1>
            
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              {featuredPost.excerpt}
            </p>
            
            {/* Meta */}
            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-amber-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {featuredPost.author.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <span className="text-gray-700 font-medium">{featuredPost.author.name}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{featuredPost.publishedAt}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <Clock className="h-4 w-4" />
                <span>{featuredPost.readTime}</span>
              </div>
            </div>
            
            <Button className="bg-rose-500 hover:bg-rose-600">
              Read Article
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
