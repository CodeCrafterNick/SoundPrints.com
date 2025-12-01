import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ProductShowcase } from '@/components/products/product-showcase'
import { RoomShowcase } from '@/components/products/room-showcase'
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

const testimonials = [
  {
    name: 'Sarah M.',
    text: "I turned my grandmother's voicemail into a canvas print. It's now my most treasured possession.",
    rating: 5
  },
  {
    name: 'James K.',
    text: "Our wedding song looks absolutely stunning as wall art. The quality exceeded my expectations!",
    rating: 5
  },
  {
    name: 'Emily R.',
    text: "Made one with my baby's first laugh. Everyone who visits asks about it. Such a unique gift idea!",
    rating: 5
  }
]

const useCases = [
  { icon: Heart, title: 'Wedding Songs', description: "Your first dance, preserved forever" },
  { icon: MessageCircle, title: 'Voice Messages', description: "A loved one's voice, visualized" },
  { icon: Music, title: 'Favorite Songs', description: 'The soundtrack to your memories' },
  { icon: Gift, title: 'Unique Gifts', description: 'Personalized art they\'ll cherish' },
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
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-background" />
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
        <section className="border-t border-b bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {useCases.map((useCase, i) => (
                <div key={i} className="text-center p-4">
                  <useCase.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-1">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

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
                  <p className="text-muted-foreground mb-6 italic">"{testimonial.text}"</p>
                  <p className="font-semibold">— {testimonial.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Room Showcase */}
        <RoomShowcase />

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
