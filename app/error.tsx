'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AlertTriangle, Home, RotateCcw, MessageCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          {/* Error icon */}
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>

          <h1 className="text-3xl font-bold mb-3">Something Went Wrong</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            We're sorry, but something unexpected happened. Don't worry, your work isn't lost. 
            Try refreshing the page or going back home.
          </p>

          {/* Error details (only in development) */}
          {process.env.NODE_ENV === 'development' && error?.message && (
            <div className="bg-muted/50 rounded-lg p-4 mb-8 text-left">
              <p className="text-xs font-mono text-muted-foreground break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs font-mono text-muted-foreground mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Button onClick={reset} size="lg">
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>

          {/* Contact support */}
          <div className="border-t pt-8">
            <p className="text-sm text-muted-foreground mb-4">
              If this problem persists, please contact us
            </p>
            <Button asChild variant="ghost" size="sm">
              <Link href="/contact">
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
