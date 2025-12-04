'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { 
  Upload, 
  Palette, 
  ShoppingBag, 
  Truck, 
  Package,
  Sparkles,
  ArrowRight,
  Check,
  Play,
  FileAudio,
  Wand2,
  Eye,
  CreditCard,
  Printer,
  Home
} from 'lucide-react'

const detailedSteps = [
  {
    number: 1,
    title: 'Upload Your Audio',
    description: 'Start by uploading any audio file that holds meaning to you.',
    icon: Upload,
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80', // Audio recording
    details: [
      'Supports MP3, WAV, M4A, FLAC, and more',
      'Upload files up to 50MB',
      'Process songs, voice messages, podcasts, or any audio',
      'Instantly see your waveform appear',
    ],
    tip: 'For best results, use high-quality audio files. The clearer the audio, the more detailed your waveform will be.',
  },
  {
    number: 2,
    title: 'Choose Your Style',
    description: 'Select from over 30 unique waveform visualization styles.',
    icon: Wand2,
    image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600&q=80', // Abstract art
    details: [
      'Classic linear waveforms',
      'Circular and radial designs',
      'Bars, blocks, and dots',
      'Heartbeat and pulse styles',
    ],
    tip: 'Different styles work better for different audio types. Try the heartbeat style for voice messages!',
  },
  {
    number: 3,
    title: 'Customize Colors & Text',
    description: 'Make it truly yours with custom colors, backgrounds, and text.',
    icon: Palette,
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&q=80', // Color palette
    details: [
      'Unlimited color combinations',
      'Gradient backgrounds available',
      'Add song titles, dates, or messages',
      'Upload custom background images',
    ],
    tip: 'Match the colors to your room decor or choose something that reflects the mood of the audio.',
  },
  {
    number: 4,
    title: 'Preview in Your Space',
    description: 'See exactly how your artwork will look in real room settings.',
    icon: Eye,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80', // Living room
    details: [
      'Multiple room mockup views',
      'See different sizes side-by-side',
      'Preview framed and canvas options',
      'Rotate through different angles',
    ],
    tip: 'Use the room preview to help decide on the perfect size for your space.',
  },
  {
    number: 5,
    title: 'Select Product & Size',
    description: 'Choose from premium posters, canvas prints, or framed artwork.',
    icon: ShoppingBag,
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80', // Canvas art
    details: [
      'Matte & satin posters',
      'Gallery-wrapped canvas',
      'Ready-to-hang framed prints',
      'Sizes from 12"×16" to 36"×24"',
    ],
    tip: 'Canvas prints are great for a modern look, while framed prints offer a classic, polished appearance.',
  },
  {
    number: 6,
    title: 'Secure Checkout',
    description: 'Complete your order with our secure, encrypted checkout.',
    icon: CreditCard,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80', // Checkout
    details: [
      'All major credit cards accepted',
      'PayPal and Apple Pay',
      'SSL encrypted payments',
      'Order confirmation email',
    ],
    tip: 'Sign up for an account to track your orders and save your designs for later.',
  },
  {
    number: 7,
    title: 'Professional Printing',
    description: 'Your design is printed on museum-quality materials by experts.',
    icon: Printer,
    image: 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=600&q=80', // Printing
    details: [
      'Giclée printing technology',
      'Archival-quality inks',
      'Premium materials',
      'Quality inspection',
    ],
    tip: 'We use the same printing techniques trusted by museums and galleries worldwide.',
  },
  {
    number: 8,
    title: 'Delivered to Your Door',
    description: 'Carefully packaged and shipped directly to you.',
    icon: Home,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', // Home delivery
    details: [
      'Ships in 3-5 business days',
      'Protective packaging',
      'Tracking number provided',
      'Free shipping on orders $50+',
    ],
    tip: 'Keep an eye on your email for tracking updates. Most orders arrive within a week!',
  },
]

const faqs = [
  {
    question: 'What audio formats do you support?',
    answer: 'We support MP3, WAV, M4A, FLAC, OGG, and most common audio formats.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Most orders ship within 3-5 business days and arrive within 7-10 days.',
  },
  {
    question: 'Can I use copyrighted music?',
    answer: 'Yes! Since the waveform is an abstract visual representation, you can create art from any audio you own.',
  },
  {
    question: 'What if I\'m not satisfied?',
    answer: 'We offer a 30-day money-back guarantee. If you\'re not happy, we\'ll make it right.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
          
          {/* Hero image */}
          <div className="absolute inset-0 -z-20">
            <Image
              src="https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1920&q=80"
              alt="Music and creativity"
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Play className="h-4 w-4" />
                Step-by-Step Guide
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                How It{' '}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Works
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                From audio file to stunning wall art in just a few minutes.
                No design skills required.
              </p>
              <Link href="/create">
                <Button size="lg" className="gap-2">
                  Start Creating <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Quick Overview */}
        <section className="py-16 border-b">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { icon: FileAudio, label: 'Upload', desc: 'Any audio file' },
                { icon: Wand2, label: 'Design', desc: '30+ styles' },
                { icon: Package, label: 'Print', desc: 'Premium quality' },
                { icon: Truck, label: 'Ship', desc: 'To your door' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Steps */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              {detailedSteps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative mb-20 last:mb-0"
                >
                  {/* Connector line */}
                  {index < detailedSteps.length - 1 && (
                    <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-primary/10 hidden md:block" />
                  )}
                  
                  <div className={`flex flex-col md:flex-row gap-8 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                    {/* Image */}
                    <div className="md:w-1/2">
                      <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl">
                        <Image
                          src={step.image}
                          alt={step.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center shadow-lg">
                          {step.number}
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="md:w-1/2 flex flex-col justify-center">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <step.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                          <p className="text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4 ml-16">
                        {step.details.map((detail) => (
                          <div key={detail} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="text-sm">{detail}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 ml-16">
                        <p className="text-sm">
                          <span className="font-semibold text-primary">Pro tip:</span>{' '}
                          {step.tip}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Preview */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                Common Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.question} className="bg-card border rounded-xl p-6">
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link href="/faq">
                  <Button variant="outline" className="gap-2">
                    View All FAQs <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Create your first SoundPrint in minutes. No design experience needed.
              </p>
              <Link href="/create">
                <Button size="lg" className="text-lg px-10 gap-2">
                  Create Your SoundPrint
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
