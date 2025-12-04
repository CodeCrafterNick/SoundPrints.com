'use client'

import { useState } from 'react'
import { Check, Star, Zap, Crown, Building2, ArrowRight } from 'lucide-react'

interface PricingTier {
  name: string
  icon: React.ReactNode
  minQuantity: number
  maxQuantity: number | null
  discount: number
  perUnit: string
  features: string[]
  popular?: boolean
  enterprise?: boolean
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    icon: <Zap className="h-6 w-6" />,
    minQuantity: 10,
    maxQuantity: 49,
    discount: 10,
    perUnit: '$26.99',
    features: [
      '10% off retail pricing',
      'Standard shipping rates',
      'Email support',
      'Basic design tools',
      '7-day production time'
    ]
  },
  {
    name: 'Business',
    icon: <Star className="h-6 w-6" />,
    minQuantity: 50,
    maxQuantity: 199,
    discount: 20,
    perUnit: '$23.99',
    features: [
      '20% off retail pricing',
      'Discounted shipping',
      'Priority email support',
      'Advanced design tools',
      '5-day production time',
      'Dedicated account manager'
    ],
    popular: true
  },
  {
    name: 'Professional',
    icon: <Crown className="h-6 w-6" />,
    minQuantity: 200,
    maxQuantity: 499,
    discount: 30,
    perUnit: '$20.99',
    features: [
      '30% off retail pricing',
      'Free standard shipping',
      'Phone & email support',
      'Premium design tools',
      '3-day production time',
      'Dedicated account manager',
      'Custom packaging options'
    ]
  },
  {
    name: 'Enterprise',
    icon: <Building2 className="h-6 w-6" />,
    minQuantity: 500,
    maxQuantity: null,
    discount: 40,
    perUnit: 'Custom',
    features: [
      'Up to 40% off retail',
      'Free expedited shipping',
      '24/7 priority support',
      'White-label options',
      '2-day rush production',
      'Dedicated account team',
      'Custom packaging included',
      'API integration access'
    ],
    enterprise: true
  }
]

export function PricingTiers() {
  const [hoveredTier, setHoveredTier] = useState<string | null>(null)

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-rose-100 text-rose-600 text-sm font-medium rounded-full mb-4">
            Wholesale Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Volume Discounts That Scale
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The more you order, the more you save. Perfect for businesses, events, and resellers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              onMouseEnter={() => setHoveredTier(tier.name)}
              onMouseLeave={() => setHoveredTier(null)}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                tier.popular
                  ? 'bg-rose-500 text-white shadow-2xl scale-105 z-10'
                  : tier.enterprise
                  ? 'bg-gray-900 text-white shadow-xl'
                  : 'bg-gray-50 text-gray-900 hover:shadow-xl'
              } ${hoveredTier === tier.name ? 'transform -translate-y-2' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-gray-900 text-sm font-bold rounded-full">
                  Most Popular
                </div>
              )}

              <div className={`inline-flex p-3 rounded-xl mb-4 ${
                tier.popular
                  ? 'bg-rose-400'
                  : tier.enterprise
                  ? 'bg-gray-800'
                  : 'bg-rose-100 text-rose-600'
              }`}>
                {tier.icon}
              </div>

              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              
              <div className="mb-4">
                <span className={`text-sm ${tier.popular || tier.enterprise ? 'text-white/80' : 'text-gray-500'}`}>
                  {tier.minQuantity}{tier.maxQuantity ? `-${tier.maxQuantity}` : '+'} units
                </span>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">{tier.perUnit}</span>
                {!tier.enterprise && <span className={tier.popular ? 'text-white/80' : 'text-gray-500'}>/unit</span>}
                <div className={`text-sm mt-1 ${tier.popular || tier.enterprise ? 'text-white/80' : 'text-gray-500'}`}>
                  Save {tier.discount}%
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                      tier.popular
                        ? 'text-white'
                        : tier.enterprise
                        ? 'text-rose-400'
                        : 'text-rose-500'
                    }`} />
                    <span className={`text-sm ${tier.popular || tier.enterprise ? 'text-white/90' : 'text-gray-600'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  tier.popular
                    ? 'bg-white text-rose-500 hover:bg-gray-100'
                    : tier.enterprise
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                    : 'bg-rose-500 text-white hover:bg-rose-600'
                }`}
              >
                {tier.enterprise ? 'Contact Sales' : 'Get Started'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Need a custom quote? <a href="/contact" className="text-rose-500 hover:underline">Contact our sales team</a> for personalized pricing.
          </p>
        </div>
      </div>
    </section>
  )
}

export function PricingTiersSimple() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Simple Volume Pricing
        </h2>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Quantity</th>
                <th className="px-6 py-4 text-left font-semibold">Discount</th>
                <th className="px-6 py-4 text-left font-semibold">Price per Unit</th>
                <th className="px-6 py-4 text-left font-semibold">You Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { qty: '10-49', discount: '10%', price: '$26.99', save: 'Up to $150' },
                { qty: '50-199', discount: '20%', price: '$23.99', save: 'Up to $600' },
                { qty: '200-499', discount: '30%', price: '$20.99', save: 'Up to $1,500' },
                { qty: '500+', discount: '40%', price: 'Custom', save: 'Unlimited' }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{row.qty}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 bg-rose-100 text-rose-600 rounded-full text-sm font-medium">
                      {row.discount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{row.price}</td>
                  <td className="px-6 py-4 text-green-600 font-medium">{row.save}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
