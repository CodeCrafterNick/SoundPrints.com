'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, Play, Star, Quote } from 'lucide-react'
import { useState, useEffect } from 'react'

const testimonials = [
  {
    text: "I gave this to my husband for our anniversary. He teared up when he saw our wedding song visualized.",
    author: "Sarah M.",
    product: "Wedding Song Print"
  },
  {
    text: "My daughter's first words are now hanging in our living room. Such a unique way to preserve memories.",
    author: "Michael R.",
    product: "Voice Recording Print"
  },
  {
    text: "Got one for my mom with her favorite song. She said it's the most thoughtful gift she's ever received.",
    author: "Emily K.",
    product: "Custom Song Print"
  }
]

/**
 * Carousel Hero with rotating testimonials and product showcase
 */
export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [waveProgress, setWaveProgress] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length)
      setWaveProgress(0)
    }, 5000)
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveProgress(prev => Math.min(prev + 2, 100))
    }, 100)
    return () => clearInterval(interval)
  }, [currentIndex])
  
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-rose-50 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, #f3f4f6 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }} />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left: Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-700 mb-8">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-medium">4.9/5 from 2,000+ customers</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Turn Sound Into
              <br />
              <span className="text-rose-500">Beautiful Art</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-lg">
              Create stunning wall art from any song, voice recording, or sound. 
              A unique gift that captures your most precious moments.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-16">
              <Link href="/create">
                <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white text-lg px-8 py-6 shadow-lg shadow-rose-500/25 gap-2">
                  <Sparkles className="h-5 w-5" />
                  Create Your Print
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 gap-2 border-gray-300">
                <Play className="h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            
            {/* Progress indicator */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <div key={i} className="h-1 w-16 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-100"
                    style={{ 
                      width: i === currentIndex ? `${waveProgress}%` : i < currentIndex ? '100%' : '0%' 
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Right: Testimonial carousel + Product */}
          <div className="relative">
            {/* Product mockup */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 mb-8">
              <div className="aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden relative">
                {/* Animated waveform */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 200 100" className="w-3/4 h-1/2">
                    {Array.from({ length: 40 }).map((_, i) => {
                      const height = 10 + Math.sin(i * 0.3 + currentIndex) * 35 + Math.random() * 5
                      return (
                        <rect
                          key={i}
                          x={i * 5}
                          y={50 - height / 2}
                          width="3"
                          height={height}
                          rx="1.5"
                          className="fill-rose-500"
                          style={{
                            opacity: 0.6 + Math.random() * 0.4
                          }}
                        />
                      )
                    })}
                  </svg>
                </div>
                {/* Song title */}
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-white/80 text-sm">Our Song</p>
                  <p className="text-white font-medium">First Dance • Wedding Day</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 transition-all duration-500">
              <Quote className="h-8 w-8 text-rose-200 mb-4" />
              <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                &ldquo;{testimonials[currentIndex].text}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{testimonials[currentIndex].author}</p>
                  <p className="text-sm text-gray-500">{testimonials[currentIndex].product}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-rose-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              Bestseller
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
