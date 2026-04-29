// Netlify Scheduled Function — runs daily at 10:00 UTC.
//
// Finds mentees with no activity (no journal entry created/updated, no
// message sent) in the last 14 days, and emails them a gentle re-engagement
// nudge — UNLESS they've already had one in the last 30 days (so we don't
// spam dormant accounts).

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SITE_URL = process.env.URL || 'https://portal.ourpathguidance.co.uk'
const DORMANT_DAYS = 14
const NUDGE_COOLDOWN_DAYS = 30

async function recentlyNudged(recipientEmail) {
  const since = new Date(Date.now() - NUDGE_COOLDOWN_DAYS * 24 * 3600_000).toISOString()
  const { data } = await supabase
    .from('notifications_log')
    .select('id')
    .eq('recipient_email', recipientEmail)
    .eq('type', 're_engagement')
    .gte('sent_at', since)
    .limit(1)
  return Boolean(data && data.length)
}

exports.handler = async () => {
  const cutoff = new Date(Date.now() - DORMANT_DAYS * 24 * 3600_000).toISOString()

  const { data: mentees } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'mentee')

  let sent = 0
  let skippedRecent = 0
  let skippedActive = 0

  for (const m of mentees ?? []) {
    if (!m.email) continue

    // Has the mentee done anything in the last DORMANT_DAYS?
    const [jres, mres] = await Promise.all([
      supabase.from('journal_entries').select('id')
        .eq('mentee_id', m.id).gte('updated_at', cutoff).limit(1),
      supabase.from('messages').select('id')
        .eq('sender_id', m.id).gte('created_at', cutoff).limit(1),
    ])
    if ((jres.data?.length ?? 0) > 0 || (mres.data?.length ?? 0) > 0) {
      skippedActive++
      continue
    }

    // Already nudged in the cooldown window?
    if (await recentlyNudged(m.email)) {
      skippedRecent++
      continue
    }

    await fetch(`${SITE_URL}/.netlify/functions/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 're_engagement',
        to: m.email,
        // Pass mentee.id as subjectId so the function logs it for cooldown
        // checks. (Our email-side dedupe is "ever" — we want time-windowed,
        // so we check via recentlyNudged() above instead and pass null
        // subjectId to skip the hard dedupe.)
        data: { name: m.full_name },
      }),
    })

    // Log it so the next day's run knows.
    await supabase.from('notifications_log').insert({
      recipient_email: m.email,
      type: 're_engagement',
      subject_id: m.id,
    })

    sent++
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ sent, skippedRecent, skippedActive }),
  }
}

exports.config = {
  schedule: '0 10 * * *', // Every day at 10:00 UTC
}
