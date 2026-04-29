// Netlify Scheduled Function — runs Sunday 18:00 UTC (≈19:00 BST / 18:00 GMT).
//
// Queries activity from the past 7 days and sends a single weekly_digest
// email to the admin (EMAIL_FROM, server-side routed). No per-week dedupe
// needed because the cron only runs once a week.

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SITE_URL = process.env.URL || 'https://portal.ourpathguidance.co.uk'

exports.handler = async () => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600_000).toISOString()
  const fourteenAgo = new Date(Date.now() - 14 * 24 * 3600_000).toISOString()
  const nowIso = new Date().toISOString()
  const sevenAhead = new Date(Date.now() + 7 * 24 * 3600_000).toISOString()

  // Find the mentor (we use the most-recently-created mentor profile, which
  // matches handle_new_user's auto-assignment logic).
  const { data: mentor } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('role', 'mentor')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!mentor) {
    return { statusCode: 200, body: JSON.stringify({ skipped: 'no mentor profile' }) }
  }

  const [appsRes, signupsRes, sharedRes, msgsRes, upcomingRes, menteesRes] = await Promise.all([
    supabase.from('applications').select('id', { count: 'exact', head: true })
      .gte('created_at', weekAgo),
    supabase.from('profiles').select('id', { count: 'exact', head: true })
      .gte('created_at', weekAgo).eq('role', 'mentee'),
    supabase.from('journal_entries').select('id', { count: 'exact', head: true })
      .gte('updated_at', weekAgo).eq('shared_with_mentor', true),
    supabase.from('messages').select('id', { count: 'exact', head: true })
      .gte('created_at', weekAgo).eq('recipient_id', mentor.id),
    supabase.from('sessions')
      .select('id, scheduled_at, mentee:profiles!sessions_mentee_id_fkey(full_name, email)')
      .eq('status', 'scheduled')
      .gte('scheduled_at', nowIso).lte('scheduled_at', sevenAhead)
      .order('scheduled_at', { ascending: true })
      .limit(20),
    supabase.from('profiles').select('id, full_name, email')
      .eq('role', 'mentee').eq('mentor_id', mentor.id),
  ])

  // Identify dormant mentees: no journal_entry or message in 14 days.
  const dormantMentees = []
  for (const m of menteesRes.data ?? []) {
    const [jres, mres] = await Promise.all([
      supabase.from('journal_entries').select('updated_at')
        .eq('mentee_id', m.id).gte('updated_at', fourteenAgo).limit(1),
      supabase.from('messages').select('created_at')
        .eq('sender_id', m.id).gte('created_at', fourteenAgo).limit(1),
    ])
    if ((jres.data?.length ?? 0) === 0 && (mres.data?.length ?? 0) === 0) {
      // How long ago was the most recent activity (to put in the digest)?
      const [jLatest, mLatest] = await Promise.all([
        supabase.from('journal_entries').select('updated_at')
          .eq('mentee_id', m.id).order('updated_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('messages').select('created_at')
          .eq('sender_id', m.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ])
      const lastDates = [jLatest.data?.updated_at, mLatest.data?.created_at].filter(Boolean)
      const lastSeen = lastDates.length
        ? new Date(Math.max(...lastDates.map(d => new Date(d).getTime())))
            .toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        : 'never'
      dormantMentees.push({ name: m.full_name ?? m.email, lastSeen })
    }
  }

  const summary = {
    newApplications: appsRes.count ?? 0,
    newSignups:      signupsRes.count ?? 0,
    sharedJournals:  sharedRes.count ?? 0,
    messagesReceived: msgsRes.count ?? 0,
    upcomingSessions: (upcomingRes.data ?? []).map(s => ({
      name: s.mentee?.full_name ?? s.mentee?.email ?? '—',
      scheduled_at: s.scheduled_at,
    })),
    dormantMentees,
  }

  await fetch(`${SITE_URL}/.netlify/functions/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'weekly_digest',
      to: mentor.email, // routed server-side to EMAIL_FROM anyway
      data: { summary },
    }),
  })

  return {
    statusCode: 200,
    body: JSON.stringify({ digest_sent: true, summary }),
  }
}

exports.config = {
  schedule: '0 18 * * 0', // Sundays at 18:00 UTC
}
