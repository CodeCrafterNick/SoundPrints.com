import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover'
})

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/checkout/session
 * 
 * Create a Stripe checkout session for the cart
 */
export async function POST(req: NextRequest) {
  try {
    const { items, shippingInfo, designUrls } = await req.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    if (!shippingInfo) {
      return NextResponse.json(
        { error: 'Shipping information is required' },
        { status: 400 }
      )
    }

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.08
    const shipping = subtotal > 50 ? 0 : 5.99
    const total = subtotal + tax + shipping

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.productType} - ${item.size}`,
          description: item.audioFileName || 'Custom waveform design',
          images: item.thumbnailUrl ? [item.thumbnailUrl] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    // Add shipping line item
    if (shipping > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping',
            description: 'Standard shipping',
            images: [],
          },
          unit_amount: Math.round(shipping * 100),
        },
        quantity: 1,
      })
    }

    // Add tax line item
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Tax',
          description: 'Sales tax (8%)',
          images: [],
        },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    })

    // Store order in database before payment
    const { data: order, error: dbError } = await supabase
      .from('orders')
      .insert({
        status: 'pending',
        recipient_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        recipient_email: shippingInfo.email,
        shipping_address: JSON.stringify(shippingInfo),
        items: items,
        design_urls: designUrls || {},
        cost_subtotal: subtotal,
        cost_shipping: shipping,
        cost_tax: tax,
        cost_total: total,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('[Checkout] Database error:', dbError)
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.nextUrl.origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}&order_id=${order?.id || ''}`,
      cancel_url: `${req.nextUrl.origin}/checkout?canceled=true`,
      customer_email: shippingInfo.email,
      metadata: {
        orderId: order?.id?.toString() || '',
        firstName: shippingInfo.firstName,
        lastName: shippingInfo.lastName,
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      orderId: order?.id
    })

  } catch (error) {
    console.error('[Checkout Session] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
