'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowRight, Star, Quote } from 'lucide-react'

/**
 * Hero with integrated testimonial
 */
export function HeroWithTestimonial() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, #f1f5f9 1px, transparent 0)',
        backgroundSize: '32px 32px'
      }} />
      
      <div className="container mx-auto px-4 py-24 md:py-32 relative">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Main content - 7 cols */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-600 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Transform Sound Into Art
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
              Create Meaningful
              <span className="block bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">
                Art From Audio
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
              Turn your most treasured sounds into stunning wall art. 
              Wedding songs, baby's first words, voice messages from loved ones—
              preserved as beautiful visual art forever.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/create">
                <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-lg px-8 py-6 gap-2">
                  Create Your SoundPrint
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/gallery">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 border-gray-300">
                  See Examples
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-200">
              <div>
                <p className="text-3xl font-bold text-gray-900">10,000+</p>
                <p className="text-sm text-gray-500">Happy Customers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">35+</p>
                <p className="text-sm text-gray-500">Art Styles</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">4.9/5</p>
                <p className="text-sm text-gray-500">Average Rating</p>
              </div>
            </div>
          </div>
          
          {/* Testimonial card - 5 cols */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Main testimonial card */}
              <div className="bg-gray-900 rounded-3xl p-8 text-white relative z-10">
                <Quote className="h-10 w-10 text-rose-400 mb-6" />
                
                <p className="text-xl leading-relaxed mb-8">
                  "I turned my grandmother's last voicemail into a canvas print. 
                  Every time I look at it, I hear her voice. This is more than art—
                  it's a piece of her I'll treasure forever."
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-400 to-amber-400" />
                  <div>
                    <p className="font-semibold text-lg">Sarah Mitchell</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Product preview */}
                <div className="mt-8 pt-8 border-t border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden">
                      <div className="w-full h-full flex items-end justify-center gap-0.5 p-2">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-rose-400 rounded-t"
                            style={{ height: `${30 + Math.random() * 60}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Purchased</p>
                      <p className="font-medium">Framed Canvas 24×36</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-rose-100 rounded-2xl -z-10" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-amber-100 rounded-2xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
