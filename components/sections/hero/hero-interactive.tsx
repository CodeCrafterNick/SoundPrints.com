'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight, Volume2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

/**
 * Interactive Hero - Waveform responds to mouse movement
 */
export function HeroInteractive() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [bars, setBars] = useState<number[]>(Array.from({ length: 60 }, () => 0.3))
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      setMousePos({ x, y })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  useEffect(() => {
    const updateBars = () => {
      setBars(prev => prev.map((_, i) => {
        const normalizedI = i / prev.length
        const distance = Math.abs(normalizedI - mousePos.x)
        const influence = Math.max(0, 1 - distance * 3)
        const base = 0.2 + influence * 0.6
        const wave = Math.sin(Date.now() / 300 + i * 0.2) * 0.1
        return Math.min(1, Math.max(0.1, base + wave))
      }))
    }
    
    const interval = setInterval(updateBars, 50)
    return () => clearInterval(interval)
  }, [mousePos])
  
  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50"
    >
      {/* Interactive waveform background */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-end justify-center gap-1 h-64 px-4 opacity-20">
        {bars.map((height, i) => (
          <div
            key={i}
            className="flex-1 max-w-2 bg-gradient-to-t from-rose-500 to-amber-400 rounded-full transition-all duration-75 ease-out"
            style={{ height: `${height * 100}%` }}
          />
        ))}
      </div>
      
      {/* Cursor follower */}
      <div 
        className="absolute w-96 h-96 bg-rose-200/30 rounded-full blur-3xl pointer-events-none transition-all duration-300 ease-out"
        style={{
          left: `${mousePos.x * 100}%`,
          top: `${mousePos.y * 100}%`,
          transform: 'translate(-50%, -50%)'
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Sound indicator */}
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white shadow-lg border border-gray-100 mb-10">
            <div className="relative">
              <Volume2 className="h-5 w-5 text-rose-500" />
              <span className="absolute -right-1 -top-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700">Move your mouse to create waves</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-none tracking-tight">
            <span className="text-gray-900">Your Sound</span>
            <br />
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
              Your Story
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Experience sound in a whole new way. 
            Transform audio into interactive, personalized art that moves with meaning.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/create">
              <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-lg px-10 py-7 gap-2 shadow-xl shadow-rose-500/25 transition-all hover:scale-105">
                Create Your Art
                <Sparkles className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/gallery">
              <Button variant="outline" size="lg" className="text-lg px-10 py-7 gap-2 border-gray-300 hover:bg-gray-50">
                Explore Gallery
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          {/* Product types */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-4">
            {['Canvas', 'Framed Prints', 'Posters', 'Wall Clocks', 'Tapestries'].map((product, i) => (
              <span key={i} className="px-4 py-2 rounded-full bg-white shadow-sm border border-gray-100 text-sm text-gray-600">
                {product}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
