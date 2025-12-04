'use client'

import { useState } from 'react'
import {
  Heart,
  ShoppingCart,
  Trash2,
  Share2,
  X,
  Grid,
  List,
  ChevronRight,
  Plus,
  Filter,
  ShoppingBag,
  ArrowRight,
  Gift,
  Bell,
  Check
} from 'lucide-react'

const sampleWishlistItems = [
  {
    id: '1',
    name: 'Canvas Print - Large',
    variant: '24" x 12"',
    price: 79.99,
    originalPrice: 99.99,
    inStock: true,
    dateAdded: '2024-01-10'
  },
  {
    id: '2',
    name: 'Metal Print',
    variant: '16" x 8"',
    price: 129.99,
    originalPrice: null,
    inStock: true,
    dateAdded: '2024-01-08'
  },
  {
    id: '3',
    name: 'Framed Print - Gallery',
    variant: '20" x 10"',
    price: 149.99,
    originalPrice: null,
    inStock: false,
    dateAdded: '2024-01-05'
  }
]

// Wishlist Grid View
export function WishlistGrid() {
  const [items, setItems] = useState(sampleWishlistItems)

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item.id} className="bg-white rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow">
          {/* Image */}
          <div className="relative aspect-[4/3] bg-gray-100">
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-gray-300" />
            </div>

            {/* Badges */}
            {item.originalPrice && (
              <span className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Sale
              </span>
            )}

            {!item.inStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium">Out of Stock</span>
              </div>
            )}

            {/* Actions */}
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors">
                <Share2 className="h-4 w-4 text-gray-600" />
              </button>
              <button
                onClick={() => removeItem(item.id)}
                className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
            <p className="text-sm text-gray-500 mb-2">{item.variant}</p>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</span>
              {item.originalPrice && (
                <span className="text-sm text-gray-400 line-through">${item.originalPrice.toFixed(2)}</span>
              )}
            </div>

            <button
              disabled={!item.inStock}
              className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${item.inStock
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
              <ShoppingCart className="h-5 w-5" />
              {item.inStock ? 'Add to Cart' : 'Notify Me'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// Wishlist List View
export function WishlistList() {
  const [items, setItems] = useState(sampleWishlistItems)

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left py-4 px-6 font-medium text-gray-500">Product</th>
            <th className="text-left py-4 px-6 font-medium text-gray-500 hidden sm:table-cell">Price</th>
            <th className="text-left py-4 px-6 font-medium text-gray-500 hidden md:table-cell">Status</th>
            <th className="text-left py-4 px-6 font-medium text-gray-500 hidden md:table-cell">Added</th>
            <th className="text-right py-4 px-6 font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="py-4 px-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="h-6 w-6 text-gray-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.variant}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6 hidden sm:table-cell">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">${item.price.toFixed(2)}</span>
                  {item.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">${item.originalPrice.toFixed(2)}</span>
                  )}
                </div>
              </td>
              <td className="py-4 px-6 hidden md:table-cell">
                {item.inStock ? (
                  <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                    <Check className="h-4 w-4" />
                    In Stock
                  </span>
                ) : (
                  <span className="text-red-500 text-sm">Out of Stock</span>
                )}
              </td>
              <td className="py-4 px-6 text-sm text-gray-500 hidden md:table-cell">
                {new Date(item.dateAdded).toLocaleDateString()}
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center justify-end gap-2">
                  <button
                    disabled={!item.inStock}
                    className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1 ${item.inStock
                        ? 'bg-rose-500 text-white hover:bg-rose-600'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Complete Wishlist Page
export function WishlistPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [items] = useState(sampleWishlistItems)

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-500 mt-1">{items.length} items saved</p>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Share2 className="h-5 w-5 text-gray-600" />
              Share List
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyWishlist />
        ) : (
          viewMode === 'grid' ? <WishlistGrid /> : <WishlistList />
        )}

        {/* Add All to Cart */}
        {items.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button className="px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Add All to Cart
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Empty Wishlist State
export function EmptyWishlist() {
  return (
    <div className="bg-white rounded-2xl p-12 text-center">
      <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Heart className="h-12 w-12 text-rose-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Start adding products you love to your wishlist. You&apos;ll be notified when they go on sale!
      </p>
      <a
        href="/create"
        className="inline-flex items-center gap-2 px-8 py-4 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
      >
        Start Creating
        <ChevronRight className="h-5 w-5" />
      </a>
    </div>
  )
}

// Wishlist Mini (For sidebar or dropdown)
export function WishlistMini() {
  const items = sampleWishlistItems.slice(0, 3)

  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 w-80">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-900 flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-500" />
          Wishlist
        </h4>
        <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-1 rounded-full">
          {items.length}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-gray-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
              <p className="text-sm font-semibold text-rose-500">${item.price.toFixed(2)}</p>
            </div>
            <button className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
              <ShoppingCart className="h-4 w-4 text-rose-500" />
            </button>
          </div>
        ))}
      </div>

      <a
        href="/wishlist"
        className="block w-full py-2.5 text-center text-rose-500 font-medium hover:bg-rose-50 rounded-lg transition-colors"
      >
        View Full Wishlist
      </a>
    </div>
  )
}

// Add to Wishlist Button
export function AddToWishlistButton({
  isInWishlist = false,
  onToggle
}: {
  isInWishlist?: boolean
  onToggle?: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`p-3 rounded-full transition-colors ${isInWishlist
          ? 'bg-rose-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-500'
        }`}
    >
      <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
    </button>
  )
}
