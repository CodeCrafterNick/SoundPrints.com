'use client'

import { Music } from 'lucide-react'

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="aspect-square bg-gray-200 rounded-2xl" />
        <div className="flex gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-20 h-20 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-10 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="h-14 bg-gray-200 rounded-xl" />
      </div>
    </div>
  )
}

export function CartItemSkeleton() {
  return (
    <div className="flex gap-4 p-4 border-b border-gray-100 animate-pulse">
      <div className="w-24 h-24 bg-gray-200 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </div>
    </div>
  )
}

export function ReviewSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-3 bg-gray-200 rounded w-1/6" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  )
}

export function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <div className="p-6 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-5 bg-gray-200 rounded w-full" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
      </td>
    </tr>
  )
}

export function PageLoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-4">
          {/* Sound Wave Animation */}
          <div className="absolute inset-0 flex items-end justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-2 bg-rose-500 rounded-full animate-pulse"
                style={{
                  height: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.8s'
                }}
              />
            ))}
          </div>
        </div>
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  )
}

export function ButtonSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export function ProgressBar({ progress = 0 }: { progress?: number }) {
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-rose-500 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

export function UploadProgress({ progress = 0, fileName = 'file' }: { progress?: number; fileName?: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-rose-100 rounded-lg">
          <Music className="h-5 w-5 text-rose-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
          <p className="text-xs text-gray-500">
            {progress < 100 ? 'Uploading...' : 'Complete'}
          </p>
        </div>
        <span className="text-sm font-medium text-rose-500">{progress}%</span>
      </div>
      <ProgressBar progress={progress} />
    </div>
  )
}

export function InlineLoader() {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}

export function SoundWaveLoader() {
  return (
    <div className="flex items-end justify-center gap-1 h-12">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-2 bg-rose-500 rounded-full transition-all"
          style={{
            animation: 'soundwave 1s ease-in-out infinite',
            animationDelay: `${i * 0.1}s`,
            height: '20%'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes soundwave {
          0%, 100% { height: 20%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  )
}
