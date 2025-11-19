import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/webhooks/printful
 * 
 * Handle Printful webhook events for order status updates
 * 
 * Printful webhook events:
 * - package_shipped: Order has been shipped
 * - package_returned: Package was returned
 * - order_failed: Order fulfillment failed
 * - order_canceled: Order was canceled
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log('[Printful Webhook] Event received:', body.type)

    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      )
    }

    const printfulOrderId = data.order?.id || data.id

    if (!printfulOrderId) {
      console.error('[Printful Webhook] No order ID in payload')
      return NextResponse.json(
        { error: 'Missing order ID' },
        { status: 400 }
      )
    }

    // Find our order by Printful order ID
    const { data: orders, error: findError } = await supabase
      .from('orders')
      .select('*')
      .eq('printful_order_id', printfulOrderId)
      .limit(1)

    if (findError || !orders || orders.length === 0) {
      console.error('[Printful Webhook] Order not found:', printfulOrderId)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const order = orders[0]

    // Update order based on webhook type
    let newStatus = order.status
    let trackingUrl = order.tracking_url
    let trackingNumber = order.tracking_number

    switch (type) {
      case 'package_shipped':
        newStatus = 'shipped'
        // Extract tracking info from shipment data
        if (data.shipment) {
          trackingNumber = data.shipment.tracking_number
          trackingUrl = data.shipment.tracking_url
        }
        console.log('[Printful Webhook] Order shipped:', printfulOrderId, trackingNumber)
        break

      case 'package_returned':
        newStatus = 'returned'
        console.log('[Printful Webhook] Package returned:', printfulOrderId)
        break

      case 'order_failed':
        newStatus = 'failed'
        console.log('[Printful Webhook] Order failed:', printfulOrderId)
        break

      case 'order_canceled':
        newStatus = 'canceled'
        console.log('[Printful Webhook] Order canceled:', printfulOrderId)
        break

      default:
        console.log('[Printful Webhook] Unhandled event type:', type)
        // Still return success so Printful doesn't retry
        return NextResponse.json({ received: true })
    }

    // Update order in database
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
        updated_at: new Date().toISOString(),
        webhook_data: body // Store full webhook payload for debugging
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('[Printful Webhook] Failed to update order:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    console.log('[Printful Webhook] Order updated:', order.id, newStatus)

    // TODO: Send email notification to customer about status change
    // This would integrate with SendGrid/Resend/etc

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('[Printful Webhook] Error:', error)
    return NextResponse.json(
      { 
        error: 'Webhook handler failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
