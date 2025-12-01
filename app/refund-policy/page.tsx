'use client'

import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
          <h1 className="text-4xl font-bold mb-8">Refund & Return Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: November 30, 2025</p>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground m-0">
                <strong>Important:</strong> Because each SoundPrints product is custom-made to order 
                using your unique audio and design choices, we have specific policies for returns and refunds.
              </p>
            </div>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What We Cover</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground m-0">Damaged or Defective Products</p>
                  <p className="text-muted-foreground text-sm m-0 mt-1">
                    If your product arrives damaged or has a manufacturing defect, we'll send a replacement at no cost.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground m-0">Wrong Item Received</p>
                  <p className="text-muted-foreground text-sm m-0 mt-1">
                    If you receive the wrong product or size, we'll correct the order immediately.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground m-0">Print Quality Issues</p>
                  <p className="text-muted-foreground text-sm m-0 mt-1">
                    If the print is significantly different from the preview or has quality issues, we'll make it right.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground m-0">Lost in Transit</p>
                  <p className="text-muted-foreground text-sm m-0 mt-1">
                    If your package is confirmed lost by the carrier, we'll send a replacement.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What We Don't Cover</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground m-0">Change of Mind</p>
                  <p className="text-muted-foreground text-sm m-0 mt-1">
                    As each product is custom-made, we cannot accept returns simply because you changed your mind.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground m-0">Incorrect Information Provided</p>
                  <p className="text-muted-foreground text-sm m-0 mt-1">
                    If you provided the wrong shipping address or made an error in your design that was printed correctly.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground m-0">Minor Color Variations</p>
                  <p className="text-muted-foreground text-sm m-0 mt-1">
                    Slight differences between screen display and printed colors are normal and expected.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How to Request a Replacement or Refund</h2>
            <ol className="list-decimal list-inside text-muted-foreground space-y-3 ml-4">
              <li>
                <strong>Contact us within 14 days</strong> of receiving your order via our{' '}
                <Link href="/contact" className="text-primary hover:underline">contact page</Link>
              </li>
              <li>
                <strong>Include your order number</strong> and a description of the issue
              </li>
              <li>
                <strong>Attach photos</strong> clearly showing the problem (for damaged/defective items)
              </li>
              <li>
                <strong>We'll respond within 24-48 hours</strong> with a resolution
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Refund Timeline</h2>
            <p className="text-muted-foreground mb-4">
              Once approved, refunds are processed within 5-7 business days. 
              The refund will be credited to your original payment method. 
              Depending on your bank, it may take an additional 5-10 business days to appear in your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cancellations</h2>
            <p className="text-muted-foreground mb-4">
              You may cancel your order within <strong>2 hours</strong> of placing it, 
              provided production has not yet begun. After this window, cancellations 
              may not be possible as your custom product enters production quickly.
            </p>
            <p className="text-muted-foreground">
              To request a cancellation, contact us immediately at{' '}
              <Link href="/contact" className="text-primary hover:underline">our contact page</Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Questions?</h2>
            <p className="text-muted-foreground">
              If you have any questions about our refund policy,{' '}
              <Link href="/contact" className="text-primary hover:underline">
                get in touch with us
              </Link>{' '}
              and we'll be happy to help.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
