import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { readFile } from 'fs/promises'
import path from 'path'
import { maskBasedGenerator } from '@/lib/displacement/mask-generator'
import { templateManager } from '@/lib/displacement/template-manager'
import { DisplacementConfig } from '@/lib/displacement/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Server-side mockup generation with displacement mapping
 * Uses Sharp for professional-quality image compositing
 * 
 * Supports two modes:
 * 1. New template-based system (multipart/form-data)
 * 2. Legacy system (JSON with base64)
 */
export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || ''
  
  // NEW SYSTEM: Template-based displacement mapping
  if (contentType.includes('multipart/form-data')) {
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

      // Get template ID
      const templateId = formData.get('templateId') as string
      if (!templateId) {
        return NextResponse.json(
          { error: 'Template ID is required' },
          { status: 400 }
        )
      }

      // Verify template exists
      const template = await templateManager.getTemplate(templateId)
      if (!template) {
        return NextResponse.json(
          { error: `Template not found: ${templateId}` },
          { status: 404 }
        )
      }

      // Convert design file to buffer
      const designBuffer = Buffer.from(await designFile.arrayBuffer())

      // Parse rendering mode (always use mask mode now)
      const mode = 'mask'

      // Parse config options
      const config: DisplacementConfig = {
        brightness: formData.get('brightness') 
          ? Number(formData.get('brightness')) 
          : 0.92,
        blendMode: (formData.get('blendMode') as DisplacementConfig['blendMode']) || 'multiply',
        contrast: formData.get('contrast') 
          ? Number(formData.get('contrast')) 
          : 1.0,
        saturation: formData.get('saturation')
          ? Number(formData.get('saturation'))
          : 1.0,
        textureOverlay: formData.get('textureOverlay') === 'true',
        textureOpacity: formData.get('textureOpacity')
          ? Number(formData.get('textureOpacity'))
          : 0.15
      }

      // Parse output options
      const outputFormat = (formData.get('format') as 'png' | 'jpeg' | 'webp') || 'png'
      const outputQuality = formData.get('quality') 
        ? Number(formData.get('quality')) 
        : 90

      // Generate mockup with mask mode
      const startTime = Date.now()
      const mockupBuffer = await maskBasedGenerator.generate({
        templateId,
        designBuffer,
        config,
        outputFormat,
        outputQuality
      })
      const generationTime = Date.now() - startTime

      // Return image with appropriate content type
      const contentTypeMap = {
        png: 'image/png',
        jpeg: 'image/jpeg',
        webp: 'image/webp'
      }

      return new NextResponse(new Uint8Array(mockupBuffer), {
        status: 200,
        headers: {
          'Content-Type': contentTypeMap[outputFormat],
          'X-Generation-Time': `${generationTime}ms`,
          'X-Render-Mode': 'mask',
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      })

    } catch (error) {
      console.error('New mockup generation error:', error)
      return NextResponse.json(
        { 
          error: 'Failed to generate mockup',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }
  }

  // LEGACY SYSTEM: JSON-based with hardcoded products
  try {
    const { artworkDataUrl, productType } = await req.json()

    if (!artworkDataUrl) {
      return NextResponse.json({ error: 'No artwork provided' }, { status: 400 })
    }

    // Product configuration
    const productConfigs: Record<string, {
      mockupPath: string
      position: { x: number; y: number; width: number; height: number }
      brightness: number
      blendMode: string
    }> = {
      't-shirt-white': {
        mockupPath: 'public/mockups/mannequin-white-tilted.png',
        position: { x: 0.28, y: 0.30, width: 0.38, height: 0.24 },
        brightness: 0.94,
        blendMode: 'multiply'
      },
      't-shirt-white-model': {
        mockupPath: 'public/mockups/mannequin-white-model.jpg',
        position: { x: 0.30, y: 0.35, width: 0.40, height: 0.30 },
        brightness: 0.94,
        blendMode: 'multiply'
      },
      't-shirt': {
        mockupPath: 'public/mockups/mannequin-black.png',
        position: { x: 0.3, y: 0.32, width: 0.4, height: 0.25 },
        brightness: 0.92,
        blendMode: 'multiply'
      },
      't-shirt-black': {
        mockupPath: 'public/mockups/mannequin-black.png',
        position: { x: 0.3, y: 0.32, width: 0.4, height: 0.25 },
        brightness: 0.92,
        blendMode: 'multiply'
      },
      't-shirt-blue': {
        mockupPath: 'public/mockups/mannequin-blue.png',
        position: { x: 0.3, y: 0.32, width: 0.4, height: 0.25 },
        brightness: 0.92,
        blendMode: 'multiply'
      }
    }

    const config = productConfigs[productType] || productConfigs['t-shirt']

    // Convert base64 to buffer
    const base64Data = artworkDataUrl.replace(/^data:image\/\w+;base64,/, '')
    const artworkBuffer = Buffer.from(base64Data, 'base64')

    // Standard compositing (mask-based)
    console.log('Using standard Sharp compositing')
    
    // Load mockup image
    const mockupPath = path.join(process.cwd(), config.mockupPath)
    const mockupBuffer = await readFile(mockupPath)
    const mockup = sharp(mockupBuffer)
    const mockupMeta = await mockup.metadata()

    const canvasWidth = mockupMeta.width!
    const canvasHeight = mockupMeta.height!

    // Calculate artwork dimensions and position
    const artworkWidth = Math.floor(canvasWidth * config.position.width)
    const artworkHeight = Math.floor(canvasHeight * config.position.height)
    const artworkX = Math.floor(canvasWidth * config.position.x)
    const artworkY = Math.floor(canvasHeight * config.position.y)

    // Process artwork: resize and adjust brightness for fabric absorption
    let processedArtwork = sharp(artworkBuffer)
      .resize(artworkWidth, artworkHeight, {
        fit: 'fill',
        kernel: sharp.kernel.lanczos3 // High-quality resampling
      })
      .modulate({
        brightness: config.brightness
      })

    // Add subtle shadow for depth
    const artworkWithShadow = await processedArtwork
      .extend({
        top: 3,
        bottom: 3,
        left: 3,
        right: 3,
        background: { r: 0, g: 0, b: 0, alpha: 0.15 }
      })
      .blur(2)
      .toBuffer()

    // Composite artwork onto mockup with multiply blend mode
    const result = await mockup
      .composite([
        {
          input: artworkWithShadow,
          top: artworkY - 3,
          left: artworkX - 3,
          blend: config.blendMode as any
        }
      ])
      .png({ quality: 100 })
      .toBuffer()

    return new NextResponse(new Uint8Array(result), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })

  } catch (error) {
    console.error('Mockup generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate mockup', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/generate-mockup?action=templates
 * 
 * List available templates and preview them
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    if (action === 'templates') {
      const forceReload = searchParams.get('reload') === 'true'
      const library = await templateManager.loadLibrary(forceReload)
      return NextResponse.json({
        templates: library.templates,
        version: library.version,
        lastUpdated: library.lastUpdated
      })
    }

    if (action === 'stats') {
      const stats = await templateManager.getStats()
      return NextResponse.json(stats)
    }

    if (action === 'clear-cache') {
      templateManager.clearCache()
      return NextResponse.json({ success: true, message: 'Template cache cleared' })
    }

    if (action === 'preview') {
      const templateId = searchParams.get('templateId')
      if (!templateId) {
        return NextResponse.json(
          { error: 'Template ID is required for preview' },
          { status: 400 }
        )
      }

      const previewBuffer = await maskBasedGenerator.previewTemplate(templateId)
      return new NextResponse(new Uint8Array(previewBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })
    }

    return NextResponse.json({
      message: 'Mockup generation API',
      endpoints: {
        'POST /api/generate-mockup (form-data)': 'Generate mockup with template system',
        'POST /api/generate-mockup (json)': 'Legacy mockup generation',
        'GET /api/generate-mockup?action=templates': 'List templates',
        'GET /api/generate-mockup?action=templates&reload=true': 'Reload template library',
        'GET /api/generate-mockup?action=stats': 'Get library stats',
        'GET /api/generate-mockup?action=clear-cache': 'Clear template cache',
        'GET /api/generate-mockup?action=preview&templateId=X': 'Preview template'
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { 
        error: 'API request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
