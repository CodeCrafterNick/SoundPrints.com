'use client'

import { Home, FileQuestion, AlertTriangle, RefreshCcw, Search, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

// 404 Not Found
export function Error404() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Illustration */}
        <div className="mb-8 relative">
          <div className="w-48 h-48 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            {/* Broken waveform */}
            <svg viewBox="0 0 100 50" className="w-32 h-16">
              <defs>
                <linearGradient id="404-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d1d5db" />
                  <stop offset="45%" stopColor="#d1d5db" />
                  <stop offset="45%" stopColor="transparent" />
                  <stop offset="55%" stopColor="transparent" />
                  <stop offset="55%" stopColor="#d1d5db" />
                  <stop offset="100%" stopColor="#d1d5db" />
                </linearGradient>
              </defs>
              {Array.from({ length: 50 }).map((_, i) => {
                const height = 5 + Math.sin(i * 0.3) * 15
                return (
                  <rect
                    key={i}
                    x={i * 2}
                    y={25 - height / 2}
                    width="1.5"
                    height={height}
                    rx="0.75"
                    fill="url(#404-grad)"
                  />
                )
              })}
            </svg>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
            <FileQuestion className="h-8 w-8 text-rose-500" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          Oops! The sound you&apos;re looking for seems to have faded away. 
          Let&apos;s get you back on track.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button className="bg-rose-500 hover:bg-rose-600">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <Button variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Search Site
          </Button>
        </div>
      </div>
    </div>
  )
}

// 500 Server Error
export function Error500() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Illustration */}
        <div className="mb-8 relative">
          <div className="w-48 h-48 mx-auto bg-red-50 rounded-full flex items-center justify-center">
            {/* Static waveform */}
            <svg viewBox="0 0 100 50" className="w-32 h-16 opacity-50">
              {Array.from({ length: 50 }).map((_, i) => {
                const height = Math.random() * 25 + 5
                return (
                  <rect
                    key={i}
                    x={i * 2}
                    y={25 - height / 2}
                    width="1.5"
                    height={height}
                    rx="0.75"
                    fill="#fca5a5"
                  />
                )
              })}
            </svg>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Something Went Wrong</h1>
        <p className="text-gray-600 mb-8">
          Our sound waves hit a snag. We&apos;re working on getting things 
          back in harmony. Please try again.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button className="bg-rose-500 hover:bg-rose-600" onClick={() => window.location.reload()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}

// Empty State
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
        {icon || (
          <svg viewBox="0 0 60 30" className="w-12 h-6 opacity-30">
            {Array.from({ length: 30 }).map((_, i) => {
              const height = 3 + (i % 2) * 6
              return (
                <rect
                  key={i}
                  x={i * 2}
                  y={15 - height / 2}
                  width="1.5"
                  height={height}
                  rx="0.75"
                  fill="#9ca3af"
                />
              )
            })}
          </svg>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      
      {action && (
        <Button className="bg-rose-500 hover:bg-rose-600" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Empty Cart
export function EmptyCart() {
  return (
    <EmptyState
      title="Your cart is empty"
      description="Looks like you haven't added any sound prints to your cart yet."
      action={{
        label: 'Start Creating',
        onClick: () => window.location.href = '/create',
      }}
    />
  )
}

// No Search Results
export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search className="h-10 w-10 text-gray-300" />}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try different keywords.`}
    />
  )
}

// No Orders
export function NoOrders() {
  return (
    <EmptyState
      title="No orders yet"
      description="You haven't placed any orders. Create your first sound print today!"
      action={{
        label: 'Create SoundPrint',
        onClick: () => window.location.href = '/create',
      }}
    />
  )
}
