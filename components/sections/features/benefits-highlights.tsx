'use client'

import { Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const benefits = [
  'Upload any audio file - songs, voice recordings, podcasts',
  '30+ unique waveform visualization styles',
  'Unlimited color customization with gradients',
  'Real-time preview as you design',
  'Multiple sizes from 8x10 to 24x36 inches',
  'Premium framing options included',
  'Museum-quality archival printing',
  'Add custom text and captions',
  'Free shipping on orders over $75',
  '30-day money-back guarantee'
]

export function BenefitsHighlights() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Benefits list */}
          <div>
            <p className="text-rose-500 font-medium mb-4">What You Get</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
              Premium Sound Art,<br />
              <span className="text-rose-500">Made Simple</span>
            </h2>
            
            <div className="space-y-4 mb-10">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-rose-600" />
                  </div>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
            
            <Link href="/create">
              <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-6 text-lg shadow-lg shadow-rose-500/25">
                Create Your Print Now
              </Button>
            </Link>
          </div>
          
          {/* Right: Visual showcase */}
          <div className="relative">
            {/* Main image */}
            <div className="relative bg-gray-900 rounded-3xl overflow-hidden aspect-square shadow-2xl">
              {/* Waveform visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-3/4 h-3/4">
                  {/* Circular waveform */}
                  {Array.from({ length: 60 }).map((_, i) => {
                    const angle = (i / 60) * Math.PI * 2
                    const baseRadius = 60
                    const variation = 15 + Math.sin(i * 0.5) * 10 + Math.random() * 8
                    const innerRadius = baseRadius - variation / 2
                    const outerRadius = baseRadius + variation / 2
                    const x1 = 100 + Math.cos(angle) * innerRadius
                    const y1 = 100 + Math.sin(angle) * innerRadius
                    const x2 = 100 + Math.cos(angle) * outerRadius
                    const y2 = 100 + Math.sin(angle) * outerRadius
                    return (
                      <line
                        key={i}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="url(#circularGradient)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        opacity={0.7 + Math.random() * 0.3}
                      />
                    )
                  })}
                  <defs>
                    <linearGradient id="circularGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              {/* Text overlay */}
              <div className="absolute bottom-6 left-6 right-6 text-center">
                <p className="text-white/70 text-sm">Our Song</p>
                <p className="text-white font-medium">The Moment We Met</p>
              </div>
            </div>
            
            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-2">
              <div className="flex -space-x-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-gray-900 font-bold">4.9</span>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-rose-500 text-white rounded-2xl shadow-xl px-6 py-3">
              <p className="font-bold text-lg">2,000+</p>
              <p className="text-rose-100 text-sm">Happy Customers</p>
            </div>
            
            {/* Background decoration */}
            <div className="absolute -z-10 -top-8 -right-8 w-full h-full bg-rose-200/50 rounded-3xl" />
            <div className="absolute -z-20 -top-16 -right-16 w-full h-full bg-rose-100/50 rounded-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
