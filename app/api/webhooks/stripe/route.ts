import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'
import { PrintfulClient } from '@/lib/printful-client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/webhooks/stripe
 * 
 * Handle Stripe webhook events
 * Processes payment confirmations and submits orders to Printful
 */
export async function POST(req: NextRequest) {
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

        // Submit order to Printful if API key is configured
        if (process.env.PRINTFUL_API_KEY && order) {
          try {
            const printful = new PrintfulClient(process.env.PRINTFUL_API_KEY)

            // Parse shipping address
            const shippingAddress = typeof order.shipping_address === 'string' 
              ? JSON.parse(order.shipping_address) 
              : order.shipping_address

            // Build Printful order
            const printfulOrder = {
              recipient: {
                name: order.recipient_name,
                email: order.recipient_email,
                address1: shippingAddress.address,
                city: shippingAddress.city,
                state_code: shippingAddress.state,
                country_code: shippingAddress.country || 'US',
                zip: shippingAddress.zipCode
              },
              items: order.items.map((item: any) => ({
                variant_id: item.printfulVariantId,
                quantity: item.quantity,
                files: [
                  {
                    url: order.design_urls?.[item.templateId] || item.designUrl
                  }
                ]
              })),
              shipping: 'STANDARD'
            }

            // Create order in Printful (confirmed)
            const printfulResponse = await printful.createOrder(printfulOrder, true)

            // Update order with Printful details
            await supabase
              .from('orders')
              .update({
                printful_order_id: printfulResponse.result.id,
                status: 'submitted',
                updated_at: new Date().toISOString()
              })
              .eq('id', orderId)

            console.log('[Stripe Webhook] Order submitted to Printful:', printfulResponse.result.id)
          } catch (printfulError) {
            console.error('[Stripe Webhook] Printful submission failed:', printfulError)
            // Don't fail the webhook, just log the error
            // The order is still paid, we can retry Printful submission later
          }
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
