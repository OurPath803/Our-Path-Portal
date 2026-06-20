// Netlify Function — permanently delete a user account.
// Director-only. Deletes the auth.users row, which cascades to profiles
// and all related data (subscriptions, sessions, tool_assignments, etc.).

const { createClient } = require('@supabase/supabase-js')

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  // Verify caller JWT — director only.
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

  if (callerProfile?.role !== 'director') {
    return { statusCode: 403, body: 'Forbidden — director only' }
  }

  let body
  try { body = JSON.parse(event.body) } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  const { userId } = body || {}
  if (!userId?.trim()) {
    return { statusCode: 400, body: 'userId is required' }
  }

  // Prevent director from deleting themselves or another director.
  if (userId === caller.id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Cannot delete your own account.' }) }
  }

  const { data: targetProfile } = await supabaseAdmin
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', userId)
    .maybeSingle()

  if (!targetProfile) {
    return { statusCode: 404, body: JSON.stringify({ error: 'User not found.' }) }
  }

  if (targetProfile.role === 'director') {
    return { statusCode: 403, body: JSON.stringify({ error: 'Cannot delete another director account.' }) }
  }

  // Delete auth user — cascades to profiles and all dependent tables.
  const { error: deleteErr } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (deleteErr) {
    return { statusCode: 500, body: JSON.stringify({ error: deleteErr.message }) }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ deleted: true, name: targetProfile.full_name, email: targetProfile.email }),
  }
}
