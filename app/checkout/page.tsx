'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/stores/cart-store'
import { Button } from '@/components/ui/button'
import { StripePayment } from '@/components/checkout/stripe-payment'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((state) => state.items)
  const getTotal = useCartStore((state) => state.getTotal)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  
  const [showPayment, setShowPayment] = useState(false)
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  })
  
  const subtotal = getTotal()
  const tax = subtotal * 0.08 // 8% tax
  const shipping = subtotal > 50 ? 0 : 5.99
  const total = subtotal + tax + shipping

  const handleContinueToPayment = () => {
    // Validate shipping info
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zipCode']
    const missingFields = requiredFields.filter(
      (field) => !shippingInfo[field as keyof typeof shippingInfo]
    )

    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(shippingInfo.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setShowPayment(true)
  }

  const handlePaymentSuccess = async () => {
    try {
      // Create order in database
      const orderData = {
        email: shippingInfo.email,
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        shipping: shipping.toString(),
        total: total.toString(),
        shippingAddress: shippingInfo,
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderData,
          items: items.map((item) => ({
            productType: item.productType,
            size: item.size,
            audioFileName: item.audioFileName,
            audioFileUrl: item.audioFileUrl,
            waveformColor: item.waveformColor,
            backgroundColor: item.backgroundColor,
            customText: item.customText,
            price: item.price.toString(),
            quantity: item.quantity,
          })),
          paymentIntentId: 'temp', // This will be updated after payment
        }),
      })

      if (response.ok) {
        clearCart()
        toast.success('Order placed successfully!')
        router.push('/order-confirmation')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Failed to create order')
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/create">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Create
              </Button>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Add some custom SoundPrints to get started!
          </p>
          <Link href="/create">
            <Button>Create Your SoundPrint</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/create">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Create
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {item.productType.replace('-', ' ').toUpperCase()} - {item.size}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.audioFileName}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: item.waveformColor }}
                        />
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: item.backgroundColor }}
                        />
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span className="text-sm w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">First Name *</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="John"
                      value={shippingInfo.firstName}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, firstName: e.target.value })
                      }
                      disabled={showPayment}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name *</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="Doe"
                      value={shippingInfo.lastName}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, lastName: e.target.value })
                      }
                      disabled={showPayment}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Email *</label>
                  <input
                    type="email"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="john@example.com"
                    value={shippingInfo.email}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, email: e.target.value })
                    }
                    disabled={showPayment}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Address *</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="123 Main St"
                    value={shippingInfo.address}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, address: e.target.value })
                    }
                    disabled={showPayment}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">City *</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="New York"
                      value={shippingInfo.city}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, city: e.target.value })
                      }
                      disabled={showPayment}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">State *</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="NY"
                      value={shippingInfo.state}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, state: e.target.value })
                      }
                      disabled={showPayment}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">ZIP Code *</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="10001"
                      value={shippingInfo.zipCode}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, zipCode: e.target.value })
                      }
                      disabled={showPayment}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Country *</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="USA"
                      value={shippingInfo.country}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, country: e.target.value })
                      }
                      disabled={showPayment}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            {showPayment && (
              <div className="bg-card rounded-lg border p-6">
                <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
                <StripePayment amount={total} onSuccess={handlePaymentSuccess} />
              </div>
            )}
          </div>

          {/* Order Total */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Total</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-green-600">
                    🎉 Free shipping on orders over $50!
                  </p>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-6"
                size="lg"
                onClick={handleContinueToPayment}
                disabled={showPayment}
              >
                {showPayment ? 'Payment Information Below' : 'Continue to Payment'}
              </Button>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Secure checkout powered by Stripe</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>100% satisfaction guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
