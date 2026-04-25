const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const { priceId, userId, email, tierName } = JSON.parse(event.body)

  if (!priceId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Price ID not configured. Please add it to your environment variables.' }),
    }
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.URL || 'http://localhost:5173'}/dashboard?subscribed=true`,
      cancel_url: `${process.env.URL || 'http://localhost:5173'}/rhythms`,
      metadata: { userId, tierName },
      subscription_data: {
        metadata: { userId, tierName },
      },
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
