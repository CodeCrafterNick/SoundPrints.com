'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, Wand2, Palette, Package, Play, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const steps = [
  {
    id: 1,
    title: 'Upload Your Audio',
    description: 'Upload any audio file - a song, voice recording, podcast, or heartbeat. We support MP3, WAV, and most audio formats.',
    icon: Upload,
    demo: 'upload',
  },
  {
    id: 2,
    title: 'Watch the Magic',
    description: 'Our technology instantly transforms your sound into a unique visual waveform pattern that represents every nuance of your audio.',
    icon: Wand2,
    demo: 'waveform',
  },
  {
    id: 3,
    title: 'Customize Your Design',
    description: 'Choose from various styles, colors, and formats. Add text, select a frame, and preview how it will look on your wall.',
    icon: Palette,
    demo: 'customize',
  },
  {
    id: 4,
    title: 'We Print & Ship',
    description: 'We produce your unique sound art using premium materials and ship it directly to you or your gift recipient.',
    icon: Package,
    demo: 'ship',
  },
]

function UploadDemo() {
  return (
    <div className="aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
      <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
        <Upload className="h-8 w-8 text-rose-500" />
      </div>
      <p className="text-gray-500 text-sm">Drop your audio file here</p>
      <p className="text-gray-400 text-xs mt-1">MP3, WAV up to 50MB</p>
    </div>
  )
}

function WaveformDemo() {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => p >= 100 ? 0 : p + 2)
    }, 50)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 100 40" className="w-3/4 h-1/2">
        <defs>
          <linearGradient id="demo-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
          <clipPath id="progress-clip">
            <rect x="0" y="0" width={progress} height="40" />
          </clipPath>
        </defs>
        {/* Background bars */}
        {Array.from({ length: 50 }).map((_, i) => {
          const height = 5 + Math.sin(i * 0.3) * 12 + (i % 3) * 3
          return (
            <rect
              key={i}
              x={i * 2}
              y={20 - height / 2}
              width="1.5"
              height={height}
              rx="0.75"
              fill="#374151"
            />
          )
        })}
        {/* Animated fill */}
        <g clipPath="url(#progress-clip)">
          {Array.from({ length: 50 }).map((_, i) => {
            const height = 5 + Math.sin(i * 0.3) * 12 + (i % 3) * 3
            return (
              <rect
                key={i}
                x={i * 2}
                y={20 - height / 2}
                width="1.5"
                height={height}
                rx="0.75"
                fill="url(#demo-grad)"
              />
            )
          })}
        </g>
      </svg>
    </div>
  )
}

function CustomizeDemo() {
  const [selectedStyle, setSelectedStyle] = useState(0)
  const colors = [
    ['#f43f5e', '#fbbf24'],
    ['#06b6d4', '#8b5cf6'],
    ['#10b981', '#3b82f6'],
    ['#f97316', '#ec4899'],
  ]
  
  return (
    <div className="aspect-video bg-gray-100 rounded-xl p-4">
      <div className="bg-gray-900 rounded-lg h-full flex items-center justify-center relative">
        <svg viewBox="0 0 80 30" className="w-2/3 h-1/3">
          <defs>
            <linearGradient id="custom-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors[selectedStyle][0]} />
              <stop offset="100%" stopColor={colors[selectedStyle][1]} />
            </linearGradient>
          </defs>
          {Array.from({ length: 40 }).map((_, i) => {
            const height = 4 + Math.sin(i * 0.35) * 10
            return (
              <rect
                key={i}
                x={i * 2}
                y={15 - height / 2}
                width="1.5"
                height={height}
                rx="0.75"
                fill="url(#custom-grad)"
              />
            )
          })}
        </svg>
        
        {/* Color picker overlay */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          {colors.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedStyle(idx)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${
                selectedStyle === idx ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ background: `linear-gradient(135deg, ${colors[idx][0]}, ${colors[idx][1]})` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ShipDemo() {
  return (
    <div className="aspect-video bg-gradient-to-br from-rose-50 to-amber-50 rounded-xl flex items-center justify-center relative overflow-hidden">
      {/* Package animation */}
      <div className="relative">
        <div className="w-24 h-24 bg-amber-100 rounded-lg border-2 border-amber-200 flex items-center justify-center">
          <Package className="h-10 w-10 text-amber-500" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
          <Check className="h-5 w-5 text-white" />
        </div>
      </div>
      
      {/* Delivery truck path */}
      <div className="absolute bottom-4 left-0 right-0 h-1 bg-gray-200 rounded-full">
        <div className="h-full w-3/4 bg-rose-500 rounded-full animate-pulse" />
      </div>
    </div>
  )
}

export function AnimatedSteps() {
  const [activeStep, setActiveStep] = useState(1)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  useEffect(() => {
    if (isAutoPlaying) {
      intervalRef.current = setInterval(() => {
        setActiveStep(s => s >= 4 ? 1 : s + 1)
      }, 4000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isAutoPlaying])
  
  const handleStepClick = (stepId: number) => {
    setActiveStep(stepId)
    setIsAutoPlaying(false)
  }
  
  const renderDemo = () => {
    switch (activeStep) {
      case 1: return <UploadDemo />
      case 2: return <WaveformDemo />
      case 3: return <CustomizeDemo />
      case 4: return <ShipDemo />
      default: return null
    }
  }
  
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transform your favorite sounds into stunning visual art in just 4 simple steps
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Steps list */}
          <div className="space-y-6">
            {steps.map((step) => {
              const Icon = step.icon
              const isActive = activeStep === step.id
              
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(step.id)}
                  className={`w-full text-left p-6 rounded-2xl transition-all ${
                    isActive
                      ? 'bg-rose-50 border-2 border-rose-200'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-rose-500' : 'bg-gray-200'
                    }`}>
                      <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${isActive ? 'text-rose-500' : 'text-gray-400'}`}>
                          Step {step.id}
                        </span>
                      </div>
                      <h3 className={`font-bold text-lg mb-1 ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${isActive ? 'text-gray-600' : 'text-gray-500'}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          
          {/* Demo area */}
          <div className="relative">
            <div className="sticky top-24">
              {renderDemo()}
              
              {/* Auto-play toggle */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  <Play className={`h-4 w-4 ${isAutoPlaying ? 'text-rose-500' : ''}`} />
                  {isAutoPlaying ? 'Auto-playing' : 'Click to auto-play'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="text-center mt-16">
          <Button size="lg" className="bg-rose-500 hover:bg-rose-600">
            Start Creating Now
          </Button>
        </div>
      </div>
    </section>
  )
}
