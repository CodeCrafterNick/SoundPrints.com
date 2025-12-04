'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, Search, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  // Getting Started
  { id: '1', category: 'Getting Started', question: 'What audio files do you accept?', answer: 'We accept most common audio formats including MP3, WAV, AAC, FLAC, OGG, and M4A. Files can be up to 50MB in size. For best results, we recommend high-quality audio files.' },
  { id: '2', category: 'Getting Started', question: 'How long should my audio file be?', answer: "There's no strict limit, but we recommend 1-5 minutes for the best visual result. Longer files will be compressed to fit the design, while very short clips (under 10 seconds) may not produce enough visual detail." },
  { id: '3', category: 'Getting Started', question: 'Can I use any song or audio?', answer: 'You can use any audio you have rights to, including personal recordings, voice messages, and heartbeats. For copyrighted music, you should own the file personally. We don\'t distribute the audio, only the visual representation.' },
  
  // Customization
  { id: '4', category: 'Customization', question: 'What waveform styles are available?', answer: 'We offer 7 unique styles: Classic Bars, Smooth Wave, Circular, DNA Helix, Vinyl Record, Heartbeat, and Galaxy Spiral. Each style can be customized with different colors and gradients.' },
  { id: '5', category: 'Customization', question: 'Can I add text to my design?', answer: 'Yes! You can add a title, subtitle, and date to your design. Common additions include song titles, names, special dates, or meaningful quotes. Text positioning and fonts are customizable.' },
  { id: '6', category: 'Customization', question: 'What sizes are available?', answer: 'We offer prints from 8x10" to 24x36", as well as canvas options. Framed prints come in standard sizes that fit common frame dimensions.' },
  
  // Production & Shipping
  { id: '7', category: 'Production & Shipping', question: 'How long does production take?', answer: 'Standard production takes 2-3 business days. During busy periods (holidays), it may take up to 5 business days. Rush production (1 business day) is available for an additional fee.' },
  { id: '8', category: 'Production & Shipping', question: 'Do you ship internationally?', answer: 'Yes! We ship to over 100 countries worldwide. Domestic US shipping takes 3-7 business days. International shipping typically takes 7-21 business days depending on the destination.' },
  { id: '9', category: 'Production & Shipping', question: 'What materials do you use?', answer: 'Our prints use premium museum-quality paper with archival inks rated for 100+ years. Canvas prints use gallery-wrapped canvas on solid wood frames. All materials are eco-friendly and sustainably sourced.' },
  
  // Returns & Support
  { id: '10', category: 'Returns & Support', question: 'What is your return policy?', answer: 'We offer a 30-day satisfaction guarantee. If you\'re not happy with your purchase, contact us for a full refund or replacement. Custom items can be reprinted if there\'s a production error.' },
  { id: '11', category: 'Returns & Support', question: 'What if my print arrives damaged?', answer: 'Contact us immediately with photos of the damage. We\'ll send a replacement at no cost. All shipments include protective packaging and insurance.' },
  { id: '12', category: 'Returns & Support', question: 'Can I get help with my design?', answer: 'Absolutely! Our design team is happy to help. Contact us via email or live chat for assistance with color choices, layout suggestions, or any customization questions.' },
]

const categories = ['All', 'Getting Started', 'Customization', 'Production & Shipping', 'Returns & Support']

export function FAQAccordion() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set(['1']))
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  const filteredFAQs = useMemo(() => {
    return faqData.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])
  
  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }
  
  const groupedFAQs = useMemo(() => {
    const groups: Record<string, FAQItem[]> = {}
    filteredFAQs.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = []
      }
      groups[item.category].push(item)
    })
    return groups
  }, [filteredFAQs])
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our sound art prints
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
            />
          </div>
          
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* FAQ list */}
          {selectedCategory === 'All' ? (
            Object.entries(groupedFAQs).map(([category, items]) => (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{category}</h3>
                <div className="space-y-3">
                  {items.map(item => (
                    <FAQItemComponent
                      key={item.id}
                      item={item}
                      isOpen={openItems.has(item.id)}
                      onToggle={() => toggleItem(item.id)}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-3">
              {filteredFAQs.map(item => (
                <FAQItemComponent
                  key={item.id}
                  item={item}
                  isOpen={openItems.has(item.id)}
                  onToggle={() => toggleItem(item.id)}
                />
              ))}
            </div>
          )}
          
          {filteredFAQs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500 mb-4">No questions found matching your search</p>
              <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}>
                Clear filters
              </Button>
            </div>
          )}
          
          {/* Contact CTA */}
          <div className="mt-12 bg-white rounded-2xl p-8 text-center border border-gray-100">
            <MessageCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you 7 days a week
            </p>
            <div className="flex justify-center gap-4">
              <Button className="bg-rose-500 hover:bg-rose-600">
                Contact Support
              </Button>
              <Button variant="outline">
                Live Chat
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FAQItemComponent({ 
  item, 
  isOpen, 
  onToggle 
}: { 
  item: FAQItem
  isOpen: boolean
  onToggle: () => void 
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900 pr-4">{item.question}</span>
        <ChevronDown className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-5 pb-5">
          <p className="text-gray-600 leading-relaxed">{item.answer}</p>
        </div>
      )}
    </div>
  )
}
