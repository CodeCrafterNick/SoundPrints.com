'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Home, Package } from 'lucide-react'
import { motion } from 'framer-motion'

export default function OrderConfirmationPage() {
  useEffect(() => {
    // Confetti effect could be added here
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-500" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Order Confirmed!
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Thank you for your order! We've sent a confirmation email with your order details.
          </p>

          <div className="bg-muted/50 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3 text-left">
              <Package className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">What happens next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• We'll process your order and prepare your custom SoundPrint</li>
                  <li>• You'll receive updates via email as your order progresses</li>
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
    </div>
  )
}
