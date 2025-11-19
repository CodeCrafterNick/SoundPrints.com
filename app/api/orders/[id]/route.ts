import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/orders/[id]
 * 
 * Get order details by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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

    // Parse JSON fields if they're stored as strings
    const formattedOrder = {
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
