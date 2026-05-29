import { stripe, PLANS } from '@/lib/stripe'
import type { PlanKey } from '@/lib/stripe'

export async function POST(request: Request) {
  if (!stripe) return Response.json({ error: 'Stripe not configured' }, { status: 503 })

  const { plan, email, successUrl, cancelUrl }: {
    plan: PlanKey
    email?: string
    successUrl: string
    cancelUrl: string
  } = await request.json()

  const planData = PLANS[plan]
  if (!planData.priceId) {
    return Response.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: planData.priceId, quantity: 1 }],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    customer_email: email,
    locale: 'ko',
    metadata: { plan },
    subscription_data: {
      trial_period_days: 7,  // 7일 무료 체험
      metadata: { plan },
    },
    allow_promotion_codes: true,
  })

  return Response.json({ url: session.url, sessionId: session.id })
}
