import { NextRequest, NextResponse } from 'next/server'

/**
 * Smartmockups API integration for realistic model mockups
 * https://smartmockups.com/api
 * Requires subscription ($29/month minimum)
 */
export async function POST(req: NextRequest) {
  try {
    const { artworkUrl, productType } = await req.json()

    const SMARTMOCKUPS_KEY = process.env.SMARTMOCKUPS_API_KEY

    if (!SMARTMOCKUPS_KEY) {
      return NextResponse.json({ error: 'Smartmockups API key not configured' }, { status: 500 })
    }

    // Smartmockups mockup IDs for different products
    // Browse available mockups at: https://smartmockups.com/mockups
    const mockupIds: Record<string, string> = {
      't-shirt': 'apparel/t-shirts/bella-canvas-white-model', // Example ID
      't-shirt-white': 'apparel/t-shirts/bella-canvas-white-model',
      't-shirt-white-model': 'apparel/t-shirts/bella-canvas-white-model',
      't-shirt-black': 'apparel/t-shirts/bella-canvas-black-model',
      'hoodie': 'apparel/hoodies/pullover-white-model',
      'mug': 'print/mugs/white-mug-lifestyle',
    }

    const mockupId = mockupIds[productType] || mockupIds['t-shirt-white']

    console.log('Generating Smartmockups mockup:', { mockupId, artworkUrl })

    // Generate mockup using Smartmockups API
    const response = await fetch('https://api.smartmockups.com/mockups', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SMARTMOCKUPS_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mockup_id: mockupId,
        inputs: {
          design: artworkUrl
        }
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Smartmockups error:', error)
      return NextResponse.json({ error: 'Failed to generate mockup' }, { status: 500 })
    }

    const data = await response.json()
    
    console.log('Smartmockups response:', data)

    return NextResponse.json({
      mockupUrl: data.url || data.image_url,
      mockupId: data.id,
      status: data.status
    })

  } catch (error) {
    console.error('Smartmockups error:', error)
    return NextResponse.json(
      { error: 'Failed to generate mockup', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
