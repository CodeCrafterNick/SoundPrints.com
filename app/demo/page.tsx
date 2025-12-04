'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

// Hero sections
import { 
  HeroSplit, 
  HeroMinimalCenter, 
  HeroWithTestimonial, 
  HeroInteractive,
  HeroVideoBackground,
  HeroCarousel
} from '@/components/sections/hero'

// Feature sections
import { 
  HowItWorks, 
  FeatureGrid, 
  BenefitsHighlights,
  AnimatedReveal,
  ComparisonSection
} from '@/components/sections/features'

// Product sections
import {
  BestsellersCarousel,
  ProductGrid,
  ThreeDGallery,
  ProductCardShowcase
} from '@/components/sections/products'

// Testimonial sections
import {
  TestimonialMasonry,
  TestimonialCarousel,
  SocialProof,
  VideoTestimonials
} from '@/components/sections/testimonials'

// CTA sections
import {
  FullWidthCTA,
  NewsletterSignup,
  LimitedOfferBanner,
  FloatingCTA
} from '@/components/sections/cta'

// Headers
import {
  HeaderSticky,
  HeaderTransparent,
  HeaderMinimal,
  HeaderCenteredLogo,
  HeaderMegaMenu
} from '@/components/sections/headers'

// Footers
import {
  FooterFullWidth,
  FooterMinimal,
  FooterNewsletter,
  FooterMega,
  FooterSocialFocused
} from '@/components/sections/footers'

// Logos
import {
  LogoPrimary,
  LogoIcon,
  LogoWordmark,
  LogoBadge,
  LogoStacked,
  LogoAnimated,
  LogoMonochrome,
  LogoGradient
} from '@/components/brand'

type Category = 'heroes' | 'features' | 'products' | 'testimonials' | 'ctas' | 'headers' | 'footers' | 'logos'

const categories: { id: Category; label: string }[] = [
  { id: 'heroes', label: 'Hero Sections' },
  { id: 'features', label: 'Feature Sections' },
  { id: 'products', label: 'Product Sections' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'ctas', label: 'Call-to-Actions' },
  { id: 'headers', label: 'Headers' },
  { id: 'footers', label: 'Footers' },
  { id: 'logos', label: 'Logos' },
]

