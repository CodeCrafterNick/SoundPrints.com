'use client'

import { useEffect, useRef, useState } from 'react'
import { Lightbulb, Rocket, Award, Globe, Users, Heart } from 'lucide-react'

const milestones = [
  {
    year: '2019',
    title: 'The Idea',
    description: 'Sarah creates a waveform print of her parents\' wedding song as an anniversary gift. The overwhelming positive response sparks an idea.',
    icon: Lightbulb,
    highlight: false,
  },
  {
    year: '2020',
    title: 'Launch',
    description: 'SoundPrints officially launches with 3 waveform styles and ships our first order to a customer in Maine.',
    icon: Rocket,
    highlight: true,
  },
  {
    year: '2021',
    title: '10,000 Orders',
    description: 'We hit 10,000 orders and expand to offer 7 unique waveform styles and custom color options.',
    icon: Award,
    highlight: false,
  },
  {
    year: '2022',
    title: 'Going Global',
    description: 'International shipping launches to 50+ countries. We add voice message and podcast waveform options.',
    icon: Globe,
    highlight: true,
  },
  {
    year: '2023',
    title: 'Team Growth',
    description: 'Our team grows to 15 members. We open our own production facility for faster turnaround.',
    icon: Users,
    highlight: false,
  },
  {
    year: '2024',
    title: '100,000 Happy Customers',
    description: 'We celebrate 100,000 customers worldwide and launch our premium canvas and framed product lines.',
    icon: Heart,
    highlight: true,
  },
]

export function CompanyTimeline() {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const timelineRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0')
            setVisibleItems(prev => new Set([...prev, index]))
          }
        })
      },
      { threshold: 0.2 }
    )
    
    const items = document.querySelectorAll('[data-index]')
    items.forEach(item => observer.observe(item))
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            From a heartfelt gift idea to a global company helping people preserve their most meaningful sounds
          </p>
        </div>
        
        <div ref={timelineRef} className="relative max-w-4xl mx-auto">
          {/* Center line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-rose-200 md:-translate-x-1/2" />
          
          {milestones.map((milestone, index) => {
            const Icon = milestone.icon
            const isVisible = visibleItems.has(index)
            const isLeft = index % 2 === 0
            
            return (
              <div
                key={index}
                data-index={index}
                className={`relative mb-12 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`flex items-start gap-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Year marker (mobile) */}
                  <div className="absolute left-0 top-0 md:hidden">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      milestone.highlight ? 'bg-rose-500' : 'bg-white border-2 border-rose-200'
                    }`}>
                      <Icon className={`h-6 w-6 ${milestone.highlight ? 'text-white' : 'text-rose-500'}`} />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className={`flex-1 ml-24 md:ml-0 ${isLeft ? 'md:text-right md:pr-16' : 'md:pl-16'}`}>
                    <div className={`bg-white rounded-2xl p-6 shadow-sm ${milestone.highlight ? 'ring-2 ring-rose-200' : ''}`}>
                      <span className="inline-block px-3 py-1 bg-rose-100 text-rose-600 text-sm font-bold rounded-full mb-3">
                        {milestone.year}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  
                  {/* Center icon (desktop) */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      milestone.highlight ? 'bg-rose-500 shadow-lg shadow-rose-200' : 'bg-white border-2 border-rose-200'
                    }`}>
                      <Icon className={`h-6 w-6 ${milestone.highlight ? 'text-white' : 'text-rose-500'}`} />
                    </div>
                  </div>
                  
                  {/* Empty space */}
                  <div className="flex-1 hidden md:block" />
                </div>
              </div>
            )
          })}
          
          {/* Future indicator */}
          <div className="relative text-center">
            <div className="absolute left-8 md:left-1/2 -top-4 w-0.5 h-8 bg-rose-200 md:-translate-x-1/2" />
            <div className="inline-flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-full shadow-lg">
              <span className="font-semibold">The future is sound</span>
              <span className="animate-pulse">✨</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
