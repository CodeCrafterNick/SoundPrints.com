'use client'

import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    text: "I gave this to my husband for our 10th anniversary. When he unwrapped it and saw our wedding song visualized, he actually teared up. It's now the centerpiece of our living room.",
    author: "Sarah M.",
    location: "Austin, TX",
    product: "Wedding Song Print",
    rating: 5,
    featured: true
  },
  {
    id: 2,
    text: "My daughter's first words are now hanging in our nursery. Such a unique way to preserve this precious memory.",
    author: "Michael R.",
    location: "Seattle, WA",
    product: "Voice Recording Print",
    rating: 5,
    featured: false
  },
  {
    id: 3,
    text: "Got one for my mom with her favorite song. She said it's the most thoughtful gift she's ever received. The quality is amazing!",
    author: "Emily K.",
    location: "Denver, CO",
    product: "Custom Song Print",
    rating: 5,
    featured: false
  },
  {
    id: 4,
    text: "The quality exceeded my expectations. The colors are vibrant and the frame is solid. Will definitely order more!",
    author: "James T.",
    location: "Chicago, IL",
    product: "Classic Waveform",
    rating: 5,
    featured: true
  },
  {
    id: 5,
    text: "I created a print of my late grandmother's voicemail. It means the world to me to have her voice displayed in my home.",
    author: "Amanda L.",
    location: "Portland, OR",
    product: "Voice Memorial Print",
    rating: 5,
    featured: false
  },
  {
    id: 6,
    text: "Perfect wedding gift! The couple absolutely loved seeing their first dance song transformed into art.",
    author: "Chris D.",
    location: "Miami, FL",
    product: "Wedding Song Print",
    rating: 5,
    featured: false
  },
  {
    id: 7,
    text: "The customization options are incredible. I spent an hour perfecting every detail and the result was worth it!",
    author: "Rachel P.",
    location: "Boston, MA",
    product: "Circular Sound Art",
    rating: 5,
    featured: true
  },
  {
    id: 8,
    text: "Ordered 3 prints as gifts. All arrived quickly, beautifully packaged, and the recipients loved them!",
    author: "David W.",
    location: "San Francisco, CA",
    product: "Multiple Orders",
    rating: 5,
    featured: false
  }
]

function TestimonialCard({ testimonial, size = 'normal' }: { 
  testimonial: typeof testimonials[0]
  size?: 'normal' | 'featured'
}) {
  const isFeatured = size === 'featured'
  
  return (
    <div className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 ${
      isFeatured ? 'p-8' : 'p-6'
    }`}>
      {/* Quote icon */}
      <Quote className={`text-rose-200 mb-4 ${isFeatured ? 'h-10 w-10' : 'h-8 w-8'}`} />
      
      {/* Rating */}
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className={`fill-amber-400 text-amber-400 ${isFeatured ? 'h-5 w-5' : 'h-4 w-4'}`} />
        ))}
      </div>
      
      {/* Text */}
      <p className={`text-gray-700 leading-relaxed mb-6 ${isFeatured ? 'text-lg' : 'text-base'}`}>
        &ldquo;{testimonial.text}&rdquo;
      </p>
      
      {/* Author */}
      <div className="flex items-center gap-4">
        {/* Avatar placeholder */}
        <div className={`rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-600 ${
          isFeatured ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm'
        }`}>
          {testimonial.author.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <p className={`font-semibold text-gray-900 ${isFeatured ? 'text-base' : 'text-sm'}`}>
            {testimonial.author}
          </p>
          <p className={`text-gray-500 ${isFeatured ? 'text-sm' : 'text-xs'}`}>
            {testimonial.location} • {testimonial.product}
          </p>
        </div>
      </div>
    </div>
  )
}

export function TestimonialMasonry() {
  const featuredTestimonials = testimonials.filter(t => t.featured)
  const regularTestimonials = testimonials.filter(t => !t.featured)
  
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-rose-500 font-medium mb-4">Customer Love</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of happy customers who have turned their precious sounds into beautiful art.
          </p>
        </div>
        
        {/* Masonry grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Column 1 - starts with featured */}
            <div className="space-y-6">
              <TestimonialCard testimonial={featuredTestimonials[0]} size="featured" />
              <TestimonialCard testimonial={regularTestimonials[0]} />
              <TestimonialCard testimonial={regularTestimonials[3]} />
            </div>
            
            {/* Column 2 - mixed */}
            <div className="space-y-6 md:mt-12">
              <TestimonialCard testimonial={regularTestimonials[1]} />
              <TestimonialCard testimonial={featuredTestimonials[1]} size="featured" />
              <TestimonialCard testimonial={regularTestimonials[4]} />
            </div>
            
            {/* Column 3 - ends with featured */}
            <div className="space-y-6 lg:mt-24">
              <TestimonialCard testimonial={regularTestimonials[2]} />
              <TestimonialCard testimonial={featuredTestimonials[2]} size="featured" />
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          {[
            { value: '2,000+', label: 'Happy Customers' },
            { value: '4.9/5', label: 'Average Rating' },
            { value: '98%', label: 'Would Recommend' }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
