'use client'

import { Newspaper, Download, ExternalLink, Calendar, ArrowRight, Quote } from 'lucide-react'

const pressFeatures = [
  {
    outlet: 'TechCrunch',
    logo: '/press/techcrunch.svg',
    headline: 'SoundPrints Raises $5M to Turn Your Favorite Songs into Art',
    excerpt: 'The startup has found a unique niche in the custom gifts market...',
    date: 'March 2024',
    link: '#'
  },
  {
    outlet: 'Forbes',
    logo: '/press/forbes.svg',
    headline: 'How SoundPrints Built a $10M Business from Wedding Songs',
    excerpt: 'What started as a passion project has become one of the most popular gift ideas...',
    date: 'February 2024',
    link: '#'
  },
  {
    outlet: 'The Verge',
    logo: '/press/verge.svg',
    headline: 'The Tech Behind Turning Audio into Beautiful Wall Art',
    excerpt: 'We spoke with the engineering team about their sound visualization technology...',
    date: 'January 2024',
    link: '#'
  },
  {
    outlet: 'Business Insider',
    logo: '/press/businessinsider.svg',
    headline: 'This Startup Found the Perfect Valentine\'s Day Gift',
    excerpt: 'SoundPrints saw a 400% increase in orders leading up to Valentine\'s Day...',
    date: 'February 2024',
    link: '#'
  },
  {
    outlet: 'Wired',
    logo: '/press/wired.svg',
    headline: 'The Algorithm That Makes Your Song Look Beautiful',
    excerpt: 'An inside look at the visualization engine powering custom sound wave art...',
    date: 'December 2023',
    link: '#'
  },
  {
    outlet: 'CNN',
    logo: '/press/cnn.svg',
    headline: 'Personalized Gifts Are Booming, and SoundPrints Is Leading the Way',
    excerpt: 'The pandemic accelerated the shift toward meaningful, personalized gifts...',
    date: 'November 2023',
    link: '#'
  }
]

const pressLogos = [
  'TechCrunch', 'Forbes', 'The Verge', 'Wired', 'CNN', 'NBC',
  'Good Morning America', 'Buzzfeed', 'Mashable', 'Refinery29'
]

export function PressHero() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 rounded-full text-rose-300 mb-6">
          <Newspaper className="h-4 w-4" />
          <span className="text-sm font-medium">Press Room</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          SoundPrints in the News
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          See what journalists and media outlets are saying about our mission to transform meaningful moments into lasting art.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#press-kit"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
          >
            <Download className="h-5 w-5" />
            Download Press Kit
          </a>
          <a
            href="mailto:press@soundprints.com"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
          >
            Media Inquiries
          </a>
        </div>
      </div>
    </section>
  )
}

export function PressFeatures() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Coverage</h2>
          <p className="text-gray-600">Recent stories about SoundPrints</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pressFeatures.map((feature, index) => (
            <a
              key={index}
              href={feature.link}
              className="group bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="h-8 w-32 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                  {feature.outlet}
                </div>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {feature.date}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-rose-500 transition-colors">
                {feature.headline}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4">
                {feature.excerpt}
              </p>
              
              <span className="inline-flex items-center gap-1 text-rose-500 text-sm font-medium group-hover:gap-2 transition-all">
                Read Article
                <ExternalLink className="h-4 w-4" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PressQuotes() {
  const quotes = [
    {
      quote: "SoundPrints has reinvented the personalized gift industry with their innovative approach to transforming audio into visual art.",
      source: "TechCrunch"
    },
    {
      quote: "A brilliant fusion of technology and emotion that creates truly meaningful keepsakes.",
      source: "Forbes"
    },
    {
      quote: "The quality and attention to detail is remarkable. This is premium gift-giving at its finest.",
      source: "Wired"
    }
  ]

  return (
    <section className="py-20 bg-rose-500 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {quotes.map((item, index) => (
            <div key={index} className="text-center">
              <Quote className="h-10 w-10 mx-auto mb-4 text-rose-300" />
              <blockquote className="text-lg mb-4 italic">
                &quot;{item.quote}&quot;
              </blockquote>
              <cite className="text-rose-200 font-medium not-italic">
                — {item.source}
              </cite>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PressKit() {
  const assets = [
    {
      name: 'Brand Guidelines',
      description: 'Logo usage, colors, and typography',
      format: 'PDF',
      size: '2.4 MB'
    },
    {
      name: 'Logo Pack',
      description: 'All logo variations in multiple formats',
      format: 'ZIP',
      size: '8.1 MB'
    },
    {
      name: 'Product Images',
      description: 'High-resolution product photography',
      format: 'ZIP',
      size: '45 MB'
    },
    {
      name: 'Company Fact Sheet',
      description: 'Key stats and company information',
      format: 'PDF',
      size: '1.2 MB'
    },
    {
      name: 'Founder Headshots',
      description: 'Professional photos of leadership',
      format: 'ZIP',
      size: '12 MB'
    },
    {
      name: 'Brand Story',
      description: 'Our origin story and mission',
      format: 'PDF',
      size: '890 KB'
    }
  ]

  return (
    <section className="py-20 bg-gray-50" id="press-kit">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Press Kit</h2>
          <p className="text-gray-600">
            Download official brand assets and media resources
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-rose-100 rounded-xl text-rose-500">
                  <Download className="h-6 w-6" />
                </div>
                <span className="text-xs text-gray-400 uppercase">{asset.format}</span>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-1">{asset.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{asset.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{asset.size}</span>
                <button className="text-rose-500 hover:text-rose-600 text-sm font-medium">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            <Download className="h-5 w-5" />
            Download Complete Press Kit
          </a>
        </div>
      </div>
    </section>
  )
}

export function PressLogos() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-500 mb-8">As featured in</p>
        <div className="flex flex-wrap justify-center gap-8 items-center">
          {pressLogos.map((logo, index) => (
            <div
              key={index}
              className="px-6 py-3 bg-gray-100 rounded-lg text-gray-400 font-medium text-sm"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PressContact() {
  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Media Inquiries</h2>
        <p className="text-gray-400 mb-8">
          For press inquiries, interview requests, or additional information, please contact our PR team.
        </p>
        
        <div className="inline-flex flex-col sm:flex-row gap-4 mb-8">
          <a
            href="mailto:press@soundprints.com"
            className="px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
          >
            press@soundprints.com
          </a>
          <a
            href="tel:1-800-SOUNDPRINT"
            className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
          >
            1-800-SOUNDPRINT
          </a>
        </div>

        <p className="text-sm text-gray-500">
          We typically respond to media inquiries within 24 hours.
        </p>
      </div>
    </section>
  )
}
