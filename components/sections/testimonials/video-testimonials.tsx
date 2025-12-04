'use client'

import { useState } from 'react'
import { Star, Play, X } from 'lucide-react'

const videoTestimonials = [
  {
    id: 1,
    thumbnail: 'wedding',
    title: 'Our Wedding Story',
    author: 'Sarah & Mike',
    duration: '2:34',
    description: 'How we turned our first dance song into wall art',
    rating: 5
  },
  {
    id: 2,
    thumbnail: 'baby',
    title: "Baby's First Words",
    author: 'The Johnson Family',
    duration: '1:45',
    description: 'Preserving our daughter\'s first words forever',
    rating: 5
  },
  {
    id: 3,
    thumbnail: 'memorial',
    title: 'A Voice to Remember',
    author: 'Amanda L.',
    duration: '3:12',
    description: 'Creating a memorial print of my grandmother',
    rating: 5
  },
  {
    id: 4,
    thumbnail: 'gift',
    title: 'The Perfect Gift',
    author: 'Chris D.',
    duration: '1:58',
    description: 'Surprising my parents for their anniversary',
    rating: 5
  }
]

export function VideoTestimonials() {
  const [activeVideo, setActiveVideo] = useState<number | null>(null)
  
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-rose-500 font-medium mb-4">Customer Stories</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Watch Their Stories
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hear directly from our customers about their SoundPrints experience.
          </p>
        </div>
        
        {/* Video grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {videoTestimonials.map((video) => (
            <div 
              key={video.id}
              className="group cursor-pointer"
              onClick={() => setActiveVideo(video.id)}
            >
              {/* Thumbnail */}
              <div className="relative aspect-[9/16] bg-gray-900 rounded-2xl overflow-hidden mb-4">
                {/* Placeholder visual */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 150" className="w-full h-full p-8 opacity-60">
                    {Array.from({ length: 40 }).map((_, i) => {
                      const height = 5 + Math.sin(i * 0.3 + video.id) * 20
                      return (
                        <rect
                          key={i}
                          x={i * 2.5}
                          y={75 - height / 2}
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
                
                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <Play className="h-8 w-8 text-rose-500 ml-1" />
                  </div>
                </div>
                
                {/* Duration badge */}
                <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded text-xs text-white">
                  {video.duration}
                </div>
              </div>
              
              {/* Info */}
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-rose-500 transition-colors">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-500">{video.author}</p>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: video.rating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Video modal */}
        {activeVideo && (
          <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setActiveVideo(null)}
          >
            <div 
              className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              
              {/* Video placeholder - in production this would be an actual video player */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <Play className="h-10 w-10 text-white ml-1" />
                  </div>
                  <p className="text-white/60">Video player placeholder</p>
                  <p className="text-white/40 text-sm mt-1">
                    {videoTestimonials.find(v => v.id === activeVideo)?.title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
