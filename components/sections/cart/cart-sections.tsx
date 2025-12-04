'use client'

import { useState } from 'react'
import { X, Plus, Minus, ShoppingBag, Trash2, Gift, Truck, Tag, ChevronRight, Heart, ArrowRight } from 'lucide-react'

// Sample cart data
const sampleCartItems = [
  {
    id: '1',
    name: 'Sound Wave Print',
    variant: 'Canvas - 24x12"',
    price: 79.99,
    quantity: 1,
    image: '/mockups/canvas-24x12.jpg'
  },
  {
    id: '2',
    name: 'Sound Wave Print',
    variant: 'Metal Print - 16x8"',
    price: 129.99,
    quantity: 2,
    image: '/mockups/metal-16x8.jpg'
  }
]

// Cart Sidebar (Slide-out drawer)
export function CartSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [items, setItems] = useState(sampleCartItems)
  const [promoCode, setPromoCode] = useState('')

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal >= 50 ? 0 : 9.99
  const total = subtotal + shipping

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ))
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-rose-500" />
            <h2 className="text-lg font-bold text-gray-900">Your Cart</h2>
            <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        {subtotal < 50 && (
          <div className="p-4 bg-rose-50">
            <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
              <Truck className="h-4 w-4 text-rose-500" />
              <span>Add <strong>${(50 - subtotal).toFixed(2)}</strong> more for free shipping!</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-rose-500 h-2 rounded-full transition-all"
                style={{ width: `${(subtotal / 50) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Start creating your custom sound wave art!</p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
              >
                Start Creating
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-gray-50 rounded-xl p-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-gray-300" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                  <p className="text-sm text-gray-500">{item.variant}</p>
                  <p className="font-bold text-rose-500 mt-1">${item.price.toFixed(2)}</p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Minus className="h-4 w-4 text-gray-500" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Plus className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                        <Heart className="h-4 w-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Promo Code */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button className="w-full py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors flex items-center justify-center gap-2">
              Checkout
              <ArrowRight className="h-5 w-5" />
            </button>

            <p className="text-center text-xs text-gray-500 mt-3">
              Secure checkout powered by Stripe
            </p>
          </div>
        )}
      </div>
    </>
  )
}

// Mini Cart (Header dropdown)
export function MiniCart() {
  const [isOpen, setIsOpen] = useState(false)
  const items = sampleCartItems.slice(0, 2)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <ShoppingBag className="h-6 w-6 text-gray-700" />
        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {items.length}
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="p-4">
            <h3 className="font-bold text-gray-900 mb-4">Shopping Cart</h3>

            {items.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Your cart is empty</p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.variant}</p>
                      <p className="text-sm font-semibold text-rose-500">${item.price.toFixed(2)} × {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <span className="font-medium text-gray-900">Subtotal</span>
                  <span className="font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>

                <div className="mt-4 space-y-2">
                  <a
                    href="/checkout"
                    className="block w-full py-2.5 bg-rose-500 text-white text-center rounded-lg font-semibold hover:bg-rose-600 transition-colors"
                  >
                    Checkout
                  </a>
                  <a
                    href="/cart"
                    className="block w-full py-2.5 bg-gray-100 text-gray-700 text-center rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    View Cart
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Full Cart Page
export function CartPage() {
  const [items, setItems] = useState(sampleCartItems)
  const [promoCode, setPromoCode] = useState('')
  const [isGiftWrap, setIsGiftWrap] = useState(false)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const giftWrapFee = isGiftWrap ? 5.99 : 0
  const shipping = subtotal >= 50 ? 0 : 9.99
  const total = subtotal + shipping + giftWrapFee

  const updateQuantity = (id: string, delta: number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ))
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <ShoppingBag className="h-20 w-20 text-gray-200 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven&apos;t added anything yet.</p>
            <a
              href="/create"
              className="inline-flex items-center gap-2 px-8 py-4 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
            >
              Start Creating
              <ChevronRight className="h-5 w-5" />
            </a>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-6 flex gap-6">
                  <div className="w-32 h-32 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                    <ShoppingBag className="h-12 w-12 text-gray-300" />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                        <p className="text-gray-500">{item.variant}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                        >
                          <Minus className="h-4 w-4 text-gray-500" />
                        </button>
                        <span className="w-12 text-center font-semibold text-lg">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                        >
                          <Plus className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>

                      <p className="text-xl font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                      <button className="text-sm text-gray-500 hover:text-rose-500 flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        Save for Later
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 sticky top-4">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                      Apply
                    </button>
                  </div>
                </div>

                {/* Gift Wrap Option */}
                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer mb-6">
                  <input
                    type="checkbox"
                    checked={isGiftWrap}
                    onChange={(e) => setIsGiftWrap(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-rose-500" />
                      <span className="font-medium text-gray-900">Add Gift Wrap</span>
                    </div>
                    <p className="text-sm text-gray-500">+ $5.99</p>
                  </div>
                </label>

                {/* Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.length} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {isGiftWrap && (
                    <div className="flex justify-between text-gray-600">
                      <span>Gift Wrap</span>
                      <span>${giftWrapFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      <span>${shipping.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <a
                  href="/checkout"
                  className="block w-full py-4 bg-rose-500 text-white text-center rounded-xl font-semibold hover:bg-rose-600 transition-colors"
                >
                  Proceed to Checkout
                </a>

                {/* Trust Badges */}
                <div className="flex justify-center gap-6 mt-6 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Truck className="h-4 w-4" />
                    Free Shipping
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    Secure Payment
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Empty Cart State
export function EmptyCartState() {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingBag className="h-12 w-12 text-gray-300" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Start creating beautiful sound wave art from your favorite moments.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="/create"
          className="px-8 py-4 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
        >
          Create Your Print
        </a>
        <a
          href="/gallery"
          className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Browse Gallery
        </a>
      </div>
    </div>
  )
}

// Cart Item Row (For table layout)
export function CartItemRow({ item, onUpdateQuantity, onRemove }: {
  item: typeof sampleCartItems[0]
  onUpdateQuantity: (delta: number) => void
  onRemove: () => void
}) {
  return (
    <tr className="border-b border-gray-100">
      <td className="py-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-gray-300" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{item.name}</h4>
            <p className="text-sm text-gray-500">{item.variant}</p>
          </div>
        </div>
      </td>
      <td className="py-6 text-center">
        <span className="font-medium text-gray-900">${item.price.toFixed(2)}</span>
      </td>
      <td className="py-6">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onUpdateQuantity(-1)}
            className="p-1.5 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
          >
            <Minus className="h-4 w-4 text-gray-500" />
          </button>
          <span className="w-10 text-center font-medium">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(1)}
            className="p-1.5 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
          >
            <Plus className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </td>
      <td className="py-6 text-center">
        <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
      </td>
      <td className="py-6 text-center">
        <button
          onClick={onRemove}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="h-5 w-5 text-red-500" />
        </button>
      </td>
    </tr>
  )
}
