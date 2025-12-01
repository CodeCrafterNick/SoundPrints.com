import { NextRequest, NextResponse } from 'next/server'

/**
 * Product key to Printify mapping for wall art
 * Using dynamic blueprint/variant lookup from Printify catalog
 * Will be validated against actual catalog at runtime
 */
const printifyProducts: Record<string, { blueprintId: number; variantId?: number; printProviderId?: number }> = {
  // Canvas prints - using blueprint 937 (Matte Canvas, Stretched, 0.75")
  'canvas-12x18': { blueprintId: 937 },
  'canvas-16x20': { blueprintId: 937 },
  'canvas-18x24': { blueprintId: 937 },
  'canvas-24x36': { blueprintId: 937 },
  
  // Framed canvas - using blueprint 944 (Matte Canvas, Framed)
  'framed-canvas-12x18': { blueprintId: 944 },
  'framed-canvas-16x20': { blueprintId: 944 },
  'framed-canvas-18x24': { blueprintId: 944 },
  'framed-canvas-24x36': { blueprintId: 944 },
  
  // Posters - using blueprint 282 (Matte Vertical Posters) or 284 (Matte Horizontal Posters)
  'poster-12x18': { blueprintId: 282 },
  'poster-16x20': { blueprintId: 282 },
  'poster-18x24': { blueprintId: 282 },
  'poster-24x36': { blueprintId: 282 },
  
  // Framed posters - using blueprint 540 (Framed Vertical Poster) or 541 (Framed Horizontal Poster)
  'framed-poster-12x18': { blueprintId: 540 },
  'framed-poster-16x20': { blueprintId: 540 },
  'framed-poster-18x24': { blueprintId: 540 },
  'framed-poster-24x36': { blueprintId: 540 },
}

/**
 * Printify Mockup Generator API integration
 * Generates professional product mockups using Printify's service
 */
