'use client'

import { Building2, Users, Globe, Award, TrendingUp, Heart, Truck, Headphones } from 'lucide-react'

const benefits = [
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: 'Volume Discounts',
    description: 'Save up to 40% on bulk orders with our tiered pricing structure.'
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: 'Dedicated Account Manager',
    description: 'Get personalized support from your own wholesale specialist.'
  },
  {
    icon: <Truck className="h-8 w-8" />,
    title: 'Priority Shipping',
    description: 'Free expedited shipping on orders over 200 units.'
  },
  {
    icon: <Award className="h-8 w-8" />,
    title: 'Premium Quality',
    description: 'Same high-quality products your customers will love.'
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: 'Worldwide Fulfillment',
    description: 'Ship to customers anywhere in the world from our global network.'
  },
  {
    icon: <Headphones className="h-8 w-8" />,
    title: '24/7 Support',
    description: 'Round-the-clock assistance for enterprise partners.'
  }
]

const stats = [
  { value: '500+', label: 'Wholesale Partners' },
  { value: '2M+', label: 'Units Shipped' },
  { value: '98%', label: 'On-Time Delivery' },
  { value: '4.9★', label: 'Partner Rating' }
]

const partners = [
  { name: 'Spotify', category: 'Music Streaming' },
  { name: 'Wedding Wire', category: 'Event Planning' },
  { name: 'The Knot', category: 'Weddings' },
  { name: 'Shutterfly', category: 'Photo Gifts' },
  { name: 'Vistaprint', category: 'Custom Printing' },
  { name: 'Etsy Wholesale', category: 'Marketplace' }
]

export function WholesaleBenefits() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 rounded-full text-rose-600 mb-4">
            <Building2 className="h-4 w-4" />
            <span className="text-sm font-medium">Partner Benefits</span>
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Partner With SoundPrints?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join hundreds of businesses that trust us for their custom sound wave merchandise needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group p-8 bg-gray-50 rounded-2xl hover:bg-rose-500 transition-all duration-300 cursor-default"
            >
              <div className="inline-flex p-4 bg-rose-100 rounded-2xl text-rose-500 group-hover:bg-white group-hover:text-rose-500 transition-colors mb-6">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-white mb-3 transition-colors">
                {benefit.title}
              </h3>
              <p className="text-gray-600 group-hover:text-rose-100 transition-colors">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-20 bg-gray-900 rounded-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function WholesalePartners() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Trusted by Industry Leaders
          </h2>
          <p className="text-gray-600">
            Join these amazing companies already partnering with us
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-gray-400" />
              </div>
              <div className="font-medium text-gray-900 text-sm">{partner.name}</div>
              <div className="text-xs text-gray-500">{partner.category}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function WholesaleHero() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-rose-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {[...Array(20)].map((_, i) => (
            <line
              key={i}
              x1="0"
              y1={i * 5}
              x2="100"
              y2={i * 5}
              stroke="currentColor"
              strokeWidth="0.1"
            />
          ))}
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 rounded-full text-rose-300 mb-6">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">Wholesale Program</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Partner With
              <span className="block text-rose-400">SoundPrints</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Unlock exclusive pricing, dedicated support, and custom solutions for your business. Perfect for retailers, event planners, and corporate gifting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#wholesale-contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
              >
                Apply for Wholesale
              </a>
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
              >
                View Pricing
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: <TrendingUp className="h-6 w-6" />, value: '40%', label: 'Max Discount' },
              { icon: <Truck className="h-6 w-6" />, value: 'Free', label: 'Bulk Shipping' },
              { icon: <Users className="h-6 w-6" />, value: '24/7', label: 'Support' },
              { icon: <Heart className="h-6 w-6" />, value: '500+', label: 'Partners' }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="inline-flex p-3 bg-rose-500/20 rounded-xl text-rose-400 mb-4">
                  {item.icon}
                </div>
                <div className="text-3xl font-bold text-white">{item.value}</div>
                <div className="text-gray-400">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
