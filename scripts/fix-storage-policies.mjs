#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  console.log('URL:', supabaseUrl ? 'set' : 'missing')
  console.log('KEY:', supabaseKey ? 'set' : 'missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

async function fixStoragePolicies() {
  console.log('🔧 Fixing storage policies for audio-files bucket...\n')

  // First, let's check if the bucket exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  
  if (listError) {
    console.error('Error listing buckets:', listError)
    return
  }

  console.log('Existing buckets:', buckets.map(b => b.name).join(', '))

  const audioBucket = buckets.find(b => b.id === 'audio-files')
  
  if (!audioBucket) {
    console.log('\n📁 Creating audio-files bucket...')
    const { data, error } = await supabase.storage.createBucket('audio-files', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['audio/*']
    })
    if (error) {
      console.error('Error creating bucket:', error)
    } else {
      console.log('✅ Bucket created successfully!')
    }
  } else {
    console.log('\n📁 audio-files bucket exists, updating to public...')
    const { data, error } = await supabase.storage.updateBucket('audio-files', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['audio/*']
    })
    if (error) {
      console.error('Error updating bucket:', error)
    } else {
      console.log('✅ Bucket updated to public!')
    }
  }

  // Test upload capability with service role key
  console.log('\n🧪 Testing upload with service role key...')
  const testBuffer = Buffer.from('test audio file content')
  const testFileName = `test-${Date.now()}.mp3`
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('audio-files')
    .upload(testFileName, testBuffer, {
      contentType: 'audio/mpeg',
      upsert: true
    })

  if (uploadError) {
    console.error('❌ Service role upload failed:', uploadError.message)
  } else {
    console.log('✅ Service role upload successful!')
    await supabase.storage.from('audio-files').remove([testFileName])
    console.log('✅ Test file cleaned up')
  }

  // Test with anon key (simulating client-side)
  console.log('\n🧪 Testing upload with anon key (client-side simulation)...')
  const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  })
  
  const testFileName2 = `test-anon-${Date.now()}.mp3`
  const { data: anonUpload, error: anonError } = await anonClient.storage
    .from('audio-files')
    .upload(testFileName2, testBuffer, {
      contentType: 'audio/mpeg',
      upsert: true
    })

  if (anonError) {
    console.error('❌ Anon key upload failed:', anonError.message)
    console.log('\n⚠️  RLS policies need to be set manually in Supabase Dashboard:')
    console.log('   1. Go to Storage → audio-files → Policies')
    console.log('   2. Click "New Policy" → "For full customization"')
    console.log('   3. Policy name: "Allow public uploads"')
    console.log('   4. Target roles: anon, authenticated')
    console.log('   5. Policy: (bucket_id = \'audio-files\'::text)')
    console.log('   6. Enable for: INSERT, SELECT')
    console.log('\n   Or run this SQL in Supabase SQL Editor:')
    console.log(`
CREATE POLICY "Allow public uploads" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'audio-files');

CREATE POLICY "Allow public reads" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'audio-files');
`)
  } else {
    console.log('✅ Anon key upload successful! RLS policies are working.')
    await anonClient.storage.from('audio-files').remove([testFileName2])
    console.log('✅ Test file cleaned up')
  }

  console.log('\n✨ Done!')
}

fixStoragePolicies().catch(console.error)
