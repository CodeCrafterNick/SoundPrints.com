import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'SoundPrints <orders@soundprints.com>'

interface OrderEmailData {
  orderId: string
  email: string
  customerName: string
  items: Array<{
    productType: string
    size: string
    audioFileName?: string
    price: number
    quantity: number
    thumbnailUrl?: string
  }>
  subtotal: number
  tax: number
  shipping: number
  total: number
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

interface ShippingEmailData {
  orderId: string
  email: string
  customerName: string
  trackingNumber: string
  trackingUrl: string
  carrier?: string
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #eee;">
          <strong>${formatProductName(item.productType)} - ${item.size}</strong>
          ${item.audioFileName ? `<br><span style="color: #666; font-size: 14px;">${item.audioFileName}</span>` : ''}
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 16px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('')

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="text-align: center; padding: 20px 0;">
    <h1 style="color: #000; font-size: 28px; margin: 0;">🎵 SoundPrints</h1>
  </div>

  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
    <h2 style="margin: 0 0 10px 0; font-size: 24px;">Order Confirmed!</h2>
    <p style="margin: 0; opacity: 0.9;">Thank you for your order, ${data.customerName}!</p>
  </div>

  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0; color: #666; font-size: 14px;">Order Number</p>
    <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: 600;">#${data.orderId.slice(0, 8).toUpperCase()}</p>
  </div>

  <h3 style="margin-bottom: 15px;">Order Details</h3>
  
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <thead>
      <tr style="background: #f5f5f5;">
        <th style="padding: 12px 16px; text-align: left; font-weight: 600;">Item</th>
        <th style="padding: 12px 16px; text-align: center; font-weight: 600;">Qty</th>
        <th style="padding: 12px 16px; text-align: right; font-weight: 600;">Price</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
      <span>Subtotal</span>
      <span>$${data.subtotal.toFixed(2)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
      <span>Shipping</span>
      <span>${data.shipping === 0 ? 'FREE' : '$' + data.shipping.toFixed(2)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
      <span>Tax</span>
      <span>$${data.tax.toFixed(2)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 2px solid #ddd; font-size: 18px; font-weight: 600;">
      <span>Total</span>
      <span>$${data.total.toFixed(2)}</span>
    </div>
  </div>

  <h3 style="margin-bottom: 15px;">Shipping Address</h3>
  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
    <p style="margin: 0;">
      ${data.shippingAddress.firstName} ${data.shippingAddress.lastName}<br>
      ${data.shippingAddress.address}<br>
      ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}<br>
      ${data.shippingAddress.country}
    </p>
  </div>

  <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
    <h4 style="margin: 0 0 10px 0;">📦 What's Next?</h4>
    <ul style="margin: 0; padding-left: 20px; color: #555;">
      <li>We're preparing your custom SoundPrint</li>
      <li>You'll receive a shipping confirmation with tracking info</li>
      <li>Expected delivery: 5-10 business days</li>
    </ul>
  </div>

  <div style="text-align: center; margin-bottom: 30px;">
    <a href="https://soundprints.com/my-orders" style="display: inline-block; background: #000; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Your Order</a>
  </div>

  <div style="text-align: center; padding-top: 30px; border-top: 1px solid #eee; color: #999; font-size: 14px;">
    <p>Questions? Reply to this email or contact us at support@soundprints.com</p>
    <p style="margin-top: 20px;">
      <a href="https://soundprints.com" style="color: #666; text-decoration: none;">SoundPrints.com</a>
    </p>
  </div>

</body>
</html>
    `

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Order Confirmed! #${data.orderId.slice(0, 8).toUpperCase()}`,
      html,
    })

    if (error) {
      console.error('[Email] Failed to send order confirmation:', error)
      return { success: false, error }
    }

    console.log('[Email] Order confirmation sent:', result?.id)
    return { success: true, id: result?.id }
  } catch (error) {
    console.error('[Email] Error sending order confirmation:', error)
    return { success: false, error }
  }
}

/**
 * Send shipping confirmation email
 */
