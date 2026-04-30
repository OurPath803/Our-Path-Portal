// Netlify Scheduled Function — runs daily at 11:00 UTC.
//
// For each Session Zero application that's still 'new' or 'in_review', sends
// the appropriate nurture email based on how long ago it was submitted:
//
//   ~2 days  ago → nurture_day2  ("anything come up?")
//   ~7 days  ago → nurture_day7  ("a small tool you might find useful")
//   ~14 days ago → nurture_day14 ("when you're ready")
//
// Once an application moves to 'approved' or 'declined', further nurture
// is skipped — the approval flow has its own welcome email; declined
// applicants shouldn't receive marketing nudges.
//
// Per-application dedupe via send-email's notifications_log (subjectId =
// application.id), so re-runs in the same window are safe.

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SITE_URL = process.env.URL || 'https://portal.ourpathguidance.co.uk'

async function findAppsInWindow(minDaysAgo, maxDaysAgo) {
  const lo = new Date(Date.now() - maxDaysAgo * 24 * 3600_000).toISOString()
  const hi = new Date(Date.now() - minDaysAgo * 24 * 3600_000).toISOString()
  const { data } = await supabase
    .from('applications')
    .select('id, applicant_name, email, status, created_at')
    .in('status', ['new', 'in_review'])
    .gte('created_at', lo)
    .lte('created_at', hi)
  return data ?? []
}

async function sendNurture(type, app) {
  if (!app.email) return false
  try {
    const res = await fetch(`${SITE_URL}/.netlify/functions/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        to: app.email,
        subjectId: app.id, // dedupe per application
        data: { name: app.applicant_name },
      }),
    })
    return res.ok
  } catch (err) {
    console.error('nurture send failed', err)
    return false
  }
}

exports.handler = async () => {
  // Day 2: 1.5–2.5 day window so we catch anyone whose 'day 2' falls between
  // any two daily runs.
  const day2Apps  = await findAppsInWindow(1.5, 2.5)
  const day7Apps  = await findAppsInWindow(6.5, 7.5)
  const day14Apps = await findAppsInWindow(13.5, 14.5)

  let sent2 = 0, sent7 = 0, sent14 = 0
  for (const a of day2Apps)  { if (await sendNurture('nurture_day2',  a)) sent2++  }
  for (const a of day7Apps)  { if (await sendNurture('nurture_day7',  a)) sent7++  }
  for (const a of day14Apps) { if (await sendNurture('nurture_day14', a)) sent14++ }

  return {
    statusCode: 200,
    body: JSON.stringify({
      day2:  { eligible: day2Apps.length,  sent: sent2  },
      day7:  { eligible: day7Apps.length,  sent: sent7  },
      day14: { eligible: day14Apps.length, sent: sent14 },
    }),
  }
}

exports.config = {
  schedule: '0 11 * * *', // every day at 11:00 UTC (≈12:00 BST / 11:00 GMT)
}
