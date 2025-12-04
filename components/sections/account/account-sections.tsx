'use client'

import { useState } from 'react'
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  CreditCard,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  Package,
  Eye,
  Edit2,
  Camera,
  Shield,
  Mail,
  Phone,
  Calendar,
  Gift,
  Star,
  Award,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

// Account Sidebar Navigation
export function AccountSidebar({ activeTab, onTabChange }: {
  activeTab: string
  onTabChange: (tab: string) => void
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: User },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Account Settings', icon: Settings }
  ]

  return (
    <div className="bg-white rounded-2xl p-4">
      {/* User Info */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-100 mb-4">
        <div className="relative">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-rose-500" />
          </div>
          <button className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow-lg border border-gray-100">
            <Camera className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <div>
          <h3 className="font-bold text-gray-900">John Doe</h3>
          <p className="text-sm text-gray-500">john@example.com</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === item.id
                ? 'bg-rose-50 text-rose-600'
                : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-4">
        <LogOut className="h-5 w-5" />
        <span className="font-medium">Sign Out</span>
      </button>
    </div>
  )
}

// Account Dashboard Overview
export function AccountDashboard() {
  const stats = [
    { label: 'Total Orders', value: '12', icon: ShoppingBag, color: 'rose' },
    { label: 'Wishlist Items', value: '5', icon: Heart, color: 'pink' },
    { label: 'Rewards Points', value: '1,250', icon: Award, color: 'amber' },
    { label: 'Saved Addresses', value: '2', icon: MapPin, color: 'blue' }
  ]

  const recentOrders = [
    { id: '#SWP-2024-1234', date: 'Jan 15, 2024', status: 'Delivered', total: '$79.99' },
    { id: '#SWP-2024-1189', date: 'Jan 8, 2024', status: 'Processing', total: '$129.99' },
    { id: '#SWP-2024-1045', date: 'Dec 28, 2023', status: 'Delivered', total: '$199.99' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'text-green-600 bg-green-50'
      case 'Processing': return 'text-amber-600 bg-amber-50'
      case 'Shipped': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, John!</h2>
        <p className="text-rose-100">You have 1,250 reward points ready to use.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-${stat.color}-100`}>
              <stat.icon className={`h-6 w-6 text-${stat.color}-500`} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
          <a href="/my-orders" className="text-rose-500 hover:text-rose-600 text-sm font-medium flex items-center gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </a>
        </div>

        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{order.id}</p>
                  <p className="text-sm text-gray-500">{order.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{order.total}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <a href="/create" className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow group">
          <Gift className="h-8 w-8 text-rose-500 mb-4" />
          <h4 className="font-bold text-gray-900 mb-1">Create New Print</h4>
          <p className="text-sm text-gray-500">Turn your favorite sound into art</p>
          <ChevronRight className="h-5 w-5 text-rose-500 mt-4 group-hover:translate-x-1 transition-transform" />
        </a>
        <a href="/gallery" className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow group">
          <Star className="h-8 w-8 text-amber-500 mb-4" />
          <h4 className="font-bold text-gray-900 mb-1">Browse Gallery</h4>
          <p className="text-sm text-gray-500">Get inspired by customer creations</p>
          <ChevronRight className="h-5 w-5 text-rose-500 mt-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  )
}

// Profile Settings
export function ProfileSettings() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Profile Information</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 text-rose-500 hover:text-rose-600 font-medium"
        >
          <Edit2 className="h-4 w-4" />
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        <div className="relative mx-auto sm:mx-0">
          <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center">
            <User className="h-12 w-12 text-rose-500" />
          </div>
          {isEditing && (
            <button className="absolute bottom-0 right-0 p-2 bg-rose-500 text-white rounded-full shadow-lg">
              <Camera className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                defaultValue="John"
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                defaultValue="Doe"
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                defaultValue="john@example.com"
                disabled={!isEditing}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                defaultValue="+1 (555) 123-4567"
                disabled={!isEditing}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Birthday (for special offers)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                defaultValue="1990-01-15"
                disabled={!isEditing}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex gap-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors">
            Save Changes
          </button>
        </div>
      )}
    </div>
  )
}

// Security Settings
export function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Shield className="h-5 w-5 text-rose-500" />
          Password
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
        </div>

        <button className="mt-6 px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors">
          Update Password
        </button>
      </div>

      {/* Two-Factor Auth */}
      <div className="bg-white rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            Enable
          </button>
        </div>
      </div>

      {/* Login History */}
      <div className="bg-white rounded-2xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Login Activity</h3>
        <div className="space-y-4">
          {[
            { device: 'Chrome on MacOS', location: 'New York, US', time: 'Just now', current: true },
            { device: 'Safari on iPhone', location: 'New York, US', time: '2 days ago', current: false },
            { device: 'Chrome on Windows', location: 'Boston, US', time: '1 week ago', current: false }
          ].map((session, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  {session.device}
                  {session.current && (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Current</span>
                  )}
                </p>
                <p className="text-sm text-gray-500">{session.location} • {session.time}</p>
              </div>
              {!session.current && (
                <button className="text-red-500 hover:text-red-600 text-sm font-medium">
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Order History List
export function OrderHistoryList() {
  const orders = [
    {
      id: '#SWP-2024-1234',
      date: 'January 15, 2024',
      status: 'Delivered',
      items: 2,
      total: '$209.98',
      tracking: 'USPS1234567890'
    },
    {
      id: '#SWP-2024-1189',
      date: 'January 8, 2024',
      status: 'Shipped',
      items: 1,
      total: '$79.99',
      tracking: 'USPS9876543210'
    },
    {
      id: '#SWP-2024-1045',
      date: 'December 28, 2023',
      status: 'Processing',
      items: 3,
      total: '$299.97',
      tracking: null
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'Shipped': return <Truck className="h-5 w-5 text-blue-500" />
      case 'Processing': return <Clock className="h-5 w-5 text-amber-500" />
      case 'Cancelled': return <XCircle className="h-5 w-5 text-red-500" />
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Order History</h3>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border border-gray-100 rounded-xl p-6 hover:border-rose-200 transition-colors">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <p className="font-bold text-gray-900">{order.id}</p>
                <p className="text-sm text-gray-500">{order.date}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(order.status)}
                <span className="font-medium text-gray-900">{order.status}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>{order.items} item{order.items > 1 ? 's' : ''}</span>
                <span className="font-semibold text-gray-900">{order.total}</span>
              </div>
              <div className="flex gap-3">
                {order.tracking && (
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                    Track Order
                  </button>
                )}
                <button className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium hover:bg-rose-100 transition-colors flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Complete Account Page
export function AccountPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <AccountSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'dashboard' && <AccountDashboard />}
            {activeTab === 'orders' && <OrderHistoryList />}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <ProfileSettings />
                <SecuritySettings />
              </div>
            )}
            {/* Other tabs would render their respective components */}
          </div>
        </div>
      </div>
    </div>
  )
}
