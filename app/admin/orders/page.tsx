'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Loader2, Package, Eye, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'

interface Order {
  id: string
  status: string
  email: string
  shipping_address: any
  subtotal: number
  tax: number
  shipping: number
  total: number
  stripe_payment_intent_id?: string
  created_at: string
  updated_at: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchEmail, setSearchEmail] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let url = '/api/orders?limit=100'
      if (searchEmail) {
        url += `&email=${encodeURIComponent(searchEmail)}`
      }
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        toast.error('Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

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

  const filteredOrders = orders.filter(order => {
    if (filterStatus !== 'all' && order.status !== filterStatus) {
      return false
    }
    return true
  })

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    paid: orders.filter(o => o.status === 'paid').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Order Management</h1>
              <p className="text-muted-foreground">Monitor and manage all customer orders</p>
            </div>
            <Button onClick={fetchOrders} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <button
              onClick={() => setFilterStatus('all')}
              className={`p-4 rounded-lg border text-left transition-colors ${
                filterStatus === 'all' 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-card hover:bg-muted'
              }`}
            >
              <div className="text-2xl font-bold">{statusCounts.all}</div>
              <div className="text-sm opacity-80">Total Orders</div>
            </button>
            <button
              onClick={() => setFilterStatus('paid')}
              className={`p-4 rounded-lg border text-left transition-colors ${
                filterStatus === 'paid' 
                  ? 'bg-green-600 text-white border-green-600' 
                  : 'bg-card hover:bg-muted'
              }`}
            >
              <div className="text-2xl font-bold">{statusCounts.paid}</div>
              <div className="text-sm opacity-80">Paid</div>
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`p-4 rounded-lg border text-left transition-colors ${
                filterStatus === 'pending' 
                  ? 'bg-yellow-600 text-white border-yellow-600' 
                  : 'bg-card hover:bg-muted'
              }`}
            >
              <div className="text-2xl font-bold">{statusCounts.pending}</div>
              <div className="text-sm opacity-80">Pending</div>
            </button>
            <button
              onClick={() => setFilterStatus('processing')}
              className={`p-4 rounded-lg border text-left transition-colors ${
                filterStatus === 'processing' 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-card hover:bg-muted'
              }`}
            >
              <div className="text-2xl font-bold">{statusCounts.processing}</div>
              <div className="text-sm opacity-80">Processing</div>
            </button>
            <button
              onClick={() => setFilterStatus('shipped')}
              className={`p-4 rounded-lg border text-left transition-colors ${
                filterStatus === 'shipped' 
                  ? 'bg-purple-600 text-white border-purple-600' 
                  : 'bg-card hover:bg-muted'
              }`}
            >
              <div className="text-2xl font-bold">{statusCounts.shipped}</div>
              <div className="text-sm opacity-80">Shipped</div>
            </button>
          </div>

          {/* Search */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg bg-background"
              />
            </div>
            <Button onClick={fetchOrders}>
              Search
            </Button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-card rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4 font-semibold">Order ID</th>
                  <th className="text-left p-4 font-semibold">Customer</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-left p-4 font-semibold">Total</th>
                  <th className="text-left p-4 font-semibold">Date</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-t hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="font-mono text-sm text-muted-foreground">
                          {order.id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">{order.email}</div>
                        {order.shipping_address && (
                          <div className="text-xs text-muted-foreground">
                            {order.shipping_address.city}, {order.shipping_address.state}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 font-semibold">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
