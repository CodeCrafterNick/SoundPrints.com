import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ProductShowcase } from '@/components/products/product-showcase'
import { RoomShowcase } from '@/components/products/room-showcase'
import { WaveDivider, SoundwaveDivider } from '@/components/ui/wave-divider'
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

// Expanded Unsplash image collection for image-heavy design
const unsplashImages = {
  // Hero section
  hero: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1920&q=80',
  heroAlt: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=80', // Concert lights
  
  // Use cases
  weddingSong: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
  voiceMessage: 'https://images.unsplash.com/photo-1516733968668-dbdce39c0651?w=800&q=80',
  favoriteSong: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
  uniqueGift: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&q=80',
  
  // Process/How it works images
  upload: 'https://images.unsplash.com/photo-1558383817-6ea5aad8c57f?w=600&q=80', // Person with phone
  customize: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80', // Design/creative
  artwork: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=600&q=80', // Art print
  
  // Lifestyle/room images
  livingRoom: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
  bedroom: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80',
  office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
  gallery: 'https://images.unsplash.com/photo-1577083552792-a0d461cb1dd6?w=1200&q=80',
  
  // Music/audio themed
  headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  vinyl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
  studio: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80',
  speakers: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
  
  // Emotional/gift images
  couple: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80',
  family: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80',
  baby: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=80',
  friends: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
  
  // Testimonials
  testimonial1: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
  testimonial2: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
  testimonial3: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
  
  // Social proof avatars
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
    <div className="min-h-screen flex flex-col bg-gradient-mesh">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section - Enhanced with gradient background */}
        <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-900 dark:to-violet-950">
          {/* Animated gradient orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-400/20 rounded-full blur-3xl -z-10 animate-pulse" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl -z-10 animate-pulse animation-delay-1000" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-fuchsia-400/10 rounded-full blur-3xl -z-10 animate-pulse animation-delay-2000" />
          
          <div className="container mx-auto px-4 py-24 md:py-32">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-200/50 dark:border-violet-700/50 text-violet-700 dark:text-violet-300 text-sm font-medium mb-8">
                <Waves className="h-4 w-4" />
                Transform Sound Into Art
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Your <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Audio</span>,
                <br />
                Your <span className="bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">Masterpiece</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Turn meaningful sounds into stunning visual art. Your favorite song, 
                a voice message, any audio moment—beautifully printed, forever preserved.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/create">
                  <Button size="lg" className="text-lg px-8 py-6 gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all">
                    Create Your SoundPrint
                    <Sparkles className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg" className="text-lg px-8 py-6 gap-2 border-violet-200 hover:bg-violet-50 dark:border-violet-700 dark:hover:bg-violet-900/30">
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
          
          {/* Soundwave divider at bottom of hero */}
          <SoundwaveDivider height="lg" colorScheme="mixed" />
        </section>

        {/* Featured Image Banner */}
        <section className="relative h-[300px] md:h-[400px] -mt-1 overflow-hidden">
          <Image
            src={unsplashImages.heroAlt}
            alt="Music and sound visualization"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-violet-900/80 via-purple-900/60 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-xl">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Every Sound Tells a Story
                </h2>
                <p className="text-lg text-white/80 mb-6">
                  From the beat of your favorite song to the voice of someone you love—
                  capture it forever as stunning wall art.
                </p>
                <Link href="/create">
                  <Button size="lg" className="bg-white text-violet-600 hover:bg-white/90">
                    Start Creating <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section with larger images */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Perfect For Every Moment</h2>
              <p className="text-lg text-muted-foreground">Turn any audio memory into art</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {useCases.map((useCase, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl group-hover:shadow-violet-500/20 transition-all mb-4">
                    <Image
                      src={useCase.image}
                      alt={useCase.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="flex items-center gap-2 text-white mb-1">
                        <useCase.icon className="h-5 w-5" />
                        <h3 className="font-semibold">{useCase.title}</h3>
                      </div>
                      <p className="text-sm text-white/80">{useCase.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Soundwave transition to Trust Badges */}
        <SoundwaveDivider flip height="md" colorScheme="violet" />

        {/* NEW: Trust Badges */}
        <TrustBadges />

        {/* NEW: Before/After Showcase */}
        <BeforeAfterShowcase />

        {/* How It Works - Enhanced with images */}
        <section className="relative py-24 overflow-hidden">
          {/* Background image with overlay */}
          <div className="absolute inset-0 -z-20">
            <Image
              src={unsplashImages.studio}
              alt="Music studio"
              fill
              className="object-cover opacity-5"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-violet-50/80 via-white/90 to-cyan-50/80 dark:from-slate-900/95 dark:via-slate-900/98 dark:to-slate-900/95 -z-10" />
          
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Create in 3 Simple Steps</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From audio to artwork in minutes. No design experience needed.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Step 1 */}
              <div className="group">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-lg group-hover:shadow-xl group-hover:shadow-violet-500/20 transition-all">
                  <Image
                    src={unsplashImages.upload}
                    alt="Upload your audio"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-violet-900/80 to-transparent" />
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-white font-bold flex items-center justify-center shadow-lg">
                    1
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Upload className="h-8 w-8 text-white mb-2" />
                    <h3 className="text-xl font-semibold text-white">Upload Your Audio</h3>
                  </div>
                </div>
                <p className="text-muted-foreground text-center">
                  Drop in any audio file—MP3, WAV, or more. Songs, voice messages, podcasts, anything with meaning.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="group">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-lg group-hover:shadow-xl group-hover:shadow-purple-500/20 transition-all">
                  <Image
                    src={unsplashImages.customize}
                    alt="Customize your design"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent" />
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white font-bold flex items-center justify-center shadow-lg">
                    2
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <Palette className="h-8 w-8 text-white mb-2" />
                    <h3 className="text-xl font-semibold text-white">Customize Your Design</h3>
                  </div>
                </div>
                <p className="text-muted-foreground text-center">
                  Choose from 30+ styles. Pick your colors, select the perfect section, add personalized text.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="group">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-6 shadow-lg group-hover:shadow-xl group-hover:shadow-cyan-500/20 transition-all">
                  <Image
                    src={unsplashImages.artwork}
                    alt="Order your artwork"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/80 to-transparent" />
                  <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-600 to-cyan-500 text-white font-bold flex items-center justify-center shadow-lg">
                    3
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <ShoppingBag className="h-8 w-8 text-white mb-2" />
                    <h3 className="text-xl font-semibold text-white">Order Your Artwork</h3>
                  </div>
                </div>
                <p className="text-muted-foreground text-center">
                  Print on premium posters, canvas, apparel, and more. We handle production and ship right to you.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Link href="/create">
                <Button size="lg" className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25">
                  Start Creating <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Soundwave transition to Product Showcase */}
        <SoundwaveDivider height="md" colorScheme="cyan" />

        {/* Product Showcase */}
        <ProductShowcase />

        {/* NEW: Occasions Grid */}
        <OccasionsGrid />

        {/* Lifestyle Gallery Section - Image heavy */}
        <section className="py-20 bg-gradient-to-b from-white to-violet-50/30 dark:from-slate-900 dark:to-violet-950/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">See It In Your Space</h2>
              <p className="text-lg text-muted-foreground">Beautiful in any room, perfect for any style</p>
            </div>
            
            {/* Masonry-style image grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg group col-span-1 row-span-2">
                <Image
                  src={unsplashImages.livingRoom}
                  alt="SoundPrint in living room"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white font-medium">Living Room</p>
                </div>
              </div>
              
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group">
                <Image
                  src={unsplashImages.headphones}
                  alt="Music lover"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group">
                <Image
                  src={unsplashImages.couple}
                  alt="Couple with art"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg group row-span-2">
                <Image
                  src={unsplashImages.bedroom}
                  alt="SoundPrint in bedroom"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white font-medium">Bedroom</p>
                </div>
              </div>
              
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group">
                <Image
                  src={unsplashImages.vinyl}
                  alt="Vinyl and music"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg group">
                <Image
                  src={unsplashImages.office}
                  alt="SoundPrint in office"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Soundwave transition */}
        <SoundwaveDivider flip height="md" colorScheme="mixed" />

        {/* Testimonials Section with larger photos */}
        <section className="relative py-24 overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0 -z-20">
            <Image
              src={unsplashImages.gallery}
              alt="Art gallery"
              fill
              className="object-cover opacity-5"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-100/80 via-purple-50/70 to-cyan-100/80 dark:from-violet-950/80 dark:via-slate-900/90 dark:to-cyan-950/80 -z-10" />
          
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Loved by Thousands</h2>
              <p className="text-xl text-muted-foreground">
                See what our customers are saying
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {testimonials.map((testimonial, i) => (
                <div key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-violet-100 dark:border-violet-900/50 rounded-2xl p-8 hover:shadow-xl hover:shadow-violet-500/10 transition-all">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">&quot;{testimonial.text}&quot;</p>
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-violet-200 dark:ring-violet-800">
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

        {/* CTA Section - Enhanced with soundwave design and background image */}
        <section className="relative py-24 overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0 -z-20">
            <Image
              src={unsplashImages.speakers}
              alt="Music speakers"
              fill
              className="object-cover"
            />
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/95 via-purple-600/90 to-fuchsia-600/95 -z-10" />
          
          {/* Soundwave pattern background */}
          <div className="absolute inset-0 opacity-20 -z-10">
            <svg className="absolute bottom-0 left-0 w-full h-32" viewBox="0 0 1440 120" preserveAspectRatio="none">
              <path fill="rgba(255,255,255,0.3)" d="M0,120 L0,95 L20,95 L20,70 L40,70 L40,85 L60,85 L60,55 L80,55 L80,75 L100,75 L100,40 L120,40 L120,65 L140,65 L140,50 L160,50 L160,70 L180,70 L180,35 L200,35 L200,60 L220,60 L220,45 L240,45 L240,65 L260,65 L260,30 L280,30 L280,55 L300,55 L300,40 L320,40 L320,60 L340,60 L340,25 L360,25 L360,50 L380,50 L380,35 L400,35 L400,55 L420,55 L420,20 L440,20 L440,45 L460,45 L460,30 L480,30 L480,50 L500,50 L500,15 L520,15 L520,40 L540,40 L540,25 L560,25 L560,45 L580,45 L580,10 L600,10 L600,35 L620,35 L620,20 L640,20 L640,40 L660,40 L660,8 L680,8 L680,32 L700,32 L700,18 L720,18 L720,38 L740,38 L740,8 L760,8 L760,32 L780,32 L780,18 L800,18 L800,38 L820,38 L820,10 L840,10 L840,35 L860,35 L860,20 L880,20 L880,40 L900,40 L900,15 L920,15 L920,40 L940,40 L940,25 L960,25 L960,45 L980,45 L980,20 L1000,20 L1000,45 L1020,45 L1020,30 L1040,30 L1040,50 L1060,50 L1060,25 L1080,25 L1080,50 L1100,50 L1100,35 L1120,35 L1120,55 L1140,55 L1140,30 L1160,30 L1160,55 L1180,55 L1180,40 L1200,40 L1200,60 L1220,60 L1220,35 L1240,35 L1240,60 L1260,60 L1260,45 L1280,45 L1280,65 L1300,65 L1300,50 L1320,50 L1320,70 L1340,70 L1340,55 L1360,55 L1360,75 L1380,75 L1380,65 L1400,65 L1400,85 L1420,85 L1420,90 L1440,90 L1440,120 Z" />
            </svg>
            <svg className="absolute top-0 left-0 w-full h-32 rotate-180" viewBox="0 0 1440 120" preserveAspectRatio="none">
              <path fill="rgba(255,255,255,0.2)" d="M0,120 L0,95 L20,95 L20,70 L40,70 L40,85 L60,85 L60,55 L80,55 L80,75 L100,75 L100,40 L120,40 L120,65 L140,65 L140,50 L160,50 L160,70 L180,70 L180,35 L200,35 L200,60 L220,60 L220,45 L240,45 L240,65 L260,65 L260,30 L280,30 L280,55 L300,55 L300,40 L320,40 L320,60 L340,60 L340,25 L360,25 L360,50 L380,50 L380,35 L400,35 L400,55 L420,55 L420,20 L440,20 L440,45 L460,45 L460,30 L480,30 L480,50 L500,50 L500,15 L520,15 L520,40 L540,40 L540,25 L560,25 L560,45 L580,45 L580,10 L600,10 L600,35 L620,35 L620,20 L640,20 L640,40 L660,40 L660,8 L680,8 L680,32 L700,32 L700,18 L720,18 L720,38 L740,38 L740,8 L760,8 L760,32 L780,32 L780,18 L800,18 L800,38 L820,38 L820,10 L840,10 L840,35 L860,35 L860,20 L880,20 L880,40 L900,40 L900,15 L920,15 L920,40 L940,40 L940,25 L960,25 L960,45 L980,45 L980,20 L1000,20 L1000,45 L1020,45 L1020,30 L1040,30 L1040,50 L1060,50 L1060,25 L1080,25 L1080,50 L1100,50 L1100,35 L1120,35 L1120,55 L1140,55 L1140,30 L1160,30 L1160,55 L1180,55 L1180,40 L1200,40 L1200,60 L1220,60 L1220,35 L1240,35 L1240,60 L1260,60 L1260,45 L1280,45 L1280,65 L1300,65 L1300,50 L1320,50 L1320,70 L1340,70 L1340,55 L1360,55 L1360,75 L1380,75 L1380,65 L1400,65 L1400,85 L1420,85 L1420,90 L1440,90 L1440,120 Z" />
            </svg>
          </div>
          
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center relative">
              <Waves className="h-12 w-12 text-white/80 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Ready to Create Your SoundPrint?
              </h2>
              <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                Transform your favorite audio moments into stunning art. 
                It only takes minutes to create something you'll treasure forever.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/create">
                  <Button size="lg" className="text-lg px-10 py-6 gap-2 bg-white text-violet-600 hover:bg-white/90 shadow-xl shadow-black/20">
                    Start Creating Now
                    <Sparkles className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/gallery">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-6 gap-2 border-white/30 text-white hover:bg-white/10">
                    View Gallery
                    <ArrowRight className="h-5 w-5" />
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
