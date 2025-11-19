import { NextRequest, NextResponse } from 'next/server'
import { useCartStore } from '@/lib/stores/cart-store'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/cart
 * 
 * Get cart contents (for server-side operations)
 */
export async function GET(req: NextRequest) {
  try {
    // Since cart is client-side, this endpoint returns empty
    // Real cart data comes from zustand store on client
    return NextResponse.json({
      items: [],
      total: 0,
      message: 'Cart is stored client-side. Use cart store on client.'
    })
  } catch (error) {
    console.error('[Cart API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get cart' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cart/validate
 * 
 * Validate cart items and calculate totals
 */
export async function POST(req: NextRequest) {
  try {
    const { items } = await req.json()

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid cart items' },
        { status: 400 }
      )
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.08 // 8% tax
    const shipping = subtotal > 50 ? 0 : 5.99
    const total = subtotal + tax + shipping

    return NextResponse.json({
      valid: true,
      itemCount: items.length,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2)
    })

  } catch (error) {
    console.error('[Cart Validate] Error:', error)
    return NextResponse.json(
      { error: 'Failed to validate cart' },
      { status: 500 }
    )
  }
}
