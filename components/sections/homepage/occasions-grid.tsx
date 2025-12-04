'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  Baby, 
  Cake, 
  GraduationCap, 
  Music, 
  MessageCircle,
  Gift,
  Star,
  PartyPopper,
  HeartHandshake,
  Dog,
  Trophy,
  LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Occasion {
  icon: LucideIcon
  title: string
  description: string
  examples: string[]
  color: string
  image: string
  popular?: boolean
}

const occasions: Occasion[] = [
  {
    icon: Heart,
    title: 'Weddings',
    description: 'Capture your special day',
    examples: ['First dance song', 'Vows recording', 'Wedding march'],
    color: 'rose',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
    popular: true,
  },
  {
    icon: Baby,
    title: 'New Baby',
    description: 'Precious first moments',
    examples: ['First words', 'Heartbeat', 'Lullabies'],
    color: 'sky',
    image: 'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=400&q=80',
    popular: true,
  },
  {
    icon: MessageCircle,
    title: 'Memorials',
    description: 'Honor loved ones',
    examples: ['Voice messages', 'Favorite songs', 'Spoken memories'],
    color: 'violet',
    image: 'https://images.unsplash.com/photo-1516733968668-dbdce39c0651?w=400&q=80',
  },
  {
    icon: GraduationCap,
    title: 'Graduation',
    description: 'Celebrate achievements',
    examples: ['School anthem', 'Ceremony audio', 'Congratulations'],
    color: 'amber',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80',
  },
  {
    icon: Cake,
    title: 'Birthdays',
    description: 'Make it unforgettable',
    examples: ['Birthday song', 'Special message', 'Milestone audio'],
    color: 'pink',
    image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=400&q=80',
  },
  {
    icon: Music,
    title: 'Music Lovers',
    description: 'Your soundtrack visualized',
    examples: ['Favorite song', 'Concert recording', 'Your own music'],
    color: 'emerald',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
  },
  {
    icon: HeartHandshake,
    title: 'Anniversaries',
    description: 'Celebrate your journey',
    examples: ['"Our song"', 'Wedding vows', 'Love letters'],
    color: 'red',
    image: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=400&q=80',
  },
  {
    icon: Dog,
    title: 'Pet Memories',
    description: 'Forever companions',
    examples: ['Barks & purrs', 'Special sounds', 'Home videos'],
    color: 'orange',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80',
  },
  {
    icon: Trophy,
    title: 'Achievements',
    description: 'Milestone moments',
    examples: ['Winning moment', 'Acceptance speech', 'Team cheer'],
    color: 'yellow',
    image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&q=80',
  },
  {
    icon: PartyPopper,
    title: 'Holidays',
    description: 'Seasonal celebrations',
    examples: ['Family singing', 'Holiday message', 'Traditions'],
    color: 'green',
    image: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=400&q=80',
  },
  {
    icon: Gift,
    title: 'Just Because',
    description: 'Perfect for any moment',
    examples: ['Inside jokes', 'Daily sounds', 'Random memories'],
    color: 'blue',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80',
  },
  {
    icon: Star,
    title: 'Fan Art',
    description: 'Celebrate your favorites',
    examples: ['Favorite podcast', 'Theme songs', 'Movie quotes'],
    color: 'purple',
    image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=80',
  },
]

const colorClasses: Record<string, { bg: string; border: string; icon: string }> = {
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'text-rose-500' },
  sky: { bg: 'bg-sky-50', border: 'border-sky-200', icon: 'text-sky-500' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'text-violet-500' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', icon: 'text-pink-500' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-500' },
  red: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-500' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600' },
  green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-500' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-500' },
}

export function OccasionsGrid() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Perfect for Every{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Occasion
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From life&apos;s biggest moments to everyday memories, turn any audio into art
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {occasions.map((occasion, index) => {
            const colors = colorClasses[occasion.color]
            return (
              <motion.div
                key={occasion.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'relative group rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer',
                  colors.border
                )}
              >
                {occasion.popular && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full z-10">
                    POPULAR
                  </div>
                )}
                
                {/* Image background */}
                <div className="relative h-32 overflow-hidden">
                  <Image
                    src={occasion.image}
                    alt={occasion.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className={cn('absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent')} />
                  {(() => {
                    const IconComponent = occasion.icon
                    return <IconComponent className="absolute bottom-3 left-3 h-6 w-6 text-white drop-shadow-lg" />
                  })()}
                </div>
                
                {/* Content */}
                <div className={cn('p-4', colors.bg)}>
                  <h3 className="font-semibold mb-1">{occasion.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {occasion.description}
                  </p>
                  <div className="space-y-1">
                    {occasion.examples.map((example) => (
                      <p
                        key={example}
                        className="text-xs text-muted-foreground/70 flex items-center gap-1"
                      >
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                        {example}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link href="/create">
            <Button size="lg" className="text-lg px-8">
              Start Creating
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// Compact version showing just icons
export function OccasionsStrip() {
  return (
    <div className="py-8 bg-muted/30 border-y overflow-hidden">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-muted-foreground mb-4">
          Perfect for any occasion
        </p>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {occasions.slice(0, 8).map((occasion) => {
            const colors = colorClasses[occasion.color]
            const IconComponent = occasion.icon
            return (
              <div
                key={occasion.title}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <IconComponent className={cn('h-4 w-4', colors.icon)} />
                <span className="text-sm">{occasion.title}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
