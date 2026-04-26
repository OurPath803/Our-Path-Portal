const crypto = require('crypto')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const CALENDLY_WEBHOOK_SECRET = process.env.CALENDLY_WEBHOOK_SECRET

// Verify Calendly's signature header.
// Header format (v1): "t=<timestamp>,v1=<signature>"
// Signature = HMAC-SHA256( "<timestamp>.<rawBody>", secret )
function verifyCalendlySignature(rawBody, signatureHeader) {
  if (!CALENDLY_WEBHOOK_SECRET) return false
  if (!signatureHeader) return false

  const parts = signatureHeader.split(',').reduce((acc, kv) => {
    const [k, v] = kv.split('=')
    if (k && v) acc[k.trim()] = v.trim()
    return acc
  }, {})

  const timestamp = parts.t
  const expected = parts.v1
  if (!timestamp || !expected) return false

  // Reject anything older than 5 minutes (replay protection).
  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp))
  if (Number.isNaN(ageSeconds) || ageSeconds > 300) return false

  const computed = crypto
    .createHmac('sha256', CALENDLY_WEBHOOK_SECRET)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')

  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(expected))
  } catch {
    return false
  }
}

async function sendSessionBookedEmail(to, data) {
  if (!process.env.URL) return
  try {
    await fetch(`${process.env.URL}/.netlify/functions/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'session_booked', to, data }),
    })
  } catch (err) {
    console.error('send-email call failed', err)
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const signature =
    event.headers['calendly-webhook-signature'] ||
    event.headers['Calendly-Webhook-Signature']

  if (!verifyCalendlySignature(event.body, signature)) {
    return { statusCode: 401, body: 'Invalid signature' }
  }

  let payload
  try {
    payload = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  // We only care about new bookings.
  if (payload.event !== 'invitee.created') {
    return { statusCode: 200, body: JSON.stringify({ ignored: true }) }
  }

  const p = payload.payload || {}
  const inviteeEmail = (p.email || '').toLowerCase().trim()
  const inviteeName = p.name || ''
  const scheduledAt = p.scheduled_event?.start_time
  const eventTypeName = p.scheduled_event?.name || '1-1 Mentoring Session'
  const calendlyEventUri = p.scheduled_event?.uri || null
  const calendlyInviteeUri = p.uri || null

  if (!inviteeEmail || !scheduledAt) {
    return { statusCode: 400, body: 'Missing email or scheduled time' }
  }

  // Look up the matching profile by email.
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, mentor_id, full_name, email')
    .ilike('email', inviteeEmail)
    .maybeSingle()

  if (!profile) {
    // No matching mentee — log to session_zero_bookings for admin review.
    await supabase.from('session_zero_bookings').insert({
      invitee_name: inviteeName,
      invitee_email: inviteeEmail,
      scheduled_at: scheduledAt,
      event_type_name: eventTypeName,
      calendly_event_uri: calendlyEventUri,
      calendly_invitee_uri: calendlyInviteeUri,
      raw_payload: payload,
    })
    return {
      statusCode: 200,
      body: JSON.stringify({ logged: 'session_zero_booking' }),
    }
  }

  // Resolve mentor — fall back to the single mentor in the system if missing.
  let mentorId = profile.mentor_id
  if (!mentorId) {
    const { data: mentor } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'mentor')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    mentorId = mentor?.id ?? null
  }

  // Insert the session.
  const { error: insertErr } = await supabase.from('sessions').insert({
    mentee_id: profile.id,
    mentor_id: mentorId,
    scheduled_at: scheduledAt,
    mode: 'video',
    status: 'scheduled',
    calendly_event_uri: calendlyEventUri,
    calendly_invitee_uri: calendlyInviteeUri,
  })

  if (insertErr) {
    console.error('sessions insert failed', insertErr)
    return { statusCode: 500, body: 'Insert failed' }
  }

  // Notify the mentee that their session was booked.
  await sendSessionBookedEmail(profile.email, {
    name: profile.full_name || inviteeName,
    scheduled_at: scheduledAt,
    event_type_name: eventTypeName,
  })

  return { statusCode: 200, body: JSON.stringify({ booked: true }) }
}
