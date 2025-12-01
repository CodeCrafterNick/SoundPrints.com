import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// How long guest orders are accessible via direct link (in hours)
const GUEST_ORDER_ACCESS_WINDOW_HOURS = 72

/**
 * GET /api/orders/[id]
 * 
 * Get order details by ID
 * 
 * Access control:
 * - Logged-in users can only view their own orders
 * - Guest orders can be viewed by anyone with the link for 72 hours
 * - After 72 hours, guest orders require email verification
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseAdmin()
    const { id } = await params
    const { userId } = await auth()
    
    // Get email from query param (for guest verification)
    const { searchParams } = new URL(req.url)
    const verifyEmail = searchParams.get('email')

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

    // Access control checks
    const isOwner = userId && order.user_id === userId
    const isGuestOrder = !order.user_id
    const orderAge = (Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60) // hours
    const withinGuestWindow = orderAge < GUEST_ORDER_ACCESS_WINDOW_HOURS
    const emailMatches = verifyEmail && order.email.toLowerCase() === verifyEmail.toLowerCase()

    // Determine if user can access this order
    let canAccess = false
    
    if (isOwner) {
      // Logged-in user viewing their own order
      canAccess = true
    } else if (isGuestOrder && withinGuestWindow) {
      // Guest order within 72-hour window - allow access with just the link
      canAccess = true
    } else if (emailMatches) {
      // Email verification provided and matches
      canAccess = true
    } else if (userId && !order.user_id) {
      // Logged-in user viewing a guest order - don't allow unless email matches
      canAccess = emailMatches
    }

    if (!canAccess) {
      // Don't reveal whether the order exists or not for security
      return NextResponse.json(
        { 
          error: 'Order not found or access denied',
          requiresVerification: !withinGuestWindow && isGuestOrder
        },
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
