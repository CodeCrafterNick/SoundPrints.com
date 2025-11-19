import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/orders
 * 
 * List orders (optionally filtered by email)
 */
export async function GET(req: NextRequest) {
  try {
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
      query = query.eq('recipient_email', email)
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
