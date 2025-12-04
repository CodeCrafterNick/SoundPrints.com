'use client'

import { Calendar, Clock, User, ArrowRight, Bookmark, Share2 } from 'lucide-react'

interface ArticleCardProps {
  variant?: 'default' | 'horizontal' | 'minimal' | 'featured'
  post: {
    id: number
    title: string
    excerpt: string
    category: string
    author: string
    publishedAt: string
    readTime: string
    slug: string
    colors: string[]
  }
}

export function ArticleCard({ variant = 'default', post }: ArticleCardProps) {
  if (variant === 'horizontal') {
    return (
      <article className="group flex gap-6 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
        {/* Thumbnail */}
        <div className="w-48 h-32 bg-gray-900 rounded-xl overflow-hidden flex-shrink-0">
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 60 24" className="w-3/4 h-1/2 group-hover:scale-110 transition-transform">
              <defs>
                <linearGradient id={`card-h-${post.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={post.colors[0]} />
                  <stop offset="100%" stopColor={post.colors[1]} />
                </linearGradient>
              </defs>
              {Array.from({ length: 30 }).map((_, i) => {
                const height = 3 + Math.sin(i * 0.3 + post.id) * 8
                return (
                  <rect
                    key={i}
                    x={i * 2}
                    y={12 - height / 2}
                    width="1.5"
                    height={height}
                    rx="0.75"
                    fill={`url(#card-h-${post.id})`}
                  />
                )
              })}
            </svg>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-rose-500 mb-1 block">{post.category}</span>
          <h3 className="font-bold text-gray-900 group-hover:text-rose-500 transition-colors mb-2 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>{post.author}</span>
            <span>{post.publishedAt}</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </article>
    )
  }
  
  if (variant === 'minimal') {
    return (
      <article className="group flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
        <div className="w-3 h-3 rounded-full mt-2" style={{ background: `linear-gradient(135deg, ${post.colors[0]}, ${post.colors[1]})` }} />
        <div className="flex-1 min-w-0">
          <a href={`/blog/${post.slug}`} className="font-medium text-gray-900 group-hover:text-rose-500 transition-colors line-clamp-2">
            {post.title}
          </a>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span>{post.publishedAt}</span>
            <span>{post.readTime}</span>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
      </article>
    )
  }
  
  if (variant === 'featured') {
    return (
      <article className="group relative bg-gray-900 rounded-2xl overflow-hidden">
        {/* Background waveform */}
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`card-f-${post.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={post.colors[0]} />
                <stop offset="100%" stopColor={post.colors[1]} />
              </linearGradient>
            </defs>
            {Array.from({ length: 100 }).map((_, i) => {
              const height = 10 + Math.sin(i * 0.15 + post.id) * 30
              return (
                <rect
                  key={i}
                  x={i * 2}
                  y={50 - height / 2}
                  width="1.5"
                  height={height}
                  rx="0.75"
                  fill={`url(#card-f-${post.id})`}
                />
              )
            })}
          </svg>
        </div>
        
        {/* Content overlay */}
        <div className="relative z-10 p-8 min-h-[300px] flex flex-col justify-end">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full w-fit mb-4">
            {post.category}
          </span>
          <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-rose-300 transition-colors">
            {post.title}
          </h3>
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{post.author}</span>
              <span>{post.readTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <Bookmark className="h-4 w-4 text-white" />
              </button>
              <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <Share2 className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </article>
    )
  }
  
  // Default variant
  return (
    <article className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 100 40" className="w-3/4 h-1/2 group-hover:scale-110 transition-transform duration-500">
            <defs>
              <linearGradient id={`card-d-${post.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={post.colors[0]} />
                <stop offset="100%" stopColor={post.colors[1]} />
              </linearGradient>
            </defs>
            {Array.from({ length: 50 }).map((_, i) => {
              const height = 5 + Math.sin(i * 0.2 + post.id) * 12
              return (
                <rect
                  key={i}
                  x={i * 2}
                  y={20 - height / 2}
                  width="1.5"
                  height={height}
                  rx="0.75"
                  fill={`url(#card-d-${post.id})`}
                />
              )
            })}
          </svg>
        </div>
        
        {/* Actions */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
            <Bookmark className="h-4 w-4 text-gray-600" />
          </button>
          <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
            <Share2 className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        
        {/* Category */}
        <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
          {post.category}
        </span>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-rose-500 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {post.excerpt}
        </p>
        
        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            <span>{post.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{post.publishedAt}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{post.readTime}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

// Demo component showing all variants
export function ArticleCardShowcase() {
  const samplePost = {
    id: 1,
    title: 'The Art of Sound Visualization',
    excerpt: 'Discover how sound waves become stunning visual art through our unique process.',
    category: 'Behind the Scenes',
    author: 'Sarah Chen',
    publishedAt: 'Dec 15, 2024',
    readTime: '5 min',
    slug: 'art-of-sound-visualization',
    colors: ['#f43f5e', '#fbbf24'],
  }
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Article Card Variants</h2>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">Default</h3>
            <ArticleCard post={samplePost} variant="default" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">Featured</h3>
            <ArticleCard post={samplePost} variant="featured" />
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Horizontal</h3>
          <ArticleCard post={samplePost} variant="horizontal" />
        </div>
        
        <div className="bg-white rounded-2xl p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Minimal List</h3>
          <ArticleCard post={samplePost} variant="minimal" />
          <ArticleCard post={{ ...samplePost, id: 2, colors: ['#06b6d4', '#8b5cf6'] }} variant="minimal" />
          <ArticleCard post={{ ...samplePost, id: 3, colors: ['#10b981', '#3b82f6'] }} variant="minimal" />
        </div>
      </div>
    </section>
  )
}
