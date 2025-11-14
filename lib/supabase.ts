import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
