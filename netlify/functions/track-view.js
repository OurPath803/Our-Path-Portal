// Increments the view counter for a blog post slug.
// Called client-side on BlogPost load — uses service role so no auth needed.
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  let body
  try { body = JSON.parse(event.body) } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  const { slug } = body || {}
  if (!slug || typeof slug !== 'string' || slug.length > 300) {
    return { statusCode: 400, body: 'Missing or invalid slug' }
  }

  const { error } = await supabase.rpc('increment_blog_views', { p_slug: slug })
  if (error) {
    console.error('track-view error', error)
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) }
}
