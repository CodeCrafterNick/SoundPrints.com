import { NextResponse } from 'next/server'

export async function GET() {
  const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY

  try {
    // Get all blueprints
    const response = await fetch(`https://api.printify.com/v1/catalog/blueprints.json`, {
      headers: {
        'Authorization': `Bearer ${PRINTIFY_API_KEY}`
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch catalog' }, { status: 500 })
    }

    const blueprints = await response.json()
    
    // Filter for canvas-related blueprints
    const canvasBlueprints = blueprints.filter((bp: any) => 
      bp.title?.toLowerCase().includes('canvas') ||
      bp.title?.toLowerCase().includes('poster')
    )

    return NextResponse.json({ 
      total: blueprints.length,
      canvasBlueprints: canvasBlueprints.map((bp: any) => ({
        id: bp.id,
        title: bp.title,
        description: bp.description
      }))
    })
  } catch (error) {
    console.error('Error fetching catalog:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
