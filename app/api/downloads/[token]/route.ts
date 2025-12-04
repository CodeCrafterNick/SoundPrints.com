import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/downloads/[token]
 * 
 * Validate token and redirect to the actual download or serve the file
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: 'Download token is required' },
        { status: 400 }
      )
    }

    // Look up the token
    const { data: tokenData, error: tokenError } = await supabase
      .from('download_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Invalid or expired download link' },
        { status: 404 }
      )
    }

    // Check if token has expired
    const now = new Date()
    const expiresAt = new Date(tokenData.expires_at)
    
    if (now > expiresAt) {
      return NextResponse.json(
        { 
          error: 'This download link has expired',
          expiredAt: tokenData.expires_at
        },
        { status: 410 } // Gone
      )
    }

    // Check download count
    if (tokenData.download_count >= tokenData.max_downloads) {
      return NextResponse.json(
        { 
          error: 'Maximum download limit reached',
          maxDownloads: tokenData.max_downloads
        },
        { status: 403 }
      )
    }

    // Increment download count
    await supabase
      .from('download_tokens')
      .update({ 
        download_count: tokenData.download_count + 1,
        last_downloaded_at: new Date().toISOString()
      })
      .eq('id', tokenData.id)

    // Get the design URL - prefer hi-res if available
    const fileUrl = tokenData.hi_res_url || tokenData.design_url

    // Fetch the file
    const response = await fetch(fileUrl)
    
    if (!response.ok) {
      console.error('[Downloads] Failed to fetch file:', response.status)
      return NextResponse.json(
        { error: 'Failed to retrieve download file' },
        { status: 500 }
      )
    }

    // Get the file as a buffer
    const fileBuffer = await response.arrayBuffer()
    
    // Determine filename
    const urlParts = fileUrl.split('/')
    const originalFilename = urlParts[urlParts.length - 1]?.split('?')[0] || 'soundprint-hi-res.png'
    
    // Return the file as a download
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="soundprint-hi-def-${token.slice(0, 8)}.png"`,
        'Content-Length': fileBuffer.byteLength.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })

  } catch (error) {
    console.error('[Downloads] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process download',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
