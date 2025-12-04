'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { 
  Gift, 
  Mail, 
  Clock, 
  Sparkles,
  ArrowRight,
  Check,
  Heart,
  Calendar,
  Download,
  Send
} from 'lucide-react'

const giftCardAmounts = [
  { value: 25, popular: false },
  { value: 50, popular: true },
  { value: 75, popular: false },
  { value: 100, popular: false },
  { value: 150, popular: false },
  { value: 200, popular: false },
]

const occasions = [
  { icon: Heart, label: 'Valentine\'s Day', image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=200&q=80' },
  { icon: Gift, label: 'Birthday', image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=200&q=80' },
  { icon: Calendar, label: 'Anniversary', image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=200&q=80' },
  { icon: Sparkles, label: 'Just Because', image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=200&q=80' },
]

const features = [
  {
    icon: Mail,
    title: 'Instant Delivery',
    description: 'Gift cards are delivered instantly via email',
  },
  {
    icon: Clock,
    title: 'Never Expires',
    description: 'No expiration date—use it whenever',
  },
  {
    icon: Download,
    title: 'Printable Option',
    description: 'Download and print for a physical gift',
  },
  {
    icon: Send,
    title: 'Schedule Delivery',
    description: 'Send it now or schedule for a special date',
  },
]

export default function GiftCardsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-b from-rose-50 to-background overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
          
          {/* Hero image */}
          <div className="absolute inset-0 -z-20">
            <Image
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1920&q=80"
              alt="Gift giving"
              fill
              className="object-cover opacity-10"
              priority
            />
          </div>
          
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-600 text-sm font-medium mb-6">
                <Gift className="h-4 w-4" />
                The Perfect Gift
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Give the Gift of{' '}
                <span className="bg-gradient-to-r from-rose-500 to-primary bg-clip-text text-transparent">
                  Sound Art
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Let them choose their own meaningful audio moment to transform into beautiful wall art.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Gift Card Selection */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-4">
                Choose an Amount
              </h2>
              <p className="text-center text-muted-foreground mb-12">
                Select a gift card value that fits your budget
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                {giftCardAmounts.map((amount) => (
                  <motion.button
                    key={amount.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-6 rounded-2xl border-2 transition-all ${
                      amount.popular
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    {amount.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                        MOST POPULAR
                      </div>
                    )}
                    <span className="text-3xl font-bold">${amount.value}</span>
                  </motion.button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="text-center mb-12">
                <p className="text-muted-foreground mb-4">
                  Or enter a custom amount ($10 - $500)
                </p>
                <div className="inline-flex items-center gap-2">
                  <span className="text-2xl font-bold">$</span>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    placeholder="Custom"
                    className="w-32 px-4 py-3 text-xl font-bold border-2 rounded-xl focus:border-primary focus:outline-none text-center"
                  />
                </div>
              </div>

              {/* Occasions */}
              <div className="bg-muted/30 rounded-2xl p-8 mb-12">
                <h3 className="font-semibold mb-4 text-center">Perfect for any occasion</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  {occasions.map((occasion) => (
                    <div
                      key={occasion.label}
                      className="flex items-center gap-3 px-4 py-2 bg-background rounded-full border group hover:border-primary/30 transition-colors"
                    >
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={occasion.image}
                          alt={occasion.label}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <span className="text-sm">{occasion.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <Button size="lg" className="text-lg px-10 gap-2">
                  Purchase Gift Card
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Delivered instantly via email
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                How Gift Cards Work
              </h2>
              <div className="space-y-6">
                {[
                  { step: 1, title: 'Choose an amount', desc: 'Select from preset amounts or enter a custom value' },
                  { step: 2, title: 'Add a personal message', desc: 'Write a heartfelt note to accompany your gift' },
                  { step: 3, title: 'Send instantly or schedule', desc: 'Deliver now via email or pick a special date' },
                  { step: 4, title: 'They create their art', desc: 'Recipient uses the code at checkout to create their SoundPrint' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Gift Card FAQs
              </h2>
              <div className="space-y-4">
                {[
                  { q: 'Do gift cards expire?', a: 'No! SoundPrints gift cards never expire. Use them whenever you\'re ready.' },
                  { q: 'Can I use multiple gift cards?', a: 'Yes, you can combine multiple gift cards on a single order.' },
                  { q: 'What if the order costs more than my gift card?', a: 'You can pay the remaining balance with any payment method at checkout.' },
                  { q: 'Can I get a refund on a gift card?', a: 'Gift cards are non-refundable, but they never expire so you can always use them later.' },
                ].map((faq) => (
                  <div key={faq.q} className="bg-card border rounded-xl p-6">
                    <h3 className="font-semibold mb-2">{faq.q}</h3>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Corporate */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                Corporate & Bulk Orders
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Looking to purchase gift cards in bulk for your team, clients, or event?
                We offer special pricing for corporate orders.
              </p>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="gap-2">
                  Contact Us <ArrowRight className="h-4 w-4" />
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
