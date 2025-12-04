import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { SavedDesign } from '@/lib/types/saved-design'

interface SaveDesignRequest {
  design: SavedDesign
  userId?: string // For server-side calls
}

// POST /api/designs/save - Save or update a design
export async function POST(request: NextRequest) {
  try {
    const { userId: authUserId } = await auth()
    const body: SaveDesignRequest = await request.json()
    
    const { design, userId: bodyUserId } = body
    const effectiveUserId = authUserId || bodyUserId
    
    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (!design || !design.state) {
      return NextResponse.json(
        { success: false, error: 'Invalid design data' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseAdmin()
    
    // Check if design already exists in cloud (by cloudId or local_id)
    let existingDesign = null
    
    if (design.cloudId) {
      const { data } = await supabase
        .from('saved_designs')
        .select('id')
        .eq('id', design.cloudId)
        .eq('clerk_user_id', effectiveUserId)
        .single()
      existingDesign = data
    }
    
    if (!existingDesign) {
      // Check by local_id
      const { data } = await supabase
        .from('saved_designs')
        .select('id')
        .eq('local_id', design.id)
        .eq('clerk_user_id', effectiveUserId)
        .single()
      existingDesign = data
    }
    
    let result
    
    if (existingDesign) {
      // Update existing design
      const { data, error } = await supabase
        .from('saved_designs')
        .update({
          name: design.name,
          thumbnail_url: design.thumbnailUrl,
          design_state: design.state,
          order_id: design.orderId,
          order_item_id: design.orderItemId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDesign.id)
        .select('id')
        .single()
      
      if (error) {
        console.error('Error updating design:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to update design' },
          { status: 500 }
        )
      }
      
      result = data
    } else {
      // Insert new design
      const { data, error } = await supabase
        .from('saved_designs')
        .insert({
          clerk_user_id: effectiveUserId,
          local_id: design.id,
          name: design.name,
          thumbnail_url: design.thumbnailUrl,
          design_state: design.state,
          order_id: design.orderId,
          order_item_id: design.orderItemId,
        })
        .select('id')
        .single()
      
      if (error) {
        console.error('Error inserting design:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to save design' },
          { status: 500 }
        )
      }
      
      result = data
    }
    
    return NextResponse.json({
      success: true,
      cloudId: result.id,
    })
    
  } catch (error) {
    console.error('Design save error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
