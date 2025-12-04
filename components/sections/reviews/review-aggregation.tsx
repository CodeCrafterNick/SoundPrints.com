'use client'

import { useState } from 'react'
import { Star, TrendingUp, Users, Award, ThumbsUp, MessageCircle, Filter, ChevronDown } from 'lucide-react'

interface Review {
  id: string
  author: string
  avatar?: string
  rating: number
  date: string
  title: string
  content: string
  product: string
  verified: boolean
  helpful: number
  images?: string[]
  response?: {
    author: string
    content: string
    date: string
  }
}

const mockReviews: Review[] = [
  {
    id: '1',
    author: 'Sarah M.',
    rating: 5,
    date: '2 days ago',
    title: 'Perfect wedding gift - brought everyone to tears!',
    content: 'I ordered this as a surprise for my sister\'s wedding, using their first dance song. When she opened it, there wasn\'t a dry eye in the room. The quality exceeded my expectations - the canvas is beautiful and the sound wave is crystal clear. Will definitely be ordering more for future gifts!',
    product: 'Premium Canvas - 24x36',
    verified: true,
    helpful: 47,
    images: ['/mockups/canvas-living-room.jpg', '/mockups/canvas-detail.jpg']
  },
  {
    id: '2',
    author: 'Michael T.',
    rating: 5,
    date: '1 week ago',
    title: 'Better than I imagined',
    content: 'Got matching t-shirts for me and my wife with our wedding song. The print quality is excellent and they fit perfectly. We wear them on date nights and always get compliments.',
    product: 'Premium T-Shirt Bundle',
    verified: true,
    helpful: 32,
    response: {
      author: 'SoundPrints Team',
      content: 'Thank you so much for sharing this, Michael! We love hearing about couples enjoying their matching pieces. Wishing you many more happy date nights! 💕',
      date: '6 days ago'
    }
  },
  {
    id: '3',
    author: 'Jessica L.',
    rating: 4,
    date: '2 weeks ago',
    title: 'Great quality, shipping took a bit',
    content: 'The poster itself is gorgeous and exactly what I wanted. Took about 2 weeks to arrive which was longer than expected, but the quality made up for it. Would order again with more lead time.',
    product: 'Art Print - 18x24',
    verified: true,
    helpful: 18
  },
  {
    id: '4',
    author: 'David R.',
    rating: 5,
    date: '3 weeks ago',
    title: 'Third order - never disappoints!',
    content: 'This is my third time ordering from SoundPrints and they consistently deliver amazing products. This time I got a canvas for my parents\' anniversary with their wedding song. Mom cried when she saw it!',
    product: 'Gallery Canvas - 30x40',
    verified: true,
    helpful: 56,
    images: ['/mockups/canvas-gift.jpg']
  }
]

const ratingBreakdown = [
  { stars: 5, percentage: 78, count: 2847 },
  { stars: 4, percentage: 15, count: 548 },
  { stars: 3, percentage: 4, count: 146 },
  { stars: 2, percentage: 2, count: 73 },
  { stars: 1, percentage: 1, count: 36 }
]

export function ReviewsAggregation() {
  const totalReviews = ratingBreakdown.reduce((acc, r) => acc + r.count, 0)
  const averageRating = 4.8

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - Overall Rating */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Customer Reviews
            </h1>
            <p className="text-gray-600 mb-8">
              See what {totalReviews.toLocaleString()}+ happy customers are saying
            </p>

            <div className="flex items-center justify-center lg:justify-start gap-6 mb-8">
              <div className="text-7xl font-bold text-gray-900">{averageRating}</div>
              <div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-8 w-8 ${
                        i < Math.floor(averageRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-500">{totalReviews.toLocaleString()} reviews</p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full text-green-700">
                <Award className="h-4 w-4" />
                <span className="text-sm font-medium">Verified Reviews</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-700">
                <ThumbsUp className="h-4 w-4" />
                <span className="text-sm font-medium">98% Recommend</span>
              </div>
            </div>
          </div>

          {/* Right - Rating Breakdown */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="font-semibold text-gray-900 mb-6">Rating Breakdown</h3>
            <div className="space-y-4">
              {ratingBreakdown.map((rating) => (
                <div key={rating.stars} className="flex items-center gap-4">
                  <div className="flex items-center gap-1 w-24">
                    <span className="text-sm font-medium text-gray-700">{rating.stars}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${rating.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-16 text-right">
                    {rating.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
          {[
            { icon: <Star className="h-6 w-6" />, value: '4.8/5', label: 'Average Rating' },
            { icon: <Users className="h-6 w-6" />, value: '50K+', label: 'Happy Customers' },
            { icon: <TrendingUp className="h-6 w-6" />, value: '98%', label: 'Would Recommend' },
            { icon: <MessageCircle className="h-6 w-6" />, value: '24hrs', label: 'Avg. Response Time' }
          ].map((stat, idx) => (
            <div key={idx} className="text-center p-6 bg-gray-50 rounded-xl">
              <div className="inline-flex p-3 bg-rose-100 rounded-xl text-rose-500 mb-3">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ReviewsList() {
  const [sortBy, setSortBy] = useState('recent')
  const [filterRating, setFilterRating] = useState<number | null>(null)

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-sm font-medium focus:ring-2 focus:ring-rose-500"
              >
                <option value="recent">Most Recent</option>
                <option value="helpful">Most Helpful</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <div className="flex gap-1">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-all ${
                      filterRating === rating
                        ? 'bg-rose-500 text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-rose-300'
                    }`}
                  >
                    {rating}
                    <Star className="h-3 w-3" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button className="text-sm text-rose-500 hover:text-rose-600 font-medium">
            Write a Review
          </button>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {mockReviews
            .filter(review => !filterRating || review.rating === filterRating)
            .map((review) => (
              <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 font-bold">
                      {review.author.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{review.author}</span>
                        {review.verified && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{review.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Content */}
                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
                <p className="text-gray-600 mb-4">{review.content}</p>

                {/* Product Tag */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 mb-4">
                  <span>Product:</span>
                  <span className="font-medium">{review.product}</span>
                </div>

                {/* Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-3 mb-4">
                    {review.images.map((image, idx) => (
                      <div
                        key={idx}
                        className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden"
                      >
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                          Photo
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Response */}
                {review.response && (
                  <div className="mt-4 p-4 bg-rose-50 rounded-xl border-l-4 border-rose-500">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">{review.response.author}</span>
                      <span className="text-sm text-gray-500">{review.response.date}</span>
                    </div>
                    <p className="text-gray-600 text-sm">{review.response.content}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
                  <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-500 transition-colors">
                    <ThumbsUp className="h-4 w-4" />
                    Helpful ({review.helpful})
                  </button>
                  <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-500 transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    Reply
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="px-8 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:border-rose-300 hover:text-rose-500 transition-all">
            Load More Reviews
          </button>
        </div>
      </div>
    </section>
  )
}

export function ReviewsCompact() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className="h-5 w-5 text-yellow-400 fill-yellow-400"
          />
        ))}
      </div>
      <span className="font-semibold text-gray-900">4.8</span>
      <span className="text-gray-500">(3,650 reviews)</span>
    </div>
  )
}
