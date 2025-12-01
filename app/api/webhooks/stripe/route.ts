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
 * These IDs are for Printify Choice (provider 99)
 * Fetched from: /catalog/blueprints/282/print_providers/99/variants.json
 */
function getVariantId(blueprintId: string | number, size: string): number {
  // Variant mapping for Printify Choice (provider 99) - Vertical Poster (blueprint 282)
  const variantMappings: Record<string, Record<string, number>> = {
    '282': { // Vertical Poster - Printify Choice
      '11x14': 43135,
      '12x18': 43138,
      '16x20': 43141,
      '18x24': 43144,
      '20x30': 43147,
      '24x32': 43150,
      '24x36': 43153,
      // Glossy variants
      '11x14-glossy': 43136,
      '12x18-glossy': 43139,
      '16x20-glossy': 43142,
      '18x24-glossy': 43145,
      // With inch marks
      '11″ x 14″': 43135,
      '12″ x 18″': 43138,
      '16″ x 20″': 43141,
      '18″ x 24″': 43144,
      '20″ x 30″': 43147,
      '24″ x 32″': 43150,
      '24″ x 36″': 43153,
      // Alternate formats
      '11" x 14"': 43135,
      '12" x 18"': 43138,
      '16" x 20"': 43141,
      '18" x 24"': 43144,
      '20" x 30"': 43147,
      '24" x 32"': 43150,
      '24" x 36"': 43153,
    },
    // Add more blueprints as needed
  }

  const blueprintKey = String(blueprintId)
  const sizeKey = size.replace(/[″"]/g, '"').toLowerCase().replace(/\s+/g, '').trim()
  const normalizedSize = size.toLowerCase().replace(/[″" ×x]/g, '').trim()
  
  // Try various matching strategies
  return variantMappings[blueprintKey]?.[sizeKey] || 
         variantMappings[blueprintKey]?.[size] ||
         variantMappings[blueprintKey]?.[normalizedSize] ||
         43144 // Default to 18x24 matte variant
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
                    // Upload the image
                    const uploadResult = await printify.uploadImage(
                      item.print_file_url,
                      `order-${orderId}-${item.id}.png`
                    )
                    
                    // Get the image details to retrieve the preview_url
                    // For print_areas, Printify requires the actual image URL, not the ID
                    const imageDetails = await fetch(
                      `https://api.printify.com/v1/uploads/${uploadResult.id}.json`,
                      { headers: { 'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}` } }
                    ).then(r => r.json())
                    
                    uploadedImages[item.print_file_url] = imageDetails.preview_url || item.print_file_url
                    console.log('[Stripe Webhook] Image uploaded to Printify:', uploadResult.id, '-> URL:', uploadedImages[item.print_file_url])
                  } catch (uploadError) {
                    console.error('[Stripe Webhook] Image upload failed:', uploadError)
                    // Fall back to original URL
                    uploadedImages[item.print_file_url] = item.print_file_url
                  }
                }
              }
            }

            // Build Printify order
            const printifyOrder = {
              external_id: orderId,
              line_items: (orderItems || []).map((item: any) => ({
                blueprint_id: parseInt(item.printify_blueprint_id) || 282, // Default to vertical poster
                print_provider_id: 99, // Printify Choice - works for all blueprints
                variant_id: getVariantId(item.printify_blueprint_id || '282', item.size), // Map size to variant
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
