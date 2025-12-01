'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CheckCircle, Home, Package, Loader2, Truck, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface OrderDetails {
  id: string
  status: string
  email: string
  shipping_address: any
  items: any[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  tracking_number?: string
  tracking_url?: string
  printful_order_id?: string
  printify_mockups?: string[]
  created_at: string
  updated_at: string
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const sessionId = searchParams.get('session_id')
  
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMockupIndex, setSelectedMockupIndex] = useState(0)

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided')
      setLoading(false)
      return
    }

    async function fetchOrder() {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch order')
        }

        const data = await response.json()
        setOrder(data.order)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'submitted':
        return <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-500" />
      case 'processing':
        return <Package className="h-12 w-12 text-blue-600 dark:text-blue-500" />
      case 'shipped':
        return <Truck className="h-12 w-12 text-green-600 dark:text-green-500" />
      default:
        return <Package className="h-12 w-12 text-gray-600 dark:text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Payment Pending'
      case 'paid':
        return 'Payment Confirmed'
      case 'submitted':
        return 'Order Submitted to Production'
      case 'processing':
        return 'In Production'
      case 'shipped':
        return 'Shipped'
      case 'delivered':
        return 'Delivered'
      case 'canceled':
        return 'Canceled'
      case 'failed':
        return 'Failed'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 bg-background flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg">Loading your order...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 bg-background flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || 'We could not find your order. Please check your email for confirmation.'}
            </p>
            <Button asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
        <div className="bg-card rounded-lg border p-8 md:p-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 mb-6"
          >
            {getStatusIcon(order.status)}
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {order.status === 'paid' || order.status === 'submitted' 
              ? 'Order Confirmed!' 
              : 'Order Status'}
          </h1>
          
          <p className="text-lg text-muted-foreground mb-2">
            Order #{order.id}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {getStatusText(order.status)}
          </p>

          {order.tracking_number && (
            <div className="bg-muted/50 rounded-lg p-4 mb-6">
              <p className="font-medium mb-2">Tracking Information</p>
              <p className="text-sm mb-2">Tracking #: {order.tracking_number}</p>
              {order.tracking_url && (
                <Button asChild variant="outline" size="sm">
                  <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                    Track Package
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* Printify Mockup Gallery */}
          {order.printify_mockups && order.printify_mockups.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold mb-4">Preview Your Print</h3>
              <div className="space-y-4">
                {/* Main mockup image */}
                <div className="rounded-lg overflow-hidden border bg-white dark:bg-gray-900 aspect-[4/3]">
                  <img 
                    src={order.printify_mockups[selectedMockupIndex]} 
                    alt={`Preview ${selectedMockupIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Mockup thumbnails */}
                {order.printify_mockups.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {order.printify_mockups.map((mockup, index) => {
                      // Get label from URL query param
                      const url = new URL(mockup)
                      const label = url.searchParams.get('camera_label')?.replace('-', ' ') || `View ${index + 1}`
                      
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedMockupIndex(index)}
                          className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedMockupIndex === index 
                              ? 'border-primary ring-2 ring-primary/20' 
                              : 'border-transparent hover:border-gray-300'
                          }`}
                        >
                          <div className="w-20 h-20 bg-white dark:bg-gray-900">
                            <img 
                              src={mockup} 
                              alt={label}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-[10px] text-center py-1 bg-gray-50 dark:bg-gray-800 capitalize">
                            {label}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold mb-4">Your Custom SoundPrint{order.items.length > 1 ? 's' : ''}</h3>
            <div className="space-y-6 mb-4">
              {order.items.map((item: any, index: number) => {
                // Get the best available image URL (skip if we have Printify mockups)
                const imageUrl = !order.printify_mockups?.length 
                  ? (item.print_file_url || item.mockup_url || item.thumbnailUrl)
                  : null
                return (
                <div key={index} className="space-y-3">
                  {imageUrl && (
                    <div className="rounded-lg overflow-hidden border bg-white dark:bg-gray-900">
                      <img 
                        src={imageUrl} 
                        alt={`SoundPrint - ${item.audio_file_name || item.product_type}`}
                        className="w-full h-auto"
                      />
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product_type} - {item.size}</p>
                      {item.audio_file_name && (
                        <p className="text-xs text-muted-foreground">{item.audio_file_name}</p>
                      )}
                      {item.custom_text && (
                        <p className="text-xs text-muted-foreground mt-1">Text: "{item.custom_text}"</p>
                      )}
                    </div>
                    <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              )})}
            </div>
            
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3 text-left">
              <Package className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">What happens next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• We'll process your order and prepare your custom SoundPrint</li>
                  <li>• You'll receive updates via email at {order.email}</li>
                  <li>• Your high-quality print will be shipped within 3-5 business days</li>
                  <li>• Delivery typically takes 5-7 business days</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" size="lg">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Link href="/create">
              <Button size="lg">
                Create Another SoundPrint
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
    <SiteFooter />
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 bg-background flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg">Loading your order...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  )
}
