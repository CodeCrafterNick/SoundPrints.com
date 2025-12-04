'use client'

import { useState } from 'react'
import {
  Truck,
  Package,
  Clock,
  MapPin,
  ChevronDown,
  Check,
  AlertCircle,
  Globe,
  Calendar,
  DollarSign,
  Info,
  Plane
} from 'lucide-react'

// Shipping Calculator
export function ShippingCalculator() {
  const [country, setCountry] = useState('United States')
  const [zip, setZip] = useState('')
  const [calculated, setCalculated] = useState(false)

  const shippingOptions = [
    { name: 'Standard Shipping', time: '5-7 business days', price: 'Free (orders $50+)', icon: Package },
    { name: 'Express Shipping', time: '2-3 business days', price: '$14.99', icon: Truck },
    { name: 'Overnight Delivery', time: 'Next business day', price: '$29.99', icon: Plane }
  ]

  const handleCalculate = () => {
    setCalculated(true)
  }

  return (
    <div className="bg-white rounded-2xl p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Truck className="h-5 w-5 text-rose-500" />
        Shipping Calculator
      </h3>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <div className="relative">
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent appearance-none bg-white"
            >
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
              <option>Australia</option>
              <option>Germany</option>
              <option>France</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
          <input
            type="text"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            placeholder="Enter ZIP code"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleCalculate}
          className="w-full py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
        >
          Calculate Shipping
        </button>
      </div>

      {calculated && (
        <div className="space-y-3 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-4">Available shipping options for {zip}, {country}:</p>
          {shippingOptions.map((option, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <option.icon className="h-5 w-5 text-rose-500" />
                <div>
                  <p className="font-medium text-gray-900">{option.name}</p>
                  <p className="text-sm text-gray-500">{option.time}</p>
                </div>
              </div>
              <span className={`font-semibold ${option.price.includes('Free') ? 'text-green-600' : 'text-gray-900'}`}>
                {option.price}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Shipping Info Section
export function ShippingInfoSection() {
  const shippingTiers = [
    {
      country: 'United States',
      methods: [
        { name: 'Standard', time: '5-7 days', price: 'Free on $50+' },
        { name: 'Express', time: '2-3 days', price: '$14.99' },
        { name: 'Overnight', time: '1 day', price: '$29.99' }
      ]
    },
    {
      country: 'Canada',
      methods: [
        { name: 'Standard', time: '7-10 days', price: '$9.99' },
        { name: 'Express', time: '3-5 days', price: '$24.99' }
      ]
    },
    {
      country: 'International',
      methods: [
        { name: 'Standard', time: '10-21 days', price: '$14.99' },
        { name: 'Express', time: '5-10 days', price: '$34.99' }
      ]
    }
  ]

  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Shipping Information</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We ship worldwide! Find estimated delivery times and costs for your location.
          </p>
        </div>

        <div className="space-y-6">
          {shippingTiers.map((tier) => (
            <div key={tier.country} className="bg-white rounded-2xl overflow-hidden">
              <div className="bg-gray-900 text-white px-6 py-4 flex items-center gap-2">
                <Globe className="h-5 w-5" />
                <h3 className="font-semibold">{tier.country}</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {tier.methods.map((method, idx) => (
                  <div key={idx} className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <Truck className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{method.name} Shipping</p>
                        <p className="text-sm text-gray-500">{method.time}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${method.price.includes('Free') ? 'text-green-600' : 'text-gray-900'}`}>
                      {method.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Production Time Notice */}
        <div className="mt-8 p-6 bg-amber-50 rounded-2xl flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Production Time</h4>
            <p className="text-gray-600 text-sm">
              Please note that all sound wave prints are custom-made. Production typically takes 2-5 business days before shipping.
              Delivery estimates shown above begin after production is complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Delivery Estimate Badge
export function DeliveryEstimate({ days = '5-7' }: { days?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Truck className="h-4 w-4 text-rose-500" />
      <span>
        Estimated delivery: <strong className="text-gray-900">{days} business days</strong>
      </span>
    </div>
  )
}

// Shipping Progress Tracker
export function ShippingTracker({ currentStep = 2 }: { currentStep?: number }) {
  const steps = [
    { id: 1, name: 'Order Placed', date: 'Jan 15, 2024', icon: Package },
    { id: 2, name: 'In Production', date: 'Jan 16, 2024', icon: Clock },
    { id: 3, name: 'Shipped', date: 'Jan 18, 2024', icon: Truck },
    { id: 4, name: 'Delivered', date: 'Est. Jan 22, 2024', icon: MapPin }
  ]

  return (
    <div className="bg-white rounded-2xl p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Tracking Your Order</h3>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
        <div
          className="absolute left-5 top-0 w-0.5 bg-rose-500 transition-all"
          style={{ height: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step) => (
            <div key={step.id} className="relative flex items-start gap-4 pl-14">
              <div
                className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= step.id
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                  }`}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className={`font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.name}
                </p>
                <p className={`text-sm ${currentStep >= step.id ? 'text-gray-500' : 'text-gray-400'}`}>
                  {step.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tracking Number */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Tracking Number</p>
          <p className="font-mono font-medium text-gray-900">USPS1234567890</p>
        </div>
        <button className="px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors">
          Track Package
        </button>
      </div>
    </div>
  )
}

// Free Shipping Banner
export function FreeShippingBanner({ threshold = 50, currentTotal = 35 }: { threshold?: number; currentTotal?: number }) {
  const remaining = threshold - currentTotal
  const progress = (currentTotal / threshold) * 100

  if (remaining <= 0) {
    return (
      <div className="bg-green-50 p-4 rounded-xl flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="font-medium text-green-800">You&apos;ve unlocked free shipping! 🎉</p>
          <p className="text-sm text-green-600">Your order qualifies for free standard shipping</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-rose-50 p-4 rounded-xl">
      <div className="flex items-center gap-3 mb-3">
        <Truck className="h-5 w-5 text-rose-500" />
        <p className="text-sm text-gray-700">
          Add <strong className="text-rose-600">${remaining.toFixed(2)}</strong> more for free shipping!
        </p>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-rose-500 h-2 rounded-full transition-all"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  )
}
