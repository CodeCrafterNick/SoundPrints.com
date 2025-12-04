'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface VideoShowcaseProps {
  videoUrl?: string
  posterUrl?: string
  title?: string
  subtitle?: string
  ctaText?: string
  ctaLink?: string
}

export function VideoShowcase({
  videoUrl = '/videos/demo.mp4',
  posterUrl = '/images/video-poster.jpg',
  title = 'See the Magic in Action',
  subtitle = 'Watch how easy it is to transform your favorite audio into stunning wall art',
  ctaText = 'Create Your Own',
  ctaLink = '/create',
}: VideoShowcaseProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  return (
    <section className="py-24 bg-gray-900 text-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-center lg:text-left"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {title}
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0">
              {subtitle}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold">Upload any audio file</h3>
                  <p className="text-sm text-gray-400">MP3, WAV, M4A and more supported</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold">Customize your design</h3>
                  <p className="text-sm text-gray-400">Choose colors, styles, and add text</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold">Receive museum-quality art</h3>
                  <p className="text-sm text-gray-400">Premium printing, delivered to your door</p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <Link href={ctaLink}>
                <Button size="lg" className="text-lg px-8">
                  {ctaText}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Video Player */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(isPlaying ? false : true)}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-800 aspect-video">
              {/* Placeholder when no video */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Play className="h-10 w-10 text-primary ml-1" />
                  </div>
                  <p className="text-gray-400">Demo video coming soon</p>
                </div>
              </div>

              {/* Actual video (hidden until videoUrl is provided) */}
              {videoUrl && videoUrl !== '/videos/demo.mp4' && (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  poster={posterUrl}
                  muted={isMuted}
                  loop
                  playsInline
                >
                  <source src={videoUrl} type="video/mp4" />
                </video>
              )}

              {/* Controls Overlay */}
              <div
                className={cn(
                  'absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300',
                  showControls ? 'opacity-100' : 'opacity-0'
                )}
              >
                <button
                  onClick={togglePlay}
                  className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="h-10 w-10 text-white" />
                  ) : (
                    <Play className="h-10 w-10 text-white ml-1" />
                  )}
                </button>
              </div>

              {/* Bottom Controls */}
              <div
                className={cn(
                  'absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300',
                  showControls ? 'opacity-100' : 'opacity-0'
                )}
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={toggleMute}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5 text-white" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-white" />
                    )}
                  </button>
                  <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
                    <Maximize2 className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
