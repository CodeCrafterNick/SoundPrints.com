import { NextRequest, NextResponse } from 'next/server'

/**
 * Printify Mockup Generator API integration
 * Generates professional product mockups using Printify's service
 */
export async function POST(req: NextRequest) {
  try {
    const { artworkUrl, blueprintId, variantId, printProviderId } = await req.json()

    // Printify API credentials
    const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY
    const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID

    if (!PRINTIFY_API_KEY || !PRINTIFY_SHOP_ID) {
      return NextResponse.json({ error: 'Printify API credentials not configured' }, { status: 500 })
    }

    console.log('Generating Printify mockup:', { blueprintId, variantId, printProviderId, artworkUrl })

    // Upload artwork to Printify
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
      const error = await uploadResponse.text()
      console.error('Printify upload error:', error)
      return NextResponse.json({ error: 'Failed to upload artwork to Printify' }, { status: 500 })
    }

    const uploadData = await uploadResponse.json()
    const imageId = uploadData.id

    console.log('Artwork uploaded to Printify:', imageId)

    // Create a temporary product to generate mockup
    const productResponse = await fetch(`https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products.json`, {
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
                position: 'front',
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
      const error = await productResponse.text()
      console.error('Printify product error:', error)
      return NextResponse.json({ error: 'Failed to create Printify product' }, { status: 500 })
    }

    const productData = await productResponse.json()
    const productId = productData.id

    console.log('Product created:', productId)

    // Request mockup generation for all available views
    const mockupGenerateResponse = await fetch(
      `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products/${productId}/mockups.json`,
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
      `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products/${productId}.json`,
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
    
    // Extract all available mockup images (flat product, on model, etc.)
    const mockupImages = mockupData.images || []

    // Clean up - delete the temporary product
    await fetch(`https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products/${productId}.json`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`
      }
    })

    console.log('Mockups generated:', mockupImages.length, 'images')
    console.log('Mockup URLs:', mockupImages.map((img: any) => ({ 
      src: img.src, 
      variant: img.variant_ids, 
      position: img.position,
      is_default: img.is_default 
    })))

    // DON'T delete the product immediately - keep it for model mockups
    // Store productId so it can be deleted later (after order or session end)
    // Clean up can be done via a separate endpoint or cron job

    return NextResponse.json({
      mockupUrl: mockupImages[0]?.src, // Keep for backwards compatibility
      mockupImages: mockupImages.map((img: any) => ({
        src: img.src,
        variantIds: img.variant_ids,
        position: img.position,
        isDefault: img.is_default,
        isPrintProvider: img.is_printify_mockup
      })),
      productId, // Return product ID for potential cleanup later
      productDetails: mockupData
    })

  } catch (error) {
    console.error('Printify mockup error:', error)
    return NextResponse.json(
      { error: 'Failed to generate Printify mockup', details: error instanceof Error ? error.message : 'Unknown error' },
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
