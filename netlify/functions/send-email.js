// Single Netlify Function that dispatches transactional email via Resend.
//
// Body shape: { type, to, data }
//   type: 'new_application' | 'application_accepted' | 'new_message' | 'session_booked'
//   to:   recipient email address (for new_application this is overridden with EMAIL_FROM)
//   data: template-specific fields (see each renderer below)
//
// All copy is British English, kept on-brand and plain.

const { createClient } = require('@supabase/supabase-js')

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || 'hello@ourpathguidance.co.uk'
const SITE_URL = process.env.URL || 'https://ourpathguidance.co.uk'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ---------------------------------------------------------------------------
// Template renderers — each returns { subject, html, text }
// ---------------------------------------------------------------------------
const TEMPLATES = {
  new_application: ({ name, email, motivation, preferred_rhythm, preferred_mode }) => ({
    subject: `New Session Zero application — ${name}`,
    text:
`A new Session Zero application has just been submitted.

Name: ${name}
Email: ${email}
Preferred rhythm: ${preferred_rhythm || '—'}
Preferred mode: ${preferred_mode || '—'}

What's drawing them here:
${motivation || '(none provided)'}

Review and reply within 48 hours.

— OurPath Portal`,
    html:
`<p>A new Session Zero application has just been submitted.</p>
<p><strong>Name:</strong> ${esc(name)}<br/>
<strong>Email:</strong> ${esc(email)}<br/>
<strong>Preferred rhythm:</strong> ${esc(preferred_rhythm || '—')}<br/>
<strong>Preferred mode:</strong> ${esc(preferred_mode || '—')}</p>
<p><strong>What's drawing them here:</strong><br/>
<em>${esc(motivation || '(none provided)')}</em></p>
<p>Review and reply within 48 hours.</p>
<p>— OurPath Portal</p>`,
  }),

  application_accepted: ({ name, email }) => {
    const link = `${SITE_URL}/login?email=${encodeURIComponent(email || '')}`
    return {
      subject: 'Welcome to OurPath — your account is ready',
      text:
`Hello ${name || 'there'},

Thank you for applying for Session Zero. Your application has been accepted.

To finish setting up, sign in (or create an account) here:
${link}

Once you're in, you can write in your reflective journal, message Shakil, and
choose a rhythm to book your first session.

If anything is unclear, just reply to this email.

— OurPath Guidance`,
      html:
`<p>Hello ${esc(name || 'there')},</p>
<p>Thank you for applying for Session Zero. Your application has been accepted.</p>
<p>To finish setting up, sign in (or create an account) here:<br/>
<a href="${link}">${link}</a></p>
<p>Once you're in, you can write in your reflective journal, message Shakil, and
choose a rhythm to book your first session.</p>
<p>If anything is unclear, just reply to this email.</p>
<p>— OurPath Guidance</p>`,
    }
  },

  new_message: ({ senderName, snippet }) => ({
    subject: `New message from ${senderName || 'OurPath'}`,
    text:
`You have a new message in your OurPath portal.

From: ${senderName || 'OurPath'}

"${(snippet || '').slice(0, 240)}"

Open the portal to read and reply:
${SITE_URL}/between

— OurPath Guidance`,
    html:
`<p>You have a new message in your OurPath portal.</p>
<p><strong>From:</strong> ${esc(senderName || 'OurPath')}</p>
<blockquote style="border-left:3px solid #C4993C;padding-left:12px;color:#1A2F36;font-style:italic;">
${esc((snippet || '').slice(0, 240))}
</blockquote>
<p><a href="${SITE_URL}/between">Open the portal to read and reply</a></p>
<p>— OurPath Guidance</p>`,
  }),

  session_booked: ({ name, scheduled_at, event_type_name }) => {
    const when = scheduled_at
      ? new Date(scheduled_at).toLocaleString('en-GB', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London',
        })
      : 'your scheduled time'
    return {
      subject: `Your ${event_type_name || 'session'} is booked`,
      text:
`Hello ${name || 'there'},

Your session with Shakil is booked for:
${when} (UK time)

A meeting link or location detail will be sent 30 minutes before we meet.
If you need to reschedule, please do so at least 24 hours in advance via the
Calendly confirmation email.

— OurPath Guidance`,
      html:
`<p>Hello ${esc(name || 'there')},</p>
<p>Your session with Shakil is booked for:<br/>
<strong>${esc(when)}</strong> (UK time)</p>
<p>A meeting link or location detail will be sent 30 minutes before we meet.
If you need to reschedule, please do so at least 24 hours in advance via the
Calendly confirmation email.</p>
<p>— OurPath Guidance</p>`,
    }
  },
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]))
}

// ---------------------------------------------------------------------------
// 5-minute throttle for new_message — uses notifications_log table.
// ---------------------------------------------------------------------------
async function recentlyNotified(recipientEmail, type, windowMinutes = 5) {
  const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString()
  const { data } = await supabase
    .from('notifications_log')
    .select('id')
    .eq('recipient_email', recipientEmail)
    .eq('type', type)
    .gte('sent_at', since)
    .limit(1)
  return Boolean(data && data.length)
}

async function logNotification(recipientEmail, type) {
  await supabase.from('notifications_log').insert({
    recipient_email: recipientEmail,
    type,
  })
}

// ---------------------------------------------------------------------------
// Resend dispatch
// ---------------------------------------------------------------------------
async function sendViaResend({ to, subject, text, html }) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY missing — skipping email send', { to, subject })
    return { skipped: true }
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `OurPath Guidance <${EMAIL_FROM}>`,
      to: [to],
      subject,
      text,
      html,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Resend error ${res.status}: ${body}`)
  }
  return await res.json()
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  const { type, to, data } = body || {}
  if (!type || !TEMPLATES[type]) {
    return { statusCode: 400, body: `Unknown email type: ${type}` }
  }

  // new_application is always sent to the admin (EMAIL_FROM) regardless of `to`.
  const recipient = type === 'new_application' ? EMAIL_FROM : to
  if (!recipient) {
    return { statusCode: 400, body: 'Missing recipient' }
  }

  // Throttle new_message emails per recipient.
  if (type === 'new_message') {
    if (await recentlyNotified(recipient, 'new_message', 5)) {
      return { statusCode: 200, body: JSON.stringify({ throttled: true }) }
    }
  }

  const rendered = TEMPLATES[type](data || {})

  try {
    const result = await sendViaResend({
      to: recipient,
      subject: rendered.subject,
      text: rendered.text,
      html: rendered.html,
    })

    if (type === 'new_message') {
      await logNotification(recipient, 'new_message')
    }

    return { statusCode: 200, body: JSON.stringify({ sent: true, result }) }
  } catch (err) {
    console.error('send-email error', err)
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
