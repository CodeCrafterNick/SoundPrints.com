import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
})

export async function createPaymentIntent(amount: number, metadata?: Record<string, string>) {
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata,
  })
}

export async function updatePaymentIntent(paymentIntentId: string, amount: number) {
  return await stripe.paymentIntents.update(paymentIntentId, {
    amount: Math.round(amount * 100),
  })
}

export async function retrievePaymentIntent(paymentIntentId: string) {
  return await stripe.paymentIntents.retrieve(paymentIntentId)
}
