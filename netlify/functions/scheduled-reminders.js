// Netlify Scheduled Function — runs every hour.
//
// Sweeps the sessions table for two time windows and sends reminders to the
// mentee for each:
//   • starts in ~24h    → "Your session with Shakil — tomorrow"
//   • starts in ~2h     → "Your session with Shakil — in 2 hours"
//
// Per-session dedupe is handled inside send-email.js via notifications_log
// (subjectId = session.id). Re-running the function in the same window is
// safe — already-notified sessions are skipped.

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SITE_URL = process.env.URL || 'https://portal.ourpathguidance.co.uk'

async function findSessionsInWindow(minHoursFromNow, maxHoursFromNow) {
  const lo = new Date(Date.now() + minHoursFromNow * 3600_000).toISOString()
  const hi = new Date(Date.now() + maxHoursFromNow * 3600_000).toISOString()

  const { data } = await supabase
    .from('sessions')
    .select('id, mentee_id, scheduled_at, status, mentee:profiles!sessions_mentee_id_fkey(email, full_name)')
    .eq('status', 'scheduled')
    .gte('scheduled_at', lo)
    .lte('scheduled_at', hi)

  return data ?? []
}

async function sendReminder(type, session) {
  if (!session.mentee?.email) return
  await fetch(`${SITE_URL}/.netlify/functions/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      to: session.mentee.email,
      subjectId: session.id, // dedupe per session
      data: {
        name: session.mentee.full_name,
        scheduled_at: session.scheduled_at,
      },
    }),
  })
}

exports.handler = async () => {
  let count24 = 0
  let count2  = 0

  // 24h window: 23–25h ahead. Hourly cron means each session falls in this
  // window once.
  for (const s of await findSessionsInWindow(23, 25)) {
    await sendReminder('session_reminder_24h', s)
    count24++
  }

  // 2h window: 1–3h ahead. Same idea.
  for (const s of await findSessionsInWindow(1, 3)) {
    await sendReminder('session_reminder_2h', s)
    count2++
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      sent_24h_reminders: count24,
      sent_2h_reminders: count2,
    }),
  }
}

exports.config = {
  schedule: '@hourly', // 0 * * * * — every hour, on the hour, UTC
}
