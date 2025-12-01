'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Package, 
  ShoppingCart, 
  Image, 
  Settings, 
  TrendingUp, 
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
  LayoutDashboard,
  Palette,
  Database,
  Waves
} from 'lucide-react'
import { toast } from 'sonner'

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  paidOrders: number
  shippedOrders: number
  totalRevenue: number
  recentOrders: Array<{
    id: string
    email: string
    total: number
    status: string
    created_at: string
  }>
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/orders?limit=100')
      if (response.ok) {
        const data = await response.json()
        const orders = data.orders || []
        
        const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
        const pendingOrders = orders.filter((o: any) => o.status === 'pending').length
        const paidOrders = orders.filter((o: any) => o.status === 'paid').length
        const shippedOrders = orders.filter((o: any) => o.status === 'shipped' || o.status === 'delivered').length
        
        setStats({
          totalOrders: orders.length,
          pendingOrders,
          paidOrders,
          shippedOrders,
          totalRevenue,
          recentOrders: orders.slice(0, 5)
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const quickLinks = [
    {
      title: 'Orders',
      description: 'View and manage all customer orders',
      href: '/admin/orders',
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600',
      badge: stats?.totalOrders || 0
    },
    {
      title: 'Printify Products',
      description: 'Manage product catalog and sync',
      href: '/admin/printify-products',
      icon: Package,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Generate Sample',
      description: 'Create sample artwork for testing',
      href: '/admin/generate-sample',
      icon: Image,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Create New Design',
      description: 'Open the design customizer',
      href: '/create',
      icon: Palette,
      color: 'from-pink-500 to-pink-600'
    }
  ]

  const externalLinks = [
    {
      title: 'Stripe Dashboard',
      description: 'Payments, subscriptions & analytics',
      href: 'https://dashboard.stripe.com',
      icon: DollarSign,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Printify Dashboard',
      description: 'Product fulfillment & shipping',
      href: 'https://printify.com/app/dashboard',
      icon: Truck,
      color: 'from-teal-500 to-teal-600'
    },
    {
      title: 'Supabase Dashboard',
      description: 'Database, storage & auth',
      href: 'https://supabase.com/dashboard',
      icon: Database,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Clerk Dashboard',
      description: 'User authentication & management',
      href: 'https://dashboard.clerk.com',
      icon: Users,
      color: 'from-violet-500 to-violet-600'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'shipped': return <Truck className="h-4 w-4 text-blue-500" />
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">SoundPrints Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={fetchStats} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <Waves className="h-4 w-4 mr-2" />
                  View Site
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.totalOrders || 0}
            </p>
            <p className="text-sm text-gray-500">Orders</p>
          </div>

          <div className="bg-white rounded-xl border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <span className="text-xs font-medium text-yellow-600">Pending</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.pendingOrders || 0}
            </p>
            <p className="text-sm text-gray-500">Awaiting Payment</p>
          </div>

          <div className="bg-white rounded-xl border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs font-medium text-green-600">Paid</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.paidOrders || 0}
            </p>
            <p className="text-sm text-gray-500">Ready to Fulfill</p>
          </div>

          <div className="bg-white rounded-xl border p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-emerald-600">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `$${(stats?.totalRevenue || 0).toFixed(2)}`}
            </p>
            <p className="text-sm text-gray-500">Total Sales</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {quickLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-all hover:border-gray-300 group">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                          <link.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{link.title}</h3>
                            {link.badge !== undefined && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                {link.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{link.description}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">External Services</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {externalLinks.map((link) => (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                    <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-all hover:border-gray-300 group">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                          <link.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{link.title}</h3>
                            <ExternalLink className="h-3 w-3 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{link.description}</p>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                  <p className="text-sm text-gray-500 mt-2">Loading orders...</p>
                </div>
              ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
                <div className="divide-y">
                  {stats.recentOrders.map((order) => (
                    <Link key={order.id} href={`/admin/orders/${order.id}`}>
                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm text-gray-900">
                            #{order.id.slice(0, 8)}
                          </span>
                          <span className="font-semibold text-gray-900">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 truncate max-w-[150px]">
                            {order.email}
                          </span>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            <span className="text-xs text-gray-500 capitalize">{order.status}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <ShoppingCart className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No orders yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="mt-8 bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Environment</p>
              <p className="font-medium text-gray-900">{process.env.NODE_ENV || 'development'}</p>
            </div>
            <div>
              <p className="text-gray-500">Framework</p>
              <p className="font-medium text-gray-900">Next.js 15</p>
            </div>
            <div>
              <p className="text-gray-500">Database</p>
              <p className="font-medium text-gray-900">Supabase (PostgreSQL)</p>
            </div>
            <div>
              <p className="text-gray-500">Fulfillment</p>
              <p className="font-medium text-gray-900">Printify</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
