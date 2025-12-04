import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/downloads/generate
 * 
 * Generate a secure, expiring download token for a digital purchase
 */
export async function POST(req: NextRequest) {
  try {
    const { orderId, orderItemId, email, designUrl } = await req.json()

    if (!orderId || !email || !designUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, email, designUrl' },
        { status: 400 }
      )
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex')
    
    // Set expiration to 24 hours from now
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    // Store the download token
    const { data: tokenData, error: tokenError } = await supabase
      .from('download_tokens')
      .insert({
        token,
        order_id: orderId,
        order_item_id: orderItemId || null,
        design_url: designUrl,
        email,
        expires_at: expiresAt.toISOString(),
        download_count: 0,
        max_downloads: 5
      })
      .select()
      .single()

    if (tokenError) {
      console.error('[Downloads] Token creation error:', tokenError)
      return NextResponse.json(
        { error: 'Failed to create download token' },
        { status: 500 }
      )
    }

    // Generate the download URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin
    const downloadUrl = `${baseUrl}/api/downloads/${token}`

    return NextResponse.json({
      success: true,
      downloadUrl,
      expiresAt: expiresAt.toISOString(),
      token: tokenData.id
    })

  } catch (error) {
    console.error('[Downloads] Error generating token:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate download link',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
