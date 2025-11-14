import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CartDialog } from '@/components/cart/cart-dialog'
import { ProductShowcase } from '@/components/products/product-showcase'
import { RoomShowcase } from '@/components/products/room-showcase'
import { Music, Palette, ShoppingBag, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">SoundPrints</h1>
            <nav className="flex gap-4 items-center">
              <Link href="/create">
                <Button variant="ghost">Create</Button>
              </Link>
              <CartDialog />
            </nav>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Turn Your Audio Into Art
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create custom waveform prints from your favorite songs, voice messages, or any audio moment. 
              Beautiful designs on posters, apparel, and more.
            </p>
            <Link href="/create">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/20 py-20">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Music className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold">Upload Audio</h4>
                <p className="text-muted-foreground">
                  Upload your favorite song, voice message, or podcast clip
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Palette className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold">Customize Design</h4>
                <p className="text-muted-foreground">
                  Choose colors, select your favorite section, and personalize
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <ShoppingBag className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-semibold">Choose Product</h4>
                <p className="text-muted-foreground">
                  Print on posters, t-shirts, mugs, canvas, and more
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Product Showcase */}
        <ProductShowcase />

        {/* Room Showcase */}
        <RoomShowcase />

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center border rounded-2xl p-12 bg-gradient-to-br from-primary/5 to-primary/10">
            <h3 className="text-3xl font-bold mb-4">Ready to Create?</h3>
            <p className="text-muted-foreground mb-8">
              Transform your favorite audio moments into stunning custom prints in minutes
            </p>
            <Link href="/create">
              <Button size="lg" className="text-lg px-8">
                Start Creating Now
              </Button>
            </Link>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-8 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 SoundPrints. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
