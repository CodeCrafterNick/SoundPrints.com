'use client'

import { 
  Music2, 
  Palette, 
  Frame, 
  Sparkles, 
  Printer, 
  Truck,
  RefreshCw,
  Shield,
  Heart
} from 'lucide-react'

const features = [
  {
    icon: Music2,
    title: '30+ Waveform Styles',
    description: 'From classic bars to artistic interpretations like circular, DNA helix, and galaxy spirals.'
  },
  {
    icon: Palette,
    title: 'Unlimited Colors',
    description: 'Choose any color combination with our advanced color picker. Gradients included.'
  },
  {
    icon: Frame,
    title: 'Premium Framing',
    description: 'Museum-quality frames in black, white, natural wood, and more elegant options.'
  },
  {
    icon: Sparkles,
    title: 'Real-Time Preview',
    description: 'See exactly what your print will look like as you customize every detail.'
  },
  {
    icon: Printer,
    title: 'Archival Quality',
    description: 'Giclée printing on acid-free paper. Colors that last 100+ years.'
  },
  {
    icon: Truck,
    title: 'Fast Shipping',
    description: 'Free shipping on orders over $75. Most orders ship within 3-5 business days.'
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    description: "30-day money-back guarantee. If you're not happy, we'll make it right."
  },
  {
    icon: Shield,
    title: 'Secure Payment',
    description: 'Your payment info is always protected with industry-standard encryption.'
  },
  {
    icon: Heart,
    title: 'Made with Love',
    description: 'Each print is crafted with care by artists who are passionate about sound.'
  }
]

export function FeatureGrid() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-rose-500 font-medium mb-4">Why Choose Us</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We&apos;ve thought of everything to make your sound art experience perfect.
          </p>
        </div>
        
        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div 
                key={i}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 group border border-gray-100"
              >
                <div className="w-14 h-14 rounded-xl bg-rose-100 flex items-center justify-center mb-6 group-hover:bg-rose-500 transition-colors duration-300">
                  <Icon className="h-7 w-7 text-rose-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
