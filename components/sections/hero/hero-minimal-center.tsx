'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight, Star, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

/**
 * Hero Minimal Center - Clean, centered layout with animated waveform
 */
export function HeroMinimalCenter() {
  const [bars, setBars] = useState<number[]>([])
  
  useEffect(() => {
    // Initialize bars
    setBars(Array.from({ length: 50 }, () => Math.random()))
    
    // Animate bars
    const interval = setInterval(() => {
      setBars(prev => prev.map((_, i) => {
        const base = Math.sin(Date.now() / 500 + i * 0.2) * 0.3 + 0.5
        return base + Math.random() * 0.2
      }))
    }, 100)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-950">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Floating waveform background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="flex items-end justify-center gap-1 h-64 w-full max-w-4xl">
          {bars.map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-white rounded-full transition-all duration-100"
              style={{ height: `${height * 100}%` }}
            />
          ))}
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm font-medium mb-8 border border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            New: AI-Powered Style Recommendations
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-none">
            <span className="text-white">Sound.</span>
            <br />
            <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
              Visualized.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform audio memories into museum-quality art. 
            From voice messages to wedding songs—create timeless pieces in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/create">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-10 py-7 gap-2 shadow-2xl shadow-white/20">
                Start Creating Free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/gallery">
              <Button variant="outline" size="lg" className="text-white border-white/20 hover:bg-white/10 text-lg px-10 py-7 gap-2">
                Browse Gallery
              </Button>
            </Link>
          </div>
          
          {/* Features row */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            {['No design skills needed', 'Free preview', 'Ships worldwide'].map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          
          {/* Social proof */}
          <div className="mt-16 pt-16 border-t border-white/10">
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-gray-400">
                <span className="text-white font-semibold">4.9/5</span> from 2,000+ reviews
              </p>
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-amber-400 border-2 border-gray-950" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
