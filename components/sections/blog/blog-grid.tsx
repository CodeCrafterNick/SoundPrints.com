'use client'

import { useState } from 'react'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

interface BlogPost {
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

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: '10 Creative Ways to Display Your Sound Art',
    excerpt: 'Transform your space with these inspiring ideas for showcasing your personalized sound prints.',
    category: 'Ideas & Inspiration',
    author: 'Emily Rodriguez',
    publishedAt: 'Dec 12, 2024',
    readTime: '5 min',
    slug: 'creative-ways-display-sound-art',
    colors: ['#f43f5e', '#fbbf24'],
  },
  {
    id: 2,
    title: 'Wedding Sound Art: A Guide for Couples',
    excerpt: 'How to capture your special day through beautiful waveform art of your vows and first dance.',
    category: 'Wedding',
    author: 'Sarah Chen',
    publishedAt: 'Dec 10, 2024',
    readTime: '7 min',
    slug: 'wedding-sound-art-guide',
    colors: ['#ec4899', '#f97316'],
  },
  {
    id: 3,
    title: 'Preserving Baby Sounds: A Parents Guide',
    excerpt: 'Tips for capturing and preserving those precious first sounds from heartbeats to first words.',
    category: 'Baby & Family',
    author: 'Lisa Thompson',
    publishedAt: 'Dec 8, 2024',
    readTime: '6 min',
    slug: 'preserving-baby-sounds',
    colors: ['#06b6d4', '#8b5cf6'],
  },
  {
    id: 4,
    title: 'The Best Audio Quality for Sound Prints',
    excerpt: 'Technical tips for getting the best waveform visualization from your audio files.',
    category: 'Tips & Tricks',
    author: 'Marcus Johnson',
    publishedAt: 'Dec 5, 2024',
    readTime: '4 min',
    slug: 'best-audio-quality',
    colors: ['#10b981', '#3b82f6'],
  },
  {
    id: 5,
    title: 'Memorial Sound Art: Honoring Loved Ones',
    excerpt: 'How families are using sound prints to preserve and celebrate cherished memories.',
    category: 'Stories',
    author: 'Sarah Chen',
    publishedAt: 'Dec 3, 2024',
    readTime: '8 min',
    slug: 'memorial-sound-art',
    colors: ['#6366f1', '#a855f7'],
  },
  {
    id: 6,
    title: 'Podcast Art: Visualizing Your Show',
    excerpt: 'Create stunning artwork from your podcast episodes with our specialized waveform styles.',
    category: 'Podcast',
    author: 'Alex Patel',
    publishedAt: 'Dec 1, 2024',
    readTime: '5 min',
    slug: 'podcast-art-visualization',
    colors: ['#f97316', '#ec4899'],
  },
]

const categories = ['All', 'Ideas & Inspiration', 'Wedding', 'Baby & Family', 'Tips & Tricks', 'Stories', 'Podcast']

export function BlogGrid() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory)
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-rose-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Posts grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map(post => (
            <article
              key={post.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-900 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 40" className="w-3/4 h-1/2 group-hover:scale-110 transition-transform duration-500">
                    <defs>
                      <linearGradient id={`blog-grad-${post.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
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
                          fill={`url(#blog-grad-${post.id})`}
                        />
                      )
                    })}
                  </svg>
                </div>
                
                {/* Category badge */}
                <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
                  {post.category}
                </span>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-rose-500 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                
                {/* Meta */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{post.author}</span>
                  <div className="flex items-center gap-3 text-gray-400">
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
              </div>
            </article>
          ))}
        </div>
        
        {/* Load more */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            Load More Articles
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
