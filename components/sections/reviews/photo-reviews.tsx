'use client'

import { useState, useRef } from 'react'
import { Camera, X, Star, Upload, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

interface PhotoReview {
  id: string
  author: string
  rating: number
  images: string[]
  caption: string
  product: string
  date: string
}

const mockPhotoReviews: PhotoReview[] = [
  {
    id: '1',
    author: 'Emily R.',
    rating: 5,
    images: ['/mockups/customer-1.jpg', '/mockups/customer-1b.jpg'],
    caption: 'Absolutely in love with how this turned out! Our first dance song looks so beautiful on the wall.',
    product: 'Gallery Canvas 24x36',
    date: '3 days ago'
  },
  {
    id: '2',
    author: 'Marcus J.',
    rating: 5,
    images: ['/mockups/customer-2.jpg'],
    caption: 'Perfect anniversary gift. My wife cried when she saw it!',
    product: 'Premium Art Print',
    date: '1 week ago'
  },
  {
    id: '3',
    author: 'Lisa K.',
    rating: 5,
    images: ['/mockups/customer-3.jpg', '/mockups/customer-3b.jpg', '/mockups/customer-3c.jpg'],
    caption: 'Got matching tees for our whole family. The kids love them!',
    product: 'Family T-Shirt Bundle',
    date: '2 weeks ago'
  },
  {
    id: '4',
    author: 'James W.',
    rating: 4,
    images: ['/mockups/customer-4.jpg'],
    caption: 'Great quality mug. I use it every morning with my coffee.',
    product: 'Ceramic Mug',
    date: '2 weeks ago'
  },
  {
    id: '5',
    author: 'Anna S.',
    rating: 5,
    images: ['/mockups/customer-5.jpg', '/mockups/customer-5b.jpg'],
    caption: 'The metal print is stunning! So much better than I expected.',
    product: 'Metal Print 16x20',
    date: '3 weeks ago'
  },
  {
    id: '6',
    author: 'David M.',
    rating: 5,
    images: ['/mockups/customer-6.jpg'],
    caption: 'Best baby shower gift ever. Mom-to-be was so touched.',
    product: 'Heartbeat Canvas',
    date: '1 month ago'
  }
]

export function PhotoReviewsGallery() {
  const [selectedReview, setSelectedReview] = useState<PhotoReview | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Customer Photos
            </h2>
            <p className="text-gray-600">See SoundPrints in real homes</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Photo Strip */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {mockPhotoReviews.map((review) => (
            <button
              key={review.id}
              onClick={() => {
                setSelectedReview(review)
                setCurrentImageIndex(0)
              }}
              className="flex-shrink-0 group relative w-64 aspect-square bg-gray-100 rounded-xl overflow-hidden"
            >
              <div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                <Camera className="h-12 w-12 text-rose-300" />
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-white text-sm font-medium">{review.author}</p>
                </div>
              </div>

              {/* Image Count Badge */}
              {review.images.length > 1 && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 rounded-full text-white text-xs">
                  +{review.images.length - 1}
                </div>
              )}

              {/* Zoom Icon */}
              <div className="absolute top-3 left-3 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-4 w-4 text-gray-700" />
              </div>
            </button>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedReview && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedReview(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition-colors"
              onClick={() => setSelectedReview(null)}
            >
              <X className="h-8 w-8" />
            </button>

            <div
              className="max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-900 rounded-xl overflow-hidden mb-4">
                <div className="w-full h-full bg-gradient-to-br from-rose-200 to-pink-200 flex items-center justify-center">
                  <Camera className="h-24 w-24 text-rose-300" />
                </div>

                {/* Navigation Arrows */}
                {selectedReview.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev === 0 ? selectedReview.images.length - 1 : prev - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex(prev => prev === selectedReview.images.length - 1 ? 0 : prev + 1)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {selectedReview.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
                    {currentImageIndex + 1} / {selectedReview.images.length}
                  </div>
                )}
              </div>

              {/* Review Info */}
              <div className="bg-white rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 font-bold">
                      {selectedReview.author.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{selectedReview.author}</div>
                      <div className="text-sm text-gray-500">{selectedReview.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < selectedReview.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-3">{selectedReview.caption}</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                  <span>Product:</span>
                  <span className="font-medium">{selectedReview.product}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export function PhotoUploadCTA() {
  return (
    <section className="py-12 bg-rose-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-rose-100 rounded-2xl flex items-center justify-center">
                <Camera className="h-10 w-10 text-rose-500" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Share Your SoundPrint!
              </h3>
              <p className="text-gray-600 mb-4">
                Upload a photo of your SoundPrint in its new home and get 15% off your next order.
              </p>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors">
                <Upload className="h-5 w-5" />
                Upload Your Photo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function PhotoReviewsGrid() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Real Customers, Real Photos
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mockPhotoReviews.map((review, idx) => (
            <div
              key={review.id}
              className={`relative group rounded-xl overflow-hidden cursor-pointer ${
                idx === 0 ? 'col-span-2 row-span-2' : ''
              }`}
            >
              <div className={`bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center ${
                idx === 0 ? 'aspect-square' : 'aspect-square'
              }`}>
                <Camera className={`text-rose-300 ${idx === 0 ? 'h-16 w-16' : 'h-8 w-8'}`} />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-white text-sm font-medium truncate">{review.caption}</p>
                  <p className="text-white/70 text-xs">{review.author}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
