'use client'

import { Heart, Leaf, Sparkles, Shield, Users, Zap } from 'lucide-react'

const values = [
  {
    icon: Heart,
    title: 'Meaningful by Design',
    description: 'Every product we create is designed to capture and preserve the moments that matter most to our customers.',
    color: 'bg-rose-500',
  },
  {
    icon: Sparkles,
    title: 'Quality First',
    description: 'We use only premium materials and proven printing techniques to ensure your sound art lasts a lifetime.',
    color: 'bg-amber-500',
  },
  {
    icon: Leaf,
    title: 'Sustainably Crafted',
    description: 'From recycled packaging to eco-friendly inks, we\'re committed to minimizing our environmental footprint.',
    color: 'bg-emerald-500',
  },
  {
    icon: Shield,
    title: 'Customer Trust',
    description: 'Your audio files are processed securely and never shared. Your privacy and trust are our top priorities.',
    color: 'bg-cyan-500',
  },
  {
    icon: Users,
    title: 'Community Driven',
    description: 'We listen to our customers and continuously improve based on your feedback and suggestions.',
    color: 'bg-violet-500',
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'We\'re constantly developing new waveform styles, products, and features to better serve you.',
    color: 'bg-pink-500',
  },
]

export function ValuesCards() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The principles that guide everything we do at SoundPrints
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {values.map((value, index) => {
            const Icon = value.icon
            
            return (
              <div
                key={index}
                className="group relative bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                {/* Icon */}
                <div className={`w-14 h-14 ${value.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
                
                {/* Decorative corner */}
                <div className={`absolute top-0 right-0 w-24 h-24 ${value.color} opacity-5 rounded-bl-full`} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
