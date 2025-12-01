import { NextResponse } from 'next/server'

/**
 * Test endpoint to check print providers for blueprint 937 (canvas)
 */
export async function GET() {
  try {
    const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY
    
    if (!PRINTIFY_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const blueprintId = 937 // Matte Canvas, Stretched, 0.75"
    const printProviderId = 105 // Jondo (from previous test)
    
    console.log(`Fetching variants for blueprint ${blueprintId}, provider ${printProviderId}...`)
    
    // Try to get variants for a specific print provider
    const response = await fetch(
      `https://api.printify.com/v1/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/variants.json`,
      {
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_KEY}`
        }
      }
    )
    
    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ 
        error: 'Failed to fetch print providers',
        status: response.status,
        details: errorText
      }, { status: 500 })
    }
    
    const variants = await response.json()
    
    // Format variants for easy reading
    const formatted = (Array.isArray(variants) ? variants : variants.variants || []).map((v: any) => ({
      id: v.id,
      title: v.title,
      options: v.options
    }))
    
    return NextResponse.json({
      blueprintId,
      printProviderId,
      totalVariants: formatted.length,
      variants: formatted
    }, { status: 200 })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
