'use client'

import { useState } from 'react'
import { Star, Camera, Upload, X, Loader2, CheckCircle } from 'lucide-react'

interface ReviewFormData {
  rating: number
  title: string
  review: string
  name: string
  email: string
  photos: File[]
  recommendProduct: boolean
}

export function WriteReviewForm() {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    title: '',
    review: '',
    name: '',
    email: '',
    photos: [],
    recommendProduct: true
  })
  const [hoveredStar, setHoveredStar] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...files].slice(0, 5) // Max 5 photos
    }))
  }

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-green-50 rounded-2xl p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Thank You for Your Review!
            </h2>
            <p className="text-gray-600 mb-6">
              Your review has been submitted and will appear on the site within 24 hours after moderation.
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false)
                setFormData({
                  rating: 0,
                  title: '',
                  review: '',
                  name: '',
                  email: '',
                  photos: [],
                  recommendProduct: true
                })
              }}
              className="text-rose-500 hover:text-rose-600 font-medium"
            >
              Write another review
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white" id="write-review">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Write a Review
          </h2>
          <p className="text-gray-600">
            Share your experience with SoundPrints
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-8">
          {/* Star Rating */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Overall Rating *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      star <= (hoveredStar || formData.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {formData.rating > 0 && (
                <span className="ml-4 text-sm text-gray-600">
                  {formData.rating === 5 && 'Excellent!'}
                  {formData.rating === 4 && 'Great!'}
                  {formData.rating === 3 && 'Good'}
                  {formData.rating === 2 && 'Fair'}
                  {formData.rating === 1 && 'Poor'}
                </span>
              )}
            </div>
          </div>

          {/* Review Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="Summarize your experience"
            />
          </div>

          {/* Review Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review *
            </label>
            <textarea
              required
              rows={5}
              value={formData.review}
              onChange={(e) => setFormData(prev => ({ ...prev, review: e.target.value }))}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
              placeholder="What did you like or dislike? How was the quality? Would you recommend this product?"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.review.length}/500 characters
            </p>
          </div>

          {/* Photo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Photos (Optional)
            </label>
            <div className="flex flex-wrap gap-3">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative w-20 h-20 bg-gray-200 rounded-xl overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <Camera className="h-6 w-6" />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {formData.photos.length < 5 && (
                <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 transition-colors">
                  <Upload className="h-5 w-5 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">Add</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Upload up to 5 photos. JPG, PNG up to 10MB each.
            </p>
          </div>

          {/* Recommend Product */}
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.recommendProduct}
                onChange={(e) => setFormData(prev => ({ ...prev, recommendProduct: e.target.checked }))}
                className="h-5 w-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
              />
              <span className="text-sm text-gray-700">I would recommend this product to a friend</span>
            </label>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="John D."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="you@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your email will not be published
              </p>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || formData.rating === 0}
            className="w-full py-4 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </form>
      </div>
    </section>
  )
}

export function WriteReviewButton() {
  return (
    <a
      href="#write-review"
      className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
    >
      <Star className="h-5 w-5" />
      Write a Review
    </a>
  )
}
