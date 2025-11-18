import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { artworkDataUrl } = await request.json()

    if (!artworkDataUrl) {
      return NextResponse.json(
        { error: 'Artwork data URL is required' },
        { status: 400 }
      )
    }

    // Convert base64 data URL to buffer
    const base64Data = artworkDataUrl.split(',')[1]
    const buffer = Buffer.from(base64Data, 'base64')

    // Generate unique filename
    const filename = `artwork-${Date.now()}.png`
    const filePath = `printify-artwork/${filename}`

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('print-files')
      .upload(filePath, buffer, {
        contentType: 'image/png',
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json(
        { error: 'Failed to upload to storage' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('print-files')
      .getPublicUrl(filePath)

    return NextResponse.json({
      artworkUrl: urlData.publicUrl,
      path: filePath
    })
  } catch (error) {
    console.error('Upload artwork error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
