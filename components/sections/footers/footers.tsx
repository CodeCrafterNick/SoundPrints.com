'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail,
  MapPin,
  Phone,
  CreditCard,
  Shield,
  Truck
} from 'lucide-react'

function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-8 w-8">
        {Array.from({ length: 5 }).map((_, i) => {
          const height = 8 + Math.sin(i * 0.8) * 12
          return (
            <rect
              key={i}
              x={i * 6 + 3}
              y={16 - height / 2}
              width="4"
              height={height}
              rx="2"
              className="fill-rose-500"
            />
          )
        })}
      </svg>
      <span className="text-xl font-bold">SoundPrints</span>
    </Link>
  )
}

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
]

const footerLinks = {
  shop: [
    { label: 'Create Your Print', href: '/create' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Gift Cards', href: '/gift-cards' },
    { label: 'Bestsellers', href: '/bestsellers' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Blog', href: '/blog' },
  ],
  support: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Shipping', href: '/shipping' },
    { label: 'Returns', href: '/refund-policy' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms-of-service' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
  ],
}

/**
 * Full-width Footer - comprehensive with all links
 */
export function FooterFullWidth() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        {/* Main footer content */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="col-span-2">
            <Logo className="text-white mb-6" />
            <p className="text-gray-400 mb-6 max-w-xs">
              Turn your favorite sounds into beautiful wall art. Songs, voice recordings, and more.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, i) => {
                const Icon = social.icon
                return (
                  <a 
                    key={i} 
                    href={social.href}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-rose-500 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>
          
          {/* Link columns */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="py-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} SoundPrints. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <CreditCard className="h-8 w-6 text-gray-400" />
            <span className="text-gray-400 text-sm">Secure payments</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

/**
 * Minimal Footer - simple and clean
 */
export function FooterMinimal() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
          
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {['About', 'FAQ', 'Contact', 'Privacy', 'Terms'].map((link) => (
              <Link 
                key={link} 
                href={`/${link.toLowerCase()}`}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {link}
              </Link>
            ))}
          </nav>
          
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} SoundPrints
          </p>
        </div>
      </div>
    </footer>
  )
}

/**
 * Newsletter-focused Footer
 */
export function FooterNewsletter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        {/* Newsletter section */}
        <div className="py-16 text-center border-b border-white/10">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Get 10% Off Your First Order</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Subscribe to our newsletter for exclusive discounts and updates.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
            <Button className="bg-rose-500 hover:bg-rose-600">Subscribe</Button>
          </div>
        </div>
        
        {/* Links */}
        <div className="py-8 flex flex-wrap items-center justify-center gap-8">
          {[...footerLinks.shop, ...footerLinks.support].slice(0, 6).map((link, i) => (
            <Link 
              key={i}
              href={link.href}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
        
        {/* Bottom */}
        <div className="py-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo className="text-white" />
          <div className="flex gap-4">
            {socialLinks.map((social, i) => {
              const Icon = social.icon
              return (
                <a 
                  key={i} 
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              )
            })}
          </div>
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} SoundPrints</p>
        </div>
      </div>
    </footer>
  )
}

/**
 * Mega Footer - comprehensive with features
 */
export function FooterMega() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Feature bar */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $75' },
              { icon: Shield, title: '30-Day Returns', desc: 'Money-back guarantee' },
              { icon: CreditCard, title: 'Secure Payment', desc: '100% secure checkout' },
              { icon: Mail, title: '24/7 Support', desc: 'We\'re here to help' },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <div key={i} className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-rose-400" />
                  <div>
                    <p className="font-medium text-sm">{feature.title}</p>
                    <p className="text-xs text-gray-400">{feature.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Logo className="text-white mb-4" />
            <p className="text-gray-400 text-sm mb-6">
              Transform your favorite sounds into stunning wall art. Perfect for weddings, anniversaries, baby milestones, and memorial tributes.
            </p>
            
            {/* Contact info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <span>hello@soundprints.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <span>1-800-SOUND-ART</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Austin, Texas, USA</span>
              </div>
            </div>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Help</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} SoundPrints. All rights reserved.
            </p>
            
            {/* Social */}
            <div className="flex gap-4">
              {socialLinks.map((social, i) => {
                const Icon = social.icon
                return (
                  <a 
                    key={i} 
                    href={social.href}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-rose-500 transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                )
              })}
            </div>
            
            {/* Legal links */}
            <div className="flex gap-4">
              {footerLinks.legal.map((link, i) => (
                <Link 
                  key={i}
                  href={link.href}
                  className="text-gray-400 hover:text-white text-xs transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

/**
 * Social-focused Footer
 */
export function FooterSocialFocused() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 py-12">
        {/* Social section */}
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Follow Our Journey</h3>
          <p className="text-gray-600 mb-8">Join 50,000+ followers for inspiration and updates</p>
          <div className="flex justify-center gap-6">
            {socialLinks.map((social, i) => {
              const Icon = social.icon
              return (
                <a 
                  key={i} 
                  href={social.href}
                  className="flex flex-col items-center gap-2 group"
                  aria-label={social.label}
                >
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-rose-500 transition-colors">
                    <Icon className="h-6 w-6 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-sm text-gray-500">{social.label}</span>
                </a>
              )
            })}
          </div>
        </div>
        
        {/* Quick links */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {['Create', 'Gallery', 'About', 'FAQ', 'Contact', 'Shipping', 'Returns'].map((link) => (
            <Link 
              key={link}
              href={`/${link.toLowerCase()}`}
              className="text-gray-600 hover:text-rose-500 transition-colors"
            >
              {link}
            </Link>
          ))}
        </div>
        
        {/* Bottom */}
        <div className="text-center pt-8 border-t border-gray-100">
          <Logo className="justify-center mb-4" />
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} SoundPrints. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