export async function POST(req: NextRequest) {
  console.log('=== Printify Mockup API Called ===')
  try {
    const contentType = req.headers.get('content-type') || ''
    console.log('Content-Type:', contentType)
    
    let blueprintId: number
    let variantId: number | undefined
    let printProviderId: number | undefined
    let artworkUrl: string | undefined
    let designBlob: Blob | undefined
    let productKey: string | undefined
    
    // Handle both FormData (from wall-art-preview) and JSON (legacy)
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      productKey = formData.get('productKey') as string
      const design = formData.get('design') as Blob
      
      console.log('Received productKey:', productKey)
      console.log('Available products:', Object.keys(printifyProducts))
      
      if (!productKey || !printifyProducts[productKey]) {
        return NextResponse.json({ 
          error: 'Invalid product key',
          productKey,
          availableProducts: Object.keys(printifyProducts)
        }, { status: 400 })
      }
      
      const product = printifyProducts[productKey]
      blueprintId = product.blueprintId
      variantId = product.variantId
      printProviderId = product.printProviderId
      designBlob = design
      
      console.log('Generating Printify mockup from FormData:', { productKey, blueprintId, variantId, printProviderId })
    } else {
      const body = await req.json()
      blueprintId = body.blueprintId
      variantId = body.variantId
      printProviderId = body.printProviderId
      artworkUrl = body.artworkUrl
      
      console.log('Generating Printify mockup from JSON:', { blueprintId, variantId, printProviderId, artworkUrl })
    }

    // Printify API credentials
    const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY
    const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID

    if (!PRINTIFY_API_KEY || !PRINTIFY_SHOP_ID) {
      return NextResponse.json({ error: 'Printify API credentials not configured' }, { status: 500 })
    }

    // First, list all accessible shops to find the correct shop ID
    console.log('Listing all accessible shops...')
    const shopsListResponse = await fetch(`https://api.printify.com/v1/shops.json`, {
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`
      }
    })
    
    if (!shopsListResponse.ok) {
      console.error('Failed to list shops:', {
        status: shopsListResponse.status,
        statusText: shopsListResponse.statusText
      })
      return NextResponse.json({ 
        error: 'Failed to access Printify shops',
        details: 'Cannot list shops with provided API key'
      }, { status: 500 })
    }
    
    const shops = await shopsListResponse.json()
    console.log('Available shops:', shops)
    
    if (!shops || shops.length === 0) {
      return NextResponse.json({ 
        error: 'No Printify shops found',
        details: 'API key has no accessible shops'
      }, { status: 500 })
    }
    
    // Use the first available shop
    const actualShopId = shops[0].id
    console.log('Using shop:', { id: actualShopId, title: shops[0].title })

    // Check if this blueprint exists in the catalog and get print providers
    console.log(`Checking blueprint ${blueprintId} in catalog...`)
    const catalogResponse = await fetch(`https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers.json`, {
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`
      }
    })
    
    if (!catalogResponse.ok) {
      console.error(`Blueprint ${blueprintId} print providers not found`)
      return NextResponse.json({ 
        error: `Blueprint ${blueprintId} does not exist or has no print providers`,
        details: 'Invalid blueprint ID or no print providers available'
      }, { status: 500 })
    }
    
    const printProviders = await catalogResponse.json()
    console.log('Available print providers:', printProviders?.map((pp: any) => ({ id: pp.id, title: pp.title })))
    
    // Use the first available print provider if none specified
    if (!printProviderId && printProviders?.length > 0) {
      const firstProvider = printProviders[0]
      printProviderId = firstProvider.id
      console.log(`Using default print provider: ${printProviderId} (${firstProvider.title})`)
    }
    
    // Check if our print provider supports this blueprint
    const provider = printProviders?.find((pp: any) => pp.id === printProviderId)
    if (!provider) {
      console.error(`Print provider ${printProviderId} not available for blueprint ${blueprintId}`)
      console.log('Available providers:', printProviders?.map((pp: any) => pp.id))
      // Use the first available print provider instead
      const firstProvider = printProviders?.[0]
      if (firstProvider) {
        console.log(`Using alternative print provider: ${firstProvider.id} (${firstProvider.title})`)
        printProviderId = firstProvider.id
      } else {
        return NextResponse.json({ 
          error: 'No print providers available for this blueprint',
          details: `Blueprint ${blueprintId} has no print providers`
        }, { status: 500 })
      }
    }
    
    // Now fetch variants for this specific print provider
    console.log(`Fetching variants for print provider ${printProviderId}...`)
    const variantsResponse = await fetch(
      `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/variants.json`,
      {
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_KEY}`
        }
      }
    )
    
    if (!variantsResponse.ok) {
      console.error(`Failed to fetch variants for provider ${printProviderId}`)
      return NextResponse.json({ 
        error: `Failed to fetch variants for print provider ${printProviderId}`,
        details: 'Could not retrieve variant information'
      }, { status: 500 })
    }
    
    const variantsData = await variantsResponse.json()
    const variants = Array.isArray(variantsData) ? variantsData : variantsData.variants || []
    console.log(`Found ${variants.length} variants for provider ${printProviderId}`)
    
    // Find matching variant based on size
    // Size format from productKey like "canvas-18x24" -> look for variant with "18" x "24"
    const sizeMatch = productKey?.match(/(\d+)x(\d+)/)
    let selectedVariant = null
    
    if (sizeMatch && variants.length > 0) {
      const [, width, height] = sizeMatch
      console.log(`Looking for variant matching size ${width}x${height}`)
      
      // Try to find variant matching the size
      // Variant titles like "18″ x 24″ (Vertical) / 0.75''" or "12″ x 18″ (Vertical) / 0.75''"
      selectedVariant = variants.find((v: any) => {
        const variantTitle = v.title?.toLowerCase() || ''
        const variantOptions = JSON.stringify(v.options || {}).toLowerCase()
        // Match both title and options for size
        return (variantTitle.includes(`${width}`) && variantTitle.includes(`${height}`)) ||
               (variantOptions.includes(`${width}`) && variantOptions.includes(`${height}`))
      })
      
      if (selectedVariant) {
        console.log(`✅ Found matching variant: ${selectedVariant.title}`)
      } else {
        console.log('⚠️  No exact size match found, available variants:')
        variants.slice(0, 5).forEach((v: any) => {
          console.log(`  - ${v.title}`)
        })
        selectedVariant = variants[0]
        console.log(`Using first available variant: ${selectedVariant.title}`)
      }
    } else if (variants.length > 0) {
      selectedVariant = variants[0]
      console.log(`No size specified, using first variant: ${selectedVariant.title}`)
    }
    
    if (!selectedVariant) {
      console.error('No variants found for this print provider')
      return NextResponse.json({ 
        error: 'No variants available',
        details: `Print provider ${printProviderId} has no variants`
      }, { status: 500 })
    }
    
    variantId = selectedVariant.id
    console.log(`Using variant: ${variantId} (${selectedVariant.title})`)

    let imageId: string

    // Upload artwork to Printify
    if (designBlob) {
      // Printify requires base64 encoded content in 'contents' field (not 'url')
      const arrayBuffer = await designBlob.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      
      console.log('Uploading image to Printify, size:', arrayBuffer.byteLength, 'bytes')
      
      const uploadResponse = await fetch(`https://api.printify.com/v1/uploads/images.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file_name: 'waveform-artwork.png',
          contents: base64
        })
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        let errorDetails
        try {
          errorDetails = JSON.parse(errorText)
        } catch {
          errorDetails = errorText
        }
        console.error('Printify upload failed:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          error: errorDetails
        })
        return NextResponse.json({ 
          error: 'Failed to upload artwork to Printify',
          details: errorDetails 
        }, { status: 500 })
      }

      const uploadData = await uploadResponse.json()
      imageId = uploadData.id
      console.log('Artwork uploaded to Printify (from blob):', imageId)
    } else if (artworkUrl) {
      const uploadResponse = await fetch(`https://api.printify.com/v1/uploads/images.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file_name: 'waveform-artwork.png',
          url: artworkUrl
        })
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        let errorDetails
        try {
          errorDetails = JSON.parse(errorText)
        } catch {
          errorDetails = errorText
        }
        console.error('Printify upload failed:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          error: errorDetails
        })
        return NextResponse.json({ 
          error: 'Failed to upload artwork to Printify',
          details: errorDetails 
        }, { status: 500 })
      }

      const uploadData = await uploadResponse.json()
      imageId = uploadData.id
      console.log('Artwork uploaded to Printify (from URL):', imageId)
    } else {
      return NextResponse.json({ error: 'No artwork provided' }, { status: 400 })
    }

    // Create a temporary product to generate mockup
    // For canvas/posters, use 'front' position (Printify's standard for wall art)
    // For apparel/drinkware, also use 'front' position
    const printPosition = 'front'
    
    console.log('Creating product:', { blueprintId, printProviderId, variantId, imageId, printPosition })
    console.log('Shop ID:', actualShopId)
    console.log('Full product endpoint:', `https://api.printify.com/v1/shops/${actualShopId}/products.json`)
    
    const productResponse = await fetch(`https://api.printify.com/v1/shops/${actualShopId}/products.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Temp Mockup Product',
        description: 'Temporary product for mockup generation',
        blueprint_id: blueprintId,
        print_provider_id: printProviderId,
        variants: [
          {
            id: variantId,
            price: 2000,
            is_enabled: true
          }
        ],
        print_areas: [
          {
            variant_ids: [variantId],
            placeholders: [
              {
                position: printPosition,
                images: [
                  {
                    id: imageId,
                    x: 0.5,
                    y: 0.5,
                    scale: 1,
                    angle: 0
                  }
                ]
              }
            ]
          }
        ]
      })
    })

    if (!productResponse.ok) {
      const errorText = await productResponse.text()
      let errorDetails
      try {
        errorDetails = JSON.parse(errorText)
      } catch {
        errorDetails = errorText
      }
      console.error('Printify product creation failed:', {
        status: productResponse.status,
        statusText: productResponse.statusText,
        error: errorDetails,
        request: {
          blueprintId,
          printProviderId,
          variantId,
          imageId
        }
      })
      return NextResponse.json({ 
        error: 'Failed to create Printify product',
        details: errorDetails,
        status: productResponse.status
      }, { status: 500 })
    }

    const productData = await productResponse.json()
    const productId = productData.id

    console.log('Product created:', productId)

    // Request mockup generation for all available views
    const mockupGenerateResponse = await fetch(
      `https://api.printify.com/v1/shops/${actualShopId}/products/${productId}/mockups.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_KEY}`
        }
      }
    )

    if (mockupGenerateResponse.ok) {
      console.log('Mockup generation triggered')
      // Wait a bit for mockups to generate
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    // Get mockup images
    const mockupResponse = await fetch(
      `https://api.printify.com/v1/shops/${actualShopId}/products/${productId}.json`,
      {
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_KEY}`
        }
      }
    )

    if (!mockupResponse.ok) {
      const error = await mockupResponse.text()
      console.error('Printify mockup fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch mockup' }, { status: 500 })
    }

    const mockupData = await mockupResponse.json()
    
    // Log the full product data to see what Printify returns
    console.log('Full Printify product data:', JSON.stringify(mockupData, null, 2))
    
    // Extract all available mockup images - return ALL views for user selection
    const mockupImages = mockupData.images || []
    
    console.log('All mockup views available:', mockupImages.length)

    // Clean up - delete the temporary product
    await fetch(`https://api.printify.com/v1/shops/${actualShopId}/products/${productId}.json`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`
      }
    })

    console.log('All mockup views available:', mockupImages.length)
    console.log('Mockup URLs:', mockupImages.map((img: any) => ({ 
      src: img.src, 
      variant: img.variant_ids, 
      position: img.position,
      is_default: img.is_default,
      camera_label: img.src.match(/camera_label=([^&]+)/)?.[1] || 'default'
    })))

    // DON'T delete the product immediately - keep it for model mockups
    // Store productId so it can be deleted later (after order or session end)
    // Clean up can be done via a separate endpoint or cron job

    return NextResponse.json({
      mockupUrl: mockupImages[0]?.src, // Keep for backwards compatibility
      mockupUrls: mockupImages.map((img: any) => ({
        src: img.src,
        variantIds: img.variant_ids,
        position: img.position,
        isDefault: img.is_default,
        isPrintProvider: img.is_printify_mockup,
        cameraLabel: img.src.match(/camera_label=([^&]+)/)?.[1] || 'default'
      })),
      productId, // Return product ID for potential cleanup later
      productDetails: mockupData
    })

  } catch (error) {
    console.error('=== Printify mockup error ===')
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: 'Failed to generate Printify mockup', 
        details: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    )
  }
}

/**
 * Get list of available Printify products
 */
export async function GET(req: NextRequest) {
  try {
    const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY

    const catalogResponse = await fetch('https://api.printify.com/v1/catalog/blueprints.json', {
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`
      }
    })

    const catalog = await catalogResponse.json()

    // Filter for relevant products
    const products = catalog.filter((item: any) => 
      ['t-shirt', 'mug', 'hoodie', 'canvas', 'poster'].some(type => 
        item.title.toLowerCase().includes(type)
      )
    )

    return NextResponse.json({ products })

  } catch (error) {
    console.error('Printify catalog error:', error)
    return NextResponse.json({ error: 'Failed to fetch Printify catalog' }, { status: 500 })
  }
}
