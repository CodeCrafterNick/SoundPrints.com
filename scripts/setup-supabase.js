#!/usr/bin/env node

/**
 * Supabase Setup Script
 * 
 * This script sets up the Supabase database schema and storage buckets.
 * 
 * Prerequisites:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Set environment variables in .env.local:
 *    - NEXT_PUBLIC_SUPABASE_URL
 *    - SUPABASE_SERVICE_ROLE_KEY (from project settings)
 * 
 * Usage:
 *   node scripts/setup-supabase.js
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nMake sure these are set in your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('📦 Setting up database schema...\n')

  try {
    // Read SQL files
    const schemaSQL = readFileSync(
      join(__dirname, '../supabase/schema.sql'),
      'utf-8'
    )
    const storageSQL = readFileSync(
      join(__dirname, '../supabase/storage.sql'),
      'utf-8'
    )

    // Execute schema SQL
    console.log('Creating tables and indexes...')
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: schemaSQL
    })

    if (schemaError) {
      // If RPC doesn't exist, try direct execution (you'll need to run SQL manually)
      console.log('⚠️  Could not execute SQL via RPC.')
      console.log('Please run the SQL files manually in the Supabase SQL Editor:\n')
      console.log('1. Go to your Supabase project')
      console.log('2. Navigate to SQL Editor')
      console.log('3. Run supabase/schema.sql')
      console.log('4. Run supabase/storage.sql\n')
      return false
    }

    console.log('✅ Database schema created\n')

    // Execute storage SQL
    console.log('Setting up storage buckets...')
    const { error: storageError } = await supabase.rpc('exec_sql', {
      sql: storageSQL
    })

    if (storageError) {
      console.log('⚠️  Could not create storage buckets via RPC.')
      console.log('Please run supabase/storage.sql manually in SQL Editor\n')
      return false
    }

    console.log('✅ Storage buckets created\n')

    return true
  } catch (error) {
    console.error('❌ Error setting up database:', error)
    return false
  }
}

async function createStorageBuckets() {
  console.log('🪣 Creating storage buckets...\n')

  try {
    // Create audio-files bucket
    const { error: audioError } = await supabase.storage.createBucket('audio-files', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/ogg']
    })

    if (audioError && !audioError.message.includes('already exists')) {
      console.error('Error creating audio-files bucket:', audioError)
    } else {
      console.log('✅ audio-files bucket created')
    }

    // Create print-files bucket
    const { error: printError } = await supabase.storage.createBucket('print-files', {
      public: true,
      fileSizeLimit: 104857600, // 100MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf']
    })

    if (printError && !printError.message.includes('already exists')) {
      console.error('Error creating print-files bucket:', printError)
    } else {
      console.log('✅ print-files bucket created')
    }

    console.log('')
    return true
  } catch (error) {
    console.error('❌ Error creating storage buckets:', error)
    return false
  }
}

async function verifySetup() {
  console.log('🔍 Verifying setup...\n')

  try {
    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('count')
      .limit(0)

    if (tablesError && tablesError.code === '42P01') {
      console.log('❌ Tables not found. Please run the SQL files manually.')
      return false
    }

    console.log('✅ Tables verified')

    // Check if buckets exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
      return false
    }

    const hasAudioBucket = buckets?.some(b => b.name === 'audio-files')
    const hasPrintBucket = buckets?.some(b => b.name === 'print-files')

    if (hasAudioBucket && hasPrintBucket) {
      console.log('✅ Storage buckets verified')
    } else {
      console.log('⚠️  Some storage buckets are missing')
      if (!hasAudioBucket) console.log('   - audio-files')
      if (!hasPrintBucket) console.log('   - print-files')
    }

    console.log('\n✨ Setup verification complete!\n')
    return true
  } catch (error) {
    console.error('❌ Error verifying setup:', error)
    return false
  }
}

// Main execution
async function main() {
  console.log('🚀 SoundPrints Supabase Setup\n')
  console.log('================================================\n')

  // Create storage buckets (this usually works)
  await createStorageBuckets()

  // Attempt database setup
  const dbSuccess = await setupDatabase()

  if (!dbSuccess) {
    console.log('📝 Manual Setup Required:\n')
    console.log('1. Open your Supabase project dashboard')
    console.log('2. Go to SQL Editor')
    console.log('3. Create a new query')
    console.log('4. Copy and paste the contents of supabase/schema.sql')
    console.log('5. Run the query')
    console.log('6. Repeat for supabase/storage.sql\n')
  }

  // Verify setup
  await verifySetup()

  console.log('================================================\n')
  console.log('Next steps:')
  console.log('1. Verify tables exist in Supabase Table Editor')
  console.log('2. Verify buckets exist in Supabase Storage')
  console.log('3. Run: pnpm db:push (if using Drizzle)')
  console.log('4. Start your app: pnpm dev\n')
}

main().catch(console.error)
