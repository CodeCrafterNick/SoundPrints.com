'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight, Play, Star } from 'lucide-react'

/**
 * Hero Split Layout - Preview on right side with content on left
 */
export function HeroSplit() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-rose-50 -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-700 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              #1 Sound Art Platform
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
              Turn Your
              <span className="block text-rose-500">Favorite Sound</span>
              Into Wall Art
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              Transform any audio into a stunning visual masterpiece. 
              Wedding songs, voice messages, podcasts—create art that tells your story.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/create">
                <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-lg px-8 py-6 gap-2 shadow-lg shadow-rose-500/30">
                  Create Your Art
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 gap-2 border-gray-300">
                <Play className="h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 text-sm text-gray-600">4.9/5 (2,000+ reviews)</span>
              </div>
            </div>
          </div>
          
          {/* Right Preview */}
          <div className="relative">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Decorative frame */}
              <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl transform rotate-3" />
              <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-amber-50 rounded-3xl shadow-xl" />
              
              {/* Preview content */}
              <div className="relative rounded-3xl overflow-hidden bg-white shadow-lg p-6">
                <div className="aspect-square bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center">
                  {/* Waveform visualization */}
                  <div className="flex items-end justify-center gap-1 h-32 w-64">
                    {Array.from({ length: 40 }).map((_, i) => {
                      const height = Math.sin(i * 0.3) * 40 + Math.random() * 30 + 20
                      return (
                        <div
                          key={i}
                          className="w-1.5 bg-gradient-to-t from-rose-500 to-amber-400 rounded-full"
                          style={{ height: `${height}%` }}
                        />
                      )
                    })}
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-lg font-semibold text-gray-900">Our Song</p>
                  <p className="text-sm text-gray-500">John & Sarah • June 15, 2024</p>
                </div>
              </div>
              
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg px-4 py-2 text-sm font-medium text-gray-900">
                ✨ Premium Canvas
              </div>
              <div className="absolute -bottom-4 -left-4 bg-rose-500 text-white rounded-xl shadow-lg px-4 py-2 text-sm font-medium">
                Starting at $29
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
