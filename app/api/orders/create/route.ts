import { NextRequest, NextResponse } from 'next/server'
import { printfulClient } from '@/lib/printful-client'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/orders/create
 * 
 * Create a new order and submit to Printful for fulfillment
 * 
 * Request body:
 * {
 *   designUrl: string,           // URL to design file (must be publicly accessible)
 *   items: Array<{
 *     variantId: number,         // Printful product variant ID
 *     quantity: number,
 *     files: Array<{
 *       type: 'front' | 'back',
 *       url: string              // Design URL
 *     }>
 *   }>,
 *   recipient: {
 *     name: string,
 *     address1: string,
 *     city: string,
 *     state_code: string,
 *     country_code: string,
 *     zip: string,
 *     email?: string,
 *     phone?: string
 *   },
 *   confirm?: boolean            // Auto-confirm order (default: false)
 * }
 * 
 * Response:
 * {
 *   orderId: number,             // Printful order ID
 *   cost: {
 *     subtotal: number,
 *     shipping: number,
 *     tax: number,
 *     total: number
 *   },
 *   status: string,
 *   trackingUrl?: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { designUrl, items, recipient, confirm = false } = body

    // Validate required fields
    if (!designUrl || !items || !recipient) {
      return NextResponse.json(
        { error: 'Missing required fields: designUrl, items, recipient' },
        { status: 400 }
      )
    }

    console.log('[Printful Order] Creating order for', items.length, 'items')

    // Step 1: Upload design file to Printful
    console.log('[Printful Order] Uploading design file...')
    const uploadResult = await printfulClient.uploadFile(designUrl)
    
    if (!uploadResult.id) {
      throw new Error('Failed to upload design file to Printful')
    }

    console.log('[Printful Order] Design uploaded, file ID:', uploadResult.id)

    // Step 2: Build order object
    const orderData: any = {
      external_id: `soundprints-${Date.now()}`,
      shipping: 'STANDARD',  // Default shipping method
      recipient,
      items: items.map((item: any) => ({
        variant_id: item.variantId,
        quantity: item.quantity,
        files: item.files.map((file: any) => ({
          type: file.type,
          url: file.url || designUrl  // Use item-specific URL or default
        }))
      }))
    }

    // Step 3: Create order
    console.log('[Printful Order] Creating order in Printful...')
    const order = await printfulClient.createOrder(orderData, confirm)

    console.log('[Printful Order] Order created:', order.id)

    // Step 4: Calculate shipping if not confirmed
    let shippingCost = 0
    if (!confirm && order.id) {
      try {
        const shipping = await printfulClient.calculateShipping(orderData)
        shippingCost = parseFloat(shipping.total_cost)
      } catch (error) {
        console.error('[Printful Order] Shipping calculation failed:', error)
      }
    }

    // Step 5: Store order in database
    const { data: dbOrder, error: dbError } = await supabase
      .from('orders')
      .insert({
        printful_order_id: order.id,
        status: order.status,
        recipient_name: recipient.name,
        recipient_email: recipient.email,
        cost_subtotal: parseFloat(order.costs?.subtotal || '0'),
        cost_shipping: shippingCost || parseFloat(order.costs?.shipping || '0'),
        cost_tax: parseFloat(order.costs?.tax || '0'),
        cost_total: parseFloat(order.costs?.total || '0'),
        items: items,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('[Printful Order] Database error:', dbError)
      // Continue anyway - order was created in Printful
    }

    return NextResponse.json({
      orderId: order.id,
      cost: {
        subtotal: parseFloat(order.costs?.subtotal || '0'),
        shipping: shippingCost || parseFloat(order.costs?.shipping || '0'),
        tax: parseFloat(order.costs?.tax || '0'),
        total: parseFloat(order.costs?.total || '0')
      },
      status: order.status,
      trackingUrl: order.shipments?.[0]?.tracking_url,
      dbOrderId: dbOrder?.id
    })

  } catch (error) {
    console.error('[Printful Order] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/orders/create?orderId=123
 * 
 * Get order status from Printful
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // This would require adding a getOrder method to printfulClient
    // For now, return a placeholder
    return NextResponse.json({
      message: 'Order status lookup not yet implemented',
      orderId
    })

  } catch (error) {
    console.error('[Printful Order] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get order status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