export default function DemoPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('heroes')
  
  return (
    <div className="min-h-screen bg-white">
      {/* Demo Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Component Demo</h1>
            <Button variant="outline" asChild>
              <a href="/">Back to Site</a>
            </Button>
          </div>
          
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div>
        {/* Hero Sections */}
        {activeCategory === 'heroes' && (
          <div className="space-y-8">
            <SectionWrapper title="Hero Split Layout">
              <HeroSplit />
            </SectionWrapper>
            
            <SectionWrapper title="Hero Minimal Center (Dark)">
              <HeroMinimalCenter />
            </SectionWrapper>
            
            <SectionWrapper title="Hero with Testimonial">
              <HeroWithTestimonial />
            </SectionWrapper>
            
            <SectionWrapper title="Hero Interactive (Mouse-responsive)">
              <HeroInteractive />
            </SectionWrapper>
            
            <SectionWrapper title="Hero Video Background">
              <HeroVideoBackground />
            </SectionWrapper>
            
            <SectionWrapper title="Hero Carousel">
              <HeroCarousel />
            </SectionWrapper>
          </div>
        )}
        
        {/* Feature Sections */}
        {activeCategory === 'features' && (
          <div className="space-y-8">
            <SectionWrapper title="How It Works">
              <HowItWorks />
            </SectionWrapper>
            
            <SectionWrapper title="Feature Grid">
              <FeatureGrid />
            </SectionWrapper>
            
            <SectionWrapper title="Benefits Highlights">
              <BenefitsHighlights />
            </SectionWrapper>
            
            <SectionWrapper title="Animated Reveal Cards">
              <AnimatedReveal />
            </SectionWrapper>
            
            <SectionWrapper title="Comparison Section">
              <ComparisonSection />
            </SectionWrapper>
          </div>
        )}
        
        {/* Product Sections */}
        {activeCategory === 'products' && (
          <div className="space-y-8">
            <SectionWrapper title="Bestsellers Carousel">
              <BestsellersCarousel />
            </SectionWrapper>
            
            <SectionWrapper title="Product Grid with Filters">
              <ProductGrid />
            </SectionWrapper>
            
            <SectionWrapper title="3D Gallery">
              <ThreeDGallery />
            </SectionWrapper>
            
            <SectionWrapper title="Product Card Showcase">
              <ProductCardShowcase />
            </SectionWrapper>
          </div>
        )}
        
        {/* Testimonial Sections */}
        {activeCategory === 'testimonials' && (
          <div className="space-y-8">
            <SectionWrapper title="Testimonial Masonry Grid">
              <TestimonialMasonry />
            </SectionWrapper>
            
            <SectionWrapper title="Testimonial Carousel">
              <TestimonialCarousel />
            </SectionWrapper>
            
            <SectionWrapper title="Social Proof (Dark)">
              <SocialProof />
            </SectionWrapper>
            
            <SectionWrapper title="Video Testimonials">
              <VideoTestimonials />
            </SectionWrapper>
          </div>
        )}
        
        {/* CTA Sections */}
        {activeCategory === 'ctas' && (
          <div className="space-y-8">
            <SectionWrapper title="Limited Offer Banner">
              <LimitedOfferBanner />
            </SectionWrapper>
            
            <SectionWrapper title="Full-Width CTA">
              <FullWidthCTA />
            </SectionWrapper>
            
            <SectionWrapper title="Newsletter Signup">
              <NewsletterSignup />
            </SectionWrapper>
            
            <SectionWrapper title="Floating CTA (scroll to see)">
              <div className="h-[600px] bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Scroll down to see the floating CTA appear</p>
              </div>
              <FloatingCTA />
            </SectionWrapper>
          </div>
        )}
        
        {/* Headers */}
        {activeCategory === 'headers' && (
          <div className="space-y-8">
            <SectionWrapper title="Sticky Header">
              <div className="relative h-[400px] bg-gray-100 overflow-auto">
                <HeaderSticky />
                <div className="pt-20 p-8">
                  <p className="text-gray-500">Scroll inside this container to see the sticky header effect</p>
                  <div className="h-[600px]" />
                </div>
              </div>
            </SectionWrapper>
            
            <SectionWrapper title="Transparent Header (for dark backgrounds)">
              <div className="relative h-[400px] bg-gray-900 overflow-auto">
                <HeaderTransparent />
                <div className="pt-20 p-8">
                  <p className="text-gray-400">Scroll inside this container to see the header transition</p>
                  <div className="h-[600px]" />
                </div>
              </div>
            </SectionWrapper>
            
            <SectionWrapper title="Minimal Header">
              <HeaderMinimal />
            </SectionWrapper>
            
            <SectionWrapper title="Centered Logo Header">
              <HeaderCenteredLogo />
            </SectionWrapper>
            
            <SectionWrapper title="Mega Menu Header">
              <HeaderMegaMenu />
              <p className="text-center text-sm text-gray-500 mt-4">Hover over &quot;Products&quot; or &quot;About&quot; to see mega menu</p>
            </SectionWrapper>
          </div>
        )}
        
        {/* Footers */}
        {activeCategory === 'footers' && (
          <div className="space-y-8">
            <SectionWrapper title="Full-Width Footer">
              <FooterFullWidth />
            </SectionWrapper>
            
            <SectionWrapper title="Minimal Footer">
              <FooterMinimal />
            </SectionWrapper>
            
            <SectionWrapper title="Newsletter-focused Footer">
              <FooterNewsletter />
            </SectionWrapper>
            
            <SectionWrapper title="Mega Footer">
              <FooterMega />
            </SectionWrapper>
            
            <SectionWrapper title="Social-focused Footer">
              <FooterSocialFocused />
            </SectionWrapper>
          </div>
        )}
        
        {/* Logos */}
        {activeCategory === 'logos' && (
          <div className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <LogoCard title="Primary Logo">
                  <LogoPrimary size="lg" />
                </LogoCard>
                
                <LogoCard title="Icon Only">
                  <LogoIcon size="xl" />
                </LogoCard>
                
                <LogoCard title="Wordmark Only">
                  <LogoWordmark size="lg" />
                </LogoCard>
                
                <LogoCard title="Badge Logo">
                  <LogoBadge size="lg" />
                </LogoCard>
                
                <LogoCard title="Stacked Logo">
                  <LogoStacked size="md" />
                </LogoCard>
                
                <LogoCard title="Animated Logo">
                  <LogoAnimated size="md" />
                </LogoCard>
                
                <LogoCard title="Monochrome Logo" dark>
                  <LogoMonochrome size="lg" color="white" />
                </LogoCard>
                
                <LogoCard title="Gradient Logo">
                  <LogoGradient size="lg" />
                </LogoCard>
              </div>
              
              {/* Size variations */}
              <div className="mt-16">
                <h3 className="text-xl font-bold text-gray-900 mb-8">Size Variations</h3>
                <div className="flex flex-wrap items-end gap-8">
                  <div className="text-center">
                    <LogoPrimary size="sm" />
                    <p className="text-xs text-gray-500 mt-2">Small</p>
                  </div>
                  <div className="text-center">
                    <LogoPrimary size="md" />
                    <p className="text-xs text-gray-500 mt-2">Medium</p>
                  </div>
                  <div className="text-center">
                    <LogoPrimary size="lg" />
                    <p className="text-xs text-gray-500 mt-2">Large</p>
                  </div>
                  <div className="text-center">
                    <LogoPrimary size="xl" />
                    <p className="text-xs text-gray-500 mt-2">XL</p>
                  </div>
                </div>
              </div>
              
              {/* Color variations */}
              <div className="mt-16">
                <h3 className="text-xl font-bold text-gray-900 mb-8">Color Variations</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-8 rounded-xl">
                    <LogoPrimary variant="dark" size="lg" />
                    <p className="text-xs text-gray-500 mt-4">Dark variant (for light backgrounds)</p>
                  </div>
                  <div className="bg-gray-900 p-8 rounded-xl">
                    <LogoPrimary variant="light" size="lg" />
                    <p className="text-xs text-gray-400 mt-4">Light variant (for dark backgrounds)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SectionWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="bg-gray-900 py-4">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
      </div>
      {children}
    </div>
  )
}

function LogoCard({ title, children, dark = false }: { title: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`p-8 rounded-2xl flex flex-col items-center justify-center min-h-[200px] ${
      dark ? 'bg-gray-900' : 'bg-white shadow-sm border border-gray-100'
    }`}>
      {children}
      <p className={`text-sm mt-4 ${dark ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
    </div>
  )
}
