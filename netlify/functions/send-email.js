// Single Netlify Function that dispatches transactional email via Resend.
//
// Body shape: { type, to, data, subjectId? }
//   type:      one of the keys in TEMPLATES below
//   to:        recipient address (admin templates ignore this and use EMAIL_FROM)
//   data:      template-specific fields
//   subjectId: optional UUID — used with a few types (e.g. session reminders)
//              to dedupe via notifications_log
//
// All copy is British English, kept on-brand and plain.

const { createClient } = require('@supabase/supabase-js')

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || 'hello@ourpathguidance.co.uk'
const SITE_URL = process.env.URL || 'https://portal.ourpathguidance.co.uk'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ---------------------------------------------------------------------------
// Template renderers — each returns { subject, html, text }
// ---------------------------------------------------------------------------

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]))
}

function formatWhen(scheduled_at) {
  if (!scheduled_at) return 'your scheduled time'
  return new Date(scheduled_at).toLocaleString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London',
  })
}

const SIGN_OFF = '— OurPath Guidance'

const TEMPLATES = {
  // ───────────── Existing four ─────────────
  new_application: ({ name, email, motivation, preferred_rhythm, preferred_mode }) => ({
    subject: `New triage call request — ${name}`,
    text:
`A new triage call request has just come in.

Name: ${name}
Email: ${email}
Preferred rhythm: ${preferred_rhythm || '—'}
Preferred mode: ${preferred_mode || '—'}

What's drawing them here:
${motivation || '(none provided)'}

Review and reply within 48 hours.

${SIGN_OFF}`,
    html:
`<p>A new triage call request has just come in.</p>
<p><strong>Name:</strong> ${esc(name)}<br/>
<strong>Email:</strong> ${esc(email)}<br/>
<strong>Preferred rhythm:</strong> ${esc(preferred_rhythm || '—')}<br/>
<strong>Preferred mode:</strong> ${esc(preferred_mode || '—')}</p>
<p><strong>What's drawing them here:</strong><br/>
<em>${esc(motivation || '(none provided)')}</em></p>
<p>Review and reply within 48 hours.</p>
<p>${SIGN_OFF}</p>`,
  }),

  contact_enquiry: ({ name, email, subject, message }) => ({
    subject: `Contact form — ${subject || 'General enquiry'} from ${name}`,
    text:
`New contact form submission.

Name: ${name}
Email: ${email}
Subject: ${subject || '—'}

Message:
${message || '(none provided)'}

${SIGN_OFF}`,
    html:
`<p>New contact form submission.</p>
<p><strong>Name:</strong> ${esc(name)}<br/>
<strong>Email:</strong> ${esc(email)}<br/>
<strong>Subject:</strong> ${esc(subject || '—')}</p>
<p><strong>Message:</strong><br/>
<em>${esc(message || '(none provided)').replace(/\n/g, '<br/>')}</em></p>
<p>${SIGN_OFF}</p>`,
  }),

  application_accepted: ({ name, email }) => {
    const link = `${SITE_URL}/login?email=${encodeURIComponent(email || '')}`
    return {
      subject: 'Welcome to OurPath — your account is ready',
      text:
`Hello ${name || 'there'},

Thank you. Your account is ready and your first session is booked or available to book.

To finish setting up, sign in (or create an account) here:
${link}

Once you're in, you can write in your reflective journal, message Ustadh Shakil, and
choose a rhythm to book your first session.

If anything is unclear, just reply to this email.

${SIGN_OFF}`,
      html:
`<p>Hello ${esc(name || 'there')},</p>
<p>Thank you. Your account is ready and your first session is booked or available to book.</p>
<p>To finish setting up, sign in (or create an account) here:<br/>
<a href="${link}">${link}</a></p>
<p>Once you're in, you can write in your reflective journal, message Ustadh Shakil, and
choose a rhythm to book your first session.</p>
<p>If anything is unclear, just reply to this email.</p>
<p>${SIGN_OFF}</p>`,
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

${SIGN_OFF}`,
    html:
`<p>You have a new message in your OurPath portal.</p>
<p><strong>From:</strong> ${esc(senderName || 'OurPath')}</p>
<blockquote style="border-left:3px solid #C4993C;padding-left:12px;color:#1A2F36;font-style:italic;">
${esc((snippet || '').slice(0, 240))}
</blockquote>
<p><a href="${SITE_URL}/between">Open the portal to read and reply</a></p>
<p>${SIGN_OFF}</p>`,
  }),

  session_booked: ({ name, scheduled_at, event_type_name }) => {
    const when = formatWhen(scheduled_at)
    return {
      subject: `Your ${event_type_name || 'session'} is booked`,
      text:
`Hello ${name || 'there'},

Your session with Ustadh Shakil is booked for:
${when} (UK time)

A meeting link or location detail will be sent 30 minutes before we meet.
If you need to reschedule, please do so at least 24 hours in advance via the
Calendly confirmation email.

${SIGN_OFF}`,
      html:
`<p>Hello ${esc(name || 'there')},</p>
<p>Your session with Ustadh Shakil is booked for:<br/>
<strong>${esc(when)}</strong> (UK time)</p>
<p>A meeting link or location detail will be sent 30 minutes before we meet.
If you need to reschedule, please do so at least 24 hours in advance via the
Calendly confirmation email.</p>
<p>${SIGN_OFF}</p>`,
    }
  },

  // ───────────── New automations ─────────────

  // A — journal shared with mentor
  journal_shared: ({ menteeName, entryDate, entryUrl }) => ({
    subject: `${menteeName} has shared a journal entry`,
    text:
`${menteeName || 'A mentee'} has chosen to share a reflection with you${entryDate ? ` (${entryDate})` : ''}.

Read it before your next session:
${entryUrl || `${SITE_URL}/mentor`}

${SIGN_OFF}`,
    html:
`<p><strong>${esc(menteeName || 'A mentee')}</strong> has chosen to share a reflection with you${entryDate ? ` (${esc(entryDate)})` : ''}.</p>
<p><a href="${entryUrl || `${SITE_URL}/mentor`}">Read it before your next session</a></p>
<p>${SIGN_OFF}</p>`,
  }),

  // B — welcome email on signup
  welcome: ({ name }) => ({
    subject: 'Welcome to OurPath',
    text:
`Hello ${name || 'there'},

Welcome to OurPath. Your account is ready, and so is the journal — when you are.

Three things you can do at your own pace:

  1. Write your first journal entry. Five questions, or freewrite.
     ${SITE_URL}/journal

  2. Send Ustadh Shakil a message. No pressure for polish — a few lines is enough.
     ${SITE_URL}/between

  3. When you're ready, choose a rhythm and book your first session.
     ${SITE_URL}/rhythms

The work doesn't start with a grand plan. It starts with where you actually are.

${SIGN_OFF}`,
    html:
`<p>Hello ${esc(name || 'there')},</p>
<p>Welcome to OurPath. Your account is ready, and so is the journal — when you are.</p>
<p>Three things you can do at your own pace:</p>
<ol style="line-height:1.7;">
  <li><strong>Write your first journal entry.</strong> Five questions, or freewrite.<br/>
      <a href="${SITE_URL}/journal">${SITE_URL}/journal</a></li>
  <li><strong>Send Ustadh Shakil a message.</strong> No pressure for polish — a few lines is enough.<br/>
      <a href="${SITE_URL}/between">${SITE_URL}/between</a></li>
  <li><strong>When you're ready</strong>, choose a rhythm and book your first session.<br/>
      <a href="${SITE_URL}/rhythms">${SITE_URL}/rhythms</a></li>
</ol>
<p style="font-family:Georgia,serif;font-style:italic;color:#1A2F36;">
The work doesn't start with a grand plan. It starts with where you actually are.
</p>
<p>${SIGN_OFF}</p>`,
  }),

  // C — triage-call auto-reply
  application_received: ({ name }) => ({
    subject: 'Your triage call request — received',
    text:
`Hello ${name || 'there'},

Thank you for requesting a triage call. We'll be in touch within 48 hours to confirm.

Ustadh Shakil reviews each application personally. We'll be in touch within 48 hours.

If anything has changed since you submitted, just reply to this email.

${SIGN_OFF}`,
    html:
`<p>Hello ${esc(name || 'there')},</p>
<p>Thank you for requesting a triage call. We'll be in touch within 48 hours to confirm.</p>
<p>Ustadh Shakil reviews each application personally. We'll be in touch within 48 hours.</p>
<p>If anything has changed since you submitted, just reply to this email.</p>
<p>${SIGN_OFF}</p>`,
  }),

  // D — 24h session reminder
  session_reminder_24h: ({ name, scheduled_at }) => {
    const when = formatWhen(scheduled_at)
    return {
      subject: 'Your session with Ustadh Shakil — tomorrow',
      text:
`Hello ${name || 'there'},

Just a quiet reminder: your session with Ustadh Shakil is tomorrow.

${when} (UK time)

If you'd like to share a journal entry beforehand, you can:
${SITE_URL}/journal

If you need to reschedule, please use the Calendly confirmation email at
least 24 hours in advance.

${SIGN_OFF}`,
      html:
`<p>Hello ${esc(name || 'there')},</p>
<p>Just a quiet reminder: your session with Ustadh Shakil is tomorrow.</p>
<p><strong>${esc(when)}</strong> (UK time)</p>
<p>If you'd like to share a journal entry beforehand, you can: <a href="${SITE_URL}/journal">open the journal</a>.</p>
<p>If you need to reschedule, please use the Calendly confirmation email at
least 24 hours in advance.</p>
<p>${SIGN_OFF}</p>`,
    }
  },

  // E — 2h session reminder (closer-in nudge)
  session_reminder_2h: ({ name, scheduled_at }) => {
    const when = formatWhen(scheduled_at)
    return {
      subject: 'Your session with Ustadh Shakil — in 2 hours',
      text:
`Hello ${name || 'there'},

Your session with Ustadh Shakil is in about two hours — ${when} (UK time).

The meeting link or details should be in your Calendly confirmation email.
If you can't find it, reply to this email and we'll resend.

${SIGN_OFF}`,
      html:
`<p>Hello ${esc(name || 'there')},</p>
<p>Your session with Ustadh Shakil is in about two hours — <strong>${esc(when)}</strong> (UK time).</p>
<p>The meeting link or details should be in your Calendly confirmation email.
If you can't find it, reply to this email and we'll resend.</p>
<p>${SIGN_OFF}</p>`,
    }
  },

  // F — weekly mentor digest
  weekly_digest: ({ summary }) => {
    const {
      newApplications = 0,
      newSignups = 0,
      sharedJournals = 0,
      messagesReceived = 0,
      upcomingSessions = [],
      dormantMentees = [],
    } = summary || {}

    const upcomingList = upcomingSessions.length
      ? upcomingSessions.map(s => `  • ${s.name} — ${formatWhen(s.scheduled_at)}`).join('\n')
      : '  (none scheduled)'

    const dormantList = dormantMentees.length
      ? dormantMentees.map(m => `  • ${m.name} (last activity ${m.lastSeen})`).join('\n')
      : '  (none)'

    return {
      subject: 'Your week at OurPath',
      text:
`A quick weekly summary.

This past week:
  • ${newApplications} new triage call request(s)
  • ${newSignups} new portal signup(s)
  • ${sharedJournals} journal entries shared with you
  • ${messagesReceived} message(s) sent to you

Upcoming sessions (next 7 days):
${upcomingList}

Mentees who haven't shown up in 14+ days:
${dormantList}

Open the portal:
${SITE_URL}/mentor

${SIGN_OFF}`,
      html:
`<p>A quick weekly summary.</p>
<p><strong>This past week:</strong></p>
<ul style="line-height:1.7;">
  <li>${newApplications} new triage call request(s)</li>
  <li>${newSignups} new portal signup(s)</li>
  <li>${sharedJournals} journal entries shared with you</li>
  <li>${messagesReceived} message(s) sent to you</li>
</ul>
<p><strong>Upcoming sessions (next 7 days):</strong></p>
<ul style="line-height:1.7;">${
  upcomingSessions.length
    ? upcomingSessions.map(s => `<li>${esc(s.name)} — ${esc(formatWhen(s.scheduled_at))}</li>`).join('')
    : '<li><em>(none scheduled)</em></li>'
}</ul>
<p><strong>Mentees who haven't shown up in 14+ days:</strong></p>
<ul style="line-height:1.7;">${
  dormantMentees.length
    ? dormantMentees.map(m => `<li>${esc(m.name)} (last activity ${esc(m.lastSeen)})</li>`).join('')
    : '<li><em>(none)</em></li>'
}</ul>
<p><a href="${SITE_URL}/mentor">Open the portal</a></p>
<p>${SIGN_OFF}</p>`,
    }
  },

  // G — re-engagement nudge for dormant mentee
  re_engagement: ({ name }) => ({
    subject: 'No pressure — just a quiet check-in',
    text:
`Hello ${name || 'there'},

It's been a couple of weeks since you last wrote in your journal or sent a
message. There's no expectation here — life ebbs and flows.

This is just a note to say: the portal is still here when you are.

Pick up where you left off:
${SITE_URL}/journal

${SIGN_OFF}`,
    html:
`<p>Hello ${esc(name || 'there')},</p>
<p>It's been a couple of weeks since you last wrote in your journal or sent a
message. There's no expectation here — life ebbs and flows.</p>
<p>This is just a note to say: the portal is still here when you are.</p>
<p><a href="${SITE_URL}/journal">Pick up where you left off</a></p>
<p>${SIGN_OFF}</p>`,
  }),

  // K — subscription lifecycle
  subscription_activated: ({ name, rhythm }) => ({
    subject: `Your ${rhythm || ''} rhythm is active`.trim(),
    text:
`Hello ${name || 'there'},

Your ${rhythm || ''} rhythm with Ustadh Shakil is now active.

Book your first session whenever you're ready:
${SITE_URL}/sessions

${SIGN_OFF}`,
    html:
`<p>Hello ${esc(name || 'there')},</p>
<p>Your <strong>${esc(rhythm || '')}</strong> rhythm with Ustadh Shakil is now active.</p>
<p><a href="${SITE_URL}/sessions">Book your first session</a> whenever you're ready.</p>
<p>${SIGN_OFF}</p>`,
  }),

  subscription_paused: ({ name }) => ({
    subject: 'Your rhythm is paused',
    text:
`Hello ${name || 'there'},

Your rhythm has been paused. New sessions are on hold, but your journal,
messages, and notes are all still here whenever you want them.

When you're ready to resume, just reply to this email.

${SIGN_OFF}`,
    html:
`<p>Hello ${esc(name || 'there')},</p>
<p>Your rhythm has been paused. New sessions are on hold, but your journal,
messages, and notes are all still here whenever you want them.</p>
<p>When you're ready to resume, just reply to this email.</p>
<p>${SIGN_OFF}</p>`,
  }),

  subscription_cancelled: ({ name }) => ({
    subject: 'Your rhythm has been cancelled',
    text:
`Hello ${name || 'there'},

Your rhythm with OurPath has been cancelled. No further sessions will be
booked, and you won't be charged again.

Your journal entries, messages, and notes will remain available so you can
return to them. If you'd like to restart later — same rhythm or different —
just reply to this email.

${SIGN_OFF}`,
    html:
`<p>Hello ${esc(name || 'there')},</p>
<p>Your rhythm with OurPath has been cancelled. No further sessions will be
booked, and you won't be charged again.</p>
<p>Your journal entries, messages, and notes will remain available so you can
return to them. If you'd like to restart later — same rhythm or different —
just reply to this email.</p>
<p>${SIGN_OFF}</p>`,
  }),

  // ───────────── Induction completed — admin alert ─────────────
  induction_completed: ({ clientName, readinessScore, whatBringsYou }) => ({
    subject: `Induction pack completed — ${clientName || 'a client'}`,
    text:
`${clientName || 'A client'} has just completed their induction pack.

Readiness score: ${readinessScore || '—'} / 5

What brings them here:
${whatBringsYou || '(not provided)'}

Review their full responses in the portal:
${SITE_URL}/mentor/applications

${SIGN_OFF}`,
    html:
`<p><strong>${esc(clientName || 'A client')}</strong> has just completed their induction pack.</p>
<p><strong>Readiness score:</strong> ${esc(String(readinessScore || '—'))} / 5</p>
<p><strong>What brings them here:</strong><br/>
<em>${esc(whatBringsYou || '(not provided)').replace(/\n/g, '<br/>')}</em></p>
<p><a href="${SITE_URL}/mentor/applications">Review their full responses in the portal →</a></p>
<p>${SIGN_OFF}</p>`,
  }),

  // ───────────── Client induction pack ─────────────
  induction_pack: ({ name, inductionUrl }) => ({
    subject: 'Your OurPath Induction Pack — please complete before your first session',
    text:
`Hello ${name || 'there'},

Your mentor has sent you the OurPath Client Induction Pack.

Please complete it before your first session — it only takes a few minutes. Your answers help your mentor understand where you are and what you'd like from the work.

Complete your induction pack:
${inductionUrl}

This link is personal to you. There's no login required.

If you have any questions, reply to this email.

${SIGN_OFF}`,
    html:
`<p>Hello ${esc(name || 'there')},</p>
<p>Your mentor has sent you the OurPath Client Induction Pack.</p>
<p>Please complete it before your first session — it only takes a few minutes.
Your answers help your mentor understand where you are and what you'd like from the work.</p>
<p style="margin: 24px 0;">
  <a href="${esc(inductionUrl)}" style="background:#1B2B4B;color:#F5EED9;padding:12px 24px;text-decoration:none;font-weight:600;border-radius:4px;">
    Complete your induction pack →
  </a>
</p>
<p style="font-size:13px;color:#8A8070;">This link is personal to you. There's no login required.<br>
If you have any questions, reply to this email.</p>
<p>${SIGN_OFF}</p>`,
  }),

  // ───────────── Post-Session-Zero nurture sequence ─────────────

  // Day 2 — gentle "anything come up?" follow-up
  nurture_day2: ({ name }) => ({
    subject: 'Anything come up after our conversation?',
    text:
`Hello ${name || 'there'},

It's a couple of days since you got in touch.
Sometimes things settle in after a conversation — even one only with
yourself, on a form.

Anything new come into focus?  Anything you wish you'd written that you
left out?  Anything you've been turning over since?

There's no need to reply unless you want to. We'll be in touch soon
with our response.

${SIGN_OFF}`,
    html:
\`<p>Hello ${esc(name || 'there')},</p>
<p>It's a couple of days since you got in touch.
Sometimes things settle in after a conversation — even one only with
yourself, on a form.</p>
<p>Anything new come into focus? Anything you wish you'd written that you
left out? Anything you've been turning over since?</p>
<p>There's no need to reply unless you want to. We'll be in touch soon
with our response.</p>
<p>${SIGN_OFF}</p>\`,
  }),

  // Day 7 — share a public Reflective Tool that fits what they brought
  nurture_day7: ({ name }) => ({
    subject: 'A small tool you might find useful',
    text:
`Hello ${name || 'there'},

A short note to share something practical.

OurPath uses a small set of structured reflection tools — guided exercises
that help you sort facts from fears, name what's actually yours to carry,
and notice the season you might be in.

The Clarity Map is the one most people start with. It's a single page
that helps when your head feels too full to make sense of a decision.

You can read about it (and try it) on our site:
https://ourpathguidance.co.uk/tools

Use it lightly. It's a starting point, not a solution.

${SIGN_OFF}`,
    html:
\`<p>Hello ${esc(name || 'there')},</p>
<p>A short note to share something practical.</p>
<p>OurPath uses a small set of structured reflection tools — guided exercises
that help you sort facts from fears, name what's actually yours to carry,
and notice the season you might be in.</p>
<p>The <strong>Clarity Map</strong> is the one most people start with. It's a single
page that helps when your head feels too full to make sense of a decision.</p>
<p>You can read about it (and try it) on our site:<br/>
<a href="https://ourpathguidance.co.uk/tools">ourpathguidance.co.uk/tools</a></p>
<p>Use it lightly. It's a starting point, not a solution.</p>
<p>${SIGN_OFF}</p>\`,
  }),

  // Day 14 — soft pointer to rhythms, no pressure
  nurture_day14: ({ name }) => ({
    subject: 'When you\'re ready',
    text:
`Hello ${name || 'there'},

We don't push people. The work only really starts when you're ready,
and there's no virtue in choosing it before then.

If at some point you'd like to begin properly, the rhythms are here:
${SITE_URL}/rhythms

Three options — Monthly, Fortnightly, Weekly — each with the journal
and messaging included from day one. You can pause or cancel any month.

If you want to talk it through first, just reply to this email.

${SIGN_OFF}`,
    html:
\`<p>Hello ${esc(name || 'there')},</p>
<p>We don't push people. The work only really starts when you're ready,
and there's no virtue in choosing it before then.</p>
<p>If at some point you'd like to begin properly, the rhythms are here:<br/>
<a href="${SITE_URL}/rhythms">${SITE_URL}/rhythms</a></p>
<p>Three options — Monthly, Fortnightly, Weekly — each with the journal
and messaging included from day one. You can pause or cancel any month.</p>
<p>If you want to talk it through first, just reply to this email.</p>
<p>${SIGN_OFF}</p>\`,
  }),
}

// ---------------------------------------------------------------------------
// Throttle / dedupe helpers
// ---------------------------------------------------------------------------

// Per-recipient throttle (used for new_message — don't spam the receiver)
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

// Per-subject dedupe (used for session reminders, re-engagement, etc.) — has
// THIS exact (type, subject_id) ever been notified?
async function alreadyNotifiedSubject(type, subjectId) {
  if (!subjectId) return false
  const { data } = await supabase
    .from('notifications_log')
    .select('id')
    .eq('type', type)
    .eq('subject_id', subjectId)
    .limit(1)
  return Boolean(data && data.length)
}

async function logNotification(recipientEmail, type, subjectId = null) {
  await supabase.from('notifications_log').insert({
    recipient_email: recipientEmail,
    type,
    subject_id: subjectId,
  })
}

// ---------------------------------------------------------------------------
// Resend dispatch
// ---------------------------------------------------------------------------
async function sendViaResend({ to, subject, text, html }) {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not set — cannot send email', { to, subject })
    throw new Error('Email service not configured. Add RESEND_API_KEY to Netlify environment variables.')
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

  const { type, to, data, subjectId } = body || {}
  if (!type || !TEMPLATES[type]) {
    return { statusCode: 400, body: `Unknown email type: ${type}` }
  }

  // Admin-bound templates: route to EMAIL_FROM regardless of `to`.
  const adminBound = ['new_application', 'journal_shared', 'weekly_digest', 'contact_enquiry', 'induction_completed']
  const recipient = adminBound.includes(type) ? EMAIL_FROM : to
  if (!recipient) {
    return { statusCode: 400, body: 'Missing recipient' }
  }

  // 5-minute per-recipient throttle for new_message only.
  if (type === 'new_message') {
    if (await recentlyNotified(recipient, 'new_message', 5)) {
      return { statusCode: 200, body: JSON.stringify({ throttled: true }) }
    }
  }

  // Per-subject dedupe for one-shot notifications (session reminders,
  // journal_shared per entry, re-engagement per mentee).
  const subjectScopedTypes = [
    'session_reminder_24h',
    'session_reminder_2h',
    'journal_shared',
    're_engagement',
    'nurture_day2',
    'nurture_day7',
    'nurture_day14',
  ]
  if (subjectScopedTypes.includes(type) && subjectId) {
    if (await alreadyNotifiedSubject(type, subjectId)) {
      return { statusCode: 200, body: JSON.stringify({ already_notified: true }) }
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

    if (subjectScopedTypes.includes(type) || type === 'new_message') {
      await logNotification(recipient, type, subjectId ?? null)
    }

    return { statusCode: 200, body: JSON.stringify({ sent: true, result }) }
  } catch (err) {
    console.error('send-email error', err)
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
