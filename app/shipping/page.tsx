'use client'

import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Truck, 
  Package, 
  Globe, 
  Clock, 
  CheckCircle, 
  MapPin,
  HelpCircle,
  ArrowRight
} from 'lucide-react'

const shippingMethods = [
  {
    name: 'Standard Shipping',
    time: '5-7 business days',
    price: 'Free on orders $50+',
    description: 'Our most popular option. Reliable delivery right to your door.',
    icon: Truck
  },
  {
    name: 'Express Shipping',
    time: '2-3 business days',
    price: 'Starting at $12.99',
    description: 'Need it faster? Get priority handling and expedited delivery.',
    icon: Package
  }
]

const shippingRegions = [
  {
    region: 'United States',
    standard: '5-7 business days',
    express: '2-3 business days',
    notes: 'Free standard shipping on orders over $50'
  },
  {
    region: 'Canada',
    standard: '7-14 business days',
    express: '3-5 business days',
    notes: 'Duties and taxes may apply'
  },
  {
    region: 'United Kingdom',
    standard: '10-14 business days',
    express: '5-7 business days',
    notes: 'VAT included in price'
  },
  {
    region: 'Europe',
    standard: '10-14 business days',
    express: '5-7 business days',
    notes: 'Duties and taxes may apply'
  },
  {
    region: 'Australia',
    standard: '14-21 business days',
    express: '7-10 business days',
    notes: 'GST included in price'
  }
]

const shippingFaqs = [
  {
    question: 'When will my order ship?',
    answer: 'All SoundPrint products are custom-made to order. Production typically takes 2-4 business days. Once complete, your order will ship and you\'ll receive a tracking email.'
  },
  {
    question: 'Can I track my order?',
    answer: 'Yes! Once your order ships, you\'ll receive an email with your tracking number. You can also view tracking info in your order confirmation page.'
  },
  {
    question: 'What if my order is damaged?',
    answer: 'We stand behind our products. If your order arrives damaged, contact us within 14 days with photos and we\'ll send a replacement at no cost.'
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Yes! We ship to over 100 countries worldwide. International shipping times and costs vary by destination.'
  }
]

export default function ShippingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Shipping Information</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We partner with premium print facilities worldwide to deliver your custom 
              SoundPrints quickly and safely.
            </p>
          </div>
        </section>

        {/* Production Time Notice */}
        <section className="py-8 bg-amber-50 dark:bg-amber-900/10 border-y border-amber-200 dark:border-amber-900/20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-3 text-amber-800 dark:text-amber-200">
              <Clock className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">
                <strong>Note:</strong> All SoundPrint products are custom-made to order. 
                Please allow 2-4 business days for production before shipping.
              </p>
            </div>
          </div>
        </section>

        {/* Shipping Methods */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Shipping Methods</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {shippingMethods.map((method, index) => (
                <div 
                  key={index}
                  className="bg-card rounded-2xl border p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <method.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{method.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{method.time}</span>
                  </div>
                  <p className="text-lg font-medium text-primary mb-3">{method.price}</p>
                  <p className="text-muted-foreground">{method.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shipping Regions */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">We Ship Worldwide</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Delivering beautiful SoundPrints to over 100 countries
              </p>
            </div>

            <div className="max-w-4xl mx-auto overflow-hidden rounded-xl border bg-card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Region</th>
                      <th className="px-6 py-4 text-left font-semibold">Standard</th>
                      <th className="px-6 py-4 text-left font-semibold">Express</th>
                      <th className="px-6 py-4 text-left font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {shippingRegions.map((region, index) => (
                      <tr key={index} className="hover:bg-muted/30">
                        <td className="px-6 py-4 font-medium">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {region.region}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{region.standard}</td>
                        <td className="px-6 py-4 text-muted-foreground">{region.express}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{region.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't see your country? <Link href="/contact" className="text-primary hover:underline">Contact us</Link> for shipping options.
            </p>
          </div>
        </section>

        {/* What to Expect */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">What to Expect</h2>
            <div className="max-w-3xl mx-auto">
              <div className="space-y-6">
                {[
                  { step: 1, title: 'Order Placed', desc: 'Your custom SoundPrint order is confirmed' },
                  { step: 2, title: 'Production', desc: '2-4 business days to create your unique artwork' },
                  { step: 3, title: 'Quality Check', desc: 'Every print is inspected for quality' },
                  { step: 4, title: 'Shipped', desc: 'Carefully packaged and sent your way' },
                  { step: 5, title: 'Delivered', desc: 'Your SoundPrint arrives at your door!' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                    {index < 4 && (
                      <div className="hidden sm:block absolute left-5 mt-10 w-px h-6 bg-border" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Shipping FAQ</h2>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {shippingFaqs.map((faq, index) => (
                <div key={index} className="bg-card rounded-xl border p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/faq">
                <Button variant="outline">
                  View All FAQs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Create?</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Transform your favorite audio moments into stunning wall art, delivered right to your door.
            </p>
            <Link href="/create">
              <Button size="lg">
                Create Your SoundPrint
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
