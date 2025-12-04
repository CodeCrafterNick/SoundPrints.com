'use client'

import { Check, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const comparisons = [
  {
    feature: 'Custom waveform styles',
    us: '30+ unique styles',
    others: 'Limited options'
  },
  {
    feature: 'Color customization',
    us: 'Unlimited colors & gradients',
    others: 'Pre-set colors only'
  },
  {
    feature: 'Real-time preview',
    us: true,
    others: false
  },
  {
    feature: 'Audio format support',
    us: 'MP3, WAV, M4A, & more',
    others: 'MP3 only'
  },
  {
    feature: 'Print quality',
    us: 'Museum-grade archival',
    others: 'Standard printing'
  },
  {
    feature: 'Custom text & captions',
    us: true,
    others: 'Limited'
  },
  {
    feature: 'Frame options',
    us: '6+ premium frames',
    others: '2-3 basic frames'
  },
  {
    feature: 'Size options',
    us: '8 sizes available',
    others: '3-4 sizes'
  },
  {
    feature: 'Room visualization',
    us: true,
    others: false
  },
  {
    feature: 'Satisfaction guarantee',
    us: '30 days',
    others: 'Varies'
  }
]

export function ComparisonSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-rose-500 font-medium mb-4">Why SoundPrints</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Not All Sound Art Is<br />
            <span className="text-rose-500">Created Equal</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See how we stack up against other sound art services.
          </p>
        </div>
        
        {/* Comparison table */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header row */}
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
              <div className="p-6">
                <span className="text-gray-500 font-medium">Feature</span>
              </div>
              <div className="p-6 bg-rose-50 border-x border-rose-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-rose-500" />
                  <span className="font-bold text-gray-900">SoundPrints</span>
                </div>
              </div>
              <div className="p-6">
                <span className="text-gray-500 font-medium">Others</span>
              </div>
            </div>
            
            {/* Comparison rows */}
            {comparisons.map((item, i) => (
              <div 
                key={i} 
                className={`grid grid-cols-3 ${i !== comparisons.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="p-5 flex items-center">
                  <span className="text-gray-700">{item.feature}</span>
                </div>
                <div className="p-5 bg-rose-50/50 border-x border-rose-100/50 flex items-center">
                  {typeof item.us === 'boolean' ? (
                    item.us ? (
                      <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                        <X className="h-4 w-4 text-gray-400" />
                      </div>
                    )
                  ) : (
                    <span className="font-medium text-gray-900">{item.us}</span>
                  )}
                </div>
                <div className="p-5 flex items-center">
                  {typeof item.others === 'boolean' ? (
                    item.others ? (
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                        <X className="h-4 w-4 text-gray-400" />
                      </div>
                    )
                  ) : (
                    <span className="text-gray-500">{item.others}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* CTA */}
          <div className="text-center mt-12">
            <Link href="/create">
              <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-6 text-lg shadow-lg shadow-rose-500/25">
                Experience the Difference
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
