'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Volume2, Sparkles, Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TransformExample {
  id: string
  title: string
  description: string
  audioType: string
  waveformStyle: 'classic' | 'bars' | 'circular' | 'heartbeat'
  colors: {
    waveform: string
    background: string
  }
}

const examples: TransformExample[] = [
  {
    id: 'wedding',
    title: 'Wedding First Dance',
    description: '"At Last" by Etta James',
    audioType: 'Song',
    waveformStyle: 'classic',
    colors: {
      waveform: '#e11d48',
      background: '#fef2f2',
    },
  },
  {
    id: 'voicemail',
    title: "Grandma's Voicemail",
    description: '"I love you, sweetheart..."',
    audioType: 'Voice Message',
    waveformStyle: 'heartbeat',
    colors: {
      waveform: '#7c3aed',
      background: '#faf5ff',
    },
  },
  {
    id: 'baby',
    title: "Baby's First Words",
    description: '"Mama... Dada!"',
    audioType: 'Recording',
    waveformStyle: 'bars',
    colors: {
      waveform: '#0891b2',
      background: '#ecfeff',
    },
  },
]

function WaveformPreview({ style, color }: { style: string; color: string }) {
  const bars = Array.from({ length: 40 }, (_, i) => {
    const height = Math.sin(i * 0.3) * 30 + Math.random() * 20 + 20
    return height
  })

  return (
    <div className="flex items-center justify-center gap-[2px] h-20">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ height: 4 }}
          animate={{ height }}
          transition={{
            duration: 0.5,
            delay: i * 0.02,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

export function BeforeAfterShowcase() {
  const [activeExample, setActiveExample] = useState(examples[0])
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
          >
            <Sparkles className="h-4 w-4" />
            The Transformation
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            From Sound to{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Stunning Art
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Watch how we transform your precious audio moments into beautiful,
            museum-quality artwork
          </motion.p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Example Selector */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {examples.map((example) => (
              <button
                key={example.id}
                onClick={() => setActiveExample(example)}
                className={cn(
                  'px-6 py-3 rounded-full text-sm font-medium transition-all',
                  activeExample.id === example.id
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                )}
              >
                {example.title}
              </button>
            ))}
          </div>

          {/* Before/After Display */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Before - Audio */}
            <motion.div
              key={`before-${activeExample.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="absolute -top-3 left-4 px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                BEFORE
              </div>
              <div className="bg-card border rounded-2xl p-8 shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-6 w-6 text-primary" />
                    ) : (
                      <Play className="h-6 w-6 text-primary ml-1" />
                    )}
                  </button>
                  <div>
                    <p className="font-semibold">{activeExample.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activeExample.description}
                    </p>
                  </div>
                </div>
                <div className="h-16 bg-muted/50 rounded-lg flex items-center justify-center">
                  <Volume2 className="h-8 w-8 text-muted-foreground/50" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    {activeExample.audioType}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>0:00</span>
                  <div className="flex-1 mx-4 h-1 bg-muted rounded-full">
                    <div className="w-1/3 h-full bg-primary/50 rounded-full" />
                  </div>
                  <span>3:24</span>
                </div>
              </div>
            </motion.div>

            {/* Arrow */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10">
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg"
              >
                <ArrowRight className="h-6 w-6 text-primary-foreground" />
              </motion.div>
            </div>

            {/* After - Artwork */}
            <motion.div
              key={`after-${activeExample.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="absolute -top-3 left-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                AFTER
              </div>
              <div
                className="rounded-2xl p-8 shadow-lg border"
                style={{ backgroundColor: activeExample.colors.background }}
              >
                <div className="aspect-[4/3] rounded-xl bg-white shadow-inner flex items-center justify-center p-8 relative overflow-hidden">
                  {/* Frame effect */}
                  <div className="absolute inset-0 border-8 border-gray-800 rounded-xl pointer-events-none" />
                  <div className="w-full">
                    <WaveformPreview
                      style={activeExample.waveformStyle}
                      color={activeExample.colors.waveform}
                    />
                    <p className="text-center mt-4 text-sm font-medium text-gray-600">
                      {activeExample.title}
                    </p>
                    <p className="text-center text-xs text-gray-400">
                      {activeExample.description}
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-sm font-medium">
                    Premium Canvas Print
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    24&quot; × 18&quot;
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
