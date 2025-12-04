'use client'

import { useEffect, useRef, useState } from 'react'
import { Users, Package, Star, Globe } from 'lucide-react'

const stats = [
  {
    id: 1,
    icon: Users,
    value: 100000,
    suffix: '+',
    label: 'Happy Customers',
    description: 'Worldwide',
    color: 'text-rose-500',
    bgColor: 'bg-rose-100',
  },
  {
    id: 2,
    icon: Package,
    value: 250000,
    suffix: '+',
    label: 'Prints Created',
    description: 'And counting',
    color: 'text-amber-500',
    bgColor: 'bg-amber-100',
  },
  {
    id: 3,
    icon: Star,
    value: 4.9,
    suffix: '★',
    label: 'Average Rating',
    description: 'From 15,000+ reviews',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100',
    decimals: 1,
  },
  {
    id: 4,
    icon: Globe,
    value: 50,
    suffix: '+',
    label: 'Countries Served',
    description: 'Global shipping',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-100',
  },
]

function AnimatedCounter({ 
  value, 
  suffix = '', 
  decimals = 0,
  isVisible 
}: { 
  value: number
  suffix?: string
  decimals?: number
  isVisible: boolean
}) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (!isVisible) return
    
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(current)
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [isVisible, value])
  
  const displayValue = decimals > 0 
    ? count.toFixed(decimals) 
    : Math.floor(count).toLocaleString()
  
  return (
    <span className="tabular-nums">
      {displayValue}{suffix}
    </span>
  )
}

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <section ref={sectionRef} className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Trusted by Thousands</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join over 100,000 customers who have turned their favorite sounds into lasting art
          </p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            
            return (
              <div
                key={stat.id}
                className="text-center group"
              >
                <div className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2`}>
                  <AnimatedCounter 
                    value={stat.value} 
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                    isVisible={isVisible}
                  />
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-500">{stat.description}</div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// Dark variant
export function StatsSectionDark() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <section ref={sectionRef} className="py-20 bg-gray-900 relative overflow-hidden">
      {/* Background waveform */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
          {Array.from({ length: 120 }).map((_, i) => {
            const height = 30 + Math.sin(i * 0.1) * 100
            return (
              <rect
                key={i}
                x={i * 10}
                y={150 - height / 2}
                width="6"
                height={height}
                rx="3"
                fill="white"
              />
            )
          })}
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.id} className="text-center">
              <div className="text-4xl md:text-6xl font-bold text-white mb-2">
                <AnimatedCounter 
                  value={stat.value} 
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                  isVisible={isVisible}
                />
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
