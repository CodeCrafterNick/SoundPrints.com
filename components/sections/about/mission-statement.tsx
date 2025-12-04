'use client'

import { Button } from '@/components/ui/button'

export function MissionStatement() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background waveform pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1200 400" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mission-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
          {Array.from({ length: 120 }).map((_, i) => {
            const height = 50 + Math.sin(i * 0.1) * 100 + Math.random() * 30
            return (
              <rect
                key={i}
                x={i * 10}
                y={200 - height / 2}
                width="6"
                height={height}
                rx="3"
                fill="url(#mission-grad)"
              />
            )
          })}
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Label */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
            <span className="text-rose-400 text-sm font-medium">Our Mission</span>
          </div>
          
          {/* Main statement */}
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-8">
            To transform the sounds that move you into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">
              timeless visual art
            </span>{' '}
            that tells your story.
          </h2>
          
          {/* Supporting text */}
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            We believe every sound holds a story worth preserving. Whether it&apos;s the song 
            from your first dance, your baby&apos;s first words, or a loved one&apos;s voice, 
            we&apos;re here to help you see the beauty in sound.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mb-12 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">100K+</div>
              <div className="text-gray-500 text-sm">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">50+</div>
              <div className="text-gray-500 text-sm">Countries Served</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">4.9★</div>
              <div className="text-gray-500 text-sm">Average Rating</div>
            </div>
          </div>
          
          {/* CTA */}
          <Button size="lg" className="bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white border-0">
            Create Your SoundPrint
          </Button>
        </div>
      </div>
    </section>
  )
}
