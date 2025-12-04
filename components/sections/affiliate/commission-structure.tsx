'use client'

import { DollarSign, Users, TrendingUp, Gift, Clock, Zap, Check, ArrowRight } from 'lucide-react'

const tiers = [
  {
    name: 'Starter',
    icon: <Zap className="h-6 w-6" />,
    commission: '10%',
    requirements: 'New affiliates',
    color: 'gray',
    features: [
      '10% commission on all sales',
      'Standard 30-day cookie',
      'Monthly payments',
      'Basic analytics dashboard',
      'Email support'
    ]
  },
  {
    name: 'Partner',
    icon: <Users className="h-6 w-6" />,
    commission: '15%',
    requirements: '$500+/month in sales',
    color: 'rose',
    popular: true,
    features: [
      '15% commission on all sales',
      'Extended 60-day cookie',
      'Bi-weekly payments',
      'Advanced analytics',
      'Priority support',
      'Custom promo codes'
    ]
  },
  {
    name: 'Elite',
    icon: <TrendingUp className="h-6 w-6" />,
    commission: '20%',
    requirements: '$2,000+/month in sales',
    color: 'purple',
    features: [
      '20% commission on all sales',
      '90-day extended cookie',
      'Weekly payments',
      'Full analytics suite',
      'Dedicated account manager',
      'Custom landing pages',
      'Early access to products',
      'Co-branded materials'
    ]
  }
]

const stats = [
  { value: '$150', label: 'Avg. Order Value', icon: <DollarSign className="h-5 w-5" /> },
  { value: '5%', label: 'Conversion Rate', icon: <TrendingUp className="h-5 w-5" /> },
  { value: '30 days', label: 'Cookie Duration', icon: <Clock className="h-5 w-5" /> },
  { value: '10K+', label: 'Active Affiliates', icon: <Users className="h-5 w-5" /> }
]

export function CommissionStructure() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-600 mb-4">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">Commission Tiers</span>
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Earn More as You Grow
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our tiered commission structure rewards your success with higher earnings and exclusive perks.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-rose-100 rounded-full text-rose-500 mb-3">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                tier.popular
                  ? 'bg-rose-500 text-white shadow-2xl scale-105 z-10'
                  : tier.color === 'purple'
                  ? 'bg-purple-900 text-white'
                  : 'bg-gray-50 text-gray-900 hover:shadow-xl'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-gray-900 text-sm font-bold rounded-full">
                  Most Popular
                </div>
              )}

              <div className={`inline-flex p-3 rounded-xl mb-4 ${
                tier.popular
                  ? 'bg-rose-400'
                  : tier.color === 'purple'
                  ? 'bg-purple-800'
                  : 'bg-rose-100 text-rose-500'
              }`}>
                {tier.icon}
              </div>

              <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
              
              <div className="mb-4">
                <span className="text-5xl font-bold">{tier.commission}</span>
                <span className={tier.popular || tier.color === 'purple' ? 'text-white/80' : 'text-gray-500'}>
                  {' '}commission
                </span>
              </div>

              <p className={`text-sm mb-6 ${tier.popular || tier.color === 'purple' ? 'text-white/80' : 'text-gray-500'}`}>
                {tier.requirements}
              </p>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                      tier.popular
                        ? 'text-white'
                        : tier.color === 'purple'
                        ? 'text-purple-300'
                        : 'text-rose-500'
                    }`} />
                    <span className={`text-sm ${
                      tier.popular || tier.color === 'purple' ? 'text-white/90' : 'text-gray-600'
                    }`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  tier.popular
                    ? 'bg-white text-rose-500 hover:bg-gray-100'
                    : tier.color === 'purple'
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-rose-500 text-white hover:bg-rose-600'
                }`}
              >
                Join Now
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CommissionCalculator() {
  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Earnings Calculator</h2>
          <p className="text-gray-400">See how much you could earn as a SoundPrints affiliate</p>
        </div>

        <div className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-gray-400 mb-2">If you refer</div>
              <div className="text-4xl font-bold text-rose-400">10 sales/week</div>
            </div>
            <div>
              <div className="text-gray-400 mb-2">At avg. order of</div>
              <div className="text-4xl font-bold text-rose-400">$150</div>
            </div>
            <div>
              <div className="text-gray-400 mb-2">You earn (15%)</div>
              <div className="text-4xl font-bold text-green-400">$225/week</div>
              <div className="text-green-400/70 text-sm mt-1">$900/month</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function HowItWorks() {
  const steps = [
    {
      step: '1',
      title: 'Sign Up Free',
      description: 'Create your affiliate account in under 2 minutes. No approval wait time.'
    },
    {
      step: '2',
      title: 'Share Your Link',
      description: 'Get your unique referral link and share it with your audience.'
    },
    {
      step: '3',
      title: 'Earn Commission',
      description: 'Earn 10-20% on every sale made through your link.'
    },
    {
      step: '4',
      title: 'Get Paid',
      description: 'Receive payments via PayPal or direct deposit. Minimum $50 payout.'
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-600">Start earning in just a few simple steps</p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-rose-200 -translate-y-1/2" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="relative z-10 w-16 h-16 bg-rose-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
