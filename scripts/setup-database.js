#!/usr/bin/env node

/**
 * Supabase Setup using Management API
 * 
 * This uses the Supabase Management API to set up:
 * - Database tables via SQL execution
 * - Storage buckets
 * 
 * Usage: node scripts/setup-database.js
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const SUPABASE_ACCESS_TOKEN = 'sbp_cf303a5210a1f2783c025b606a283134053b288b'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_PROJECT_REF = SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1]

if (!SUPABASE_URL || !SUPABASE_PROJECT_REF) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL in .env.local')
  process.exit(1)
}

const DATABASE_SQL = `
-- Create tables
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  shipping DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  shipping_address JSONB NOT NULL,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) NOT NULL,
  product_type TEXT NOT NULL,
  size TEXT NOT NULL,
  audio_file_name TEXT NOT NULL,
  audio_file_url TEXT NOT NULL,
  waveform_color TEXT NOT NULL,
  background_color TEXT NOT NULL,
  custom_text TEXT,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  print_file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS audio_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  duration DECIMAL(10, 2),
  mime_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_audio_files_user_id ON audio_files(user_id);
`

async function executeSQLViaAPI() {
  console.log('📊 Creating database schema via Management API...\n')
  
  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: DATABASE_SQL
        })
      }
    )
    
    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Failed to execute SQL:', error)
      console.log('\n📝 You can run this SQL manually in Supabase SQL Editor:\n')
      console.log(DATABASE_SQL)
      return false
    }
    
    console.log('✅ Database schema created successfully!\n')
    return true
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\n📝 Please run this SQL manually in Supabase SQL Editor:\n')
    console.log(DATABASE_SQL)
    return false
  }
}

async function createStorageBucket(bucketName, config) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/bucket`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          name: bucketName,
          ...config
        })
      }
    )
    
    if (!response.ok) {
      const error = await response.json()
      if (error.message?.includes('already exists')) {
        console.log(`  ✓ Bucket '${bucketName}' already exists`)
        return true
      }
      console.error(`  ❌ Failed to create '${bucketName}':`, error.message)
      return false
    }
    
    console.log(`  ✅ Created bucket '${bucketName}'`)
    return true
  } catch (error) {
    console.error(`  ❌ Error creating '${bucketName}':`, error.message)
    return false
  }
}

async function setupStorageBuckets() {
  console.log('📦 Setting up storage buckets...\n')
  
  const buckets = [
    {
      name: 'audio-files',
      config: {
        public: true,
        file_size_limit: 52428800, // 50MB
        allowed_mime_types: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/ogg']
      }
    },
    {
      name: 'print-files',
      config: {
        public: true,
        file_size_limit: 104857600, // 100MB
        allowed_mime_types: ['image/png', 'image/jpeg', 'application/pdf']
      }
    }
  ]
  
  for (const bucket of buckets) {
    await createStorageBucket(bucket.name, bucket.config)
  }
  
  console.log('')
}

async function main() {
  console.log('🚀 SoundPrints Database Setup\n')
  console.log('================================================\n')
  
  // Execute SQL
  const sqlSuccess = await executeSQLViaAPI()
  
  // Create storage buckets
  await setupStorageBuckets()
  
  console.log('================================================\n')
  
  if (sqlSuccess) {
    console.log('✨ Setup complete!')
    console.log('\n📚 Next steps:')
    console.log('  1. Verify tables in Supabase Dashboard > Table Editor')
    console.log('  2. Verify storage buckets in Storage section')
    console.log('  3. Start development: pnpm dev\n')
  } else {
    console.log('⚠️  Setup partially complete')
    console.log('\n📚 Next steps:')
    console.log('  1. Run the SQL manually in Supabase SQL Editor')
    console.log('  2. Verify storage buckets were created')
    console.log('  3. Start development: pnpm dev\n')
  }
}

main().catch(console.error)
