'use client'

import { useState } from 'react'
import { Check, Gift, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Bundle {
  id: string
  title: string
  description: string
  originalPrice: number
  bundlePrice: number
  items: string[]
  savings: number
  popular?: boolean
  colors: string[]
}

const bundles: Bundle[] = [
  {
    id: 'wedding',
    title: 'Wedding Complete Bundle',
    description: 'Everything you need to capture your special day',
    originalPrice: 199,
    bundlePrice: 149,
    savings: 50,
    popular: true,
    items: [
      'First Dance Canvas (Large)',
      'Vows Matching Pair',
      'Wedding Date Mini Print',
      'Gift Wrapping & Box',
    ],
    colors: ['#f43f5e', '#fbbf24'],
  },
  {
    id: 'baby',
    title: 'New Baby Bundle',
    description: 'Preserve those precious first moments',
    originalPrice: 149,
    bundlePrice: 109,
    savings: 40,
    items: [
      'Heartbeat Ultrasound Print',
      'First Words Frame',
      'Baby Laughter Mini Print',
      'Memory Box',
    ],
    colors: ['#06b6d4', '#8b5cf6'],
  },
  {
    id: 'anniversary',
    title: 'Anniversary Bundle',
    description: 'Celebrate years of love together',
    originalPrice: 169,
    bundlePrice: 129,
    savings: 40,
    items: [
      'Your Song Canvas (Medium)',
      'Date & Location Print',
      'Matching Mini Prints x2',
    ],
    colors: ['#ec4899', '#f97316'],
  },
  {
    id: 'memorial',
    title: 'Memorial Keepsake Bundle',
    description: 'Honor and remember loved ones',
    originalPrice: 179,
    bundlePrice: 139,
    savings: 40,
    items: [
      'Voice Message Canvas',
      'Favorite Song Print',
      'Mini Memory Frame',
      'Keepsake Box',
    ],
    colors: ['#10b981', '#6366f1'],
  },
]

export function GiftBundles() {
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null)
  
  return (
    <section className="py-16 bg-gradient-to-b from-white to-rose-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Save up to 25%</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Curated Gift Bundles</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hand-picked collections for every occasion. Save more when you bundle!
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bundles.map((bundle) => (
            <div
              key={bundle.id}
              className={`relative bg-white rounded-2xl overflow-hidden transition-all ${
                selectedBundle === bundle.id
                  ? 'ring-2 ring-rose-500 shadow-xl'
                  : 'shadow-sm border border-gray-100 hover:shadow-lg'
              }`}
            >
              {bundle.popular && (
                <div className="absolute top-0 right-0 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}
              
              {/* Preview */}
              <div className="aspect-[4/3] bg-gray-900 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 50" className="w-2/3 h-1/3">
                    <defs>
                      <linearGradient id={`bgrad-${bundle.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={bundle.colors[0]} />
                        <stop offset="100%" stopColor={bundle.colors[1]} />
                      </linearGradient>
                    </defs>
                    {Array.from({ length: 35 }).map((_, i) => {
                      const height = 5 + Math.sin(i * 0.4) * 18
                      return (
                        <rect
                          key={i}
                          x={i * 2.85}
                          y={25 - height / 2}
                          width="2"
                          height={height}
                          rx="1"
                          fill={`url(#bgrad-${bundle.id})`}
                        />
                      )
                    })}
                  </svg>
                </div>
                
                {/* Savings badge */}
                <div className="absolute bottom-3 left-3 bg-white rounded-full px-3 py-1">
                  <span className="text-sm font-bold text-rose-500">Save ${bundle.savings}</span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{bundle.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{bundle.description}</p>
                
                {/* Items list */}
                <ul className="space-y-2 mb-6">
                  {bundle.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">${bundle.bundlePrice}</span>
                  <span className="text-gray-400 line-through">${bundle.originalPrice}</span>
                </div>
                
                <Button 
                  className="w-full bg-rose-500 hover:bg-rose-600"
                  onClick={() => setSelectedBundle(bundle.id)}
                >
                  <Gift className="h-4 w-4 mr-2" />
                  Add Bundle to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Custom bundle CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 bg-white rounded-full px-6 py-4 shadow-sm border border-gray-100">
            <span className="text-gray-600">Want to create your own bundle?</span>
            <Button variant="outline" className="rounded-full">
              Build Custom Bundle
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
