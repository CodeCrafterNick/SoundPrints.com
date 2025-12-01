import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmail, sendShippingConfirmationEmail } from '@/lib/email'

export const runtime = 'nodejs'

/**
 * GET /api/test-email?type=confirmation&email=your@email.com
 * 
 * Test email sending (only works in development)
 */
export async function GET(req: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'confirmation'
  const email = searchParams.get('email')

  if (!email) {
    return NextResponse.json({ 
      error: 'Missing email parameter',
      usage: '/api/test-email?type=confirmation&email=your@email.com',
      types: ['confirmation', 'shipping']
    }, { status: 400 })
  }

  try {
    if (type === 'confirmation') {
      const result = await sendOrderConfirmationEmail({
        orderId: 'test-order-12345678',
        email,
        customerName: 'Test Customer',
        items: [
          {
            productType: 'poster-matte',
            size: '18x24',
            audioFileName: 'my-favorite-song.mp3',
            price: 29.99,
            quantity: 1
          },
          {
            productType: 'canvas',
            size: '16x20',
            audioFileName: 'wedding-first-dance.mp3',
            price: 49.99,
            quantity: 1
          }
        ],
        subtotal: 79.98,
        tax: 6.40,
        shipping: 0,
        total: 86.38,
        shippingAddress: {
          firstName: 'Test',
          lastName: 'Customer',
          address: '123 Test Street',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'US'
        }
      })

      return NextResponse.json({
        success: result.success,
        message: result.success ? 'Order confirmation email sent!' : 'Failed to send email',
        emailId: result.id,
        error: result.error
      })
    }

    if (type === 'shipping') {
      const result = await sendShippingConfirmationEmail({
        orderId: 'test-order-12345678',
        email,
        customerName: 'Test Customer',
        trackingNumber: '1Z999AA10123456784',
        trackingUrl: 'https://www.ups.com/track?tracknum=1Z999AA10123456784',
        carrier: 'UPS'
      })

      return NextResponse.json({
        success: result.success,
        message: result.success ? 'Shipping confirmation email sent!' : 'Failed to send email',
        emailId: result.id,
        error: result.error
      })
    }

    return NextResponse.json({ 
      error: 'Invalid type',
      types: ['confirmation', 'shipping']
    }, { status: 400 })

  } catch (error) {
    console.error('[Test Email] Error:', error)
    return NextResponse.json({
      error: 'Failed to send email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
