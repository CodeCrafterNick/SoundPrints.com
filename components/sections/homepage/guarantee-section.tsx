'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, RefreshCw, Award, Check, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

const guaranteePoints = [
  'Museum-quality printing on premium materials',
  'Vibrant colors that last a lifetime',
  'Carefully packaged to arrive perfect',
  'Eco-friendly, sustainable materials',
  'Handcrafted with attention to detail',
]

export function GuaranteeSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Guarantee Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative mx-auto w-80 h-80">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                
                {/* Middle ring with dashes */}
                <div className="absolute inset-4 rounded-full border-2 border-dashed border-primary/30" />
                
                {/* Inner circle */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-2xl shadow-primary/30 flex flex-col items-center justify-center text-primary-foreground p-6">
                  <Shield className="h-12 w-12 mb-2" />
                  <span className="text-4xl font-bold">100%</span>
                  <span className="text-lg font-semibold">SATISFACTION</span>
                  <span className="text-sm opacity-80">GUARANTEE</span>
                </div>

                {/* Decorative stars */}
                {[0, 72, 144, 216, 288].map((angle, i) => (
                  <motion.div
                    key={angle}
                    className="absolute w-8 h-8"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${angle}deg) translateY(-140px) rotate(-${angle}deg)`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <Star className="h-6 w-6 text-primary fill-primary/20" />
                  </motion.div>
                ))}
              </div>

              {/* Floating badges */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute top-10 -left-4 bg-white rounded-xl shadow-lg p-3 border"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">30-Day</p>
                    <p className="text-xs text-muted-foreground">Free Returns</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-10 -right-4 bg-white rounded-xl shadow-lg p-3 border"
              >
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">Premium</p>
                    <p className="text-xs text-muted-foreground">Quality</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Our Promise to{' '}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  You
                </span>
              </h2>
              
              <p className="text-xl text-muted-foreground mb-8">
                We&apos;re so confident you&apos;ll love your SoundPrint that we offer a 
                100% satisfaction guarantee. If you&apos;re not completely happy, 
                we&apos;ll make it right.
              </p>

              <div className="space-y-4 mb-10">
                {guaranteePoints.map((point, index) => (
                  <motion.div
                    key={point}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground">{point}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/create">
                  <Button size="lg" className="text-lg px-8">
                    Create with Confidence
                  </Button>
                </Link>
                <Link href="/faq">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    Read Our Policies
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Minimal inline version
export function GuaranteeBanner() {
  return (
    <div className="bg-primary text-primary-foreground py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>100% Satisfaction Guarantee</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>30-Day Returns</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>Premium Quality</span>
          </div>
        </div>
      </div>
    </div>
  )
}
