#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Subscribes the Calendly webhook to invitee.created events for the OurPath
 * organisation, pointed at the portal's Netlify function.
 *
 * Usage:
 *   CALENDLY_TOKEN=eyJ... PORTAL_URL=https://ourpathportal.netlify.app \
 *     node scripts/setup-calendly-webhook.cjs
 *
 * Defaults PORTAL_URL to https://ourpathportal.netlify.app if not set.
 *
 * Prints the signing key at the end — paste that into Netlify env vars as
 * CALENDLY_WEBHOOK_SECRET.
 */

const TOKEN = process.env.CALENDLY_TOKEN
const PORTAL_URL = process.env.PORTAL_URL || 'https://ourpathportal.netlify.app'

if (!TOKEN) {
  console.error('\nError: CALENDLY_TOKEN is not set.\n')
  console.error('Get a token at https://calendly.com/integrations/api_webhooks → Generate new token\n')
  console.error('Usage:')
  console.error('  CALENDLY_TOKEN=eyJ... node scripts/setup-calendly-webhook.cjs\n')
  process.exit(1)
}

const WEBHOOK_URL = `${PORTAL_URL}/.netlify/functions/calendly-webhook`

async function api(path, init = {}) {
  const res = await fetch(`https://api.calendly.com${path}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
  const text = await res.text()
  let body
  try { body = JSON.parse(text) } catch { body = text }
  if (!res.ok) {
    throw new Error(`Calendly API ${res.status} on ${path}: ${typeof body === 'string' ? body : JSON.stringify(body)}`)
  }
  return body
}

async function main() {
  console.log('\nOurPath — Calendly webhook setup')
  console.log('================================\n')

  // 1. Resolve current user → organisation URI
  console.log('→ Fetching current user…')
  const me = await api('/users/me')
  const orgUri = me.resource.current_organization
  const userUri = me.resource.uri
  console.log(`  Organisation: ${orgUri}`)
  console.log(`  User:         ${userUri}\n`)

  // 2. Check for an existing subscription pointing at our URL
  console.log('→ Looking for existing subscription pointing at portal…')
  const existing = await api(`/webhook_subscriptions?organization=${encodeURIComponent(orgUri)}&scope=organization`)
  const match = (existing.collection || []).find(s => s.callback_url === WEBHOOK_URL)
  if (match) {
    console.log(`  Found existing: ${match.uri}`)
    console.log(`  Signing key:    ${match.creator}`) // not the signing key — we have to recreate to get it
    console.log('\n  Note: Calendly does not let us read an existing webhook\'s signing key.')
    console.log('  Deleting + recreating so we can capture a fresh signing key…\n')
    await api(match.uri.replace('https://api.calendly.com', ''), { method: 'DELETE' })
    console.log(`  Deleted ${match.uri}\n`)
  }

  // 3. Create a new subscription
  console.log(`→ Creating webhook subscription → ${WEBHOOK_URL}`)
  const created = await api('/webhook_subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      url: WEBHOOK_URL,
      events: ['invitee.created'],
      organization: orgUri,
      scope: 'organization',
    }),
  })

  const subscription = created.resource
  console.log(`  ✓ Created: ${subscription.uri}\n`)

  console.log('Done. Paste this into Netlify env vars as CALENDLY_WEBHOOK_SECRET:\n')
  console.log('-------------------------- ENV ----------------------------')
  console.log(`CALENDLY_WEBHOOK_SECRET=${subscription.signing_key}`)
  console.log('-----------------------------------------------------------\n')

  console.log('After saving, trigger a redeploy in Netlify (Deploys → Trigger deploy)')
  console.log('so the calendly-webhook function picks up the new secret.\n')
}

main().catch(err => {
  console.error('\nSetup failed:', err.message)
  process.exit(1)
})
