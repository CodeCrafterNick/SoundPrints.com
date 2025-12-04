'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const galleryItems = [
  {
    id: 1,
    title: 'Our Wedding Song',
    subtitle: '"At Last" by Etta James',
    style: 'circular',
    colors: ['#f43f5e', '#fbbf24']
  },
  {
    id: 2,
    title: 'Baby Emma\'s First Words',
    subtitle: '"Mama" - 14 months old',
    style: 'bars',
    colors: ['#06b6d4', '#8b5cf6']
  },
  {
    id: 3,
    title: '25th Anniversary',
    subtitle: '"Wonderful Tonight"',
    style: 'smooth',
    colors: ['#f43f5e', '#f97316']
  },
  {
    id: 4,
    title: 'Dad\'s Voice Message',
    subtitle: 'Last voicemail • Forever treasured',
    style: 'heartbeat',
    colors: ['#10b981', '#3b82f6']
  },
  {
    id: 5,
    title: 'First Dance',
    subtitle: '"Perfect" by Ed Sheeran',
    style: 'dna',
    colors: ['#f43f5e', '#ec4899']
  }
]

export function ThreeDGallery() {
  const [currentIndex, setCurrentIndex] = useState(2) // Start at middle
  const containerRef = useRef<HTMLDivElement>(null)
  
  const goToSlide = (index: number) => {
    const newIndex = Math.max(0, Math.min(galleryItems.length - 1, index))
    setCurrentIndex(newIndex)
  }
  
  const renderWaveform = (item: typeof galleryItems[0]) => {
    switch (item.style) {
      case 'circular':
        return (
          <svg viewBox="0 0 200 200" className="w-full h-full p-8">
            <defs>
              <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={item.colors[0]} />
                <stop offset="100%" stopColor={item.colors[1]} />
              </linearGradient>
            </defs>
            {Array.from({ length: 48 }).map((_, i) => {
              const angle = (i / 48) * Math.PI * 2
              const len = 15 + Math.sin(i * 0.5 + item.id) * 20
              const innerR = 50
              const x1 = 100 + Math.cos(angle) * innerR
              const y1 = 100 + Math.sin(angle) * innerR
              const x2 = 100 + Math.cos(angle) * (innerR + len)
              const y2 = 100 + Math.sin(angle) * (innerR + len)
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={`url(#grad-${item.id})`} strokeWidth="3" strokeLinecap="round" />
            })}
          </svg>
        )
      case 'bars':
        return (
          <svg viewBox="0 0 200 100" className="w-full h-1/2">
            <defs>
              <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={item.colors[0]} />
                <stop offset="100%" stopColor={item.colors[1]} />
              </linearGradient>
            </defs>
            {Array.from({ length: 50 }).map((_, i) => {
              const height = 10 + Math.sin(i * 0.3 + item.id) * 30 + Math.random() * 10
              return (
                <rect
                  key={i}
                  x={i * 4}
                  y={50 - height / 2}
                  width="3"
                  height={height}
                  rx="1.5"
                  fill={`url(#grad-${item.id})`}
                />
              )
            })}
          </svg>
        )
      case 'smooth':
        const points = Array.from({ length: 50 }).map((_, i) => {
          const x = i * 4
          const y = 50 + Math.sin(i * 0.3 + item.id) * 30 + Math.sin(i * 0.1) * 10
          return `${x},${y}`
        }).join(' ')
        return (
          <svg viewBox="0 0 200 100" className="w-full h-1/2">
            <defs>
              <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={item.colors[0]} />
                <stop offset="100%" stopColor={item.colors[1]} />
              </linearGradient>
            </defs>
            <polyline points={points} fill="none" stroke={`url(#grad-${item.id})`} strokeWidth="3" strokeLinecap="round" />
          </svg>
        )
      case 'heartbeat':
        return (
          <svg viewBox="0 0 200 80" className="w-full h-1/3">
            <defs>
              <linearGradient id={`grad-${item.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={item.colors[0]} />
                <stop offset="100%" stopColor={item.colors[1]} />
              </linearGradient>
            </defs>
            <path
              d="M0 40 L40 40 L50 10 L60 70 L70 40 L90 40 L100 20 L110 60 L120 40 L200 40"
              fill="none"
              stroke={`url(#grad-${item.id})`}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      case 'dna':
        return (
          <svg viewBox="0 0 100 200" className="w-1/4 h-full">
            <defs>
              <linearGradient id={`grad1-${item.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={item.colors[0]} />
                <stop offset="100%" stopColor={item.colors[1]} />
              </linearGradient>
            </defs>
            {Array.from({ length: 15 }).map((_, i) => {
              const y = i * 13 + 10
              const offset = Math.sin(i * 0.6) * 25
              return (
                <g key={i}>
                  <circle cx={50 - offset} cy={y} r="5" fill={item.colors[0]} />
                  <circle cx={50 + offset} cy={y} r="5" fill={item.colors[1]} />
                  <line x1={50 - offset} y1={y} x2={50 + offset} y2={y} stroke={`url(#grad1-${item.id})`} strokeWidth="2" />
                </g>
              )
            })}
          </svg>
        )
      default:
        return null
    }
  }
  
  return (
    <section className="py-24 bg-gray-900 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-rose-400 font-medium mb-4">Featured Gallery</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Customer Creations
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            See how others have immortalized their most precious sounds.
          </p>
        </div>
        
        {/* 3D Gallery */}
        <div ref={containerRef} className="relative h-[500px] flex items-center justify-center">
          {galleryItems.map((item, index) => {
            const offset = index - currentIndex
            const isActive = offset === 0
            const scale = isActive ? 1 : 0.7
            const opacity = Math.abs(offset) <= 1 ? 1 : 0.3
            const zIndex = 10 - Math.abs(offset)
            const translateX = offset * 280
            const rotateY = offset * -15
            
            return (
              <div
                key={item.id}
                className="absolute transition-all duration-500 ease-out cursor-pointer"
                style={{
                  transform: `translateX(${translateX}px) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`,
                  opacity,
                  zIndex
                }}
                onClick={() => goToSlide(index)}
              >
                {/* Frame */}
                <div className="bg-white p-4 rounded-lg shadow-2xl">
                  {/* Print */}
                  <div className="w-64 h-80 bg-gray-900 rounded flex items-center justify-center overflow-hidden relative">
                    {renderWaveform(item)}
                    
                    {/* Text overlay */}
                    <div className="absolute bottom-4 left-4 right-4 text-center">
                      <p className="text-white/70 text-xs">{item.subtitle}</p>
                      <p className="text-white text-sm font-medium mt-1">{item.title}</p>
                    </div>
                  </div>
                </div>
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Navigation */}
        <div className="flex justify-center gap-4 mt-16">
          <button
            onClick={() => goToSlide(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          
          {/* Dots */}
          <div className="flex items-center gap-2">
            {galleryItems.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex ? 'w-8 bg-rose-500' : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={() => goToSlide(currentIndex + 1)}
            disabled={currentIndex === galleryItems.length - 1}
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </div>
        
        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/create">
            <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-6 text-lg">
              Create Your Own
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
