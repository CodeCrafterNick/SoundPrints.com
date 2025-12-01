import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'
import { sendOrderConfirmationEmail } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/orders
 * 
 * List orders (optionally filtered by email)
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (email) {
      query = query.eq('email', email)
    }

    const { data: orders, error, count } = await query

    if (error) {
      console.error('[List Orders] Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    // Format orders
    const formattedOrders = orders?.map(order => ({
      ...order,
      shipping_address: typeof order.shipping_address === 'string' 
        ? JSON.parse(order.shipping_address) 
        : order.shipping_address,
      items: typeof order.items === 'string'
        ? JSON.parse(order.items)
        : order.items,
      design_urls: typeof order.design_urls === 'string'
        ? JSON.parse(order.design_urls)
        : order.design_urls
    })) || []

    return NextResponse.json({
      orders: formattedOrders,
      total: count || formattedOrders.length,
      limit,
      offset
    })

  } catch (error) {
    console.error('[List Orders] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to list orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/orders
 * 
 * Create a new order in the database
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await req.json()
    const { orderData, items, paymentIntentId } = body

    // Validate required fields
    if (!orderData || !items) {
      return NextResponse.json(
        { error: 'Missing required fields: orderData, items' },
        { status: 400 }
      )
    }

    // Get user ID from Clerk if authenticated
    const { userId } = await auth()

    console.log('[Create Order] Creating order for', orderData.email, userId ? `(User: ${userId})` : '(Guest)')

    // Insert order into database
    // Note: user_id is set to null because Clerk IDs are strings but DB column may be UUID
    // TODO: Run migration to change user_id to VARCHAR(255) to support Clerk IDs
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        email: orderData.email,
        shipping_address: orderData.shippingAddress,
        subtotal: parseFloat(orderData.subtotal),
        tax: parseFloat(orderData.tax),
        shipping: parseFloat(orderData.shipping),
        total: parseFloat(orderData.total),
        stripe_payment_intent_id: paymentIntentId,
        status: paymentIntentId ? 'paid' : 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('[Create Order] Error:', error)
      return NextResponse.json(
        { error: 'Failed to create order', details: error.message },
        { status: 500 }
      )
    }

    console.log('[Create Order] Order created:', order.id)

    // Insert order items into order_items table
    if (items && items.length > 0) {
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_type: item.productType || 'poster',
        size: item.size || '18x24',
        audio_file_name: item.audioFileName || '',
        audio_file_url: item.audioFileUrl || '',
        waveform_color: item.waveformColor || '#000000',
        background_color: item.backgroundColor || '#FFFFFF',
        custom_text: item.customText || '',
        price: parseFloat(item.price || '0'),
        quantity: parseInt(item.quantity || '1'),
        print_file_url: item.designUrl || '',
        // Printify-specific fields for resubmission
        printify_blueprint_id: item.printifyBlueprintId || null,
        printify_variant_id: item.printifyVariantId || null,
        waveform_style: item.waveformStyle || 'bars',
        design_preset: item.designPreset || null,
        product_color: item.productColor || null,
        mockup_url: item.mockupUrl || item.thumbnailUrl || null
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('[Create Order] Error inserting items:', itemsError)
        // Don't fail the whole order if items insert fails
      }
    }

    console.log('[Create Order] Order created:', order.id)

    // Send order confirmation email
    try {
      const shippingAddress = orderData.shippingAddress
      await sendOrderConfirmationEmail({
        orderId: order.id,
        email: orderData.email,
        customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        items: items.map((item: any) => ({
          productType: item.productType || 'poster',
          size: item.size || '18x24',
          audioFileName: item.audioFileName,
          price: parseFloat(item.price || '0'),
          quantity: parseInt(item.quantity || '1'),
          thumbnailUrl: item.thumbnailUrl
        })),
        subtotal: parseFloat(orderData.subtotal),
        tax: parseFloat(orderData.tax),
        shipping: parseFloat(orderData.shipping),
        total: parseFloat(orderData.total),
        shippingAddress: {
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country || 'US'
        }
      })
      console.log('[Create Order] Confirmation email sent to:', orderData.email)
    } catch (emailError) {
      console.error('[Create Order] Failed to send confirmation email:', emailError)
      // Don't fail the order if email fails
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order
    })

  } catch (error) {
    console.error('[Create Order] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
