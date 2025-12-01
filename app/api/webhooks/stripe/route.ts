import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase'
import { PrintifyClient } from '@/lib/printify-client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Map size strings to Printify variant IDs
 * These IDs are specific to each blueprint and need to be looked up from Printify
 * TODO: This should be dynamically fetched from Printify catalog
 */
function getVariantId(blueprintId: string | number, size: string): number {
  // Default variant mapping for vertical poster (blueprint 282)
  // You'll need to fetch actual variant IDs from Printify for each blueprint
  const variantMappings: Record<string, Record<string, number>> = {
    '282': { // Vertical Poster
      '12x16': 49853,
      '16x20': 49854,
      '18x24': 49855,
      '24x36': 49856,
      '12" × 16"': 49853,
      '16" × 20"': 49854,
      '18" × 24"': 49855,
      '24" × 36"': 49856,
    },
    '284': { // Horizontal Poster
      '16x12': 49861,
      '20x16': 49862,
      '24x18': 49863,
      '36x24': 49864,
      '16" × 12"': 49861,
      '20" × 16"': 49862,
      '24" × 18"': 49863,
      '36" × 24"': 49864,
    },
    // Add more blueprints as needed
  }

  const blueprintKey = String(blueprintId)
  const sizeKey = size.replace(/[″"]/g, '"').trim()
  
  return variantMappings[blueprintKey]?.[sizeKey] || 
         variantMappings[blueprintKey]?.[size] || 
         49855 // Default to 18x24 variant
}

/**
 * POST /api/webhooks/stripe
 * 
 * Handle Stripe webhook events
 * Processes payment confirmations and submits orders to Printify
 */
export async function POST(req: NextRequest) {
  const supabase = getSupabaseAdmin()
  
  try {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')

    if (!sig) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err)
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err}` },
        { status: 400 }
      )
    }

    console.log('[Stripe Webhook] Event received:', event.type)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId

        if (!orderId) {
          console.error('[Stripe Webhook] No orderId in session metadata')
          return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
        }

        // Update order status to paid
        const { data: order, error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent as string,
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)
          .select()
          .single()

        if (updateError) {
          console.error('[Stripe Webhook] Failed to update order:', updateError)
          return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
        }

        console.log('[Stripe Webhook] Order updated to paid:', orderId)

        // Get order items
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId)

        // Submit order to Printify if API key is configured
        if (process.env.PRINTIFY_API_KEY && process.env.PRINTIFY_SHOP_ID && order) {
          try {
            const printify = new PrintifyClient()

            // Parse shipping address
            const shippingAddress = typeof order.shipping_address === 'string' 
              ? JSON.parse(order.shipping_address) 
              : order.shipping_address

            // First, upload the design image(s) to Printify
            const uploadedImages: Record<string, string> = {}
            
            if (orderItems) {
              for (const item of orderItems) {
                if (item.print_file_url && !uploadedImages[item.print_file_url]) {
                  try {
                    const uploadResult = await printify.uploadImage(
                      item.print_file_url,
                      `order-${orderId}-${item.id}.png`
                    )
                    uploadedImages[item.print_file_url] = uploadResult.id
                    console.log('[Stripe Webhook] Image uploaded to Printify:', uploadResult.id)
                  } catch (uploadError) {
                    console.error('[Stripe Webhook] Image upload failed:', uploadError)
                  }
                }
              }
            }

            // Build Printify order
            const printifyOrder = {
              external_id: orderId,
              line_items: (orderItems || []).map((item: any) => ({
                blueprint_id: parseInt(item.printify_blueprint_id) || 282, // Default to vertical poster
                variant_id: getVariantId(item.printify_blueprint_id, item.size), // Map size to variant
                quantity: item.quantity || 1,
                print_areas: {
                  front: uploadedImages[item.print_file_url] || item.print_file_url
                }
              })),
              shipping_method: 1, // Standard shipping
              is_printify_express: false, // TEST MODE - change to true for production
              send_shipping_notification: true,
              address_to: {
                first_name: shippingAddress.firstName || '',
                last_name: shippingAddress.lastName || '',
                email: order.email,
                phone: shippingAddress.phone || '',
                country: shippingAddress.country || 'US',
                region: shippingAddress.state || '',
                address1: shippingAddress.address || '',
                address2: shippingAddress.address2 || '',
                city: shippingAddress.city || '',
                zip: shippingAddress.zipCode || ''
              }
            }

            // Create order in Printify
            const printifyResponse = await printify.createOrder(printifyOrder)

            // Update order with Printify details
            await supabase
              .from('orders')
              .update({
                printify_order_id: printifyResponse.id,
                printify_status: 'submitted',
                printify_submitted_at: new Date().toISOString(),
                status: 'processing',
                updated_at: new Date().toISOString()
              })
              .eq('id', orderId)

            console.log('[Stripe Webhook] Order submitted to Printify:', printifyResponse.id)
          } catch (printifyError) {
            console.error('[Stripe Webhook] Printify submission failed:', printifyError)
            
            // Store the error for manual retry
            await supabase
              .from('orders')
              .update({
                printify_error: printifyError instanceof Error ? printifyError.message : 'Unknown error',
                printify_status: 'failed',
                updated_at: new Date().toISOString()
              })
              .eq('id', orderId)
            
            // Don't fail the webhook, the order is still paid
            // Admin can retry Printify submission later
          }
        } else {
          console.log('[Stripe Webhook] Printify not configured, skipping submission')
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('[Stripe Webhook] Payment failed:', paymentIntent.id)

        // Find order by payment intent
        const { data: orders } = await supabase
          .from('orders')
          .select('id')
          .eq('stripe_payment_intent', paymentIntent.id)
          .limit(1)

        if (orders && orders.length > 0) {
          await supabase
            .from('orders')
            .update({
              status: 'payment_failed',
              updated_at: new Date().toISOString()
            })
            .eq('id', orders[0].id)
        }

        break
      }

      default:
        console.log('[Stripe Webhook] Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('[Stripe Webhook] Error:', error)
    return NextResponse.json(
      { 
        error: 'Webhook handler failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
