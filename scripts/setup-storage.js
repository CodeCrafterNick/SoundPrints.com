#!/usr/bin/env node

import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createBucket(name, config) {
  try {
    const { data, error } = await supabase.storage.createBucket(name, config)
    
    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`  ✓ Bucket '${name}' already exists`)
        return true
      }
      console.error(`  ❌ Failed to create '${name}':`, error.message)
      return false
    }
    
    console.log(`  ✅ Created bucket '${name}'`)
    return true
  } catch (error) {
    console.error(`  ❌ Error creating '${name}':`, error.message)
    return false
  }
}

async function main() {
  console.log('📦 Setting up storage buckets...\n')
  
  // Audio files bucket
  await createBucket('audio-files', {
    public: true,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/ogg']
  })
  
  // Print files bucket
  await createBucket('print-files', {
    public: true,
    fileSizeLimit: 52428800, // 50MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf']
  })
  
  console.log('\n✨ Storage setup complete!')
}

main().catch(console.error)
