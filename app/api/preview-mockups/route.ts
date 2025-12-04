import { NextRequest, NextResponse } from 'next/server'

const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID
const PRINTIFY_API_URL = 'https://api.printify.com/v1'

// Preferred provider IDs in order of preference
const PREFERRED_PROVIDERS = [99, 69, 36] // Printify Choice, Prodigi, Print Pigeons

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface MockupResult {
  variantId: number
  size: string
  blueprintId: number
  mockups: {
    front?: string
    front2?: string
    closeUp?: string
    context1?: string
  }
}

interface VariantInfo {
  variantId: number
  providerId: number
  color?: string
}

interface AllVariantsInfo {
  providerId: number
  variants: VariantInfo[] // All color variants for the requested size
}

// Cache for variant lookups (blueprintId -> { providerId, sizeVariants: { size -> VariantInfo[] } })
const blueprintCache: Record<number, { 
  providerId: number
  sizeVariants: Record<string, VariantInfo[]>
}> = {}

/**
 * Get all variant IDs and provider ID for a specific blueprint and size
 * Returns all color variants for that size
 */
async function getAllVariantsForSize(blueprintId: number, size: string): Promise<AllVariantsInfo | null> {
  // Check cache first
  if (blueprintCache[blueprintId]?.sizeVariants[size]) {
    return {
      providerId: blueprintCache[blueprintId].providerId,
      variants: blueprintCache[blueprintId].sizeVariants[size]
    }
  }

  try {
    // Get print providers for this blueprint
    const providersResponse = await fetch(
      `${PRINTIFY_API_URL}/catalog/blueprints/${blueprintId}/print_providers.json`,
      { headers: { 'Authorization': `Bearer ${PRINTIFY_API_KEY}` } }
    )
    
    if (!providersResponse.ok) {
      console.error('[Preview Mockups] Failed to get providers for blueprint', blueprintId)
      return null
    }

    const providers = await providersResponse.json()
    
    // Find best provider - prefer ones in our list, otherwise use first available
    let provider = null
    for (const prefId of PREFERRED_PROVIDERS) {
      provider = providers.find((p: { id: number }) => p.id === prefId)
      if (provider) break
    }
    if (!provider) {
      provider = providers[0]
    }
    
    if (!provider) {
      console.error('[Preview Mockups] No providers found for blueprint', blueprintId)
      return null
    }

    console.log(`[Preview Mockups] Using provider ${provider.id} for blueprint ${blueprintId}`)

    // Get variants for this provider
    const variantsResponse = await fetch(
      `${PRINTIFY_API_URL}/catalog/blueprints/${blueprintId}/print_providers/${provider.id}/variants.json`,
      { headers: { 'Authorization': `Bearer ${PRINTIFY_API_KEY}` } }
    )

    if (!variantsResponse.ok) {
      console.error('[Preview Mockups] Failed to get variants')
      return null
    }

    const variantsData = await variantsResponse.json()
    const variants = variantsData.variants || []

    // Initialize cache for this blueprint
    if (!blueprintCache[blueprintId]) {
      blueprintCache[blueprintId] = {
        providerId: provider.id,
        sizeVariants: {}
      }
    }

    // Group variants by size, collecting all color variants
    for (const variant of variants) {
      const title = variant.title || ''
      let variantSize: string | null = null
      
      // Parse size from title (e.g., "18" x 24"" or "18×24")
      const sizeMatch = title.match(/(\d+)["″]?\s*[x×]\s*(\d+)["″]?/i)
      if (sizeMatch) {
        variantSize = `${sizeMatch[1]}x${sizeMatch[2]}`
      } else {
        // Try to parse single dimension sizes (e.g., "10"" for clocks/round items)
        const singleSizeMatch = title.match(/(\d+)["″](?:\s|$)/i)
        if (singleSizeMatch) {
          variantSize = `${singleSizeMatch[1]}x${singleSizeMatch[1]}`
        }
      }
      
      if (variantSize) {
        // Extract color from options or title
        const color = variant.options?.color || 
                      (title.includes('Black') ? 'Black' : 
                       title.includes('White') ? 'White' : 
                       title.includes('Walnut') ? 'Walnut' : undefined)
        
        const variantInfo: VariantInfo = {
          variantId: variant.id,
          providerId: provider.id,
          color
        }
        
        // Add to main size
        if (!blueprintCache[blueprintId].sizeVariants[variantSize]) {
          blueprintCache[blueprintId].sizeVariants[variantSize] = []
        }
        blueprintCache[blueprintId].sizeVariants[variantSize].push(variantInfo)
        
        // Also add to reverse orientation if not already there
        const reverseSize = variantSize.split('x').reverse().join('x')
        if (reverseSize !== variantSize) {
          if (!blueprintCache[blueprintId].sizeVariants[reverseSize]) {
            blueprintCache[blueprintId].sizeVariants[reverseSize] = []
          }
          // Only add if this variant isn't already in the reverse size
          const existing = blueprintCache[blueprintId].sizeVariants[reverseSize]
          if (!existing.find(v => v.variantId === variant.id)) {
            blueprintCache[blueprintId].sizeVariants[reverseSize].push(variantInfo)
          }
        }
      } else {
        console.log(`[Preview Mockups] Could not parse size from variant: "${title}"`)
      }
    }

    const sizes = Object.keys(blueprintCache[blueprintId].sizeVariants)
    console.log(`[Preview Mockups] Cached ${sizes.length} sizes for blueprint ${blueprintId}`)
    
    const sizeVariants = blueprintCache[blueprintId].sizeVariants[size]
    if (!sizeVariants || sizeVariants.length === 0) {
      console.log(`[Preview Mockups] Size "${size}" not found. Available: ${sizes.join(', ')}`)
      return null
    }
    
    console.log(`[Preview Mockups] Found ${sizeVariants.length} variants for size "${size}":`, 
      sizeVariants.map(v => `${v.variantId}${v.color ? ` (${v.color})` : ''}`).join(', '))
    
    return {
      providerId: provider.id,
      variants: sizeVariants
    }
  } catch (error) {
    console.error('[Preview Mockups] Error fetching variants:', error)
    return null
  }
}

/**
 * POST /api/preview-mockups
 * 
 * Creates a temporary Printify product to generate mockups, then deletes it.
 * Returns mockup URLs for the specified product/size, including all color variants.
 * 
 * Body: { designUrl: string, blueprintId: number, size: string }
 */
export async function POST(req: NextRequest) {
  if (!PRINTIFY_API_KEY || !PRINTIFY_SHOP_ID) {
    return NextResponse.json(
      { error: 'Printify not configured' },
      { status: 500 }
    )
  }

  try {
    const body = await req.json()
    const { designUrl, blueprintId, size } = body

    if (!designUrl) {
      return NextResponse.json(
        { error: 'designUrl is required' },
        { status: 400 }
      )
    }

    if (!blueprintId || !size) {
      return NextResponse.json(
        { error: 'blueprintId and size are required' },
        { status: 400 }
      )
    }

    console.log(`[Preview Mockups] Generating mockup for blueprint ${blueprintId}, size ${size}`)

    // Get ALL variants for this blueprint/size combination (all colors)
    const allVariantsInfo = await getAllVariantsForSize(blueprintId, size)
    if (!allVariantsInfo) {
      return NextResponse.json(
        { error: `No variant found for blueprint ${blueprintId} size ${size}` },
        { status: 400 }
      )
    }

    const { providerId, variants } = allVariantsInfo
    const variantIds = variants.map(v => v.variantId)
    console.log(`[Preview Mockups] Using ${variants.length} variants: ${variantIds.join(', ')}, provider ID: ${providerId}`)

    // Step 1: Upload the design image to Printify
    console.log('[Preview Mockups] Uploading design to Printify...')
    const uploadResponse = await fetch(`${PRINTIFY_API_URL}/uploads/images.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_name: `preview-${Date.now()}.png`,
        url: designUrl,
      }),
    })

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text()
      console.error('[Preview Mockups] Upload failed:', error)
      return NextResponse.json(
        { error: 'Failed to upload design to Printify' },
        { status: 500 }
      )
    }

    const uploadResult = await uploadResponse.json()
    const imageId = uploadResult.id
    console.log('[Preview Mockups] Image uploaded:', imageId)

    // Step 2: Create a temporary product with ALL color variants for this size
    console.log('[Preview Mockups] Creating temporary product with all color variants...')
    
    const productResponse = await fetch(`${PRINTIFY_API_URL}/shops/${PRINTIFY_SHOP_ID}/products.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `TEMP_PREVIEW_${blueprintId}_${size}_${Date.now()}`,
        description: 'Temporary product for mockup preview - auto-delete',
        blueprint_id: blueprintId,
        print_provider_id: providerId,
        variants: variants.map(v => ({
          id: v.variantId,
          price: 100,
          is_enabled: true,
        })),
        print_areas: [{
          variant_ids: variantIds,
          placeholders: [{
            position: 'front',
            images: [{
              id: imageId,
              x: 0.5,
              y: 0.5,
              scale: 1,
              angle: 0,
            }],
          }],
        }],
      }),
    })

    if (!productResponse.ok) {
      const error = await productResponse.text()
      console.error('[Preview Mockups] Product creation failed:', error)
      return NextResponse.json(
        { error: 'Failed to create preview product' },
        { status: 500 }
      )
    }

    const product = await productResponse.json()
    const productId = product.id
    console.log('[Preview Mockups] Product created:', productId)

    // Step 3: Wait a moment for mockups to generate
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Step 4: Fetch the product to get mockup images
    console.log('[Preview Mockups] Fetching mockups...')
    
    const fetchResponse = await fetch(
      `${PRINTIFY_API_URL}/shops/${PRINTIFY_SHOP_ID}/products/${productId}.json`,
      {
        headers: { 'Authorization': `Bearer ${PRINTIFY_API_KEY}` },
      }
    )

    if (!fetchResponse.ok) {
      console.error('[Preview Mockups] Failed to fetch product')
    }

    const fetchedProduct = await fetchResponse.json()
    const images = fetchedProduct.images || []
    
    console.log('[Preview Mockups] Got', images.length, 'mockup images')

    // Step 5: Organize mockups by variant and camera angle
    // Map variant IDs to their colors for organization
    const variantColorMap: Record<number, string | undefined> = {}
    for (const v of variants) {
      variantColorMap[v.variantId] = v.color
    }

    // Group images by variant
    const mockupsByVariant: Record<number, MockupResult['mockups']> = {}
    const primaryMockups: MockupResult['mockups'] = {}
    
    for (const img of images) {
      const variantId = img.variant_ids?.[0] || variants[0].variantId
      
      if (!mockupsByVariant[variantId]) {
        mockupsByVariant[variantId] = {}
      }
      
      // Extract camera label from URL
      try {
        const url = new URL(img.src)
        const cameraLabel = url.searchParams.get('camera_label') || 'front'
        
        switch (cameraLabel) {
          case 'front':
            mockupsByVariant[variantId].front = img.src
            if (!primaryMockups.front) primaryMockups.front = img.src
            break
          case 'front-2':
            mockupsByVariant[variantId].front2 = img.src
            if (!primaryMockups.front2) primaryMockups.front2 = img.src
            break
          case 'close-up':
            mockupsByVariant[variantId].closeUp = img.src
            if (!primaryMockups.closeUp) primaryMockups.closeUp = img.src
            break
          case 'context-1':
            mockupsByVariant[variantId].context1 = img.src
            if (!primaryMockups.context1) primaryMockups.context1 = img.src
            break
        }
      } catch {
        // If URL parsing fails, just use front
        if (!mockupsByVariant[variantId].front) {
          mockupsByVariant[variantId].front = img.src
        }
        if (!primaryMockups.front) {
          primaryMockups.front = img.src
        }
      }
    }

    // Build result with all color variants
    const colorVariants: Array<{
      variantId: number
      color?: string
      mockups: MockupResult['mockups']
    }> = []

    for (const v of variants) {
      const variantMockups = mockupsByVariant[v.variantId]
      if (variantMockups && Object.keys(variantMockups).length > 0) {
        colorVariants.push({
          variantId: v.variantId,
          color: v.color,
          mockups: variantMockups,
        })
      }
    }

    const result: MockupResult = {
      variantId: variants[0].variantId,
      size,
      blueprintId,
      mockups: primaryMockups,
    }

    // Step 6: Delete the temporary product (don't wait for it)
    console.log('[Preview Mockups] Deleting temporary product...')
    fetch(`${PRINTIFY_API_URL}/shops/${PRINTIFY_SHOP_ID}/products/${productId}.json`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${PRINTIFY_API_KEY}` },
    }).catch(err => console.error('[Preview Mockups] Delete failed:', err))

    // Also archive the uploaded image to keep things clean
    fetch(`${PRINTIFY_API_URL}/uploads/${imageId}/archive.json`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${PRINTIFY_API_KEY}` },
    }).catch(err => console.error('[Preview Mockups] Archive failed:', err))

    // Log what we got
    const cameras = Object.keys(primaryMockups).join(', ')
    console.log(`[Preview Mockups] Returning mockup for ${size} with cameras: ${cameras}`)
    console.log(`[Preview Mockups] Total color variants: ${colorVariants.length}`)

    return NextResponse.json({
      success: true,
      mockup: result,
      colorVariants, // All color variants with their mockups
      productId, // For debugging
    })

  } catch (error) {
    console.error('[Preview Mockups] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate mockups',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
