'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Check, Gift } from 'lucide-react'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSubmitted(true)
    setIsLoading(false)
  }
  
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left: Visual */}
            <div className="bg-gray-900 p-8 md:p-12 flex items-center justify-center relative overflow-hidden">
              {/* Waveform background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <svg viewBox="0 0 200 100" className="w-full h-full">
                  {Array.from({ length: 50 }).map((_, i) => {
                    const height = 10 + Math.sin(i * 0.3) * 30
                    return (
                      <rect
                        key={i}
                        x={i * 4}
                        y={50 - height / 2}
                        width="2.5"
                        height={height}
                        rx="1.25"
                        className="fill-rose-500"
                      />
                    )
                  })}
                </svg>
              </div>
              
              {/* Gift icon */}
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <Gift className="h-10 w-10 text-rose-400" />
                </div>
                <p className="text-white text-xl font-semibold mb-2">Get 10% Off</p>
                <p className="text-gray-400">Your first order</p>
              </div>
            </div>
            
            {/* Right: Form */}
            <div className="p-8 md:p-12">
              {!isSubmitted ? (
                <>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    Join Our Newsletter
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Subscribe to get exclusive discounts, new product announcements, and inspiration for your next sound print.
                  </p>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-14 text-lg"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-14 bg-rose-500 hover:bg-rose-600 text-lg"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Subscribing...' : 'Get 10% Off'}
                    </Button>
                  </form>
                  
                  <p className="text-xs text-gray-400 mt-4">
                    By subscribing, you agree to our Privacy Policy and consent to receive updates from SoundPrints.
                  </p>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    You&apos;re In!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Check your email for your 10% discount code.
                  </p>
                  <p className="text-sm text-rose-500 font-medium">
                    Code: WELCOME10
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
