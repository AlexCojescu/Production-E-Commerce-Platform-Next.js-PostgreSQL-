import Stripe from 'stripe'

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey?.trim()) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(secretKey)
}

export async function findPaymentIntentIdForOrder(stripe, orderId, storedIntentId) {
  if (storedIntentId) {
    return storedIntentId
  }

  let startingAfter
  let hasMore = true

  while (hasMore) {
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      starting_after: startingAfter,
      status: 'complete',
    })

    for (const session of sessions.data) {
      const orderIds = session.metadata?.orderIds?.split(',') || []
      if (orderIds.includes(orderId) && session.payment_intent) {
        return typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent.id
      }
    }

    hasMore = sessions.has_more
    startingAfter = sessions.data.at(-1)?.id
    if (!sessions.data.length) break
  }

  return null
}
