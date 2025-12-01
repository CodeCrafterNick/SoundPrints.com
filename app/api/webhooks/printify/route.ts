import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendShippingConfirmationEmail, sendOrderStatusEmail } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/webhooks/printify
 * 
 * Handle Printify webhook events for order status updates
 * 
 * Printify webhook events:
 * - order:created - Order was created
 * - order:updated - Order status changed
 * - order:shipped - Order has been shipped (contains tracking info)
 * - order:completed - Order delivered
 * - order:cancelled - Order was cancelled
 * - order:send-to-production - Sent to print provider
 * - order:send-to-production-failed - Failed to send to production
 * 
 * @see https://developers.printify.com/#webhooks
 */
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  
  try {
    const body = await req.json()

    console.log('[Printify Webhook] Event received:', JSON.stringify(body))

    // Handle Printify webhook validation/ping
    // Printify sends { topic: "order:shipped" } during validation
    if (body.topic && !body.resource && !body.data) {
      console.log('[Printify Webhook] Validation request for topic:', body.topic)
      return NextResponse.json({ success: true })
    }

    // Printify sends event type in 'type' or 'event' field
    const eventType = body.type || body.event || body.topic
    const resource = body.resource || body.data

    if (!eventType) {
      // Still acknowledge to prevent retries
      console.log('[Printify Webhook] No event type, acknowledging')
      return NextResponse.json({ success: true })
    }

    if (!resource) {
      // Validation request or ping - acknowledge it
      console.log('[Printify Webhook] No resource data, likely validation')
      return NextResponse.json({ success: true })
    }

    // Get Printify order ID from resource
    const printifyOrderId = resource.id || resource.order_id

    if (!printifyOrderId) {
      console.error('[Printify Webhook] No order ID in payload')
      return NextResponse.json(
        { error: 'Missing order ID' },
        { status: 400 }
      )
    }

    console.log('[Printify Webhook] Processing order:', printifyOrderId)

    // Find our order by Printify order ID
    const { data: orders, error: findError } = await supabase
      .from('orders')
      .select('*')
      .eq('printify_order_id', printifyOrderId)
      .limit(1)

    if (findError) {
      console.error('[Printify Webhook] Database error:', findError)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    if (!orders || orders.length === 0) {
      // Order might not be in our system yet, acknowledge webhook
      console.log('[Printify Webhook] Order not found in database:', printifyOrderId)
      return NextResponse.json({ received: true, message: 'Order not found' })
    }

    const order = orders[0]
    const shippingAddress = typeof order.shipping_address === 'string' 
      ? JSON.parse(order.shipping_address) 
      : order.shipping_address

    const customerName = `${shippingAddress?.firstName || ''} ${shippingAddress?.lastName || ''}`.trim() || 'Customer'

    // Process based on event type
    let updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
      webhook_data: body
    }

    switch (eventType) {
      case 'order:shipped':
      case 'order.shipped': {
        updates.status = 'shipped'
        
        // Extract tracking info
        const shipments = resource.shipments || []
        if (shipments.length > 0) {
          const shipment = shipments[0]
          updates.tracking_number = shipment.tracking_number || shipment.tracking_id
          updates.tracking_url = shipment.tracking_url
          updates.carrier = shipment.carrier
        }

        console.log('[Printify Webhook] Order shipped:', printifyOrderId, updates.tracking_number)

        // Send shipping email if we have tracking info
        if (updates.tracking_number && updates.tracking_url) {
          try {
            await sendShippingConfirmationEmail({
              orderId: order.id,
              email: order.email,
              customerName,
              trackingNumber: updates.tracking_number,
              trackingUrl: updates.tracking_url,
              carrier: updates.carrier
            })
            console.log('[Printify Webhook] Shipping email sent to:', order.email)
          } catch (emailError) {
            console.error('[Printify Webhook] Failed to send shipping email:', emailError)
          }
        }
        break
      }

      case 'order:completed':
      case 'order.completed': {
        updates.status = 'delivered'
        console.log('[Printify Webhook] Order delivered:', printifyOrderId)
        break
      }

      case 'order:cancelled':
      case 'order.cancelled': {
        updates.status = 'canceled'
        console.log('[Printify Webhook] Order canceled:', printifyOrderId)

        // Send cancellation email
        try {
          await sendOrderStatusEmail({
            orderId: order.id,
            email: order.email,
            customerName,
            status: 'canceled',
            reason: resource.cancel_reason || undefined
          })
        } catch (emailError) {
          console.error('[Printify Webhook] Failed to send cancellation email:', emailError)
        }
        break
      }

      case 'order:send-to-production':
      case 'order.send-to-production': {
        updates.status = 'processing'
        console.log('[Printify Webhook] Order in production:', printifyOrderId)
        break
      }

      case 'order:send-to-production-failed':
      case 'order.send-to-production-failed': {
        updates.status = 'failed'
        console.log('[Printify Webhook] Production failed:', printifyOrderId)

        // Send failure email
        try {
          await sendOrderStatusEmail({
            orderId: order.id,
            email: order.email,
            customerName,
            status: 'failed',
            reason: resource.error_message || 'Production failed'
          })
        } catch (emailError) {
          console.error('[Printify Webhook] Failed to send failure email:', emailError)
        }
        break
      }

      case 'order:updated':
      case 'order.updated': {
        // Map Printify status to our status
        const printifyStatus = resource.status
        if (printifyStatus) {
          const statusMap: Record<string, string> = {
            'pending': 'pending',
            'on-hold': 'pending',
            'in-production': 'processing',
            'shipped': 'shipped',
            'fulfilled': 'delivered',
            'cancelled': 'canceled',
            'canceled': 'canceled'
          }
          updates.status = statusMap[printifyStatus] || order.status
        }
        console.log('[Printify Webhook] Order updated:', printifyOrderId, updates.status)
        break
      }

      default:
        console.log('[Printify Webhook] Unhandled event type:', eventType)
        // Still return success so Printify doesn't retry
        return NextResponse.json({ received: true })
    }

    // Update order in database
    const { error: updateError } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', order.id)

    if (updateError) {
      console.error('[Printify Webhook] Failed to update order:', updateError)
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      )
    }

    console.log('[Printify Webhook] Order updated successfully:', order.id, updates.status)

    return NextResponse.json({ received: true, status: updates.status })

  } catch (error) {
    console.error('[Printify Webhook] Error:', error)
    return NextResponse.json(
      { 
        error: 'Webhook handler failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/webhooks/printify
 * 
 * Verification endpoint for Printify webhook setup
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Printify webhook endpoint is active'
  })
}
