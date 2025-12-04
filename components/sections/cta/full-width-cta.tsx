'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function FullWidthCTA() {
  return (
    <section className="relative py-24 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {Array.from({ length: 100 }).map((_, i) => (
            <circle
              key={i}
              cx={Math.random() * 400}
              cy={Math.random() * 400}
              r={Math.random() * 3 + 1}
              className="fill-white"
            />
          ))}
        </svg>
      </div>
      
      {/* Animated waveform background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <svg viewBox="0 0 600 100" className="w-full max-w-4xl">
          {Array.from({ length: 100 }).map((_, i) => {
            const height = 10 + Math.sin(i * 0.2) * 30 + Math.random() * 10
            return (
              <rect
                key={i}
                x={i * 6}
                y={50 - height / 2}
                width="4"
                height={height}
                rx="2"
                className="fill-white"
              />
            )
          })}
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Create Your<br />Sound Print?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
            Turn your favorite song, voice recording, or any sound into a beautiful piece of art.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create">
              <Button size="lg" className="bg-white text-rose-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-xl gap-2">
                Start Creating
                <Sparkles className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/gallery">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8 py-6 gap-2">
                View Gallery
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
