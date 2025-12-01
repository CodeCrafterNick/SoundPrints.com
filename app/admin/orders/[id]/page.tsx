'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Package, Mail, MapPin, CreditCard, Calendar, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

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
  stripe_payment_intent_id?: string
  tracking_number?: string
  tracking_url?: string
  printful_order_id?: string
  created_at: string
  updated_at: string
}

export default function AdminOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided')
      setLoading(false)
      return
    }

    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    setLoading(true)
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

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return
    
    setUpdating(true)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast.success('Order status updated')
        fetchOrder()
      } else {
        toast.error('Failed to update order')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button asChild>
            <Link href="/admin/orders">Back to Orders</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/orders">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Order Details</h1>
              <p className="text-muted-foreground font-mono text-sm">ID: {order.id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              <div className="space-y-6">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="space-y-3">
                    {item.print_file_url && (
                      <div className="rounded-lg overflow-hidden border bg-white dark:bg-gray-900">
                        <img 
                          src={item.print_file_url} 
                          alt={`SoundPrint - ${item.audio_file_name}`}
                          className="w-full h-auto"
                        />
                      </div>
                    )}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{item.product_type} - {item.size}</p>
                        {item.audio_file_name && (
                          <p className="text-sm text-muted-foreground">{item.audio_file_name}</p>
                        )}
                        {item.custom_text && (
                          <p className="text-sm text-muted-foreground">Text: "{item.custom_text}"</p>
                        )}
                        <div className="flex gap-3 mt-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">Waveform:</span>
                            <div 
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: item.waveform_color }}
                            />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">Background:</span>
                            <div 
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: item.background_color }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t mt-6 pt-4 space-y-2">
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
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Update Status */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Update Status</h2>
              <div className="grid grid-cols-2 gap-3">
                {['pending', 'paid', 'processing', 'shipped', 'delivered', 'canceled'].map((status) => (
                  <Button
                    key={status}
                    variant={order.status === status ? 'default' : 'outline'}
                    onClick={() => updateOrderStatus(status)}
                    disabled={updating || order.status === status}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Customer
              </h2>
              <div className="space-y-2">
                <p className="text-sm">{order.email}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Shipping Address
              </h2>
              {order.shipping_address && (
                <div className="text-sm space-y-1">
                  <p className="font-medium">
                    {order.shipping_address.firstName} {order.shipping_address.lastName}
                  </p>
                  <p>{order.shipping_address.address}</p>
                  <p>
                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
                  </p>
                  <p>{order.shipping_address.country || 'USA'}</p>
                </div>
              )}
            </div>

            {/* Payment Info */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment
              </h2>
              <div className="text-sm space-y-2">
                {order.stripe_payment_intent_id && (
                  <div>
                    <p className="text-muted-foreground">Stripe Payment Intent</p>
                    <p className="font-mono text-xs break-all">{order.stripe_payment_intent_id}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Timeline
              </h2>
              <div className="text-sm space-y-2">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p>{new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Updated</p>
                  <p>{new Date(order.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
