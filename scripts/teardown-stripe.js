#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Archives the three OurPath subscription products by name.
 *
 * Stripe doesn't allow deletion of products that have associated prices,
 * so we archive (set active: false) instead. Useful when starting over in
 * test mode.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... node scripts/teardown-stripe.js
 */

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY

if (!STRIPE_KEY) {
  console.error('\nError: STRIPE_SECRET_KEY is not set.\n')
  console.error('Usage:')
  console.error('  STRIPE_SECRET_KEY=sk_test_... node scripts/teardown-stripe.js\n')
  process.exit(1)
}

const Stripe = require('stripe')
const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-04-10' })

const PRODUCT_NAMES = [
  'Monthly Rhythm',
  'Fortnightly Rhythm',
  'Weekly Rhythm',
]

async function main() {
  console.log('\nOurPath — Stripe teardown')
  console.log('=========================\n')

  for (const name of PRODUCT_NAMES) {
    let archivedAny = false
    for await (const product of stripe.products.list({ active: true, limit: 100 })) {
      if (product.name !== name) continue

      // Archive any active prices first.
      for await (const price of stripe.prices.list({ product: product.id, active: true, limit: 100 })) {
        await stripe.prices.update(price.id, { active: false })
        console.log(`  · archived price ${price.id} on ${name}`)
      }

      await stripe.products.update(product.id, { active: false })
      console.log(`✓ Archived product: ${name} (${product.id})`)
      archivedAny = true
    }
    if (!archivedAny) {
      console.log(`— No active product found for: ${name}`)
    }
  }

  console.log('\nDone. Products are archived (not deleted).')
  console.log('You can re-run setup-stripe.js to create fresh ones.\n')
}

main().catch(err => {
  console.error('\nTeardown failed:', err.message)
  process.exit(1)
})
