'use client'

import { useEffect, useRef, useState } from 'react'
import { Music, Sparkles, Palette, Printer, Truck, Gift } from 'lucide-react'

const timelineSteps = [
  {
    id: 1,
    icon: Music,
    title: 'Choose Your Sound',
    description: 'Upload a song, voice recording, heartbeat, podcast, or any meaningful audio',
    time: '1 minute',
    color: 'bg-rose-500',
  },
  {
    id: 2,
    icon: Sparkles,
    title: 'Instant Transformation',
    description: 'Watch as our technology converts your audio into a beautiful visual waveform',
    time: 'Instant',
    color: 'bg-amber-500',
  },
  {
    id: 3,
    icon: Palette,
    title: 'Personalize Your Design',
    description: 'Choose colors, styles, sizes, and add meaningful text like names and dates',
    time: '2-3 minutes',
    color: 'bg-cyan-500',
  },
  {
    id: 4,
    icon: Printer,
    title: 'Premium Production',
    description: 'We craft your unique artwork using museum-quality materials and archival inks',
    time: '2-3 days',
    color: 'bg-violet-500',
  },
  {
    id: 5,
    icon: Truck,
    title: 'Careful Delivery',
    description: 'Your sound art is carefully packaged and shipped with tracking and insurance',
    time: '3-7 days',
    color: 'bg-emerald-500',
  },
  {
    id: 6,
    icon: Gift,
    title: 'Ready to Display',
    description: 'Hang it, gift it, and enjoy your one-of-a-kind sound art for generations',
    time: 'Forever',
    color: 'bg-pink-500',
  },
]

export function ProcessTimeline() {
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set())
  const timelineRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const stepId = parseInt(entry.target.getAttribute('data-step') || '0')
            setVisibleSteps(prev => new Set([...prev, stepId]))
          }
        })
      },
      { threshold: 0.3 }
    )
    
    const stepElements = document.querySelectorAll('[data-step]')
    stepElements.forEach(el => observer.observe(el))
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Journey with SoundPrints</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From your favorite sound to stunning wall art in just a few simple steps
          </p>
        </div>
        
        <div ref={timelineRef} className="relative max-w-4xl mx-auto">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2 hidden md:block" />
          
          {timelineSteps.map((step, index) => {
            const Icon = step.icon
            const isVisible = visibleSteps.has(step.id)
            const isLeft = index % 2 === 0
            
            return (
              <div
                key={step.id}
                data-step={step.id}
                className={`relative mb-12 md:mb-16 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`flex flex-col md:flex-row items-center ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Content */}
                  <div className={`flex-1 ${isLeft ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                    <div className={`bg-gray-50 rounded-2xl p-6 ${isLeft ? 'md:ml-auto' : ''} max-w-md`}>
                      <div className={`flex items-center gap-3 mb-3 ${isLeft ? 'md:justify-end' : ''}`}>
                        <span className="text-sm font-medium text-gray-400">Step {step.id}</span>
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-medium rounded-full">
                          {step.time}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                  
                  {/* Center icon */}
                  <div className={`relative z-10 my-4 md:my-0 ${step.color} w-14 h-14 rounded-full flex items-center justify-center shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                    
                    {/* Pulse animation */}
                    {isVisible && (
                      <div className={`absolute inset-0 ${step.color} rounded-full animate-ping opacity-25`} />
                    )}
                  </div>
                  
                  {/* Empty space for alignment */}
                  <div className="flex-1 hidden md:block" />
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Summary */}
        <div className="mt-16 bg-gradient-to-r from-rose-500 to-amber-500 rounded-2xl p-8 md:p-12 text-center text-white max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Total Time: Less Than 5 Minutes
          </h3>
          <p className="text-rose-100 mb-6">
            Create your personalized sound art in minutes. We handle the rest.
          </p>
          <button className="px-8 py-3 bg-white text-rose-500 font-semibold rounded-full hover:bg-gray-100 transition-colors">
            Start Creating Now
          </button>
        </div>
      </div>
    </section>
  )
}
