'use client'

import { DollarSign, TrendingUp, Users, Gift, Sparkles, Music, Heart, Award, ArrowRight } from 'lucide-react'

export function AffiliateHero() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur rounded-full mb-6">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm font-medium">Affiliate Program</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Earn While You
            <span className="block text-yellow-300">Share the Love</span>
          </h1>

          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Turn your passion for music into income. Earn up to 20% commission on every SoundPrints sale you refer.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a
              href="#affiliate-signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-rose-500 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Join Free Today
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#commission"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 backdrop-blur text-white rounded-xl font-semibold hover:bg-white/30 transition-colors"
            >
              View Commission Rates
            </a>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: '20%', label: 'Max Commission' },
              { value: '$150', label: 'Avg. Order Value' },
              { value: '90-Day', label: 'Cookie Duration' },
              { value: '10K+', label: 'Active Affiliates' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function AffiliateBenefits() {
  const benefits = [
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: 'Generous Commissions',
      description: 'Earn 10-20% on every sale. Higher tiers unlock higher earnings as you grow.'
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'High Conversion',
      description: 'Our products convert at 5%+ because customers love unique, personalized gifts.'
    },
    {
      icon: <Gift className="h-8 w-8" />,
      title: 'Perfect for Gift Content',
      description: 'SoundPrints are ideal for gift guides, wedding content, and holiday roundups.'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Dedicated Support',
      description: 'Get your own affiliate manager plus 24/7 support for all your questions.'
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: 'Exclusive Promos',
      description: 'Access special discount codes, early product launches, and affiliate-only deals.'
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Real-Time Tracking',
      description: 'Monitor your clicks, sales, and earnings with our advanced analytics dashboard.'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 rounded-full text-rose-600 mb-4">
            <Heart className="h-4 w-4" />
            <span className="text-sm font-medium">Why Join Us</span>
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Benefits of Being an Affiliate
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We make it easy for creators to earn passive income while sharing products they genuinely love.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow"
            >
              <div className="inline-flex p-4 bg-rose-100 rounded-2xl text-rose-500 mb-6">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {benefit.title}
              </h3>
              <p className="text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function AffiliateTestimonials() {
  const testimonials = [
    {
      quote: "I made $2,400 in my first month just by sharing SoundPrints in my wedding content. The products practically sell themselves!",
      author: "Sarah M.",
      role: "Wedding Blogger",
      earnings: "$8,500/month avg"
    },
    {
      quote: "My audience loves unique gift ideas, and SoundPrints is always a hit. The commissions are way better than other affiliate programs.",
      author: "Mike T.",
      role: "Gift Guide YouTuber",
      earnings: "$5,200/month avg"
    },
    {
      quote: "As a music content creator, recommending SoundPrints feels natural. It's the perfect crossover between music and meaningful gifts.",
      author: "Jessica L.",
      role: "Music TikToker",
      earnings: "$3,800/month avg"
    }
  ]

  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">What Our Affiliates Say</h2>
          <p className="text-gray-400">Real earnings from real creators in our program</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10"
            >
              <div className="flex items-center gap-1 text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 mb-6 italic">&quot;{testimonial.quote}&quot;</p>
              <div className="border-t border-white/10 pt-4">
                <div className="font-semibold">{testimonial.author}</div>
                <div className="text-sm text-gray-400">{testimonial.role}</div>
                <div className="text-sm text-green-400 mt-1">{testimonial.earnings}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function AffiliateResources() {
  const resources = [
    {
      icon: <Music className="h-6 w-6" />,
      title: 'Product Images',
      description: 'High-quality photos and lifestyle images for your content'
    },
    {
      icon: <Gift className="h-6 w-6" />,
      title: 'Banner Ads',
      description: 'Pre-designed banners in all standard sizes'
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'Email Templates',
      description: 'Ready-to-send promotional email copy'
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Analytics Dashboard',
      description: 'Track clicks, conversions, and earnings in real-time'
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-gray-600">
            Get access to professional marketing materials and tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <div className="inline-flex p-3 bg-rose-100 rounded-xl text-rose-500 mb-4">
                {resource.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
              <p className="text-sm text-gray-500">{resource.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
