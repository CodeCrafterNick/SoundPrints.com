'use client'

import { useState } from 'react'
import {
  Bell,
  Mail,
  Phone,
  MessageSquare,
  Package,
  Tag,
  Gift,
  Star,
  Settings,
  Check,
  X,
  Smartphone
} from 'lucide-react'

// Notification Preferences Panel
export function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    orderUpdates: { email: true, sms: true, push: true },
    promotions: { email: true, sms: false, push: false },
    productNews: { email: true, sms: false, push: false },
    reviews: { email: false, sms: false, push: true },
    wishlist: { email: true, sms: false, push: true }
  })

  const categories = [
    {
      id: 'orderUpdates',
      label: 'Order Updates',
      description: 'Shipping updates, delivery notifications',
      icon: Package
    },
    {
      id: 'promotions',
      label: 'Promotions & Sales',
      description: 'Exclusive deals and discounts',
      icon: Tag
    },
    {
      id: 'productNews',
      label: 'Product News',
      description: 'New product launches and features',
      icon: Gift
    },
    {
      id: 'reviews',
      label: 'Review Reminders',
      description: 'Reminders to leave reviews',
      icon: Star
    },
    {
      id: 'wishlist',
      label: 'Wishlist Alerts',
      description: 'Price drops and back in stock alerts',
      icon: Bell
    }
  ]

  const togglePreference = (category: keyof typeof preferences, channel: 'email' | 'sms' | 'push') => {
    setPreferences({
      ...preferences,
      [category]: {
        ...preferences[category],
        [channel]: !preferences[category][channel]
      }
    })
  }

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-rose-100 rounded-xl">
          <Bell className="h-6 w-6 text-rose-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Notification Preferences</h3>
          <p className="text-sm text-gray-500">Choose how you want to be notified</p>
        </div>
      </div>

      {/* Channel Headers */}
      <div className="hidden sm:grid sm:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-100">
        <div />
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500">
          <Mail className="h-4 w-4" />
          Email
        </div>
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500">
          <Phone className="h-4 w-4" />
          SMS
        </div>
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500">
          <Smartphone className="h-4 w-4" />
          Push
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="sm:grid sm:grid-cols-4 gap-4 items-center py-4 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3 mb-4 sm:mb-0">
              <category.icon className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">{category.label}</p>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
            </div>

            <div className="flex sm:justify-center">
              <label className="flex items-center gap-2 sm:gap-0 cursor-pointer">
                <span className="sm:hidden text-sm text-gray-500">Email</span>
                <button
                  onClick={() => togglePreference(category.id as keyof typeof preferences, 'email')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${preferences[category.id as keyof typeof preferences].email
                      ? 'bg-rose-500'
                      : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${preferences[category.id as keyof typeof preferences].email
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                      }`}
                  />
                </button>
              </label>
            </div>

            <div className="flex sm:justify-center">
              <label className="flex items-center gap-2 sm:gap-0 cursor-pointer">
                <span className="sm:hidden text-sm text-gray-500">SMS</span>
                <button
                  onClick={() => togglePreference(category.id as keyof typeof preferences, 'sms')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${preferences[category.id as keyof typeof preferences].sms
                      ? 'bg-rose-500'
                      : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${preferences[category.id as keyof typeof preferences].sms
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                      }`}
                  />
                </button>
              </label>
            </div>

            <div className="flex sm:justify-center">
              <label className="flex items-center gap-2 sm:gap-0 cursor-pointer">
                <span className="sm:hidden text-sm text-gray-500">Push</span>
                <button
                  onClick={() => togglePreference(category.id as keyof typeof preferences, 'push')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${preferences[category.id as keyof typeof preferences].push
                      ? 'bg-rose-500'
                      : 'bg-gray-200'
                    }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${preferences[category.id as keyof typeof preferences].push
                        ? 'translate-x-6'
                        : 'translate-x-0.5'
                      }`}
                  />
                </button>
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <button className="w-full py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors">
          Save Preferences
        </button>
      </div>
    </div>
  )
}

// Simple Toggle Switch
export function NotificationToggle({
  label,
  description,
  enabled,
  onChange
}: {
  label: string
  description?: string
  enabled: boolean
  onChange: (enabled: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-rose-500' : 'bg-gray-200'
          }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0.5'
            }`}
        />
      </button>
    </div>
  )
}

// Unsubscribe Preferences
export function UnsubscribePreferences() {
  const [unsubscribeOptions, setUnsubscribeOptions] = useState({
    all: false,
    marketing: false,
    productUpdates: false
  })

  const handleUnsubscribe = (option: keyof typeof unsubscribeOptions) => {
    if (option === 'all') {
      setUnsubscribeOptions({
        all: !unsubscribeOptions.all,
        marketing: !unsubscribeOptions.all,
        productUpdates: !unsubscribeOptions.all
      })
    } else {
      setUnsubscribeOptions({
        ...unsubscribeOptions,
        [option]: !unsubscribeOptions[option]
      })
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Email Preferences</h3>
        <p className="text-gray-500 text-sm">
          We&apos;re sorry to see you go! Choose which emails you&apos;d like to unsubscribe from.
        </p>
      </div>

      <div className="space-y-4 mb-6">
        <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
          <input
            type="checkbox"
            checked={unsubscribeOptions.all}
            onChange={() => handleUnsubscribe('all')}
            className="w-5 h-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
          />
          <div>
            <p className="font-medium text-gray-900">Unsubscribe from all</p>
            <p className="text-sm text-gray-500">You&apos;ll still receive order updates</p>
          </div>
        </label>

        <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
          <input
            type="checkbox"
            checked={unsubscribeOptions.marketing}
            onChange={() => handleUnsubscribe('marketing')}
            className="w-5 h-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
          />
          <div>
            <p className="font-medium text-gray-900">Marketing emails</p>
            <p className="text-sm text-gray-500">Sales, promotions, and offers</p>
          </div>
        </label>

        <label className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
          <input
            type="checkbox"
            checked={unsubscribeOptions.productUpdates}
            onChange={() => handleUnsubscribe('productUpdates')}
            className="w-5 h-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
          />
          <div>
            <p className="font-medium text-gray-900">Product updates</p>
            <p className="text-sm text-gray-500">New products and features</p>
          </div>
        </label>
      </div>

      <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
        Update Preferences
      </button>
    </div>
  )
}

// Notification Bell with Badge
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = 3

  const notifications = [
    { id: 1, type: 'order', title: 'Order Shipped!', message: 'Your order #SWP-1234 is on its way', time: '2 hours ago', unread: true },
    { id: 2, type: 'promo', title: 'Flash Sale!', message: '25% off all canvas prints today', time: '5 hours ago', unread: true },
    { id: 3, type: 'review', title: 'Leave a Review', message: 'How was your recent order?', time: '1 day ago', unread: true },
    { id: 4, type: 'wishlist', title: 'Back in Stock', message: 'Metal Print 24x12 is back!', time: '2 days ago', unread: false }
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="h-6 w-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h4 className="font-bold text-gray-900">Notifications</h4>
              <button className="text-sm text-rose-500 hover:text-rose-600">Mark all read</button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${notif.unread ? 'bg-rose-50/50' : ''
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${notif.unread ? 'bg-rose-500' : 'bg-transparent'}`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{notif.title}</p>
                      <p className="text-sm text-gray-500">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-100">
              <a href="/notifications" className="block text-center text-rose-500 hover:text-rose-600 font-medium">
                View All Notifications
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
