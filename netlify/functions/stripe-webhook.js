const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Tier name (set in Rhythms.jsx → create-checkout) → enum value used by the
// `subscriptions.rhythm` column (session_rhythm).
const RHYTHM_MAP = {
  'Monthly Rhythm': 'monthly',
  'Fortnightly Rhythm': 'fortnightly',
  'Weekly Rhythm': 'weekly',
}

// Stripe subscription.status → our subscription_status enum.
function mapStatus(stripeStatus) {
  if (stripeStatus === 'active' || stripeStatus === 'trialing') return 'active'
  if (stripeStatus === 'paused') return 'paused'
  // canceled, incomplete, incomplete_expired, past_due, unpaid → cancelled
  return 'cancelled'
}

async function upsertSubscription(menteeId, rhythm, stripeSubscriptionId, status) {
  // Match on stripe_subscription_id when possible, otherwise on mentee.
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .maybeSingle()

  if (existing) {
    await supabase.from('subscriptions')
      .update({ rhythm, status })
      .eq('id', existing.id)
    return
  }

  await supabase.from('subscriptions').insert({
    mentee_id: menteeId,
    rhythm: rhythm ?? 'fortnightly',
    status,
    stripe_subscription_id: stripeSubscriptionId,
  })
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

    if (userId && session.subscription) {
      await upsertSubscription(userId, rhythm, session.subscription, 'active')
    }
  }

  if (stripeEvent.type === 'customer.subscription.updated') {
    const sub = stripeEvent.data.object
    const tierName = sub.metadata?.tierName
    const rhythm = RHYTHM_MAP[tierName] // may be undefined; keep existing
    const status = mapStatus(sub.status)

    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id, mentee_id, rhythm')
      .eq('stripe_subscription_id', sub.id)
      .maybeSingle()

    if (existing) {
      await supabase.from('subscriptions').update({
        status,
        rhythm: rhythm ?? existing.rhythm,
      }).eq('id', existing.id)
    } else if (sub.metadata?.userId) {
      await upsertSubscription(sub.metadata.userId, rhythm, sub.id, status)
    }
  }

  if (stripeEvent.type === 'customer.subscription.deleted') {
    const sub = stripeEvent.data.object
    await supabase.from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('stripe_subscription_id', sub.id)
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) }
}
