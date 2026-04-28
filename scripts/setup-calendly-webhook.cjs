#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Subscribes the Calendly webhook to invitee.created events for the OurPath
 * organisation, pointed at the portal's Netlify function.
 *
 * Calendly's API requires us to provide our own signing_key when creating a
 * subscription (Calendly does not generate one for us). This script generates
 * a 32-byte hex secret, passes it in the create request, and prints the same
 * value as CALENDLY_WEBHOOK_SECRET.
 *
 * Usage:
 *   CALENDLY_TOKEN=eyJ... PORTAL_URL=https://portal.ourpathguidance.co.uk \
 *     node scripts/setup-calendly-webhook.cjs
 *
 * Defaults PORTAL_URL to https://ourpathportal.netlify.app if not set.
 *
 * Prints the signing key at the end — paste that into Netlify env vars as
 * CALENDLY_WEBHOOK_SECRET.
 */

const crypto = require('crypto')

const TOKEN = process.env.CALENDLY_TOKEN
const PORTAL_URL = process.env.PORTAL_URL || 'https://ourpathportal.netlify.app'

if (!TOKEN) {
  console.error('\nError: CALENDLY_TOKEN is not set.\n')
  console.error('Get a token at https://calendly.com/integrations/api_webhooks → Generate new token\n')
  console.error('Usage:')
  console.error("  CALENDLY_TOKEN='eyJ...' node scripts/setup-calendly-webhook.cjs\n")
  process.exit(1)
}

const WEBHOOK_URL = `${PORTAL_URL}/.netlify/functions/calendly-webhook`
const SIGNING_KEY = crypto.randomBytes(32).toString('hex') // 64 hex chars

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

  // 2. Delete any existing subscription pointing at our URL — Calendly does
  //    not return the signing_key on GET, so we always recreate to capture a
  //    known one.
  console.log('→ Removing any existing subscription pointing at portal…')
  const existing = await api(`/webhook_subscriptions?organization=${encodeURIComponent(orgUri)}&scope=organization`)
  const matches = (existing.collection || []).filter(s => s.callback_url === WEBHOOK_URL)
  for (const m of matches) {
    await api(m.uri.replace('https://api.calendly.com', ''), { method: 'DELETE' })
    console.log(`  Deleted ${m.uri}`)
  }
  if (matches.length === 0) console.log('  (none found)')
  console.log('')

  // 3. Create a fresh subscription with our own signing_key
  console.log(`→ Creating webhook subscription → ${WEBHOOK_URL}`)
  const created = await api('/webhook_subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      url: WEBHOOK_URL,
      events: ['invitee.created'],
      organization: orgUri,
      scope: 'organization',
      signing_key: SIGNING_KEY,
    }),
  })

  const subscription = created.resource
  console.log(`  ✓ Created: ${subscription.uri}\n`)

  console.log('Done. Paste this into Netlify env vars as CALENDLY_WEBHOOK_SECRET:\n')
  console.log('-------------------------- ENV ----------------------------')
  console.log(`CALENDLY_WEBHOOK_SECRET=${SIGNING_KEY}`)
  console.log('-----------------------------------------------------------\n')

  console.log('Notes:')
  console.log('  • This signing key is generated locally on each run — re-running')
  console.log('    will print a NEW one and you must update Netlify env vars.')
  console.log('  • Mark Sensitive in Netlify, leave "Local development" blank.')
  console.log('  • After saving, trigger a redeploy (Deploys → Trigger deploy)')
  console.log('    so the calendly-webhook function picks up the new secret.\n')
}

main().catch(err => {
  console.error('\nSetup failed:', err.message)
  process.exit(1)
})