export async function sendShippingConfirmationEmail(data: ShippingEmailData) {
  try {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Has Shipped!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="text-align: center; padding: 20px 0;">
    <h1 style="color: #000; font-size: 28px; margin: 0;">🎵 SoundPrints</h1>
  </div>

  <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
    <h2 style="margin: 0 0 10px 0; font-size: 24px;">🚚 Your Order Has Shipped!</h2>
    <p style="margin: 0; opacity: 0.9;">Great news, ${data.customerName}! Your SoundPrint is on its way!</p>
  </div>

  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0; color: #666; font-size: 14px;">Order Number</p>
    <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: 600;">#${data.orderId.slice(0, 8).toUpperCase()}</p>
  </div>

  <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
    <p style="margin: 0; color: #666; font-size: 14px;">Tracking Number</p>
    <p style="margin: 5px 0 15px 0; font-size: 18px; font-weight: 600;">${data.trackingNumber}</p>
    ${data.carrier ? `<p style="margin: 0 0 15px 0; color: #666;">Carrier: ${data.carrier}</p>` : ''}
    <a href="${data.trackingUrl}" style="display: inline-block; background: #000; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Track Your Package</a>
  </div>

  <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
    <h4 style="margin: 0 0 10px 0;">📦 Delivery Information</h4>
    <ul style="margin: 0; padding-left: 20px; color: #555;">
      <li>Estimated delivery: 3-7 business days</li>
      <li>You can track your package using the link above</li>
      <li>We'll notify you when it's delivered</li>
    </ul>
  </div>

  <div style="text-align: center; padding-top: 30px; border-top: 1px solid #eee; color: #999; font-size: 14px;">
    <p>Questions about your order? Reply to this email or contact us at support@soundprints.com</p>
    <p style="margin-top: 20px;">
      <a href="https://soundprints.com" style="color: #666; text-decoration: none;">SoundPrints.com</a>
    </p>
  </div>

</body>
</html>
    `

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `Your SoundPrint Has Shipped! 🚚`,
      html,
    })

    if (error) {
      console.error('[Email] Failed to send shipping confirmation:', error)
      return { success: false, error }
    }

    console.log('[Email] Shipping confirmation sent:', result?.id)
    return { success: true, id: result?.id }
  } catch (error) {
    console.error('[Email] Error sending shipping confirmation:', error)
    return { success: false, error }
  }
}

/**
 * Send order failed/canceled email
 */
export async function sendOrderStatusEmail(data: {
  orderId: string
  email: string
  customerName: string
  status: 'failed' | 'canceled' | 'returned'
  reason?: string
}) {
  try {
    const statusMessages = {
      failed: {
        title: 'Issue with Your Order',
        message: 'We encountered an issue processing your order. Our team has been notified and will reach out to you shortly.',
        color: '#e53e3e'
      },
      canceled: {
        title: 'Order Canceled',
        message: 'Your order has been canceled. If you did not request this cancellation, please contact us immediately.',
        color: '#dd6b20'
      },
      returned: {
        title: 'Package Returned',
        message: 'Your package was returned to us. This may be due to an incorrect address or delivery issues. Please contact us to resolve this.',
        color: '#dd6b20'
      }
    }

    const statusInfo = statusMessages[data.status]

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusInfo.title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="text-align: center; padding: 20px 0;">
    <h1 style="color: #000; font-size: 28px; margin: 0;">🎵 SoundPrints</h1>
  </div>

  <div style="background: ${statusInfo.color}; color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
    <h2 style="margin: 0 0 10px 0; font-size: 24px;">${statusInfo.title}</h2>
    <p style="margin: 0; opacity: 0.9;">Order #${data.orderId.slice(0, 8).toUpperCase()}</p>
  </div>

  <p style="margin-bottom: 20px;">Hi ${data.customerName},</p>
  
  <p style="margin-bottom: 20px;">${statusInfo.message}</p>

  ${data.reason ? `<p style="margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-radius: 8px;"><strong>Reason:</strong> ${data.reason}</p>` : ''}

  <div style="text-align: center; margin: 30px 0;">
    <a href="mailto:support@soundprints.com" style="display: inline-block; background: #000; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Contact Support</a>
  </div>

  <div style="text-align: center; padding-top: 30px; border-top: 1px solid #eee; color: #999; font-size: 14px;">
    <p>We apologize for any inconvenience. Our team is here to help!</p>
    <p style="margin-top: 20px;">
      <a href="https://soundprints.com" style="color: #666; text-decoration: none;">SoundPrints.com</a>
    </p>
  </div>

</body>
</html>
    `

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: `${statusInfo.title} - Order #${data.orderId.slice(0, 8).toUpperCase()}`,
      html,
    })

    if (error) {
      console.error('[Email] Failed to send status email:', error)
      return { success: false, error }
    }

    console.log('[Email] Status email sent:', result?.id)
    return { success: true, id: result?.id }
  } catch (error) {
    console.error('[Email] Error sending status email:', error)
    return { success: false, error }
  }
}

/**
 * Format product type for display
 */
function formatProductName(productType: string): string {
  return productType
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export { resend }
