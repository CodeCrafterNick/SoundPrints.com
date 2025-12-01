import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/orders/[id]
 * 
 * Get order details by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin()
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Fetch order items from the order_items table
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id)

    if (itemsError) {
      console.error('[Get Order Items] Error:', itemsError)
    }

    // Parse JSON fields if they're stored as strings
    const formattedOrder = {
      ...order,
      shipping_address: typeof order.shipping_address === 'string' 
        ? JSON.parse(order.shipping_address) 
        : order.shipping_address,
      items: items || []
    }

    return NextResponse.json({ order: formattedOrder })

  } catch (error) {
    console.error('[Get Order] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/orders/[id]
 * 
 * Update order status and tracking info
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin()
    const { id } = await params
    const body = await req.json()
    const { status, tracking_number, tracking_url, printful_order_id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }

    // Build update object
    const updates: any = {}
    if (status) updates.status = status
    if (tracking_number) updates.tracking_number = tracking_number
    if (tracking_url) updates.tracking_url = tracking_url
    if (printful_order_id) updates.printful_order_id = printful_order_id
    updates.updated_at = new Date().toISOString()

    const { data: order, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error || !order) {
      console.error('[Update Order] Error:', error)
      return NextResponse.json(
        { error: 'Failed to update order', details: error?.message || 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })

  } catch (error) {
    console.error('[Update Order] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
