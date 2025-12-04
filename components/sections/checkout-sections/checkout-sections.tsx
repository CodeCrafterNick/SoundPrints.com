'use client'

import { useState } from 'react'
import {
  CreditCard,
  Lock,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Truck,
  Package,
  MapPin,
  User,
  Mail,
  Phone,
  Building,
  Gift,
  Tag,
  ShoppingBag,
  Shield,
  ArrowLeft
} from 'lucide-react'

// Checkout Steps Progress
export function CheckoutSteps({ currentStep }: { currentStep: number }) {
  const steps = [
    { id: 1, name: 'Information', icon: User },
    { id: 2, name: 'Shipping', icon: Truck },
    { id: 3, name: 'Payment', icon: CreditCard }
  ]

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= step.id
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                  }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={`font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                  }`}
              >
                {step.name}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${currentStep > step.id ? 'bg-rose-500' : 'bg-gray-200'
                  }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Contact Information Form
export function ContactInfoForm() {
  return (
    <div className="bg-white rounded-2xl p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <User className="h-5 w-5 text-rose-500" />
        Contact Information
      </h2>

      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="John"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              placeholder="Doe"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              placeholder="john@example.com"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500" />
          Email me with news and offers
        </label>
      </div>
    </div>
  )
}

// Shipping Address Form
export function ShippingAddressForm() {
  const [country, setCountry] = useState('United States')

  return (
    <div className="bg-white rounded-2xl p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-rose-500" />
        Shipping Address
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country/Region</label>
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
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <div className="relative">
            <Building className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="123 Main Street"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apartment, suite, etc. (optional)</label>
          <input
            type="text"
            placeholder="Apt 4B"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              placeholder="New York"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent appearance-none bg-white">
              <option>New York</option>
              <option>California</option>
              <option>Texas</option>
            </select>
          </div>
          <div className="sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
            <input
              type="text"
              placeholder="10001"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500" />
          Save this address for future orders
        </label>
      </div>
    </div>
  )
}

// Shipping Method Selection
export function ShippingMethodSelect() {
  const [selected, setSelected] = useState('standard')

  const methods = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: '5-7 business days',
      price: 'Free',
      icon: Package
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: '2-3 business days',
      price: '$14.99',
      icon: Truck
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      description: 'Next business day',
      price: '$29.99',
      icon: Truck
    }
  ]

  return (
    <div className="bg-white rounded-2xl p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Truck className="h-5 w-5 text-rose-500" />
        Shipping Method
      </h2>

      <div className="space-y-3">
        {methods.map((method) => (
          <label
            key={method.id}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selected === method.id
                ? 'border-rose-500 bg-rose-50'
                : 'border-gray-200 hover:border-gray-300'
              }`}
          >
            <input
              type="radio"
              name="shipping"
              value={method.id}
              checked={selected === method.id}
              onChange={(e) => setSelected(e.target.value)}
              className="w-5 h-5 text-rose-500 focus:ring-rose-500"
            />
            <method.icon className={`h-5 w-5 ${selected === method.id ? 'text-rose-500' : 'text-gray-400'}`} />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{method.name}</p>
              <p className="text-sm text-gray-500">{method.description}</p>
            </div>
            <span className={`font-semibold ${method.price === 'Free' ? 'text-green-600' : 'text-gray-900'}`}>
              {method.price}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

// Payment Form
export function PaymentForm() {
  const [saveCard, setSaveCard] = useState(false)

  return (
    <div className="bg-white rounded-2xl p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-rose-500" />
        Payment
      </h2>

      {/* Payment Method Tabs */}
      <div className="flex gap-2 mb-6">
        <button className="flex-1 py-3 px-4 bg-gray-900 text-white rounded-xl font-medium">
          Credit Card
        </button>
        <button className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
          PayPal
        </button>
        <button className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
          Apple Pay
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-1 rounded">VISA</span>
              <span className="text-xs font-bold text-orange-700 bg-orange-100 px-1 rounded">MC</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
            <input
              type="text"
              placeholder="MM/YY"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
            <div className="relative">
              <input
                type="text"
                placeholder="123"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={saveCard}
            onChange={(e) => setSaveCard(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
          />
          Save card for future purchases
        </label>
      </div>

      {/* Security Badge */}
      <div className="flex items-center gap-2 mt-6 p-4 bg-green-50 rounded-xl">
        <Shield className="h-5 w-5 text-green-600" />
        <span className="text-sm text-green-700">
          Your payment information is encrypted and secure
        </span>
      </div>
    </div>
  )
}

// Order Summary Sidebar
export function OrderSummary() {
  const [promoCode, setPromoCode] = useState('')
  const [showPromo, setShowPromo] = useState(false)

  const items = [
    { name: 'Sound Wave Print - Canvas 24x12"', price: 79.99, quantity: 1 },
    { name: 'Sound Wave Print - Metal 16x8"', price: 129.99, quantity: 2 }
  ]

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  return (
    <div className="bg-white rounded-2xl p-6 sticky top-4">
      <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <ShoppingBag className="h-5 w-5 text-rose-500" />
        Order Summary
      </h2>

      {/* Items */}
      <div className="space-y-4 mb-6">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center relative">
              <ShoppingBag className="h-6 w-6 text-gray-300" />
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 text-white text-xs rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
              <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Code */}
      <div className="mb-6">
        <button
          onClick={() => setShowPromo(!showPromo)}
          className="flex items-center gap-2 text-sm text-rose-500 hover:text-rose-600"
        >
          <Tag className="h-4 w-4" />
          {showPromo ? 'Hide promo code' : 'Add promo code'}
        </button>

        {showPromo && (
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter code"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
            />
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm">
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Shipping</span>
          <span className="text-green-600">Free</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Estimated Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-100">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

// Complete Checkout Page
export function CheckoutPage() {
  const [step, setStep] = useState(1)

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Cart */}
        <a href="/cart" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </a>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Forms */}
          <div className="lg:col-span-2">
            <CheckoutSteps currentStep={step} />

            {step === 1 && (
              <>
                <ContactInfoForm />
                <ShippingAddressForm />
                <button
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
                >
                  Continue to Shipping
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <ShippingMethodSelect />
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-4 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
                  >
                    Continue to Payment
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <PaymentForm />

                {/* Gift Option */}
                <div className="bg-white rounded-2xl p-6 mb-6">
                  <label className="flex items-center gap-4 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                    />
                    <Gift className="h-5 w-5 text-rose-500" />
                    <div>
                      <p className="font-medium text-gray-900">This order is a gift</p>
                      <p className="text-sm text-gray-500">Add a gift message and hide the price</p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button className="flex-1 py-4 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors flex items-center justify-center gap-2">
                    <Lock className="h-5 w-5" />
                    Place Order
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  )
}

// Order Confirmation Success
export function OrderConfirmation() {
  return (
    <div className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-2xl p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You for Your Order!</h1>
          <p className="text-gray-600 mb-6">
            Your order #SWP-2024-1234 has been confirmed.
          </p>

          <div className="bg-gray-50 rounded-xl p-6 text-left mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Number</span>
                <span className="font-medium text-gray-900">#SWP-2024-1234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Order Date</span>
                <span className="font-medium text-gray-900">January 15, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Estimated Delivery</span>
                <span className="font-medium text-gray-900">January 20-22, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-rose-500">$339.97</span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            A confirmation email has been sent to john@example.com
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/my-orders"
              className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
            >
              View Order
            </a>
            <a
              href="/"
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
