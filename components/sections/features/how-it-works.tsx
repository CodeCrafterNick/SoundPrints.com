'use client'

import { Upload, Wand2, Palette, Truck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const steps = [
  {
    icon: Upload,
    title: 'Upload Your Sound',
    description: 'Upload any song, voice recording, or audio file. We support MP3, WAV, and most audio formats.',
    color: 'rose'
  },
  {
    icon: Wand2,
    title: 'Choose Your Style',
    description: 'Pick from 30+ unique waveform visualizations. From classic bars to artistic interpretations.',
    color: 'amber'
  },
  {
    icon: Palette,
    title: 'Customize Everything',
    description: 'Choose colors, add text, select your size and frame. See your design come to life in real-time.',
    color: 'cyan'
  },
  {
    icon: Truck,
    title: 'We Print & Ship',
    description: 'Museum-quality prints made on demand. Carefully packaged and shipped to your door.',
    color: 'emerald'
  }
]

const colorVariants = {
  rose: {
    bg: 'bg-rose-100',
    text: 'text-rose-600',
    border: 'border-rose-200'
  },
  amber: {
    bg: 'bg-amber-100',
    text: 'text-amber-600',
    border: 'border-amber-200'
  },
  cyan: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-600',
    border: 'border-cyan-200'
  },
  emerald: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-600',
    border: 'border-emerald-200'
  }
}

export function HowItWorks() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-rose-500 font-medium mb-4">Simple Process</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create your personalized sound art in just a few minutes. 
            No design skills required.
          </p>
        </div>
        
        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connection line */}
          <div className="hidden md:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-gray-200" />
          
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, i) => {
              const colors = colorVariants[step.color as keyof typeof colorVariants]
              const Icon = step.icon
              return (
                <div key={i} className="relative text-center">
                  {/* Step number */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center z-10">
                    {i + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl ${colors.bg} flex items-center justify-center relative z-10`}>
                    <Icon className={`h-10 w-10 ${colors.text}`} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  
                  {/* Arrow (except last) */}
                  {i < steps.length - 1 && (
                    <ArrowRight className="hidden md:block absolute top-20 -right-4 h-8 w-8 text-gray-300" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
        
        {/* CTA */}
        <div className="text-center mt-16">
          <Link href="/create">
            <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-6 text-lg shadow-lg shadow-rose-500/25">
              Start Creating Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
