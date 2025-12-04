'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight, Play, Pause, Volume2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

/**
 * Video Background Hero with ambient sound visualization
 */
export function HeroVideoBackground() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [bars, setBars] = useState<number[]>(Array.from({ length: 30 }, () => 0.5))
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setBars(prev => prev.map((_, i) => {
          const time = Date.now() / 500
          return 0.2 + Math.sin(time + i * 0.3) * 0.3 + Math.random() * 0.3
        }))
      }
    }, 100)
    return () => clearInterval(interval)
  }, [isPlaying])
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video background - simulated with gradient animation */}
      <div className="absolute inset-0 bg-gray-900">
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(244, 63, 94, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(251, 191, 36, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 50% 80%, rgba(34, 211, 238, 0.2) 0%, transparent 50%)
            `,
            animation: 'pulse 8s ease-in-out infinite'
          }}
        />
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900/60" />
      
      {/* Animated waveform at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center gap-1 px-4">
        {bars.map((height, i) => (
          <div
            key={i}
            className="flex-1 max-w-3 bg-gradient-to-t from-rose-500/80 to-amber-400/60 rounded-t-sm transition-all duration-100"
            style={{ height: `${height * 100}%` }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Play/Pause control */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-10 hover:bg-white/20 transition-colors"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="text-sm">{isPlaying ? 'Pause Visualization' : 'Play Visualization'}</span>
          </button>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-none">
            <span className="block">See Your</span>
            <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              Music
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Every beat. Every note. Every moment of silence. 
            Captured in stunning visual art you can hang on your wall.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/create">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-10 py-7 gap-2 shadow-2xl">
                Start Creating
                <Sparkles className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10 text-lg px-10 py-7 gap-2">
              <Volume2 className="h-5 w-5" />
              How It Works
            </Button>
          </div>
          
          {/* Feature highlights */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { value: '30+', label: 'Art Styles' },
              { value: '5min', label: 'To Create' },
              { value: '∞', label: 'Memories' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/60 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}
