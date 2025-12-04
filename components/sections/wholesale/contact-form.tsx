'use client'

import { useState } from 'react'
import { Building2, Mail, Phone, MessageSquare, Send, CheckCircle, Loader2 } from 'lucide-react'

interface FormData {
  companyName: string
  contactName: string
  email: string
  phone: string
  businessType: string
  estimatedQuantity: string
  products: string[]
  message: string
}

const businessTypes = [
  'Retail Store',
  'Event Planning',
  'Corporate Gifts',
  'Music Industry',
  'Recording Studio',
  'Wedding Planner',
  'Marketing Agency',
  'Other'
]

const productOptions = [
  'T-Shirts',
  'Hoodies',
  'Art Prints',
  'Canvas Prints',
  'Mugs',
  'Tote Bags',
  'Phone Cases',
  'Custom Products'
]

export function WholesaleContactForm() {
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    businessType: '',
    estimatedQuantity: '',
    products: [],
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleProductToggle = (product: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.includes(product)
        ? prev.products.filter(p => p !== product)
        : [...prev.products, product]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-lg">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Thank You!
            </h2>
            <p className="text-gray-600 mb-8">
              We've received your wholesale inquiry. Our team will review your request and get back to you within 24 hours.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-rose-500 hover:text-rose-600 font-medium"
            >
              Submit another inquiry
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gray-50" id="wholesale-contact">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 rounded-full text-rose-600 mb-4">
            <Building2 className="h-4 w-4" />
            <span className="text-sm font-medium">Business Inquiries</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Start Your Wholesale Partnership
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Fill out the form below and our wholesale team will create a custom quote tailored to your business needs.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 lg:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    placeholder="Your company name"
                  />
                </div>
              </div>

              {/* Contact Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  placeholder="Your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type *
                </label>
                <select
                  required
                  value={formData.businessType}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                >
                  <option value="">Select business type</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Estimated Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Quantity *
                </label>
                <select
                  required
                  value={formData.estimatedQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedQuantity: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                >
                  <option value="">Select quantity range</option>
                  <option value="10-49">10-49 units</option>
                  <option value="50-199">50-199 units</option>
                  <option value="200-499">200-499 units</option>
                  <option value="500+">500+ units</option>
                </select>
              </div>
            </div>

            {/* Products Interested */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Products Interested In *
              </label>
              <div className="flex flex-wrap gap-3">
                {productOptions.map(product => (
                  <button
                    key={product}
                    type="button"
                    onClick={() => handleProductToggle(product)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.products.includes(product)
                        ? 'bg-rose-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {product}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us about your project, timeline, or any special requirements..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-8 w-full py-4 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Inquiry
                  <Send className="h-5 w-5" />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-sm text-gray-500">
              By submitting, you agree to our <a href="/privacy-policy" className="text-rose-500 hover:underline">Privacy Policy</a>
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}

export function WholesaleContactSimple() {
  return (
    <section className="py-16 bg-rose-500 text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-rose-100 mb-8">
          Contact our wholesale team for a custom quote tailored to your business.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:wholesale@soundprints.com"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-rose-500 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            <Mail className="h-5 w-5" />
            wholesale@soundprints.com
          </a>
          <a
            href="tel:1-800-SOUNDPRINT"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700 transition-colors"
          >
            <Phone className="h-5 w-5" />
            1-800-SOUNDPRINT
          </a>
        </div>
      </div>
    </section>
  )
}
