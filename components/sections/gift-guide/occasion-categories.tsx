'use client'

import { useState } from 'react'
import { Heart, Gift, Baby, Cake, GraduationCap, Music, Mic2, Home, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

const occasions = [
  { id: 'wedding', icon: Heart, label: 'Wedding', description: 'First dance songs & vows', color: 'bg-rose-500' },
  { id: 'anniversary', icon: Gift, label: 'Anniversary', description: 'Celebrate your love story', color: 'bg-pink-500' },
  { id: 'baby', icon: Baby, label: 'New Baby', description: 'First words & heartbeats', color: 'bg-sky-500' },
  { id: 'birthday', icon: Cake, label: 'Birthday', description: 'Their favorite song', color: 'bg-amber-500' },
  { id: 'graduation', icon: GraduationCap, label: 'Graduation', description: 'Milestone speeches', color: 'bg-emerald-500' },
  { id: 'memorial', icon: Music, label: 'Memorial', description: 'Voices to remember', color: 'bg-violet-500' },
  { id: 'podcast', icon: Mic2, label: 'Podcasters', description: 'Show artwork & episodes', color: 'bg-orange-500' },
  { id: 'housewarming', icon: Home, label: 'Housewarming', description: 'Welcome home gifts', color: 'bg-teal-500' },
  { id: 'corporate', icon: Users, label: 'Corporate', description: 'Team & event gifts', color: 'bg-indigo-500' },
]

interface OccasionCategoriesProps {
  onSelect?: (occasionId: string) => void
}

export function OccasionCategories({ onSelect }: OccasionCategoriesProps) {
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null)
  
  const handleSelect = (id: string) => {
    setSelectedOccasion(id)
    onSelect?.(id)
  }
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Occasion</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find the perfect sound art gift for any special moment in life
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {occasions.map((occasion) => {
            const Icon = occasion.icon
            const isSelected = selectedOccasion === occasion.id
            
            return (
              <button
                key={occasion.id}
                onClick={() => handleSelect(occasion.id)}
                className={`group p-6 rounded-2xl border-2 transition-all text-center ${
                  isSelected
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className={`w-14 h-14 mx-auto rounded-full ${occasion.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{occasion.label}</h3>
                <p className="text-xs text-gray-500">{occasion.description}</p>
              </button>
            )
          })}
        </div>
        
        {selectedOccasion && (
          <div className="text-center mt-8">
            <Button className="bg-rose-500 hover:bg-rose-600">
              View {occasions.find(o => o.id === selectedOccasion)?.label} Gifts
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
