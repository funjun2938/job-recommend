import { stripe as stripeClient } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  if (!stripeClient) return Response.json({ ok: true })

  const body = await request.text()
  const sig  = request.headers.get('stripe-signature')!

  let event
  try {
    event = stripeClient.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (!supabase) return Response.json({ ok: true })

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      await supabase.from('subscriptions').upsert({
        customer_email:  session.customer_email,
        stripe_customer: session.customer,
        stripe_session:  session.id,
        plan:            session.metadata?.plan ?? 'pro',
        status:          'active',
        trial_end:       null,
        updated_at:      new Date().toISOString(),
      }, { onConflict: 'customer_email' })
      break
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = event.data.object
      const status = event.type === 'customer.subscription.deleted' ? 'canceled' : sub.status
      await supabase.from('subscriptions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('stripe_customer', sub.customer)
      break
    }
  }

  return Response.json({ ok: true })
}
