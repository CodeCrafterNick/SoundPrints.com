import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET /api/designs - Get all designs for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    // Also support query param for userId (for server-side calls)
    const searchParams = request.nextUrl.searchParams
    const queryUserId = searchParams.get('userId')
    
    const effectiveUserId = userId || queryUserId
    
    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const supabase = getSupabaseAdmin()
    
    const { data: designs, error } = await supabase
      .from('saved_designs')
      .select('*')
      .eq('clerk_user_id', effectiveUserId)
      .order('updated_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching designs:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch designs' },
        { status: 500 }
      )
    }
    
    // Transform database records to SavedDesign format
    const transformedDesigns = designs?.map(d => ({
      id: d.local_id || d.id,
      cloudId: d.id,
      name: d.name,
      thumbnailUrl: d.thumbnail_url,
      state: d.design_state,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
      cloudSyncedAt: d.updated_at,
      isDirty: false,
      orderId: d.order_id,
      orderItemId: d.order_item_id,
    })) || []
    
    return NextResponse.json({
      success: true,
      designs: transformedDesigns,
    })
    
  } catch (error) {
    console.error('Designs GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/designs?id=xxx - Delete a design
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const searchParams = request.nextUrl.searchParams
    const designId = searchParams.get('id')
    
    if (!designId) {
      return NextResponse.json(
        { success: false, error: 'Design ID is required' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseAdmin()
    
    // Delete design (only if owned by user)
    const { error } = await supabase
      .from('saved_designs')
      .delete()
      .eq('id', designId)
      .eq('clerk_user_id', userId)
    
    if (error) {
      console.error('Error deleting design:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete design' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Designs DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
