const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SITE_URL = process.env.URL || 'https://portal.ourpathguidance.co.uk'

const RHYTHM_MAP = {
  'Monthly Rhythm': 'monthly',
  'Fortnightly Rhythm': 'fortnightly',
  'Weekly Rhythm': 'weekly',
}

function mapStatus(stripeStatus) {
  if (stripeStatus === 'active' || stripeStatus === 'trialing') return 'active'
  if (stripeStatus === 'paused') return 'paused'
  return 'cancelled'
}

async function upsertSubscription(menteeId, rhythm, stripeSubscriptionId, status) {
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id, status')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .maybeSingle()

  if (existing) {
    await supabase.from('subscriptions')
      .update({ rhythm, status })
      .eq('id', existing.id)
    return existing.status
  }

  await supabase.from('subscriptions').insert({
    mentee_id: menteeId,
    rhythm: rhythm ?? 'fortnightly',
    status,
    stripe_subscription_id: stripeSubscriptionId,
  })
  return null
}

async function fireLifecycleEmail(menteeId, type, rhythm) {
  if (!type || !menteeId) return
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', menteeId)
      .maybeSingle()
    if (!profile?.email) return

    await fetch(`${SITE_URL}/.netlify/functions/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        to: profile.email,
        data: { name: profile.full_name, rhythm },
      }),
    })
  } catch (err) {
    console.error('lifecycle email failed', err)
  }
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
      const previousStatus = await upsertSubscription(
        userId, rhythm, session.subscription, 'active'
      )
      if (previousStatus !== 'active') {
        await fireLifecycleEmail(userId, 'subscription_activated', rhythm)
      }
    }
  }

  if (stripeEvent.type === 'customer.subscription.updated') {
    const sub = stripeEvent.data.object
    const tierName = sub.metadata?.tierName
    const rhythm = RHYTHM_MAP[tierName]
    const status = mapStatus(sub.status)

    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id, mentee_id, rhythm, status')
      .eq('stripe_subscription_id', sub.id)
      .maybeSingle()

    if (existing) {
      await supabase.from('subscriptions').update({
        status,
        rhythm: rhythm ?? existing.rhythm,
      }).eq('id', existing.id)

      if (existing.status !== status) {
        const typeMap = {
          active:    'subscription_activated',
          paused:    'subscription_paused',
          cancelled: 'subscription_cancelled',
        }
        await fireLifecycleEmail(existing.mentee_id, typeMap[status], rhythm ?? existing.rhythm)
      }
    } else if (sub.metadata?.userId) {
      await upsertSubscription(sub.metadata.userId, rhythm, sub.id, status)
    }
  }

  if (stripeEvent.type === 'customer.subscription.deleted') {
    const sub = stripeEvent.data.object
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id, mentee_id, rhythm, status')
      .eq('stripe_subscription_id', sub.id)
      .maybeSingle()

    if (existing) {
      await supabase.from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', existing.id)

      if (existing.status !== 'cancelled') {
        await fireLifecycleEmail(existing.mentee_id, 'subscription_cancelled', existing.rhythm)
      }
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) }
}
