import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ProductShowcase } from '@/components/products/product-showcase'
import { RoomShowcase } from '@/components/products/room-showcase'
import {
  BeforeAfterShowcase,
  TrustBadges,
  VideoShowcase,
  OccasionsGrid,
  GuaranteeSection,
} from '@/components/sections/homepage'
import { 
  Music, 
  Palette, 
  ShoppingBag, 
  Sparkles, 
  Heart, 
  MessageCircle, 
  Star, 
  ArrowRight,
  Waves,
  Gift,
  Upload
} from 'lucide-react'

// Unsplash image URLs for different sections
const unsplashImages = {
  hero: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920&q=80', // Music/audio studio
  weddingSong: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', // Wedding dance
  voiceMessage: 'https://images.unsplash.com/photo-1516733968668-dbdce39c0651?w=800&q=80', // Grandmother
  favoriteSong: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80', // Music concert
  uniqueGift: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80', // Gift box
  testimonial1: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80', // Woman
  testimonial2: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80', // Man
  testimonial3: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80', // Woman
  socialProof: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
  ],
}

const testimonials = [
  {
    name: 'Sarah M.',
    text: "I turned my grandmother's voicemail into a canvas print. It's now my most treasured possession.",
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
  },
  {
    name: 'James K.',
    text: "Our wedding song looks absolutely stunning as wall art. The quality exceeded my expectations!",
    rating: 5,
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
  },
  {
    name: 'Emily R.',
    text: "Made one with my baby's first laugh. Everyone who visits asks about it. Such a unique gift idea!",
    rating: 5,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
  }
]

const useCases = [
  { 
    icon: Heart, 
    title: 'Wedding Songs', 
    description: "Your first dance, preserved forever",
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80'
  },
  { 
    icon: MessageCircle, 
    title: 'Voice Messages', 
    description: "A loved one's voice, visualized",
    image: 'https://images.unsplash.com/photo-1516733968668-dbdce39c0651?w=400&q=80'
  },
  { 
    icon: Music, 
    title: 'Favorite Songs', 
    description: 'The soundtrack to your memories',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80'
  },
  { 
    icon: Gift, 
    title: 'Unique Gifts', 
    description: 'Personalized art they\'ll cherish',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80'
  },
]

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section - Enhanced */}
        <section className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 -z-10" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
          
          {/* Hero background image */}
          <div className="absolute inset-0 -z-20">
            <Image
              src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920&q=80"
              alt="Music studio"
              fill
              className="object-cover opacity-5"
              priority
            />
          </div>
          
          <div className="container mx-auto px-4 py-24 md:py-32">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
                <Waves className="h-4 w-4" />
                Transform Sound Into Art
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Your <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">Audio</span>,
                <br />
                Your <span className="bg-gradient-to-r from-primary/60 via-primary/80 to-primary bg-clip-text text-transparent">Masterpiece</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Turn meaningful sounds into stunning visual art. Your favorite song, 
                a voice message, any audio moment—beautifully printed, forever preserved.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/create">
                  <Button size="lg" className="text-lg px-8 py-6 gap-2 shadow-lg hover:shadow-xl transition-shadow">
                    Create Your SoundPrint
                    <Sparkles className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6 gap-2">
                    Learn More
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
              
              {/* Social proof */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {unsplashImages.socialProof.map((img, i) => (
                      <div key={i} className="relative w-8 h-8 rounded-full border-2 border-background overflow-hidden">
                        <Image
                          src={img}
                          alt={`Customer ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <span>1,000+ happy customers</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-1">4.9/5 rating</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="border-t border-b bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {useCases.map((useCase, i) => (
                <div key={i} className="group text-center p-4">
                  <div className="relative w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                    <Image
                      src={useCase.image}
                      alt={useCase.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors" />
                    <useCase.icon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                  <h3 className="font-semibold mb-1">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NEW: Trust Badges */}
        <TrustBadges />

        {/* NEW: Before/After Showcase */}
        <BeforeAfterShowcase />

        {/* How It Works - Enhanced */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Create in 3 Simple Steps</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From audio to artwork in minutes. No design experience needed.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="relative text-center p-8 rounded-2xl border bg-card hover:shadow-lg transition-shadow group">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Upload Your Audio</h3>
                <p className="text-muted-foreground">
                  Drop in any audio file—MP3, WAV, or more. Songs, voice messages, podcasts, anything with meaning.
                </p>
              </div>
              
              <div className="relative text-center p-8 rounded-2xl border bg-card hover:shadow-lg transition-shadow group">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6 group-hover:scale-110 transition-transform">
                  <Palette className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Customize Your Design</h3>
                <p className="text-muted-foreground">
                  Choose from 30+ styles. Pick your colors, select the perfect section, add personalized text.
                </p>
              </div>
              
              <div className="relative text-center p-8 rounded-2xl border bg-card hover:shadow-lg transition-shadow group">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Order Your Artwork</h3>
                <p className="text-muted-foreground">
                  Print on premium posters, canvas, apparel, and more. We handle production and ship right to you.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link href="/create">
                <Button size="lg" className="gap-2">
                  Start Creating <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Product Showcase */}
        <ProductShowcase />

        {/* NEW: Occasions Grid */}
        <OccasionsGrid />

        {/* Testimonials Section */}
        <section className="py-24 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Loved by Thousands</h2>
              <p className="text-xl text-muted-foreground">
                See what our customers are saying
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {testimonials.map((testimonial, i) => (
                <div key={i} className="bg-card border rounded-2xl p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">&quot;{testimonial.text}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="font-semibold">— {testimonial.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Room Showcase */}
        <RoomShowcase />

        {/* NEW: Video Showcase */}
        <VideoShowcase />

        {/* NEW: Guarantee Section */}
        <GuaranteeSection />

        {/* CTA Section - Enhanced */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-12 md:p-16">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-primary/5 rounded-full blur-3xl" />
              
              <div className="relative">
                <Waves className="h-12 w-12 text-primary mx-auto mb-6" />
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Ready to Create Your SoundPrint?
                </h2>
                <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                  Transform your favorite audio moments into stunning art. 
                  It only takes minutes to create something you'll treasure forever.
                </p>
                <Link href="/create">
                  <Button size="lg" className="text-lg px-10 py-6 gap-2 shadow-lg">
                    Start Creating Now
                    <Sparkles className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <SiteFooter />
    </div>
  );
}
