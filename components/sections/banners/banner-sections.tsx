'use client'

import { useState } from 'react'
import { X, Gift, Truck, Clock, Percent, ChevronRight, Bell, Sparkles } from 'lucide-react'

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-gray-900 text-white py-3 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-rose-400" />
            Free shipping on orders over $50
          </span>
          <span className="hidden sm:inline text-gray-500">|</span>
          <span className="hidden sm:flex items-center gap-2">
            <Clock className="h-4 w-4 text-rose-400" />
            Order by 2pm for same-day processing
          </span>
        </div>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function SaleBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 text-white py-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-rose-600/50 via-transparent to-rose-600/50 animate-pulse" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-6 text-center flex-wrap">
          <div className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            <span className="font-bold">VALENTINE&apos;S SALE</span>
          </div>
          <span className="text-2xl font-bold">25% OFF</span>
          <span className="text-rose-100">Use code: LOVE25</span>
          <a
            href="/create"
            className="bg-white text-rose-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-1"
          >
            Shop Now
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
      
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function CountdownBanner() {
  const [timeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 32
  })

  return (
    <div className="bg-gray-900 text-white py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-rose-400" />
            <span className="font-semibold">Flash Sale Ends In:</span>
          </div>
          
          <div className="flex items-center gap-2">
            {[
              { value: timeLeft.hours, label: 'HRS' },
              { value: timeLeft.minutes, label: 'MIN' },
              { value: timeLeft.seconds, label: 'SEC' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="bg-rose-500 px-3 py-1 rounded-lg">
                  <span className="text-xl font-bold">{item.value.toString().padStart(2, '0')}</span>
                  <span className="text-xs ml-1">{item.label}</span>
                </div>
                {idx < 2 && <span className="text-rose-400 font-bold">:</span>}
              </div>
            ))}
          </div>

          <a
            href="/sale"
            className="text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
          >
            View Deals
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

export function PromoStrip() {
  const promos = [
    { icon: <Truck className="h-4 w-4" />, text: 'Free Shipping Over $50' },
    { icon: <Gift className="h-4 w-4" />, text: 'Gift Wrapping Available' },
    { icon: <Clock className="h-4 w-4" />, text: '2-5 Day Production' },
    { icon: <Sparkles className="h-4 w-4" />, text: '100% Satisfaction Guaranteed' }
  ]

  return (
    <div className="bg-gray-50 border-y border-gray-100 py-3 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...promos, ...promos].map((promo, idx) => (
          <div key={idx} className="flex items-center gap-2 mx-8 text-sm text-gray-600">
            <span className="text-rose-500">{promo.icon}</span>
            {promo.text}
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  )
}

export function NewProductBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">NEW</span>
          <span>Introducing Metal Prints! Modern, sleek, and built to last.</span>
          <a href="/products/metal-print" className="underline hover:no-underline font-medium">
            Learn More →
          </a>
        </div>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-300">
          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{' '}
          <a href="/privacy-policy" className="text-rose-400 hover:underline">
            Learn more
          </a>
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setIsVisible(false)}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Decline
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="px-4 py-2 bg-rose-500 text-white text-sm font-medium rounded-lg hover:bg-rose-600 transition-colors"
          >
            Accept Cookies
          </button>
        </div>
      </div>
    </div>
  )
}

export function NewsletterFloatingBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [email, setEmail] = useState('')

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-40">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X className="h-4 w-4 text-gray-400" />
      </button>

      <div className="flex items-start gap-4">
        <div className="p-3 bg-rose-100 rounded-xl">
          <Bell className="h-6 w-6 text-rose-500" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 mb-1">Get 15% Off!</h4>
          <p className="text-sm text-gray-600 mb-3">
            Subscribe for exclusive deals and be the first to know about new products.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
            <button className="px-4 py-2 bg-rose-500 text-white text-sm font-medium rounded-lg hover:bg-rose-600 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')

  // In a real app, you'd trigger this on mouse leaving viewport
  // For demo, it's controlled by state

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className="h-48 bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
          <Gift className="h-20 w-20 text-white" />
        </div>
        
        <div className="p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Wait! Don&apos;t Leave Empty-Handed
          </h3>
          <p className="text-gray-600 mb-6">
            Get 20% off your first order when you subscribe to our newsletter.
          </p>
          
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
            <button className="w-full py-3 bg-rose-500 text-white font-semibold rounded-xl hover:bg-rose-600 transition-colors">
              Claim My 20% Off
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              No thanks, I&apos;ll pay full price
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
