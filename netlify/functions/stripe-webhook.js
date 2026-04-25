const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const RHYTHM_MAP = {
  'Monthly Rhythm': 'monthly',
  'Fortnightly Rhythm': 'fortnightly',
  'Weekly Rhythm': 'weekly',
}

exports.handler = async (event) => {
  const sig = event.headers['stripe-signature']

  let stripeEvent
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return { statusCode: 400, body: `Webhook Error: ${err.message}` }
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object
    const userId = session.metadata?.userId
    const tierName = session.metadata?.tierName
    const rhythm = RHYTHM_MAP[tierName] ?? 'fortnightly'

    if (userId) {
      await supabase.from('profiles').update({
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        subscription_status: 'active',
        rhythm,
      }).eq('id', userId)
    }
  }

  if (stripeEvent.type === 'customer.subscription.deleted') {
    const sub = stripeEvent.data.object
    await supabase.from('profiles')
      .update({ subscription_status: 'inactive' })
      .eq('stripe_subscription_id', sub.id)
  }

  if (stripeEvent.type === 'customer.subscription.updated') {
    const sub = stripeEvent.data.object
    const status = sub.status === 'active' ? 'active' : 'inactive'
    await supabase.from('profiles')
      .update({ subscription_status: status })
      .eq('stripe_subscription_id', sub.id)
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) }
}
