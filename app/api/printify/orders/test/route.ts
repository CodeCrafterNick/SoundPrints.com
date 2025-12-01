import { NextRequest, NextResponse } from 'next/server'
import { printifyClient } from '@/lib/printify-client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/printify/orders/test
 * Create a TEST order (won't actually print or charge)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { productId, variantId, shippingAddress, printFileUrl } = body

    // Upload the print file
    const uploadedImage = await printifyClient.uploadImage(
      printFileUrl,
      `order-${Date.now()}.png`
    )

    console.log('[Printify Test Order] Image uploaded:', uploadedImage.id)

    // Create TEST order (is_printify_express: false means it won't actually print)
    const order = await printifyClient.createOrder({
      external_id: `test-${Date.now()}`,
      line_items: [
        {
          product_id: productId,
          variant_id: variantId,
          quantity: 1,
          print_areas: {
            front: uploadedImage.id,
          },
        },
      ],
      shipping_method: 1, // Standard shipping
      is_printify_express: false, // TEST MODE
      send_shipping_notification: false,
      address_to: {
        first_name: shippingAddress.firstName,
        last_name: shippingAddress.lastName,
        email: shippingAddress.email || 'test@example.com',
        phone: shippingAddress.phone || '555-0100',
        country: shippingAddress.country || 'US',
        region: shippingAddress.state,
        address1: shippingAddress.address,
        address2: shippingAddress.address2 || '',
        city: shippingAddress.city,
        zip: shippingAddress.zipCode,
      },
    })

    console.log('[Printify Test Order] Created:', order)

    return NextResponse.json({ 
      success: true, 
      order,
      note: 'This is a TEST order - it will not be printed or shipped'
    })
  } catch (error) {
    console.error('[Printify Test Order] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create test order' },
      { status: 500 }
    )
  }
}
