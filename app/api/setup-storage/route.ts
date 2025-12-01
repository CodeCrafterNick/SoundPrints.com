import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This endpoint requires the service role key to create/update buckets and policies
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/setup-storage
 * 
 * Set up private storage buckets with proper RLS policies
 * This should only be run once during initial setup or to fix permissions
 * 
 * Requires SUPABASE_SERVICE_ROLE_KEY environment variable
 */
export async function POST(req: NextRequest) {
  // Check for admin authorization (you should add proper auth in production)
  const authHeader = req.headers.get('authorization')
  const adminKey = process.env.ADMIN_SETUP_KEY || 'setup-storage-key'
  
  if (authHeader !== `Bearer ${adminKey}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
      { status: 500 }
    )
  }

  const results: { step: string; success: boolean; message: string }[] = []

  try {
    // Step 1: Create or update audio-files bucket (private)
    const { data: audioBucket, error: audioError } = await supabaseAdmin.storage.createBucket('audio-files', {
      public: false,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/ogg', 'audio/x-m4a']
    })

    if (audioError) {
      if (audioError.message.includes('already exists')) {
        // Update existing bucket to be private
        const { error: updateError } = await supabaseAdmin.storage.updateBucket('audio-files', {
          public: false,
          fileSizeLimit: 52428800,
          allowedMimeTypes: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/ogg', 'audio/x-m4a']
        })
        
        if (updateError) {
          results.push({ step: 'audio-files bucket', success: false, message: updateError.message })
        } else {
          results.push({ step: 'audio-files bucket', success: true, message: 'Updated to private' })
        }
      } else {
        results.push({ step: 'audio-files bucket', success: false, message: audioError.message })
      }
    } else {
      results.push({ step: 'audio-files bucket', success: true, message: 'Created as private' })
    }

    // Step 2: Create or update print-files bucket (private)
    const { data: printBucket, error: printError } = await supabaseAdmin.storage.createBucket('print-files', {
      public: false,
      fileSizeLimit: 104857600, // 100MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf']
    })

    if (printError) {
      if (printError.message.includes('already exists')) {
        // Update existing bucket to be private
        const { error: updateError } = await supabaseAdmin.storage.updateBucket('print-files', {
          public: false,
          fileSizeLimit: 104857600,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf']
        })
        
        if (updateError) {
          results.push({ step: 'print-files bucket', success: false, message: updateError.message })
        } else {
          results.push({ step: 'print-files bucket', success: true, message: 'Updated to private' })
        }
      } else {
        results.push({ step: 'print-files bucket', success: false, message: printError.message })
      }
    } else {
      results.push({ step: 'print-files bucket', success: true, message: 'Created as private' })
    }

    // Step 3: Set up RLS policies via SQL
    // Note: Storage policies are managed through the storage schema, not the public schema
    // We'll use raw SQL to create the policies
    
    const policySQL = `
      -- Drop existing policies to avoid conflicts
      DROP POLICY IF EXISTS "Users can view own audio files" ON storage.objects;
      DROP POLICY IF EXISTS "Public audio files are viewable by everyone" ON storage.objects;
      DROP POLICY IF EXISTS "Authenticated users can upload audio files" ON storage.objects;
      DROP POLICY IF EXISTS "Users can update own audio files" ON storage.objects;
      DROP POLICY IF EXISTS "Users can delete own audio files" ON storage.objects;
      DROP POLICY IF EXISTS "Users can view own print files" ON storage.objects;
      DROP POLICY IF EXISTS "Public print files are viewable by everyone" ON storage.objects;
      DROP POLICY IF EXISTS "Service role can upload print files" ON storage.objects;
      DROP POLICY IF EXISTS "Service role can update print files" ON storage.objects;

      -- Audio files policies (private - user can only access own files)
      CREATE POLICY "Users can view own audio files" ON storage.objects
        FOR SELECT USING (
          bucket_id = 'audio-files' 
          AND auth.uid()::text = (storage.foldername(name))[1]
        );

      CREATE POLICY "Authenticated users can upload audio files" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'audio-files' 
          AND auth.role() = 'authenticated'
          AND auth.uid()::text = (storage.foldername(name))[1]
        );

      CREATE POLICY "Users can update own audio files" ON storage.objects
        FOR UPDATE USING (
          bucket_id = 'audio-files' 
          AND auth.uid()::text = (storage.foldername(name))[1]
        );

      CREATE POLICY "Users can delete own audio files" ON storage.objects
        FOR DELETE USING (
          bucket_id = 'audio-files' 
          AND auth.uid()::text = (storage.foldername(name))[1]
        );

      -- Print files policies (private - user can view own, service can upload)
      CREATE POLICY "Users can view own print files" ON storage.objects
        FOR SELECT USING (
          bucket_id = 'print-files'
          AND auth.uid()::text = (storage.foldername(name))[1]
        );

      CREATE POLICY "Service role can upload print files" ON storage.objects
        FOR INSERT WITH CHECK (bucket_id = 'print-files');

      CREATE POLICY "Service role can update print files" ON storage.objects
        FOR UPDATE USING (bucket_id = 'print-files');
    `

    // Execute the SQL using the admin client
    const { error: sqlError } = await supabaseAdmin.rpc('exec_sql', { sql: policySQL })
    
    if (sqlError) {
      // RPC might not exist, try alternative approach
      results.push({ 
        step: 'RLS policies', 
        success: false, 
        message: `SQL execution failed: ${sqlError.message}. Please run the SQL manually in Supabase Dashboard.`
      })
    } else {
      results.push({ step: 'RLS policies', success: true, message: 'Created successfully' })
    }

    const allSuccess = results.every(r => r.success)
    
    return NextResponse.json({
      success: allSuccess,
      message: allSuccess ? 'Storage setup complete' : 'Some steps failed',
      results,
      note: 'If RLS policies failed, run the SQL from supabase/storage.sql in your Supabase Dashboard SQL Editor'
    })

  } catch (error) {
    console.error('[Setup Storage] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to set up storage',
        details: error instanceof Error ? error.message : 'Unknown error',
        results
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/setup-storage
 * 
 * Check current storage bucket status
 */
export async function GET(req: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
      { status: 500 }
    )
  }

  try {
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const audioBucket = buckets?.find(b => b.name === 'audio-files')
    const printBucket = buckets?.find(b => b.name === 'print-files')

    return NextResponse.json({
      buckets: {
        'audio-files': audioBucket ? {
          exists: true,
          public: audioBucket.public,
          status: audioBucket.public ? '⚠️ PUBLIC (should be private)' : '✅ Private'
        } : { exists: false, status: '❌ Not created' },
        'print-files': printBucket ? {
          exists: true,
          public: printBucket.public,
          status: printBucket.public ? '⚠️ PUBLIC (should be private)' : '✅ Private'
        } : { exists: false, status: '❌ Not created' }
      },
      setupRequired: !audioBucket || !printBucket || audioBucket.public || printBucket.public
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
