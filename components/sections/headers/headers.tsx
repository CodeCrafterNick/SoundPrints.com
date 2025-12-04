'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Menu, X, User, Search } from 'lucide-react'

const navLinks = [
  { href: '/create', label: 'Create' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
]

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
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
      <span className="text-xl font-bold text-gray-900">SoundPrints</span>
    </Link>
  )
}

/**
 * Sticky Header - stays fixed at top when scrolling
 */
export function HeaderSticky() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-3' : 'bg-white/80 backdrop-blur-md py-4'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <Logo />
          
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link 
                key={link.href} 
                href={link.href}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </button>
            <Link href="/create" className="hidden sm:block">
              <Button className="bg-rose-500 hover:bg-rose-600">Create Now</Button>
            </Link>
            
            {/* Mobile menu toggle */}
            <button 
              className="md:hidden p-2 hover:bg-gray-100 rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <nav className="flex flex-col gap-4">
              {navLinks.map(link => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="text-gray-600 hover:text-gray-900 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/create" className="mt-2">
                <Button className="w-full bg-rose-500 hover:bg-rose-600">Create Now</Button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

/**
 * Transparent Header - for hero sections with background images
 */
export function HeaderTransparent() {
  const [isScrolled, setIsScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
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
                    className={isScrolled ? 'fill-rose-500' : 'fill-white'}
                  />
                )
              })}
            </svg>
            <span className={`text-xl font-bold ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
              SoundPrints
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`font-medium transition-colors ${
                  isScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-4">
            <button className={`p-2 rounded-full transition-colors ${
              isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/10'
            }`}>
              <ShoppingCart className={`h-5 w-5 ${isScrolled ? 'text-gray-600' : 'text-white'}`} />
            </button>
            <Link href="/create">
              <Button className={isScrolled 
                ? 'bg-rose-500 hover:bg-rose-600' 
                : 'bg-white text-gray-900 hover:bg-gray-100'
              }>
                Create Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

/**
 * Minimal Header - clean, simple design
 */
export function HeaderMinimal() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Logo />
          
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link 
                key={link.href} 
                href={link.href}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          <div className="flex items-center gap-2">
            <Link href="/sign-in" className="hidden sm:block">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/create">
              <Button size="sm" className="bg-rose-500 hover:bg-rose-600">Create</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

/**
 * Centered Logo Header - logo in the middle
 */
export function HeaderCenteredLogo() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-2 border-b border-gray-100 text-xs text-gray-500">
          <span>Free shipping on orders over $75</span>
          <div className="flex items-center gap-4">
            <Link href="/faq" className="hover:text-gray-900">Help</Link>
            <Link href="/sign-in" className="hover:text-gray-900">Sign In</Link>
          </div>
        </div>
        
        {/* Main header */}
        <div className="py-6">
          {/* Centered logo */}
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center gap-3">
              <svg viewBox="0 0 32 32" className="h-10 w-10">
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
              <span className="text-2xl font-bold text-gray-900">SoundPrints</span>
            </Link>
          </div>
          
          {/* Centered nav */}
          <nav className="flex items-center justify-center gap-8">
            {navLinks.map(link => (
              <Link 
                key={link.href} 
                href={link.href}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

/**
 * Header with Mega Menu
 */
export function HeaderMegaMenu() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  
  const megaMenuContent = {
    products: {
      categories: [
        { title: 'By Style', items: ['Classic Waveform', 'Circular', 'Galaxy Spiral', 'DNA Helix', 'Vinyl Record'] },
        { title: 'By Occasion', items: ['Wedding', 'Anniversary', 'Baby', 'Memorial', 'Graduation'] },
        { title: 'By Product', items: ['Framed Prints', 'Canvas', 'Posters', 'Metal Prints', 'Gift Cards'] }
      ]
    },
    about: {
      categories: [
        { title: 'Company', items: ['Our Story', 'Team', 'Press', 'Careers'] },
        { title: 'Support', items: ['FAQ', 'Contact', 'Shipping', 'Returns'] }
      ]
    }
  }
  
  return (
    <header className="bg-white border-b border-gray-100 relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Logo />
          
          <nav className="hidden md:flex items-center gap-8">
            <div 
              className="relative"
              onMouseEnter={() => setActiveMenu('products')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link href="/gallery" className="text-gray-600 hover:text-gray-900 font-medium py-4">
                Products
              </Link>
            </div>
            <Link href="/create" className="text-gray-600 hover:text-gray-900 font-medium">
              Create
            </Link>
            <div 
              className="relative"
              onMouseEnter={() => setActiveMenu('about')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link href="/about" className="text-gray-600 hover:text-gray-900 font-medium py-4">
                About
              </Link>
            </div>
            <Link href="/faq" className="text-gray-600 hover:text-gray-900 font-medium">
              FAQ
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <User className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full relative">
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mega menu dropdown */}
      {activeMenu && (
        <div 
          className="absolute left-0 right-0 bg-white border-b border-gray-100 shadow-lg"
          onMouseEnter={() => setActiveMenu(activeMenu)}
          onMouseLeave={() => setActiveMenu(null)}
        >
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-3 gap-8">
              {megaMenuContent[activeMenu as keyof typeof megaMenuContent]?.categories.map((category, i) => (
                <div key={i}>
                  <h4 className="font-semibold text-gray-900 mb-4">{category.title}</h4>
                  <ul className="space-y-2">
                    {category.items.map((item, j) => (
                      <li key={j}>
                        <Link href="#" className="text-gray-600 hover:text-rose-500 transition-colors">
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
