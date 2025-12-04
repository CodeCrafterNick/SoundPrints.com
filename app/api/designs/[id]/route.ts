import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// DELETE /api/designs/[id] - Delete a design
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { id } = await params
    
    // Delete the design, ensuring it belongs to the user
    const { error } = await supabase
      .from('saved_designs')
      .delete()
      .eq('id', id)
      .eq('clerk_user_id', userId)
    
    if (error) {
      console.error('[DELETE Design] Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to delete design' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('[DELETE Design] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/designs/[id] - Get a single design by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { id } = await params
    
    const { data, error } = await supabase
      .from('saved_designs')
      .select('*')
      .eq('id', id)
      .eq('clerk_user_id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Design not found' },
          { status: 404 }
        )
      }
      console.error('[GET Design] Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch design' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ design: data })
    
  } catch (error) {
    console.error('[GET Design] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
