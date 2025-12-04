'use client'

import { useState } from 'react'
import {
  Search,
  Mail,
  Send,
  User,
  Phone,
  MessageSquare,
  Paperclip,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react'

// Search Bar Component
export function SearchBar({ placeholder = 'Search...', onSearch }: {
  placeholder?: string
  onSearch?: (query: string) => void
}) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(query)
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${isFocused ? 'text-rose-500' : 'text-gray-400'
        }`} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent focus:bg-white transition-all"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      )}
    </form>
  )
}

// Search with Suggestions
export function SearchWithSuggestions() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const suggestions = [
    'Wedding first dance',
    'Baby heartbeat',
    'Favorite song',
    'Voice recording'
  ]

  const recentSearches = ['Canvas 24x12', 'Metal print']

  return (
    <div className="relative">
      <form className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search for sounds, products..."
          className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
        >
          <Search className="h-4 w-4" />
        </button>
      </form>

      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {recentSearches.length > 0 && (
            <div className="p-4 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Recent</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    className="px-3 py-1.5 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Popular Searches</p>
            <ul className="space-y-2">
              {suggestions.map((suggestion) => (
                <li key={suggestion}>
                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-gray-700 transition-colors">
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

// Newsletter Form
export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
        <CheckCircle className="h-6 w-6 text-green-500" />
        <div>
          <p className="font-medium text-green-800">You&apos;re subscribed!</p>
          <p className="text-sm text-green-600">Check your email for a 15% off code.</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Subscribing...
          </>
        ) : (
          <>
            Subscribe
            <Send className="h-5 w-5" />
          </>
        )}
      </button>
      <p className="text-xs text-gray-500 text-center">
        By subscribing, you agree to our Privacy Policy.
      </p>
    </form>
  )
}

// Contact Form
export function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    await new Promise(resolve => setTimeout(resolve, 1500))
    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
        <p className="text-gray-600">We&apos;ll get back to you within 24 hours.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <select
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent appearance-none bg-white"
        >
          <option value="">Select a subject</option>
          <option value="order">Order Inquiry</option>
          <option value="product">Product Question</option>
          <option value="return">Return/Exchange</option>
          <option value="feedback">Feedback</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <div className="relative">
          <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="How can we help you?"
            rows={4}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* File Attachment */}
      <div>
        <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-rose-300 transition-colors">
          <Paperclip className="h-5 w-5 text-gray-400" />
          <span className="text-gray-600">Attach files (optional)</span>
          <input type="file" className="hidden" multiple accept="image/*,.pdf" />
        </label>
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-4 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Send Message
          </>
        )}
      </button>
    </form>
  )
}

// Password Input with Toggle
export function PasswordInput({
  value,
  onChange,
  placeholder = 'Enter password',
  label
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent pr-12"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5 text-gray-400" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  )
}

// Form Error Message
export function FormError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
      <p className="text-sm text-red-600">{message}</p>
    </div>
  )
}

// Form Success Message
export function FormSuccess({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
      <p className="text-sm text-green-600">{message}</p>
    </div>
  )
}
