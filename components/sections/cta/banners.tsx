'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { X, Clock, Sparkles } from 'lucide-react'

interface TimeLeft {
  hours: number
  minutes: number
  seconds: number
}

export function LimitedOfferBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 23, minutes: 59, seconds: 59 })
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev
        
        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        }
        
        return { hours, minutes, seconds }
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])
  
  if (!isVisible) return null
  
  const formatNumber = (n: number) => n.toString().padStart(2, '0')
  
  return (
    <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white py-3 relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4 text-sm md:text-base">
          <Sparkles className="h-5 w-5 hidden sm:block" />
          
          <span className="font-medium">
            🎉 Limited Time: <span className="font-bold">20% OFF</span> All Framed Prints
          </span>
          
          {/* Countdown */}
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
            <Clock className="h-4 w-4" />
            <span className="font-mono font-bold">
              {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
            </span>
          </div>
          
          <Link href="/create" className="hidden md:block">
            <Button size="sm" className="bg-white text-rose-600 hover:bg-gray-100 text-xs px-4">
              Shop Now
            </Button>
          </Link>
          
          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 500px
      if (window.scrollY > 500 && !isDismissed) {
        setIsVisible(true)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isDismissed])
  
  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
  }
  
  if (!isVisible) return null
  
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-10 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-xs border border-gray-100">
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
        
        <div className="flex items-start gap-3">
          {/* Mini waveform icon */}
          <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-6 h-6">
              {Array.from({ length: 5 }).map((_, i) => {
                const height = 4 + Math.sin(i * 0.8) * 6
                return (
                  <rect
                    key={i}
                    x={i * 5 + 2}
                    y={12 - height / 2}
                    width="3"
                    height={height}
                    rx="1.5"
                    className="fill-rose-500"
                  />
                )
              })}
            </svg>
          </div>
          
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">Ready to create?</p>
            <p className="text-xs text-gray-500 mb-2">Turn your sound into art</p>
            <Link href="/create">
              <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-xs w-full">
                Start Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
