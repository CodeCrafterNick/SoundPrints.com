import { NextRequest, NextResponse } from 'next/server'
import { printifyClient } from '@/lib/printify-client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/printify/catalog
 * Get Printify catalog information (blueprints and print providers)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'blueprints' or 'providers'

    if (type === 'blueprints') {
      const blueprints = await printifyClient.getBlueprints()
      return NextResponse.json({ blueprints })
    }

    if (type === 'providers') {
      const providers = await printifyClient.getPrintProviders()
      return NextResponse.json({ providers })
    }

    // Get both
    const [blueprints, providers] = await Promise.all([
      printifyClient.getBlueprints(),
      printifyClient.getPrintProviders(),
    ])

    return NextResponse.json({ blueprints, providers })
  } catch (error) {
    console.error('[Printify Catalog] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch catalog' },
      { status: 500 }
    )
  }
}
