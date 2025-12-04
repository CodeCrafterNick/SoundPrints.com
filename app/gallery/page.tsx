'use client'

import { useState } from 'react'
import Image from 'next/image'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  Music, 
  MessageCircle, 
  Baby, 
  Mic, 
  Radio,
  ArrowRight,
  Sparkles,
  Quote
} from 'lucide-react'
import { cn } from '@/lib/utils'

const categories = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'songs', label: 'Songs', icon: Music },
  { id: 'voicemails', label: 'Voice Messages', icon: MessageCircle },
  { id: 'baby', label: 'Baby Moments', icon: Baby },
  { id: 'podcasts', label: 'Podcasts', icon: Mic },
  { id: 'wedding', label: 'Wedding', icon: Heart },
]

const galleryItems = [
  {
    id: 1,
    category: 'songs',
    title: 'First Dance',
    description: 'Our wedding song "Perfect" by Ed Sheeran',
    customer: 'Sarah & Mike',
    style: 'Classic Bars',
    colors: { waveform: '#D4AF37', background: '#1a1a2e' },
    aspectRatio: '3/4',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80', // Wedding dance
  },
  {
    id: 2,
    category: 'voicemails',
    title: 'Grandma\'s Message',
    description: 'Her last voicemail saying "I love you"',
    customer: 'Emily R.',
    style: 'Smooth Wave',
    colors: { waveform: '#ffffff', background: '#2d3436' },
    aspectRatio: '1/1',
    image: 'https://images.unsplash.com/photo-1516733968668-dbdce39c0651?w=600&q=80', // Grandmother
  },
  {
    id: 3,
    category: 'baby',
    title: 'First Words',
    description: 'When she said "mama" for the first time',
    customer: 'The Johnson Family',
    style: 'Heartbeat',
    colors: { waveform: '#ff6b6b', background: '#fff5f5' },
    aspectRatio: '4/3',
    image: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=600&q=80', // Baby
  },
  {
    id: 4,
    category: 'songs',
    title: 'Our Song',
    description: '"Thinking Out Loud" - Our anniversary gift',
    customer: 'David & Lisa',
    style: 'Mirror Wave',
    colors: { waveform: '#6c5ce7', background: '#dfe6e9' },
    aspectRatio: '3/4',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80', // Concert
  },
  {
    id: 5,
    category: 'podcasts',
    title: 'Favorite Episode',
    description: 'The episode that changed my perspective',
    customer: 'Alex T.',
    style: 'Spectrum',
    colors: { waveform: '#00cec9', background: '#0d0d0d' },
    aspectRatio: '16/9',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&q=80', // Podcast studio
  },
  {
    id: 6,
    category: 'wedding',
    title: 'Vow Recording',
    description: 'His wedding vows, forever captured',
    customer: 'Jennifer K.',
    style: 'Classic Bars',
    colors: { waveform: '#fdcb6e', background: '#2d3436' },
    aspectRatio: '3/4',
    image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600&q=80', // Wedding rings
  },
  {
    id: 7,
    category: 'baby',
    title: 'Heartbeat',
    description: 'Our baby\'s first heartbeat at 12 weeks',
    customer: 'The Martinez Family',
    style: 'Heartbeat',
    colors: { waveform: '#e84393', background: '#ffeef8' },
    aspectRatio: '1/1',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80', // Ultrasound
  },
  {
    id: 8,
    category: 'songs',
    title: 'Memorial Tribute',
    description: 'Dad\'s favorite song - "What a Wonderful World"',
    customer: 'The Williams Family',
    style: 'Circular',
    colors: { waveform: '#74b9ff', background: '#0a3d62' },
    aspectRatio: '1/1',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80', // Music memory
  },
  {
    id: 9,
    category: 'voicemails',
    title: 'Birthday Surprise',
    description: 'Voice message from friends around the world',
    customer: 'Rachel M.',
    style: 'Blocks',
    colors: { waveform: '#fab1a0', background: '#2d3436' },
    aspectRatio: '3/4',
    image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=600&q=80', // Birthday
  }
]

const testimonials = [
  {
    quote: "I turned my grandmother's last voicemail into a canvas print. Now her voice lives on in our living room. I cry happy tears every time I look at it.",
    author: "Emily R.",
    location: "Boston, MA",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80"
  },
  {
    quote: "We used our first dance song for our 10th anniversary. My husband was speechless. Best gift I've ever given.",
    author: "Sarah M.",
    location: "Austin, TX",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80"
  },
  {
    quote: "Our baby's heartbeat from the first ultrasound - it's the most precious thing we own. Everyone asks about it!",
    author: "The Garcia Family",
    location: "Los Angeles, CA",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
  }
]

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filteredItems = activeCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory)

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/5 to-background py-16 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <Image
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80"
              alt="Art gallery"
              fill
              className="object-cover opacity-10"
              priority
            />
          </div>
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Customer Inspiration
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">SoundPrint Gallery</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how our customers have transformed their precious audio moments into 
              beautiful wall art. Get inspired for your own creation!
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 border-b sticky top-0 bg-background/95 backdrop-blur z-40">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                    activeCategory === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  )}
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div 
                  key={item.id}
                  className="group bg-card rounded-2xl border overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Preview Image */}
                  <div 
                    className="relative overflow-hidden"
                    style={{ aspectRatio: item.aspectRatio }}
                  >
                    {/* Background lifestyle image */}
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Overlay with waveform effect */}
                    <div 
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: `${item.colors.background}cc` }}
                    >
                      <div className="w-3/4 h-1/2 flex items-end justify-center gap-[2px]">
                        {Array.from({ length: 50 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-1 rounded-full transition-all duration-300"
                            style={{ 
                              backgroundColor: item.colors.waveform,
                              height: `${20 + Math.sin(i * 0.3) * 30 + Math.random() * 30}%`,
                              opacity: 0.8 + Math.random() * 0.2
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Link href="/create">
                        <Button>
                          Create Similar
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">By {item.customer}</span>
                      <span className="px-2 py-1 rounded-full bg-muted">{item.style}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-card rounded-2xl border p-6">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  <p className="text-muted-foreground mb-6 italic">&quot;{testimonial.quote}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ideas Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Ideas for Your SoundPrint</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Not sure what audio to use? Here are some popular ideas:
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                'Wedding first dance',
                'Baby\'s heartbeat',
                'Loved one\'s voicemail',
                'Favorite song lyrics',
                'Podcast moment',
                'Wedding vows',
                'Child\'s first words',
                'Pet sounds',
                'Graduation speech',
                'Anniversary song',
                'Memorial tribute',
                'Birthday message'
              ].map((idea, index) => (
                <div 
                  key={index}
                  className="px-4 py-3 rounded-xl bg-muted/50 border text-center text-sm hover:bg-primary/10 hover:border-primary/20 transition-colors cursor-default"
                >
                  {idea}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Create Your Own?</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Turn your meaningful audio moments into stunning visual art in just minutes.
            </p>
            <Link href="/create">
              <Button size="lg" className="gap-2">
                Start Creating
                <Sparkles className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
