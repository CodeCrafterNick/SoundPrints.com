'use client'

import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto prose prose-neutral dark:prose-invert">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: November 30, 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using SoundPrints ("the Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our Service. We reserve the right to update 
              these terms at any time, and your continued use of the Service constitutes acceptance of any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              SoundPrints provides a platform for creating custom soundwave artwork from audio files. 
              Users can upload audio, customize the visual representation, and order physical products 
              featuring their unique designs including posters, canvas prints, apparel, and more.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
            <p className="text-muted-foreground mb-4">When using our Service, you agree to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide accurate and complete information when placing orders</li>
              <li>Only upload audio files that you own or have the right to use</li>
              <li>Not upload content that infringes on any third party's intellectual property rights</li>
              <li>Not use the Service for any unlawful purpose</li>
              <li>Not attempt to interfere with the proper functioning of the Service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
            <p className="text-muted-foreground mb-4">
              <strong>Your Content:</strong> You retain all rights to the audio files you upload. 
              By uploading audio, you grant us a limited license to process the file solely for 
              the purpose of creating your soundwave design and fulfilling your order.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong>Our Content:</strong> The SoundPrints service, including our website design, 
              logos, software, and visual styles, are protected by intellectual property laws. 
              You may not copy, modify, or distribute our content without permission.
            </p>
            <p className="text-muted-foreground">
              <strong>Copyright Responsibility:</strong> You are solely responsible for ensuring 
              you have the right to use any audio you upload. We are not liable for any copyright 
              infringement resulting from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Orders and Payment</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>All prices are listed in USD and are subject to change without notice</li>
              <li>Payment is processed securely through Stripe</li>
              <li>Orders are final once submitted and payment is processed</li>
              <li>We reserve the right to refuse or cancel any order for any reason</li>
              <li>Shipping times are estimates and not guaranteed</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Product Quality</h2>
            <p className="text-muted-foreground">
              We partner with high-quality print-on-demand providers to fulfill orders. 
              While we strive for excellence, slight variations in color and print quality 
              may occur between what you see on screen and the final printed product. 
              Such variations are normal and do not constitute a defect.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Returns and Refunds</h2>
            <p className="text-muted-foreground">
              Please refer to our{' '}
              <Link href="/refund-policy" className="text-primary hover:underline">
                Refund Policy
              </Link>{' '}
              for detailed information about returns, exchanges, and refunds.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, SoundPrints shall not be liable for any 
              indirect, incidental, special, consequential, or punitive damages resulting from 
              your use of the Service. Our total liability shall not exceed the amount you paid 
              for your order.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground">
              The Service is provided "as is" without warranties of any kind, either express or implied. 
              We do not guarantee that the Service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with the laws of the 
              United States. Any disputes arising from these Terms or your use of the Service 
              shall be resolved in the appropriate courts.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, please{' '}
              <Link href="/contact" className="text-primary hover:underline">
                contact us
              </Link>.
            </p>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
