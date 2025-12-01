import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables')
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase credentials' },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('Uploading file:', file.name, file.type, file.size)

    // Generate a unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExt}`
    
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log('Uploading to Supabase bucket: audio-files')

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '86400', // 24 hours cache
        upsert: false,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json(
        { error: `Failed to upload file: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('Upload successful:', data)

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio-files')
      .getPublicUrl(fileName)

    console.log('Public URL:', publicUrl)

    // Save audio file record to database
    try {
      const { data: audioRecord, error: dbError } = await supabase
        .from('audio_files')
        .insert({
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database insert error:', dbError)
        // Don't fail the upload if DB insert fails, just log it
      } else {
        console.log('Audio file record created:', audioRecord)
      }
    } catch (dbError) {
      console.error('Failed to save audio file record:', dbError)
    }

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
