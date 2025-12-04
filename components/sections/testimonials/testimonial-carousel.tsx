'use client'

import { useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    text: "I gave this to my husband for our 10th anniversary. When he unwrapped it and saw our wedding song visualized, he actually teared up. It's now the centerpiece of our living room. The quality is stunning and the customer service was exceptional.",
    author: "Sarah M.",
    location: "Austin, TX",
    product: "Wedding Song Print - 'At Last' by Etta James",
    rating: 5
  },
  {
    id: 2,
    text: "My daughter's first words 'I love you mama' are now hanging in our living room. Every time I look at it, I'm transported back to that magical moment. The circular waveform design is absolutely beautiful.",
    author: "Jennifer L.",
    location: "Seattle, WA",
    product: "Voice Recording Print - Circular Style",
    rating: 5
  },
  {
    id: 3,
    text: "I created a memorial print of my grandmother's voicemail - the last message she left me. It brings me so much comfort to have her voice displayed in my home. This company handles sensitive orders with such care.",
    author: "Michael R.",
    location: "Denver, CO",
    product: "Voice Memorial Print",
    rating: 5
  },
  {
    id: 4,
    text: "Perfect wedding gift! I gave the newlyweds a print of their first dance song and they were blown away. The frame quality is premium and it shipped way faster than expected.",
    author: "Amanda K.",
    location: "Chicago, IL",
    product: "Wedding Song Print - Framed",
    rating: 5
  }
]

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  
  useEffect(() => {
    if (!isAutoPlaying) return
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [isAutoPlaying])
  
  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }
  
  const goToPrev = () => {
    setCurrentIndex(prev => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
  }
  
  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
  }
  
  const current = testimonials[currentIndex]
  
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-rose-500 font-medium mb-4">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Loved by Thousands
          </h2>
        </div>
        
        {/* Carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gray-50 rounded-3xl p-8 md:p-12">
            {/* Quote icon */}
            <Quote className="h-16 w-16 text-rose-200 absolute top-8 left-8" />
            
            {/* Content */}
            <div className="relative z-10 text-center pt-8">
              {/* Rating */}
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: current.rating }).map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
                ))}
              </div>
              
              {/* Text */}
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 max-w-3xl mx-auto">
                &ldquo;{current.text}&rdquo;
              </p>
              
              {/* Author */}
              <div className="flex flex-col items-center">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xl mb-3">
                  {current.author.split(' ').map(n => n[0]).join('')}
                </div>
                <p className="font-semibold text-gray-900 text-lg">{current.author}</p>
                <p className="text-gray-500">{current.location}</p>
                <p className="text-rose-500 text-sm mt-1">{current.product}</p>
              </div>
            </div>
            
            {/* Navigation arrows */}
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          
          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`h-2 rounded-full transition-all ${
                  i === currentIndex ? 'w-8 bg-rose-500' : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
