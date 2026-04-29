#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Updates the three OurPath subscription prices to a new amount. Archives
 * the existing active prices (so they don't show up as alternative options
 * in checkout) and creates fresh prices on the same products. Existing
 * subscribers keep their old prices — Stripe ties subscriptions to the
 * price ID at the time of subscription, not the product.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_live_... node scripts/update-stripe-prices.cjs
 *
 * After running, copy the printed VITE_STRIPE_PRICE_* lines into Netlify
 * env vars (replacing the existing values), then trigger a redeploy.
 */

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY

if (!STRIPE_KEY) {
  console.error('\nError: STRIPE_SECRET_KEY is not set.\n')
  console.error('Usage:')
  console.error('  STRIPE_SECRET_KEY=sk_live_... node scripts/update-stripe-prices.cjs\n')
  process.exit(1)
}

const Stripe = require('stripe')
const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2024-04-10' })

// New pricing. Amounts are in pence.
const TIERS = [
  { name: 'Monthly Rhythm',     amount: 5000,  envVar: 'VITE_STRIPE_PRICE_MONTHLY' },
  { name: 'Fortnightly Rhythm', amount: 8000,  envVar: 'VITE_STRIPE_PRICE_FORTNIGHTLY' },
  { name: 'Weekly Rhythm',      amount: 12000, envVar: 'VITE_STRIPE_PRICE_WEEKLY' },
]

async function findProduct(name) {
  for await (const p of stripe.products.list({ active: true, limit: 100 })) {
    if (p.name === name) return p
  }
  return null
}

async function archiveAllActivePrices(productId, productName) {
  let count = 0
  for await (const price of stripe.prices.list({ product: productId, active: true, limit: 100 })) {
    await stripe.prices.update(price.id, { active: false })
    console.log(`    archived old price ${price.id} (£${(price.unit_amount/100).toFixed(2)}/${price.recurring?.interval ?? 'one-off'})`)
    count++
  }
  return count
}

async function main() {
  console.log('\nOurPath — Stripe price update')
  console.log('=============================\n')
  console.log('New prices:')
  TIERS.forEach(t => console.log(`  ${t.name.padEnd(20)} £${(t.amount/100).toFixed(2)}/month`))
  console.log('')

  const results = []

  for (const tier of TIERS) {
    console.log(`→ ${tier.name}`)
    const product = await findProduct(tier.name)
    if (!product) {
      console.error(`  ✗ Product "${tier.name}" not found. Run setup-stripe.cjs first.`)
      process.exit(1)
    }
    console.log(`  product: ${product.id}`)

    await archiveAllActivePrices(product.id, tier.name)

    const created = await stripe.prices.create({
      product: product.id,
      unit_amount: tier.amount,
      currency: 'gbp',
      recurring: { interval: 'month' },
    })
    console.log(`  ✓ Created new price: £${(tier.amount/100).toFixed(2)}/month → ${created.id}\n`)
    results.push({ ...tier, productId: product.id, priceId: created.id })
  }

  console.log('Done. Replace the existing VITE_STRIPE_PRICE_* values in Netlify with these:\n')
  console.log('-------------------------- ENV ----------------------------')
  for (const r of results) {
    console.log(`${r.envVar}=${r.priceId}`)
  }
  console.log('-----------------------------------------------------------\n')

  console.log('Then trigger a redeploy in Netlify so the new bundle picks up the new IDs.')
  console.log('(Existing customers — none yet — would have stayed on their original prices.)\n')
}

main().catch(err => {
  console.error('\nUpdate failed:', err.message)
  process.exit(1)
})
