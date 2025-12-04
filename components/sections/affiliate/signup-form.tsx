'use client'

import { useState } from 'react'
import { User, Mail, Globe, Instagram, Youtube, Twitter, MessageSquare, Send, CheckCircle, Loader2, Link2 } from 'lucide-react'

interface FormData {
  firstName: string
  lastName: string
  email: string
  website: string
  socialPlatforms: string[]
  audienceSize: string
  niche: string
  howHeard: string
  message: string
  agreedToTerms: boolean
}

const socialOptions = [
  { id: 'instagram', name: 'Instagram', icon: <Instagram className="h-4 w-4" /> },
  { id: 'youtube', name: 'YouTube', icon: <Youtube className="h-4 w-4" /> },
  { id: 'twitter', name: 'Twitter/X', icon: <Twitter className="h-4 w-4" /> },
  { id: 'tiktok', name: 'TikTok', icon: <Globe className="h-4 w-4" /> },
  { id: 'blog', name: 'Blog', icon: <Link2 className="h-4 w-4" /> },
  { id: 'podcast', name: 'Podcast', icon: <Globe className="h-4 w-4" /> }
]

const audienceOptions = [
  'Under 1,000',
  '1,000 - 10,000',
  '10,000 - 50,000',
  '50,000 - 100,000',
  '100,000 - 500,000',
  '500,000+'
]

const nicheOptions = [
  'Music & Musicians',
  'Wedding & Events',
  'Lifestyle & Home',
  'Parenting & Family',
  'Gift Guides',
  'Art & Design',
  'Tech & Gadgets',
  'General Content',
  'Other'
]

export function AffiliateSignupForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    website: '',
    socialPlatforms: [],
    audienceSize: '',
    niche: '',
    howHeard: '',
    message: '',
    agreedToTerms: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      socialPlatforms: prev.socialPlatforms.includes(platform)
        ? prev.socialPlatforms.filter(p => p !== platform)
        : [...prev.socialPlatforms, platform]
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
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-green-50 rounded-2xl p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to the Team!
            </h2>
            <p className="text-gray-600 mb-6">
              Your affiliate application has been submitted. Check your email for your unique referral link and getting started guide.
            </p>
            <div className="bg-white p-4 rounded-xl border border-green-200">
              <p className="text-sm text-gray-500 mb-2">Your Referral Link</p>
              <code className="text-rose-500 font-mono text-sm">
                soundprints.com/ref/{formData.firstName.toLowerCase()}{Math.floor(Math.random() * 1000)}
              </code>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-white" id="affiliate-signup">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Join the Affiliate Program
          </h2>
          <p className="text-gray-600">
            Fill out the form below to become a SoundPrints affiliate partner.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="John"
                />
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Doe"
              />
            </div>

            {/* Email */}
            <div className="md:col-span-2">
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
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Website */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website / Main Platform URL
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="https://yoursite.com"
                />
              </div>
            </div>
          </div>

          {/* Social Platforms */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Where will you promote SoundPrints? *
            </label>
            <div className="flex flex-wrap gap-3">
              {socialOptions.map(platform => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => togglePlatform(platform.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    formData.socialPlatforms.includes(platform.id)
                      ? 'bg-rose-500 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300'
                  }`}
                >
                  {platform.icon}
                  {platform.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Audience Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Audience Size *
              </label>
              <select
                required
                value={formData.audienceSize}
                onChange={(e) => setFormData(prev => ({ ...prev, audienceSize: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="">Select audience size</option>
                {audienceOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Niche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Niche *
              </label>
              <select
                required
                value={formData.niche}
                onChange={(e) => setFormData(prev => ({ ...prev, niche: e.target.value }))}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="">Select your niche</option>
                {nicheOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Message */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tell us about yourself
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                placeholder="Why do you want to be a SoundPrints affiliate? Share your content style and promotion ideas..."
              />
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="mt-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.agreedToTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, agreedToTerms: e.target.checked }))}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
              />
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <a href="/affiliate-terms" className="text-rose-500 hover:underline">
                  Affiliate Program Terms
                </a>{' '}
                and{' '}
                <a href="/privacy-policy" className="text-rose-500 hover:underline">
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full py-4 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Join Affiliate Program
                <Send className="h-5 w-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  )
}

export function AffiliateSignupSimple() {
  const [email, setEmail] = useState('')

  return (
    <section className="py-16 bg-gradient-to-r from-rose-500 to-pink-500 text-white">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Start Earning Today</h2>
        <p className="text-rose-100 mb-8">
          Join 10,000+ affiliates earning passive income with SoundPrints
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-6 py-4 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-white/50"
          />
          <button className="px-8 py-4 bg-white text-rose-500 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
            Get Started Free
          </button>
        </div>
        <p className="text-rose-200 text-sm mt-4">
          No minimum followers required. Instant approval.
        </p>
      </div>
    </section>
  )
}
