import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client (uses service role key for admin operations)
// Only use this in API routes, never in client components!
export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  })
}

// Helper function to upload audio files to Supabase Storage
export async function uploadAudioFile(file: File) {
  const fileName = `${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from('audio-files')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('audio-files')
    .getPublicUrl(fileName)

  return {
    fileName,
    fileUrl: urlData.publicUrl,
  }
}

// Helper function to upload print files (high-res exports)
export async function uploadPrintFile(blob: Blob, fileName: string) {
  const { data, error } = await supabase.storage
    .from('print-files')
    .upload(fileName, blob, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('print-files')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}
