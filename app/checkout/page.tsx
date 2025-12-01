'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useCartStore } from '@/lib/stores/cart-store'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import { StripePayment } from '@/components/checkout/stripe-payment'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' },
]

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'BE', label: 'Belgium' },
  { value: 'AT', label: 'Austria' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'SE', label: 'Sweden' },
  { value: 'NO', label: 'Norway' },
  { value: 'DK', label: 'Denmark' },
  { value: 'FI', label: 'Finland' },
  { value: 'IE', label: 'Ireland' },
  { value: 'PT', label: 'Portugal' },
  { value: 'NZ', label: 'New Zealand' },
  { value: 'JP', label: 'Japan' },
  { value: 'KR', label: 'South Korea' },
  { value: 'SG', label: 'Singapore' },
  { value: 'HK', label: 'Hong Kong' },
  { value: 'MX', label: 'Mexico' },
  { value: 'BR', label: 'Brazil' },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const items = useCartStore((state) => state.items)
  const getTotal = useCartStore((state) => state.getTotal)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  
  const [showPayment, setShowPayment] = useState(false)
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  })
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  })
  
  const subtotal = getTotal()
  const tax = subtotal * 0.08 // 8% tax
  const shipping = subtotal > 50 ? 0 : 5.99
  const total = subtotal + tax + shipping

  // Auto-populate email from logged-in user
  useEffect(() => {
    if (isLoaded && user?.primaryEmailAddress?.emailAddress && !shippingInfo.email) {
      setShippingInfo(prev => ({
        ...prev,
        email: user.primaryEmailAddress!.emailAddress
      }))
    }
  }, [isLoaded, user])

  const handleContinueToPayment = () => {
    // Validate shipping info
    const requiredShippingFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode']
    const missingShippingFields = requiredShippingFields.filter(
      (field) => !shippingInfo[field as keyof typeof shippingInfo]
    )

    if (missingShippingFields.length > 0) {
      toast.error('Please fill in all required shipping fields')
      return
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(shippingInfo.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    // Validate billing info if different from shipping
    if (!billingSameAsShipping) {
      const requiredBillingFields = ['firstName', 'lastName', 'address', 'city', 'state', 'zipCode']
      const missingBillingFields = requiredBillingFields.filter(
        (field) => !billingInfo[field as keyof typeof billingInfo]
      )

      if (missingBillingFields.length > 0) {
        toast.error('Please fill in all required billing fields')
        return
      }
    }

    setShowPayment(true)
  }

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Create order in database
      const finalBillingAddress = billingSameAsShipping ? shippingInfo : billingInfo
      const orderData = {
        email: shippingInfo.email,
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        shipping: shipping.toString(),
        total: total.toString(),
        shippingAddress: shippingInfo,
        billingAddress: finalBillingAddress,
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
            designUrl: item.designUrl,
            thumbnailUrl: item.thumbnailUrl,
            // Printify fields
            printifyBlueprintId: item.printifyBlueprintId,
            printifyVariantId: item.printifyVariantId,
            waveformStyle: item.waveformStyle,
          })),
          paymentIntentId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        clearCart()
        toast.success('Order placed successfully!')
        router.push(`/order-confirmation?orderId=${data.order.id}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Failed to create order')
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">
            Add some custom SoundPrints to get started!
          </p>
          <Link href="/create">
            <Button>Create Your SoundPrint</Button>
          </Link>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                    {/* Product Preview */}
                    <div className="relative w-32 h-32 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.productType}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                          No preview
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {item.productType.replace('-', ' ').toUpperCase()} - {item.size}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.audioFileName}
                      </p>
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
                  <label className="text-sm font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    placeholder="(555) 123-4567"
                    value={shippingInfo.phone}
                    onChange={(e) =>
                      setShippingInfo({ ...shippingInfo, phone: e.target.value })
                    }
                    disabled={showPayment}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Required for delivery updates</p>
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
                    <label className="text-sm font-medium" htmlFor="state-select">State *</label>
                    <div className="mt-1">
                      <Combobox
                        id="state-select"
                        options={US_STATES}
                        value={shippingInfo.state}
                        onChange={(value) =>
                          setShippingInfo({ ...shippingInfo, state: value })
                        }
                        placeholder="Select state..."
                        searchPlaceholder="Search states..."
                        emptyText="No state found."
                        disabled={showPayment}
                      />
                    </div>
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
                    <label className="text-sm font-medium" htmlFor="country-select">Country *</label>
                    <div className="mt-1">
                      <Combobox
                        id="country-select"
                        options={COUNTRIES}
                        value={shippingInfo.country}
                        onChange={(value) =>
                          setShippingInfo({ ...shippingInfo, country: value })
                        }
                        placeholder="Select country..."
                        searchPlaceholder="Search countries..."
                        emptyText="No country found."
                        disabled={showPayment}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Address Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="billingSame"
                  checked={billingSameAsShipping}
                  onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                  disabled={showPayment}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="billingSame" className="text-sm font-medium">
                  Billing address same as shipping
                </label>
              </div>

              {!billingSameAsShipping && (
                <div className="space-y-4 pt-2 border-t">
                  <h3 className="text-lg font-semibold pt-4">Billing Address</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">First Name *</label>
                      <input
                        type="text"
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        placeholder="John"
                        value={billingInfo.firstName}
                        onChange={(e) =>
                          setBillingInfo({ ...billingInfo, firstName: e.target.value })
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
                        value={billingInfo.lastName}
                        onChange={(e) =>
                          setBillingInfo({ ...billingInfo, lastName: e.target.value })
                        }
                        disabled={showPayment}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Street Address *</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="123 Main St"
                      value={billingInfo.address1}
                      onChange={(e) =>
                        setBillingInfo({ ...billingInfo, address1: e.target.value })
                      }
                      disabled={showPayment}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Apartment, suite, etc. (optional)</label>
                    <input
                      type="text"
                      className="w-full mt-1 px-3 py-2 border rounded-md"
                      placeholder="Apt 4B"
                      value={billingInfo.address2}
                      onChange={(e) =>
                        setBillingInfo({ ...billingInfo, address2: e.target.value })
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
                        value={billingInfo.city}
                        onChange={(e) =>
                          setBillingInfo({ ...billingInfo, city: e.target.value })
                        }
                        disabled={showPayment}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium" htmlFor="billing-state-select">State *</label>
                      <div className="mt-1">
                        <Combobox
                          id="billing-state-select"
                          options={US_STATES}
                          value={billingInfo.state}
                          onChange={(value) =>
                            setBillingInfo({ ...billingInfo, state: value })
                          }
                          placeholder="Select state..."
                          searchPlaceholder="Search states..."
                          emptyText="No state found."
                          disabled={showPayment}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">ZIP Code *</label>
                      <input
                        type="text"
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        placeholder="10001"
                        value={billingInfo.zipCode}
                        onChange={(e) =>
                          setBillingInfo({ ...billingInfo, zipCode: e.target.value })
                        }
                        disabled={showPayment}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium" htmlFor="billing-country-select">Country *</label>
                      <div className="mt-1">
                        <Combobox
                          id="billing-country-select"
                          options={COUNTRIES}
                          value={billingInfo.country}
                          onChange={(value) =>
                            setBillingInfo({ ...billingInfo, country: value })
                          }
                          placeholder="Select country..."
                          searchPlaceholder="Search countries..."
                          emptyText="No country found."
                          disabled={showPayment}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
      </main>
      <SiteFooter />
    </div>
  )
}
