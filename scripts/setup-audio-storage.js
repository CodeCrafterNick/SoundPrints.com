import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupAudioStorage() {
  try {
    // Create the audio-files bucket
    const { data, error } = await supabase.storage.createBucket('audio-files', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/m4a', 'audio/ogg', 'audio/x-m4a'],
    })

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✓ audio-files bucket already exists')
        return
      }
      throw error
    }

    console.log('✓ Created audio-files storage bucket')
  } catch (error) {
    console.error('Error setting up audio storage:', error)
    process.exit(1)
  }
}

setupAudioStorage()
