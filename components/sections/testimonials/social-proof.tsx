'use client'

import { Star, ShieldCheck, Award, Heart, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const trustBadges = [
  { icon: ShieldCheck, label: '100% Satisfaction', sublabel: '30-day guarantee' },
  { icon: Award, label: 'Premium Quality', sublabel: 'Museum-grade prints' },
  { icon: Users, label: '2,000+ Customers', sublabel: 'And counting' },
  { icon: Heart, label: 'Made with Love', sublabel: 'Handcrafted in USA' }
]

const reviews = [
  { platform: 'Google', rating: 4.9, count: 847 },
  { platform: 'Trustpilot', rating: 4.8, count: 523 },
  { platform: 'Facebook', rating: 5.0, count: 312 }
]

export function SocialProof() {
  return (
    <section className="py-24 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-rose-400 font-medium mb-4">Trusted & Loved</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Join Our Happy Customers
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Thousands of customers trust SoundPrints to turn their precious moments into beautiful art.
          </p>
        </div>
        
        {/* Rating platforms */}
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          {reviews.map((review, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center min-w-[180px]">
              <p className="text-lg font-semibold text-white mb-2">{review.platform}</p>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="text-2xl font-bold text-white">{review.rating}</span>
              </div>
              <p className="text-sm text-gray-400">{review.count} reviews</p>
            </div>
          ))}
        </div>
        
        {/* Trust badges */}
        <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
          {trustBadges.map((badge, i) => {
            const Icon = badge.icon
            return (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <Icon className="h-8 w-8 text-rose-400" />
                </div>
                <p className="font-semibold text-white">{badge.label}</p>
                <p className="text-sm text-gray-400">{badge.sublabel}</p>
              </div>
            )
          })}
        </div>
        
        {/* Featured testimonial snippet */}
        <div className="max-w-3xl mx-auto bg-white/5 rounded-2xl p-8 text-center mb-12">
          <div className="flex justify-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <p className="text-xl text-gray-300 leading-relaxed mb-6">
            &ldquo;The quality is outstanding and the customer service team went above and beyond to help me create the perfect gift. Highly recommend!&rdquo;
          </p>
          <p className="text-white font-semibold">— Jennifer M., Verified Buyer</p>
        </div>
        
        {/* CTA */}
        <div className="text-center">
          <Link href="/create">
            <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-6 text-lg">
              Create Your Print Now
            </Button>
          </Link>
          <p className="text-gray-400 mt-4 text-sm">Join 2,000+ happy customers</p>
        </div>
      </div>
    </section>
  )
}
