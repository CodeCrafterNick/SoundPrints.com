'use client'

import { useEffect, useRef, useState } from 'react'
import { Music, Heart, Home, Gift } from 'lucide-react'

const useCases = [
  {
    icon: Music,
    title: 'Your First Song Together',
    description: 'Capture the melody that started it all. The song that was playing when you first met, danced, or fell in love.',
    image: 'wedding'
  },
  {
    icon: Heart,
    title: "Baby's First Words",
    description: "Preserve that precious moment when they said 'mama' or 'dada' for the very first time.",
    image: 'baby'
  },
  {
    icon: Home,
    title: 'Favorite Podcast',
    description: 'Turn a clip from your favorite podcast into art. Perfect for home offices and creative spaces.',
    image: 'podcast'
  },
  {
    icon: Gift,
    title: 'Voice Message',
    description: 'Keep a loved one\'s voice close forever. A voicemail from grandma, a message from a friend.',
    image: 'voice'
  }
]

interface AnimatedCardProps {
  item: typeof useCases[0]
  index: number
}

function AnimatedCard({ item, index }: AnimatedCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )
    
    if (ref.current) {
      observer.observe(ref.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  const Icon = item.icon
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-12'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
        {/* Image/Visual area */}
        <div className="aspect-[4/3] bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
          {/* Animated waveform background */}
          <svg viewBox="0 0 200 80" className="absolute inset-0 w-full h-full p-8 opacity-60">
            {Array.from({ length: 50 }).map((_, i) => {
              const height = 10 + Math.sin(i * 0.3 + index) * 20 + Math.random() * 10
              return (
                <rect
                  key={i}
                  x={i * 4}
                  y={40 - height / 2}
                  width="2.5"
                  height={height}
                  rx="1.25"
                  className={`transition-all duration-300 ${
                    isVisible ? 'fill-rose-500' : 'fill-gray-700'
                  }`}
                  style={{ 
                    transitionDelay: `${index * 150 + i * 20}ms`,
                    opacity: isVisible ? (0.5 + Math.random() * 0.5) : 0.3
                  }}
                />
              )
            })}
          </svg>
          
          {/* Icon overlay */}
          <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`} style={{ transitionDelay: `${index * 150 + 200}ms` }}>
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Icon className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-rose-500 transition-colors">
            {item.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {item.description}
          </p>
        </div>
        
        {/* Hover indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
      </div>
    </div>
  )
}

export function AnimatedReveal() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-rose-500 font-medium mb-4">Use Cases</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Perfect For Every<br />
            <span className="text-rose-500">Special Moment</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From wedding songs to baby&apos;s first words, turn your most precious audio memories into art.
          </p>
        </div>
        
        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {useCases.map((item, i) => (
            <AnimatedCard key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
