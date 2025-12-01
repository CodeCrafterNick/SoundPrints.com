'use client'

import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: November 30, 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              When you use SoundPrints, we collect information that you provide directly to us:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Account Information:</strong> Email address, name, and password when you create an account</li>
              <li><strong>Order Information:</strong> Shipping address, billing information, and contact details</li>
              <li><strong>Audio Files:</strong> Audio files you upload to create soundwave designs (temporarily stored for order processing)</li>
              <li><strong>Design Preferences:</strong> Your customization choices including colors, styles, and text</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Process and fulfill your orders</li>
              <li>Create your custom soundwave products</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Respond to your questions and customer service requests</li>
              <li>Improve our products and services</li>
              <li>Send marketing communications (with your consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong>Print Partners:</strong> We share order details with our print-on-demand partners to fulfill your orders</li>
              <li><strong>Payment Processors:</strong> We use Stripe to process payments securely</li>
              <li><strong>Shipping Carriers:</strong> Your shipping information is shared with carriers to deliver your order</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Audio File Handling</h2>
            <p className="text-muted-foreground mb-4">
              Your audio files are handled with care:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Audio files are temporarily stored to generate your soundwave design</li>
              <li>We retain audio selection metadata with your order for quality assurance</li>
              <li>Audio files are automatically deleted after order fulfillment</li>
              <li>We do not share, sell, or use your audio files for any purpose other than creating your product</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational security measures to protect your personal 
              information. All payment information is processed securely through Stripe and is never stored on 
              our servers. We use HTTPS encryption for all data transmission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of marketing communications at any time</li>
              <li>Request a copy of your data in a portable format</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cookies</h2>
            <p className="text-muted-foreground">
              We use essential cookies to maintain your shopping cart and session. We may also use analytics 
              cookies to understand how visitors use our site. You can control cookie preferences through 
              your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy or how we handle your information, 
              please contact us at{' '}
              <Link href="/contact" className="text-primary hover:underline">
                our contact page
              </Link>{' '}
              or email us at privacy@soundprints.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
