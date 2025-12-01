import { NextRequest, NextResponse } from 'next/server'

const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID

export async function DELETE(request: NextRequest) {
  try {
    // Check if Printify is configured
    if (!PRINTIFY_API_KEY || !PRINTIFY_SHOP_ID) {
      console.log('Printify not configured, skipping cleanup')
      return NextResponse.json({ success: true, skipped: true })
    }

    const { productId } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
    }

    console.log('Deleting Printify product:', productId)

    // Delete the product from Printify
    const deleteResponse = await fetch(
      `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/products/${productId}.json`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${PRINTIFY_API_KEY}`,
        },
      }
    )

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json()
      console.error('Failed to delete product:', errorData)
      return NextResponse.json({ error: 'Failed to delete product', details: errorData }, { status: 500 })
    }

    console.log('Product deleted successfully')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in cleanup:', error)
    return NextResponse.json({ error: 'Failed to cleanup product' }, { status: 500 })
  }
}
