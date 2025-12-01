import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Home, Search, Music, ArrowLeft, Waves } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          {/* Animated waveform illustration */}
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                <Waves className="w-12 h-12 text-primary" />
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full border-2 border-dashed border-primary/20 animate-spin" style={{ animationDuration: '20s' }} />
          </div>

          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-3">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Oops! The page you're looking for seems to have wandered off into the soundwaves. 
            Let's get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Button asChild size="lg">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/create">
                <Music className="mr-2 h-4 w-4" />
                Create SoundPrint
              </Link>
            </Button>
          </div>

          {/* Helpful links */}
          <div className="border-t pt-8">
            <p className="text-sm text-muted-foreground mb-4">Looking for something specific?</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/about" className="text-primary hover:underline">
                About Us
              </Link>
              <Link href="/faq" className="text-primary hover:underline">
                FAQ
              </Link>
              <Link href="/contact" className="text-primary hover:underline">
                Contact
              </Link>
              <Link href="/my-orders" className="text-primary hover:underline">
                My Orders
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
