'use client'

import { Shield, CreditCard, Truck, RotateCcw, Lock, Award, CheckCircle } from 'lucide-react'

const badges = [
  {
    icon: Shield,
    title: 'Secure Checkout',
    description: '256-bit SSL encryption',
  },
  {
    icon: CreditCard,
    title: 'Safe Payment',
    description: 'All major cards accepted',
  },
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Orders over $75',
  },
  {
    icon: RotateCcw,
    title: '30-Day Returns',
    description: 'Money back guarantee',
  },
]

const paymentIcons = ['Visa', 'Mastercard', 'Amex', 'PayPal', 'Apple Pay', 'Google Pay']

export function TrustBadges() {
  return (
    <section className="py-12 bg-gray-50 border-y border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon
            return (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                  <Icon className="h-6 w-6 text-rose-500" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{badge.title}</div>
                  <div className="text-xs text-gray-500">{badge.description}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function TrustBadgesCompact() {
  return (
    <div className="flex flex-wrap justify-center gap-6 py-6">
      {badges.map((badge, index) => {
        const Icon = badge.icon
        return (
          <div key={index} className="flex items-center gap-2 text-gray-500">
            <Icon className="h-4 w-4" />
            <span className="text-sm">{badge.title}</span>
          </div>
        )
      })}
    </div>
  )
}

export function PaymentIcons() {
  return (
    <div className="flex flex-wrap justify-center gap-3 py-4">
      {paymentIcons.map((name, index) => (
        <div
          key={index}
          className="px-3 py-1.5 bg-gray-100 rounded text-sm font-medium text-gray-600"
        >
          {name}
        </div>
      ))}
    </div>
  )
}

export function GuaranteeBanner() {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-emerald-800 mb-1">100% Satisfaction Guaranteed</h3>
          <p className="text-emerald-700 text-sm">
            Love your SoundPrint or get a full refund. No questions asked. 
            We stand behind every piece we create.
          </p>
        </div>
      </div>
    </div>
  )
}

export function SecuritySeals() {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100">
      <div className="flex items-center justify-center gap-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Lock className="h-8 w-8 text-gray-600" />
          </div>
          <span className="text-xs text-gray-500">SSL Secured</span>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Shield className="h-8 w-8 text-gray-600" />
          </div>
          <span className="text-xs text-gray-500">Verified Business</span>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Award className="h-8 w-8 text-gray-600" />
          </div>
          <span className="text-xs text-gray-500">Top Rated</span>
        </div>
      </div>
    </div>
  )
}
