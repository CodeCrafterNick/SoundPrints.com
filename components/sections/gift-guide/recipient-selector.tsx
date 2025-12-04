'use client'

import { useState } from 'react'
import { ChevronRight, Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Question {
  id: string
  question: string
  options: {
    id: string
    label: string
    emoji: string
    description?: string
  }[]
}

const questions: Question[] = [
  {
    id: 'who',
    question: "Who are you shopping for?",
    options: [
      { id: 'partner', label: 'Partner/Spouse', emoji: '💕', description: 'Anniversary, birthday, just because' },
      { id: 'parent', label: 'Parent', emoji: '👨‍👩‍👧', description: 'Mom, Dad, or both' },
      { id: 'newparents', label: 'New Parents', emoji: '👶', description: 'Baby shower or welcome gift' },
      { id: 'couple', label: 'A Couple', emoji: '💑', description: 'Wedding or engagement' },
      { id: 'friend', label: 'Friend', emoji: '🤝', description: 'Birthday or milestone' },
      { id: 'colleague', label: 'Colleague', emoji: '💼', description: 'Work event or retirement' },
    ],
  },
  {
    id: 'occasion',
    question: "What's the occasion?",
    options: [
      { id: 'wedding', label: 'Wedding', emoji: '💒' },
      { id: 'anniversary', label: 'Anniversary', emoji: '🎊' },
      { id: 'birthday', label: 'Birthday', emoji: '🎂' },
      { id: 'baby', label: 'New Baby', emoji: '🍼' },
      { id: 'memorial', label: 'Memorial', emoji: '🕯️' },
      { id: 'other', label: 'Just Because', emoji: '🎁' },
    ],
  },
  {
    id: 'style',
    question: "What style do they prefer?",
    options: [
      { id: 'modern', label: 'Modern & Minimal', emoji: '◻️' },
      { id: 'classic', label: 'Classic & Elegant', emoji: '🖼️' },
      { id: 'colorful', label: 'Colorful & Bold', emoji: '🌈' },
      { id: 'rustic', label: 'Rustic & Natural', emoji: '🪵' },
    ],
  },
  {
    id: 'budget',
    question: "What's your budget?",
    options: [
      { id: 'under50', label: 'Under $50', emoji: '💵' },
      { id: '50-100', label: '$50 - $100', emoji: '💰' },
      { id: '100-150', label: '$100 - $150', emoji: '💎' },
      { id: 'over150', label: '$150+', emoji: '👑' },
    ],
  },
]

interface RecommendedProduct {
  id: number
  title: string
  price: number
  rating: number
  match: number
  colors: string[]
}

const recommendations: RecommendedProduct[] = [
  { id: 1, title: 'Wedding Vows Canvas Set', price: 89, rating: 4.9, match: 98, colors: ['#f43f5e', '#fbbf24'] },
  { id: 2, title: 'First Dance Sound Print', price: 69, rating: 4.8, match: 95, colors: ['#ec4899', '#f97316'] },
  { id: 3, title: 'Anniversary Date Art', price: 59, rating: 4.7, match: 92, colors: ['#06b6d4', '#8b5cf6'] },
]

export function RecipientSelector() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  
  const currentQuestion = questions[currentStep]
  
  const handleSelect = (optionId: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: optionId }
    setAnswers(newAnswers)
    
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300)
    } else {
      setTimeout(() => setShowResults(true), 300)
    }
  }
  
  const reset = () => {
    setCurrentStep(0)
    setAnswers({})
    setShowResults(false)
  }
  
  if (showResults) {
    return (
      <section className="py-16 bg-rose-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full mb-4">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Perfect Matches Found!</h2>
              <p className="text-gray-600">Based on your answers, here are our top recommendations</p>
            </div>
            
            <div className="space-y-4 mb-8">
              {recommendations.map((product, index) => (
                <div key={product.id} className="bg-white rounded-2xl p-6 flex items-center gap-6 shadow-sm">
                  {/* Preview */}
                  <div className="w-24 h-24 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 60 30" className="w-16 h-8">
                      <defs>
                        <linearGradient id={`rgrad-${product.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={product.colors[0]} />
                          <stop offset="100%" stopColor={product.colors[1]} />
                        </linearGradient>
                      </defs>
                      {Array.from({ length: 20 }).map((_, i) => {
                        const height = 3 + Math.sin(i * 0.4 + product.id) * 10
                        return (
                          <rect
                            key={i}
                            x={i * 3}
                            y={15 - height / 2}
                            width="2"
                            height={height}
                            rx="1"
                            fill={`url(#rgrad-${product.id})`}
                          />
                        )
                      })}
                    </svg>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {product.match}% MATCH
                      </span>
                      {index === 0 && (
                        <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                          TOP PICK
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{product.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="font-bold text-gray-900">${product.price}</span>
                    </div>
                  </div>
                  
                  {/* Action */}
                  <Button className="bg-rose-500 hover:bg-rose-600">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <button onClick={reset} className="text-rose-500 hover:text-rose-600 font-medium">
                Start Over
              </button>
            </div>
          </div>
        </div>
      </section>
    )
  }
  
  return (
    <section className="py-16 bg-rose-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index < currentStep
                    ? 'w-8 bg-rose-500'
                    : index === currentStep
                    ? 'w-8 bg-rose-500'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          {/* Question */}
          <div className="text-center mb-8">
            <span className="text-sm text-rose-500 font-medium mb-2 block">
              Question {currentStep + 1} of {questions.length}
            </span>
            <h2 className="text-3xl font-bold text-gray-900">{currentQuestion.question}</h2>
          </div>
          
          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={`p-6 rounded-2xl text-left transition-all ${
                  answers[currentQuestion.id] === option.id
                    ? 'bg-rose-500 text-white'
                    : 'bg-white hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <span className="text-3xl mb-3 block">{option.emoji}</span>
                <span className={`font-semibold block ${answers[currentQuestion.id] === option.id ? 'text-white' : 'text-gray-900'}`}>
                  {option.label}
                </span>
                {option.description && (
                  <span className={`text-sm block mt-1 ${answers[currentQuestion.id] === option.id ? 'text-rose-100' : 'text-gray-500'}`}>
                    {option.description}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              className={`text-gray-500 hover:text-gray-700 ${currentStep === 0 ? 'invisible' : ''}`}
            >
              ← Back
            </button>
            <button
              onClick={reset}
              className="text-gray-400 hover:text-gray-500 text-sm"
            >
              Start over
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
