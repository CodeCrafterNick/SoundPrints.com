import { NextRequest, NextResponse } from 'next/server'
import { printifyClient } from '@/lib/printify-client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/printify/products
 * List all products in your Printify shop
 */
export async function GET(req: NextRequest) {
  try {
    const products = await printifyClient.getProducts()
    return NextResponse.json({ products })
  } catch (error) {
    console.error('[Printify Products] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/printify/products
 * Create a new product in Printify with automatic variant discovery
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, description, blueprintId, imageUrl, tags, visible = false } = body

    if (!title || !description || !blueprintId || !imageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, blueprintId, imageUrl' },
        { status: 400 }
      )
    }

    console.log(`[Printify] Creating product: ${title}`)
    console.log(`[Printify] Blueprint ID: ${blueprintId}`)

    // Get print providers for this blueprint
    let providers
    try {
      providers = await printifyClient.getPrintProviders(blueprintId)
      console.log(`[Printify] Got ${providers?.length || 0} providers`)
    } catch (error: any) {
      console.error('[Printify] Error fetching providers:', error.message)
      return NextResponse.json(
        { error: `Failed to get print providers: ${error.message}` },
        { status: 500 }
      )
    }

    if (!providers || providers.length === 0) {
      return NextResponse.json(
        { error: `No print providers available for blueprint ${blueprintId}` },
        { status: 400 }
      )
    }

    // Use the first available print provider
    const printProvider = providers[0]
    console.log(`[Printify] Using print provider: ${printProvider.title} (ID: ${printProvider.id})`)

    // Get available variants for this blueprint/provider combo
    let variantsData
    try {
      variantsData = await printifyClient.getBlueprint(blueprintId, printProvider.id)
      console.log(`[Printify] Got variants data:`, JSON.stringify(variantsData).substring(0, 200))
    } catch (error: any) {
      console.error('[Printify] Error fetching variants:', error.message)
      return NextResponse.json(
        { error: `Failed to get variants: ${error.message}` },
        { status: 500 }
      )
    }

    const variants = variantsData.variants || []

    if (variants.length === 0) {
      return NextResponse.json(
        { error: 'No variants available for this product' },
        { status: 400 }
      )
    }

    console.log(`[Printify] Found ${variants.length} variants`)

    // Upload the design image first
    let uploadedImage
    try {
      uploadedImage = await printifyClient.uploadImage(
        imageUrl,
        `${title.replace(/\s+/g, '-').toLowerCase()}.png`
      )
      console.log(`[Printify] Uploaded image ID: ${uploadedImage.id}`)
    } catch (error: any) {
      console.error('[Printify] Error uploading image:', error.message)
      return NextResponse.json(
        { error: `Failed to upload image: ${error.message}` },
        { status: 500 }
      )
    }

    // Configure variants with pricing (50% markup)
    const variantConfigs = variants.map((variant: any) => ({
      id: variant.id,
      price: Math.round(variant.price * 1.5), // 50% markup
      is_enabled: true
    }))

    // Determine print areas from placeholders
    const placeholders = variantsData.placeholders || []
    console.log(`[Printify] Found ${placeholders.length} placeholders`)

    const printAreas = placeholders.map((placeholder: any) => ({
      variant_ids: variants.map((v: any) => v.id),
      placeholders: [{
        position: placeholder.position,
        images: [{
          id: uploadedImage.id,
          x: 0.5,
          y: 0.5,
          scale: 1,
          angle: 0
        }]
      }]
    }))

    // Create the product
    let product
    try {
      product = await printifyClient.createProduct({
        title,
        description,
        blueprint_id: blueprintId,
        print_provider_id: printProvider.id,
        variants: variantConfigs,
        print_areas: printAreas
      })
      console.log(`[Printify] Product created successfully! ID: ${product.id}`)
    } catch (error: any) {
      console.error('[Printify] Error creating product:', error.message)
      return NextResponse.json(
        { error: `Failed to create product: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      product,
      uploadedImage,
      printProvider: {
        id: printProvider.id,
        title: printProvider.title
      },
      variantsCount: variantConfigs.length
    })
  } catch (error) {
    console.error('[Printify Create Product] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    )
  }
}
