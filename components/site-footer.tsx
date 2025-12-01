import Link from 'next/link'
import { Waves, Heart } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="border-t py-12 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Waves className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">SoundPrints</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Transform your audio moments into beautiful, personalized artwork.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Create</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/create" className="hover:text-foreground transition-colors">Design Your SoundPrint</Link></li>
              <li><Link href="/gallery" className="hover:text-foreground transition-colors">Gallery & Inspiration</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">How It Works</Link></li>
              <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              <li><Link href="/shipping" className="hover:text-foreground transition-colors">Shipping Info</Link></li>
              <li><Link href="/faq" className="hover:text-foreground transition-colors">Help Center</Link></li>
              <li><Link href="/refund-policy" className="hover:text-foreground transition-colors">Refunds</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="hover:text-foreground transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 SoundPrints. All rights reserved. Made with <Heart className="h-3 w-3 inline text-red-500 fill-red-500" /> for audio lovers.</p>
        </div>
      </div>
    </footer>
  )
}
