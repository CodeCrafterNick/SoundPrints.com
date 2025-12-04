'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { 
  Layers, 
  Sparkles, 
  Frame as FrameIcon, 
  Square,
  ArrowRight,
  Check,
  Star,
  Ruler,
  Palette
} from 'lucide-react'

const products = [
  {
    id: 'matte-poster',
    name: 'Matte Poster',
    shortName: 'Poster',
    description: 'Premium matte finish print on heavyweight paper. Perfect for framing yourself or using poster hangers.',
    icon: Layers,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=800&q=80', // Poster on wall
    startingPrice: 19.99,
    sizes: ['12"×16"', '16"×20"', '18"×24"', '24"×36"'],
    features: [
      'Premium 200gsm matte paper',
      'Vibrant, long-lasting colors',
      'No glare or reflection',
      'Ships flat in protective tube',
    ],
    bestFor: 'Budget-friendly option, DIY framing',
    popular: true,
  },
  {
    id: 'satin-poster',
    name: 'Satin Poster',
    shortName: 'Satin',
    description: 'Elegant satin finish with a subtle sheen. Rich colors and smooth texture for a sophisticated look.',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=800&q=80', // Art print
    startingPrice: 24.99,
    sizes: ['12"×18"', '18"×24"', '24"×36"'],
    features: [
      'Premium 210gsm satin paper',
      'Subtle, elegant sheen',
      'Enhanced color depth',
      'Water-resistant finish',
    ],
    bestFor: 'Premium look without frame',
    popular: false,
  },
  {
    id: 'canvas',
    name: 'Canvas Print',
    shortName: 'Canvas',
    description: 'Gallery-wrapped canvas stretched over a wooden frame. Ready to hang right out of the box.',
    icon: Square,
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80', // Canvas art
    startingPrice: 49.99,
    sizes: ['12"×16"', '16"×20"', '18"×24"', '24"×36"'],
    features: [
      'Premium poly-cotton canvas',
      '1.5" deep wooden frame',
      'Gallery-wrapped edges',
      'Ready to hang',
    ],
    bestFor: 'Modern, gallery-style display',
    popular: true,
  },
  {
    id: 'framed',
    name: 'Framed Print',
    shortName: 'Framed',
    description: 'Museum-quality print in an elegant frame with protective glass. The ultimate ready-to-display option.',
    icon: FrameIcon,
    image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80', // Framed art
    startingPrice: 79.99,
    sizes: ['12"×16"', '16"×20"', '18"×24"'],
    frameColors: ['Black', 'White', 'Walnut'],
    features: [
      'Premium wood frame',
      'Shatter-resistant acrylic glass',
      'Acid-free matting',
      'Wire hanger included',
    ],
    bestFor: 'Gift-ready, premium display',
    popular: false,
    premium: true,
  },
]

const comparisonFeatures = [
  { name: 'Ready to hang', poster: false, satin: false, canvas: true, framed: true },
  { name: 'Premium materials', poster: true, satin: true, canvas: true, framed: true },
  { name: 'Frame included', poster: false, satin: false, canvas: true, framed: true },
  { name: 'Glass/protection', poster: false, satin: false, canvas: false, framed: true },
  { name: 'Gift-ready packaging', poster: false, satin: false, canvas: true, framed: true },
]

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Palette className="h-4 w-4" />
                Premium Products
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Choose Your{' '}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Perfect Medium
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Every SoundPrint is crafted using museum-quality materials 
                and professional printing techniques.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-card border rounded-2xl overflow-hidden hover:shadow-xl transition-shadow group ${
                    product.premium ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  {product.popular && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full z-10">
                      POPULAR
                    </div>
                  )}
                  {product.premium && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full z-10">
                      PREMIUM
                    </div>
                  )}
                  
                  {/* Image */}
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-1">{product.name}</h3>
                        <p className="text-muted-foreground text-sm">{product.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-sm text-muted-foreground">From</span>
                      <span className="text-3xl font-bold">${product.startingPrice}</span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">AVAILABLE SIZES</p>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                          <span
                            key={size}
                            className="px-2 py-1 bg-muted rounded text-xs font-medium"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {product.frameColors && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2">FRAME COLORS</p>
                        <div className="flex gap-2">
                          {product.frameColors.map((color) => (
                            <span
                              key={color}
                              className="px-2 py-1 bg-muted rounded text-xs font-medium"
                            >
                              {color}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2 mb-6">
                      {product.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="bg-primary/5 rounded-lg p-3 mb-6">
                      <p className="text-sm">
                        <span className="font-semibold">Best for:</span>{' '}
                        <span className="text-muted-foreground">{product.bestFor}</span>
                      </p>
                    </div>
                    
                    <Link href="/create">
                      <Button className="w-full gap-2">
                        Create with {product.shortName}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Compare Products
              </h2>
              <div className="bg-card border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="p-4 text-left font-semibold">Feature</th>
                        <th className="p-4 text-center font-semibold">Poster</th>
                        <th className="p-4 text-center font-semibold">Satin</th>
                        <th className="p-4 text-center font-semibold">Canvas</th>
                        <th className="p-4 text-center font-semibold">Framed</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-4 font-medium">Starting Price</td>
                        <td className="p-4 text-center">$19.99</td>
                        <td className="p-4 text-center">$24.99</td>
                        <td className="p-4 text-center">$49.99</td>
                        <td className="p-4 text-center">$79.99</td>
                      </tr>
                      {comparisonFeatures.map((feature) => (
                        <tr key={feature.name} className="border-b last:border-0">
                          <td className="p-4 font-medium">{feature.name}</td>
                          <td className="p-4 text-center">
                            {feature.poster ? (
                              <Check className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {feature.satin ? (
                              <Check className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {feature.canvas ? (
                              <Check className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {feature.framed ? (
                              <Check className="h-5 w-5 text-primary mx-auto" />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quality Promise */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Star className="h-4 w-4 fill-primary" />
                Quality Promise
              </div>
              <h2 className="text-3xl font-bold mb-6">
                Museum-Quality, Every Time
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                We partner with professional print labs that supply museums, galleries, 
                and professional photographers. Your SoundPrint is printed using 
                archival-quality materials that will look stunning for generations.
              </p>
              <div className="grid sm:grid-cols-3 gap-8">
                {[
                  { label: 'Archival Inks', desc: '100+ year color retention' },
                  { label: 'Premium Papers', desc: 'Heavyweight, acid-free' },
                  { label: 'Quality Checked', desc: 'Every print inspected' },
                ].map((item) => (
                  <div key={item.label}>
                    <h3 className="font-semibold mb-1">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-4">
                Ready to Create Your SoundPrint?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Choose your product during the creation process. 
                Preview how your design looks on each option before ordering.
              </p>
              <Link href="/create">
                <Button size="lg" className="text-lg px-10 gap-2">
                  Start Creating
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <SiteFooter />
    </div>
  )
}
