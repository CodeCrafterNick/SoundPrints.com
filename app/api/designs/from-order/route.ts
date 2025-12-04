import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * POST /api/designs/from-order
 * 
 * Creates a saved design from an order item's data
 * This allows users to re-edit designs they've ordered before
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { orderId, orderItemId, designState, name, thumbnailUrl } = await request.json()
    
    if (!orderId || !designState) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, designState' },
        { status: 400 }
      )
    }
    
    // Check if a design already exists for this order item
    const { data: existing } = await supabase
      .from('saved_designs')
      .select('id')
      .eq('clerk_user_id', userId)
      .eq('order_id', orderId)
      .eq('order_item_id', orderItemId || '')
      .single()
    
    if (existing) {
      // Return existing design
      return NextResponse.json({
        success: true,
        designId: existing.id,
        isExisting: true
      })
    }
    
    // Create new design
    const localId = `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    const { data: newDesign, error } = await supabase
      .from('saved_designs')
      .insert({
        clerk_user_id: userId,
        local_id: localId,
        name: name || `Order ${orderId.slice(0, 8)}`,
        thumbnail_url: thumbnailUrl,
        design_state: designState,
        order_id: orderId,
        order_item_id: orderItemId || '',
        created_at: now,
        updated_at: now
      })
      .select('id')
      .single()
    
    if (error) {
      console.error('[Create Design from Order] Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create design from order' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      designId: newDesign.id,
      localId,
      isExisting: false
    })
    
  } catch (error) {
    console.error('[Create Design from Order] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/designs/from-order?orderId=xxx
 * 
 * Get a saved design that was created from an order
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId parameter' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('saved_designs')
      .select('*')
      .eq('clerk_user_id', userId)
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('[Get Design from Order] Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch design' },
        { status: 500 }
      )
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No design found for this order' },
        { status: 404 }
      )
    }
    
    // Return the first (most recent) design for this order
    return NextResponse.json({ design: data[0] })
    
  } catch (error) {
    console.error('[Get Design from Order] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
