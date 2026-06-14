// Netlify Function — invite a new mentor by email.
// Called by director/admin only. Verifies the caller's JWT before acting.
// Uses Supabase service role to:
//   1. Send a Supabase invite email to the new mentor.
//   2. Insert a profile row with role='mentor'.

const { createClient } = require('@supabase/supabase-js')

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SITE_URL = process.env.URL || 'https://portal.ourpathguidance.co.uk'

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  // Verify caller JWT — only director or admin may invite mentors.
  const authHeader = event.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) return { statusCode: 401, body: 'Unauthorised' }

  const { data: { user: caller }, error: authErr } = await supabaseAdmin.auth.getUser(token)
  if (authErr || !caller) return { statusCode: 401, body: 'Invalid token' }

  const { data: callerProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', caller.id)
    .maybeSingle()

  if (!['director', 'admin'].includes(callerProfile?.role)) {
    return { statusCode: 403, body: 'Forbidden — director or admin only' }
  }

  let body
  try { body = JSON.parse(event.body) } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  const { fullName, email } = body || {}
  if (!fullName?.trim() || !email?.trim()) {
    return { statusCode: 400, body: 'fullName and email are required' }
  }

  // Check if a profile with this email already exists
  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('id, role')
    .eq('email', email.trim().toLowerCase())
    .maybeSingle()

  if (existing) {
    return { statusCode: 409, body: JSON.stringify({ error: 'An account with this email already exists.' }) }
  }

  // Invite via Supabase Auth — sends a "You've been invited" email with a login link.
  const { data: invited, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email.trim().toLowerCase(),
    { redirectTo: `${SITE_URL}/login` }
  )

  if (inviteErr) {
    return { statusCode: 500, body: JSON.stringify({ error: inviteErr.message }) }
  }

  // Create the profile row with role=mentor.
  const { error: profileErr } = await supabaseAdmin.from('profiles').insert({
    id:        invited.user.id,
    role:      'mentor',
    full_name: fullName.trim(),
    email:     email.trim().toLowerCase(),
  })

  if (profileErr) {
    return { statusCode: 500, body: JSON.stringify({ error: `Account created but profile failed: ${profileErr.message}` }) }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ invited: true, userId: invited.user.id }),
  }
}
