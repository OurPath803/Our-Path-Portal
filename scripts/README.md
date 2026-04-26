# Owner scripts

One-off scripts the owner runs locally — not part of the build or runtime.

## Stripe setup

Creates the three subscription products and prices (`Monthly Rhythm`,
`Fortnightly Rhythm`, `Weekly Rhythm`) in your Stripe account and prints the
price IDs ready to paste into your `.env` / Netlify environment settings.

The script is idempotent — re-running it skips products / prices that already
exist.

```bash
STRIPE_SECRET_KEY=sk_test_... node scripts/setup-stripe.cjs
```

After it finishes, copy the `VITE_STRIPE_PRICE_*` lines from the output into
both your local `.env` and your Netlify environment settings.

The script also prints a reminder to set the webhook up manually in the Stripe
dashboard:

> dashboard.stripe.com → Developers → Webhooks → Add endpoint
>
> URL: `https://<your-netlify-site>/.netlify/functions/stripe-webhook`
>
> Events:
> - `checkout.session.completed`
> - `customer.subscription.updated`
> - `customer.subscription.deleted`
>
> Then copy the signing secret into `STRIPE_WEBHOOK_SECRET` in Netlify env.

## Stripe teardown

Archives the three products (and their prices) by name. Stripe doesn't allow
true deletion of products that have prices — archiving is the cleanest way to
start over in test mode.

```bash
STRIPE_SECRET_KEY=sk_test_... node scripts/teardown-stripe.cjs
```

Re-run `setup-stripe.js` afterwards to create a fresh set.
