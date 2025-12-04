'use client'

import { Instagram, Heart, MessageCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface InstagramPost {
  id: number
  likes: number
  comments: number
  colors: string[]
  caption?: string
}

const posts: InstagramPost[] = [
  { id: 1, likes: 1234, comments: 45, colors: ['#f43f5e', '#fbbf24'], caption: 'Our wedding song ❤️' },
  { id: 2, likes: 987, comments: 32, colors: ['#06b6d4', '#8b5cf6'], caption: "Baby's first heartbeat 💙" },
  { id: 3, likes: 2156, comments: 89, colors: ['#10b981', '#3b82f6'], caption: 'Perfect anniversary gift!' },
  { id: 4, likes: 876, comments: 28, colors: ['#f97316', '#ec4899'], caption: 'Mom loved it 💕' },
  { id: 5, likes: 1543, comments: 67, colors: ['#6366f1', '#a855f7'], caption: 'Memorial piece for grandma' },
  { id: 6, likes: 2341, comments: 94, colors: ['#14b8a6', '#f43f5e'], caption: 'First dance memories' },
  { id: 7, likes: 765, comments: 23, colors: ['#ec4899', '#fbbf24'], caption: 'Podcast art 🎙️' },
  { id: 8, likes: 1876, comments: 56, colors: ['#8b5cf6', '#06b6d4'], caption: 'Best gift ever received' },
]

export function InstagramFeed() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-4 py-2 rounded-full mb-4">
            <Instagram className="h-5 w-5" />
            <span className="font-medium">@soundprints</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Share Your Sound</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tag us in your photos for a chance to be featured
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group relative aspect-square bg-gray-900 rounded-xl overflow-hidden cursor-pointer"
            >
              {/* Waveform preview */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 60 30" className="w-3/4 h-1/3">
                  <defs>
                    <linearGradient id={`ig-grad-${post.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={post.colors[0]} />
                      <stop offset="100%" stopColor={post.colors[1]} />
                    </linearGradient>
                  </defs>
                  {Array.from({ length: 30 }).map((_, i) => {
                    const height = 3 + Math.sin(i * 0.3 + post.id) * 10
                    return (
                      <rect
                        key={i}
                        x={i * 2}
                        y={15 - height / 2}
                        width="1.5"
                        height={height}
                        rx="0.75"
                        fill={`url(#ig-grad-${post.id})`}
                      />
                    )
                  })}
                </svg>
              </div>
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                <div className="flex items-center gap-4 text-white mb-2">
                  <div className="flex items-center gap-1">
                    <Heart className="h-5 w-5 fill-white" />
                    <span className="font-medium">{post.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-5 w-5 fill-white" />
                    <span className="font-medium">{post.comments}</span>
                  </div>
                </div>
                {post.caption && (
                  <p className="text-white/80 text-sm text-center px-4 line-clamp-2">
                    {post.caption}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button variant="outline" className="gap-2">
            <Instagram className="h-4 w-4" />
            Follow @soundprints
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
