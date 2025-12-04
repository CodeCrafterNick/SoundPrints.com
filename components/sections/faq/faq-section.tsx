'use client'

import { useState } from 'react'
import { ChevronDown, Search, HelpCircle, Package, Truck, RefreshCw, CreditCard, Palette, MessageCircle } from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How does the sound wave creation process work?',
    answer: 'Simply upload your audio file (MP3, WAV, or M4A), and our system automatically generates a beautiful sound wave visualization. You can then customize the colors, style, and add your own text before previewing it on your chosen product.',
    category: 'creation'
  },
  {
    id: '2',
    question: 'What audio formats do you accept?',
    answer: 'We accept MP3, WAV, M4A, and AAC audio files up to 50MB. For best results, we recommend using high-quality audio files. You can upload songs, voice recordings, heartbeats, or any audio that\'s meaningful to you.',
    category: 'creation'
  },
  {
    id: '3',
    question: 'How long does production and shipping take?',
    answer: 'Production typically takes 2-5 business days. Standard shipping is 5-7 business days within the US, and 10-14 business days for international orders. Rush processing and expedited shipping options are available at checkout.',
    category: 'shipping'
  },
  {
    id: '4',
    question: 'Do you ship internationally?',
    answer: 'Yes! We ship to over 50 countries worldwide. International shipping rates and delivery times vary by location. You can see the exact shipping cost during checkout after entering your address.',
    category: 'shipping'
  },
  {
    id: '5',
    question: 'What is your return policy?',
    answer: 'We offer a 30-day satisfaction guarantee. If you\'re not happy with your order, contact us within 30 days and we\'ll make it right with a replacement or refund. Since each item is custom-made, we ask that you carefully review your design before ordering.',
    category: 'returns'
  },
  {
    id: '6',
    question: 'Can I cancel or modify my order?',
    answer: 'You can cancel or modify your order within 2 hours of placing it. After that, production may have already begun. Contact us immediately at support@soundprints.com if you need to make changes.',
    category: 'orders'
  },
  {
    id: '7',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, Google Pay, and Shop Pay. All transactions are secured with SSL encryption.',
    category: 'payment'
  },
  {
    id: '8',
    question: 'Is my audio file kept private?',
    answer: 'Absolutely. Your audio files are processed securely and automatically deleted from our servers after 30 days. We never share your audio or personal information with third parties.',
    category: 'privacy'
  },
  {
    id: '9',
    question: 'Can I use copyrighted music?',
    answer: 'Yes, you can use any audio for personal use products. Our products are for personal enjoyment and gifts. However, you cannot resell products featuring copyrighted material without proper licensing.',
    category: 'creation'
  },
  {
    id: '10',
    question: 'What\'s the quality of your products?',
    answer: 'We use premium materials for all our products. Our canvas prints use museum-quality archival-grade canvas, posters are printed on premium matte paper, and apparel is made from soft, durable fabrics. All prints are fade-resistant and built to last.',
    category: 'products'
  }
]

const categories = [
  { id: 'all', label: 'All Questions', icon: <HelpCircle className="h-4 w-4" /> },
  { id: 'creation', label: 'Creating Designs', icon: <Palette className="h-4 w-4" /> },
  { id: 'shipping', label: 'Shipping', icon: <Truck className="h-4 w-4" /> },
  { id: 'returns', label: 'Returns', icon: <RefreshCw className="h-4 w-4" /> },
  { id: 'orders', label: 'Orders', icon: <Package className="h-4 w-4" /> },
  { id: 'payment', label: 'Payment', icon: <CreditCard className="h-4 w-4" /> }
]

export function FAQSection() {
  const [openItems, setOpenItems] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 rounded-full text-rose-600 mb-4">
            <HelpCircle className="h-4 w-4" />
            <span className="text-sm font-medium">FAQ</span>
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about SoundPrints
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-rose-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No questions found. Try a different search.</p>
            </div>
          ) : (
            filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                      openItems.includes(faq.id) ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openItems.includes(faq.id) && (
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Still Have Questions */}
        <div className="mt-12 bg-gray-50 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
          <p className="text-gray-600 mb-6">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
          >
            <MessageCircle className="h-5 w-5" />
            Contact Support
          </a>
        </div>
      </div>
    </section>
  )
}

export function FAQCompact() {
  const [openItem, setOpenItem] = useState<string | null>(null)
  const topFAQs = faqData.slice(0, 5)

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Common Questions
        </h2>

        <div className="space-y-3">
          {topFAQs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenItem(openItem === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    openItem === faq.id ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openItem === faq.id && (
                <div className="px-5 pb-5 pt-0">
                  <p className="text-gray-600 text-sm">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="/faq" className="text-rose-500 hover:text-rose-600 font-medium">
            View all FAQs →
          </a>
        </div>
      </div>
    </section>
  )
}

export function FAQMinimal() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const quickFAQs = faqData.slice(0, 4)

  return (
    <div className="space-y-2">
      {quickFAQs.map((faq, index) => (
        <div key={faq.id} className="border-b border-gray-100 last:border-0">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between py-4 text-left"
          >
            <span className="text-sm font-medium text-gray-900">{faq.question}</span>
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform ${
                openIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openIndex === index && (
            <p className="pb-4 text-sm text-gray-600">{faq.answer}</p>
          )}
        </div>
      ))}
    </div>
  )
}
