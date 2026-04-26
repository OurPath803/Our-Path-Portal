#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * One-off setup script: create the three subscription products and prices
 * in Stripe. Idempotent — safe to re-run.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/setup-stripe.js
 */

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY

if (!STRIPE_KEY) {
  console.error('\nError: STRIPE_SECRET_KEY is not set.\n')
  console.error('Usage:')
  console.error('  STRIPE_SECRET_KEY=sk_test_... node scripts/setup-stripe.js\n')
  process.exit(1)
}

const Stripe = require('stripe')
const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-04-10' })

// Each tier maps to one product, one recurring monthly GBP price, and the
// env var name the front-end expects.
const TIERS = [
  { name: 'Monthly Rhythm',     amount: 3900,  envVar: 'VITE_STRIPE_PRICE_MONTHLY' },
  { name: 'Fortnightly Rhythm', amount: 7500,  envVar: 'VITE_STRIPE_PRICE_FORTNIGHTLY' },
  { name: 'Weekly Rhythm',      amount: 14000, envVar: 'VITE_STRIPE_PRICE_WEEKLY' },
]

async function listAllProducts() {
  const products = []
  for await (const p of stripe.products.list({ active: true, limit: 100 })) {
    products.push(p)
  }
  return products
}

async function findOrCreateProduct(name, existingProducts) {
  const found = existingProducts.find(p => p.name === name)
  if (found) {
    console.log(`✓ Product exists: ${name} (${found.id})`)
    return found
  }
  const created = await stripe.products.create({ name })
  console.log(`+ Created product: ${name} (${created.id})`)
  return created
}

async function findOrCreatePrice(product, amount) {
  // Look for a matching active GBP monthly recurring price on this product.
  for await (const pr of stripe.prices.list({ product: product.id, active: true, limit: 100 })) {
    const matches =
      pr.unit_amount === amount &&
      pr.currency === 'gbp' &&
      pr.recurring?.interval === 'month'
    if (matches) {
      console.log(`  ✓ Price exists: £${(amount / 100).toFixed(2)}/month → ${pr.id}`)
      return pr
    }
  }
  const created = await stripe.prices.create({
    product: product.id,
    unit_amount: amount,
    currency: 'gbp',
    recurring: { interval: 'month' },
  })
  console.log(`  + Created price: £${(amount / 100).toFixed(2)}/month → ${created.id}`)
  return created
}

async function main() {
  console.log('\nOurPath — Stripe setup')
  console.log('======================\n')

  const existing = await listAllProducts()
  const results = []

  for (const tier of TIERS) {
    console.log(`→ ${tier.name}`)
    const product = await findOrCreateProduct(tier.name, existing)
    const price = await findOrCreatePrice(product, tier.amount)
    results.push({ ...tier, productId: product.id, priceId: price.id })
    console.log('')
  }

  console.log('Done. Copy these into your .env / Netlify env settings:\n')
  console.log('-------------------------- ENV ----------------------------')
  for (const r of results) {
    console.log(`${r.envVar}=${r.priceId}`)
  }
  console.log('-----------------------------------------------------------\n')

  console.log('Next: configure the webhook manually.')
  console.log('  1. Go to https://dashboard.stripe.com → Developers → Webhooks')
  console.log('  2. Add endpoint:')
  console.log('       https://<your-netlify-site>/.netlify/functions/stripe-webhook')
  console.log('  3. Select events:')
  console.log('       - checkout.session.completed')
  console.log('       - customer.subscription.updated')
  console.log('       - customer.subscription.deleted')
  console.log('  4. Copy the signing secret into STRIPE_WEBHOOK_SECRET in Netlify env.\n')
}

main().catch(err => {
  console.error('\nSetup failed:', err.message)
  process.exit(1)
})
