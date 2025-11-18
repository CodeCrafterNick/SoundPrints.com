import { NextRequest, NextResponse } from 'next/server'
import { mockupPreGenerator } from '@/lib/displacement/pregenerate'
import { supabase } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for large batches

/**
 * POST /api/pregenerate-mockups
 * 
 * Generate all mockups for a design in parallel for instant product switching.
 * This is the core endpoint for the "instant mockup" launch strategy.
 * 
 * Request body:
 * - design: File (multipart/form-data)
 * - category?: 'wall-art' | 'apparel' | 'all' (default: 'all')
 * - format?: 'png' | 'jpeg' | 'webp' (default: 'png')
 * - quality?: number (default: 90)
 * - uploadToStorage?: boolean (default: true) - Upload to Supabase Storage
 * 
 * Response:
 * {
 *   mockups: Array<{
 *     templateId: string,
 *     name: string,
 *     category: string,
 *     url: string | null,      // Supabase public URL (if uploaded)
 *     buffer?: Buffer,         // Raw buffer (if not uploaded)
 *     cached: boolean,
 *     renderTime: number
 *   }>,
 *   stats: {
 *     total: number,
 *     cached: number,
 *     generated: number,
 *     totalTime: number,
 *     averageTime: number
 *   }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    // Get design file
    const designFile = formData.get('design') as File
    if (!designFile) {
      return NextResponse.json(
        { error: 'Design file is required' },
        { status: 400 }
      )
    }

    // Parse options
    const category = (formData.get('category') as 'wall-art' | 'apparel' | 'all') || 'all'
    const format = (formData.get('format') as 'png' | 'jpeg' | 'webp') || 'png'
    const quality = formData.get('quality') ? Number(formData.get('quality')) : 90
    const uploadToStorage = formData.get('uploadToStorage') !== 'false'

    // Convert design to buffer
    const designBuffer = Buffer.from(await designFile.arrayBuffer())

    console.log(`[Pre-generate] Starting batch generation for category: ${category}`)
    const startTime = Date.now()

    // Generate all mockups in parallel
    const mockups = await mockupPreGenerator.generateAll({
      designBuffer,
      category,
      outputFormat: format,
      outputQuality: quality
    })

    const totalTime = Date.now() - startTime
    console.log(`[Pre-generate] Generated ${mockups.length} mockups in ${totalTime}ms`)

    // Upload to Supabase Storage if requested
    let resultMockups = mockups

    if (uploadToStorage) {
      console.log('[Pre-generate] Uploading mockups to Supabase Storage...')
      
      resultMockups = await Promise.all(
        mockups.map(async (mockup) => {
          try {
            // Generate unique filename
            const timestamp = Date.now()
            const fileName = `mockups/${mockup.templateId}-${timestamp}.${format}`
            
            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
              .from('mockups')
              .upload(fileName, mockup.buffer, {
                contentType: `image/${format}`,
                cacheControl: '3600',
                upsert: false
              })

            if (error) {
              console.error(`[Pre-generate] Upload failed for ${mockup.templateId}:`, error)
              return mockup
            }

            // Get public URL
            const { data: publicUrlData } = supabase.storage
              .from('mockups')
              .getPublicUrl(data.path)

            // Return mockup with URL
            return {
              ...mockup,
              url: publicUrlData.publicUrl
            }
          } catch (error) {
            console.error(`[Pre-generate] Upload error for ${mockup.templateId}:`, error)
            return mockup
          }
        })
      )

      const uploadTime = Date.now() - startTime - totalTime
      console.log(`[Pre-generate] Uploaded ${resultMockups.length} mockups in ${uploadTime}ms`)
    }

    // Calculate stats
    const cached = mockups.filter(m => m.cached).length
    const generated = mockups.length - cached

    const stats = {
      total: mockups.length,
      cached,
      generated,
      totalTime,
      averageTime: Math.round(totalTime / mockups.length)
    }

    return NextResponse.json({
      mockups: resultMockups,
      stats
    })

  } catch (error) {
    console.error('[Pre-generate] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate mockups',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/pregenerate-mockups?action=stats
 * 
 * Get pre-generation statistics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    if (action === 'stats') {
      const stats = mockupPreGenerator.getStats()
      return NextResponse.json(stats)
    }

    return NextResponse.json({
      message: 'Pre-generation API',
      endpoints: {
        'POST /api/pregenerate-mockups': 'Generate all mockups in parallel',
        'GET /api/pregenerate-mockups?action=stats': 'Get generation statistics'
      },
      features: [
        'Parallel generation for instant product switching',
        'Automatic caching for fast regeneration',
        'Optional Supabase Storage upload',
        'Support for wall-art and apparel categories',
        'Multiple output formats (PNG, JPEG, WebP)'
      ]
    })

  } catch (error) {
    console.error('[Pre-generate] API error:', error)
    return NextResponse.json(
      { 
        error: 'API request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
