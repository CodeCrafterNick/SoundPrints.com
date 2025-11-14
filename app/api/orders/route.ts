import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, orderItems } from '@/lib/db/schema'
import { retrievePaymentIntent } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, orderData, items } = await req.json()

    // Verify payment was successful
    const paymentIntent = await retrievePaymentIntent(paymentIntentId)
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Create order in database
    const [order] = await db
      .insert(orders)
      .values({
        email: orderData.email,
        status: 'processing',
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shipping: orderData.shipping,
        total: orderData.total,
        shippingAddress: orderData.shippingAddress,
        stripePaymentIntentId: paymentIntentId,
      })
      .returning()

    // Create order items
    const orderItemsData = items.map((item: any) => ({
      orderId: order.id,
      productType: item.productType,
      size: item.size,
      audioFileName: item.audioFileName,
      audioFileUrl: item.audioFileUrl,
      waveformColor: item.waveformColor,
      backgroundColor: item.backgroundColor,
      customText: item.customText,
      price: item.price,
      quantity: item.quantity,
    }))

    await db.insert(orderItems).values(orderItemsData)

    return NextResponse.json({
      success: true,
      orderId: order.id,
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
