import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * PATCH /api/orders/[id]
 * 
 * Update order status and tracking info
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
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
      return NextResponse.json(
        { error: 'Failed to update order' },
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
