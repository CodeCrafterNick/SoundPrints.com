'use client'

import Image from 'next/image'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Music, Heart, Sparkles, Palette, Zap, Globe } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative container mx-auto px-4 py-20 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <Image
              src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80"
              alt="Music and sound"
              fill
              className="object-cover opacity-10"
              priority
            />
          </div>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              About SoundPrints
            </h1>
            <p className="text-xl text-muted-foreground">
              Transforming meaningful audio moments into stunning visual art since 2025
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="border-t bg-muted/20 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    SoundPrints was born from a simple yet powerful idea: sound carries meaning. 
                    Whether it&apos;s your wedding song, your baby&apos;s first words, a loved one&apos;s voice, 
                    or the soundtrack to your favorite memory—these audio moments deserve to be 
                    preserved and celebrated.
                  </p>
                  <p>
                    We created a platform that transforms any audio into beautiful, unique 
                    soundwave artwork. Each piece is as individual as the sound itself, 
                    making it the perfect way to capture and display the moments that matter most.
                  </p>
                  <p>
                    What started as a passion project has grown into a mission to help people 
                    create meaningful, personalized art that tells their unique story.
                  </p>
                </div>
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80"
                  alt="Sound studio"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">What We Believe</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center space-y-3 p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Meaningful Moments</h3>
                <p className="text-muted-foreground">
                  Every sound tells a story. We help you preserve the audio moments 
                  that mean the most to you.
                </p>
              </div>
              <div className="text-center space-y-3 p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Palette className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Creative Freedom</h3>
                <p className="text-muted-foreground">
                  With dozens of styles, unlimited colors, and complete customization, 
                  your design is truly yours.
                </p>
              </div>
              <div className="text-center space-y-3 p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Quality First</h3>
                <p className="text-muted-foreground">
                  We partner with premium print providers to ensure every product 
                  meets our high standards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="border-t bg-muted/20 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">The SoundPrints Experience</h2>
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Upload Your Audio</h3>
                    <p className="text-muted-foreground">
                      Any audio file works—songs, voice messages, podcasts, or recordings.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Select Your Moment</h3>
                    <p className="text-muted-foreground">
                      Choose the perfect section—a verse, a phrase, or the whole track.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Customize Your Design</h3>
                    <p className="text-muted-foreground">
                      Pick your style, colors, and add personalized text.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Order Your Art</h3>
                    <p className="text-muted-foreground">
                      Choose from posters, canvas, apparel, and more. We handle the rest!
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
                  alt="Art gallery"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Sustainability */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-6">
                <Globe className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Sustainability Matters</h2>
              <p className="text-muted-foreground mb-6">
                We're committed to minimizing our environmental impact. Our print-on-demand model 
                means we only produce what's ordered—no overstock, no waste. We partner with 
                print facilities that prioritize sustainable practices and eco-friendly materials.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center border rounded-2xl p-12 bg-gradient-to-br from-primary/5 to-primary/10">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Ready to Create Your SoundPrint?</h2>
              <p className="text-muted-foreground mb-8">
                Transform your favorite audio moment into beautiful art in just minutes.
              </p>
              <Link href="/create">
                <Button size="lg" className="text-lg px-8">
                  Start Creating
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
