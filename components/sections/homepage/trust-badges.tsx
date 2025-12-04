'use client'

import { motion } from 'framer-motion'
import { 
  Shield, 
  Truck, 
  RefreshCw, 
  Award, 
  Lock, 
  Clock,
  BadgeCheck,
  Leaf,
  type LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrustBadge {
  icon: LucideIcon
  title: string
  description: string
  highlight?: boolean
}

const trustBadges: TrustBadge[] = [
  {
    icon: Shield,
    title: '100% Satisfaction',
    description: 'Love it or your money back',
    highlight: true,
  },
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over $50',
  },
  {
    icon: RefreshCw,
    title: '30-Day Returns',
    description: 'Hassle-free return policy',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'Museum-grade materials',
  },
  {
    icon: Lock,
    title: 'Secure Checkout',
    description: 'SSL encrypted payments',
  },
  {
    icon: Clock,
    title: 'Fast Production',
    description: 'Ships in 3-5 business days',
  },
]

const certifications: { icon: LucideIcon; label: string }[] = [
  { icon: BadgeCheck, label: 'Verified Business' },
  { icon: Leaf, label: 'Eco-Friendly Materials' },
  { icon: Award, label: '5-Star Rated' },
]

export function TrustBadges() {
  return (
    <section className="py-16 bg-muted/30 border-y">
      <div className="container mx-auto px-4">
        {/* Main Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {trustBadges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'text-center p-4 rounded-xl transition-all hover:shadow-md',
                badge.highlight 
                  ? 'bg-primary/5 border border-primary/20' 
                  : 'bg-background border'
              )}
            >
              <div className={cn(
                'w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center',
                badge.highlight ? 'bg-primary/10' : 'bg-muted'
              )}>
                <badge.icon className={cn(
                  'h-6 w-6',
                  badge.highlight ? 'text-primary' : 'text-muted-foreground'
                )} />
              </div>
              <h3 className="font-semibold text-sm mb-1">{badge.title}</h3>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Certification Strip */}
        <div className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.label}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <cert.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{cert.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-4 mt-8 pt-8 border-t"
        >
          <span className="text-sm text-muted-foreground mr-2">We accept:</span>
          {['Visa', 'Mastercard', 'Amex', 'PayPal', 'Apple Pay'].map((method) => (
            <div
              key={method}
              className="px-3 py-1.5 bg-background border rounded text-xs font-medium text-muted-foreground"
            >
              {method}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// Compact version for footer or other areas
export function TrustBadgesCompact() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-6">
      {trustBadges.slice(0, 4).map((badge) => (
        <div key={badge.title} className="flex items-center gap-2">
          <badge.icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{badge.title}</span>
        </div>
      ))}
    </div>
  )
}
