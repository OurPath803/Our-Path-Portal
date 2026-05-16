// Single Netlify Function that serves the OurPath blog from Notion.
//
// Routes (all on the same function):
//   GET /.netlify/functions/blog                 → JSON list of published posts
//   GET /.netlify/functions/blog?slug=foo        → JSON single post (with body HTML)
//   GET /.netlify/functions/blog?img=<url>       → proxy a Notion image (URLs expire ~1h)
//
// Caching:
//   - In-memory per-instance cache, 10 min TTL.
//   - HTTP Cache-Control set so Netlify's edge can cache too.
//
// Env vars (set in Netlify UI):
//   NOTION_TOKEN              — internal integration secret (secret_...)
//   NOTION_DATABASE_ID        — 1dd52d69-3050-4ed4-a85d-130bde572558

const NOTION_API = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'

const NOTION_TOKEN = process.env.NOTION_TOKEN
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID

// ────────────────────────────────────────────────────────────────────────────
// In-memory cache (per warm function instance)
// ────────────────────────────────────────────────────────────────────────────
const CACHE_TTL_MS = 10 * 60 * 1000
const cache = new Map()

function cacheGet(key) {
  const hit = cache.get(key)
  if (!hit) return null
  if (Date.now() > hit.expiresAt) { cache.delete(key); return null }
  return hit.value
}
function cacheSet(key, value) {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS })
}

// ────────────────────────────────────────────────────────────────────────────
// Notion API
// ────────────────────────────────────────────────────────────────────────────
function notionHeaders() {
  return {
    'Authorization': `Bearer ${NOTION_TOKEN}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  }
}

async function notionFetch(path, opts = {}) {
  const res = await fetch(`${NOTION_API}${path}`, {
    ...opts,
    headers: { ...notionHeaders(), ...(opts.headers || {}) },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Notion ${res.status}: ${body}`)
  }
  return res.json()
}

async function queryPublishedPosts() {
  const data = await notionFetch(`/databases/${NOTION_DATABASE_ID}/query`, {
    method: 'POST',
    body: JSON.stringify({
      filter: { property: 'Status', select: { equals: 'Published' } },
      sorts: [{ property: 'Publish date', direction: 'descending' }],
      page_size: 100,
    }),
  })
  return data.results || []
}

async function getPageBlocks(pageId) {
  const blocks = []
  let cursor
  do {
    const url = `/blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`
    const data = await notionFetch(url)
    blocks.push(...(data.results || []))
    cursor = data.has_more ? data.next_cursor : null
  } while (cursor)
  return blocks
}

// ────────────────────────────────────────────────────────────────────────────
// Notion blocks → HTML
// ────────────────────────────────────────────────────────────────────────────
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;',
  }[c]))
}

function renderRichText(rich = []) {
  return rich.map(rt => {
    let text = escapeHtml(rt.plain_text || '')
    const ann = rt.annotations || {}
    if (ann.code) text = `<code>${text}</code>`
    if (ann.bold) text = `<strong>${text}</strong>`
    if (ann.italic) text = `<em>${text}</em>`
    if (ann.strikethrough) text = `<del>${text}</del>`
    if (ann.underline) text = `<u>${text}</u>`
    if (rt.href) text = `<a href="${escapeHtml(rt.href)}" rel="noopener">${text}</a>`
    return text
  }).join('')
}

function imageProxyUrl(notionUrl) {
  return `/.netlify/functions/blog?img=${encodeURIComponent(notionUrl)}`
}

function getImageUrl(block) {
  const img = block.image
  if (!img) return null
  return img.type === 'external' ? img.external.url : img.file.url
}

function blocksToHtml(blocks) {
  const out = []
  let listType = null
  const closeList = () => { if (listType) { out.push(`</${listType}>`); listType = null } }

  for (const b of blocks) {
    const type = b.type
    const data = b[type] || {}

    if (type === 'bulleted_list_item' || type === 'numbered_list_item') {
      const wanted = type === 'bulleted_list_item' ? 'ul' : 'ol'
      if (listType !== wanted) { closeList(); out.push(`<${wanted}>`); listType = wanted }
      out.push(`<li>${renderRichText(data.rich_text)}</li>`)
      continue
    }
    closeList()

    switch (type) {
      case 'paragraph': {
        const html = renderRichText(data.rich_text)
        out.push(html ? `<p>${html}</p>` : '<p>&nbsp;</p>')
        break
      }
      case 'heading_1': out.push(`<h2>${renderRichText(data.rich_text)}</h2>`); break
      case 'heading_2': out.push(`<h3>${renderRichText(data.rich_text)}</h3>`); break
      case 'heading_3': out.push(`<h4>${renderRichText(data.rich_text)}</h4>`); break
      case 'quote':     out.push(`<blockquote>${renderRichText(data.rich_text)}</blockquote>`); break
      case 'divider':   out.push('<hr/>'); break
      case 'code':
        out.push(`<pre><code>${escapeHtml(data.rich_text?.map(r => r.plain_text).join('') || '')}</code></pre>`)
        break
      case 'image': {
        const url = getImageUrl(b)
        if (url) {
          const captionHtml = renderRichText(data.caption || [])
          const altText = data.caption?.[0]?.plain_text || ''
          out.push(`<figure><img src="${escapeHtml(imageProxyUrl(url))}" alt="${escapeHtml(altText)}" loading="lazy"/>${captionHtml ? `<figcaption>${captionHtml}</figcaption>` : ''}</figure>`)
        }
        break
      }
      case 'callout': out.push(`<aside class="callout">${renderRichText(data.rich_text)}</aside>`); break
      default:
        if (data.rich_text) {
          const html = renderRichText(data.rich_text)
          if (html) out.push(`<p>${html}</p>`)
        }
    }
  }
  closeList()
  return out.join('\n')
}

// ────────────────────────────────────────────────────────────────────────────
// Property mapping
// ────────────────────────────────────────────────────────────────────────────
const getProp = (page, name) => page.properties?.[name]
const getTitle = page => getProp(page, 'Title')?.title?.map(t => t.plain_text).join('') || 'Untitled'
const getRichText = (page, name) => getProp(page, name)?.rich_text?.map(t => t.plain_text).join('') || ''
const getCheckbox = (page, name) => Boolean(getProp(page, name)?.checkbox)
const getDate = (page, name) => getProp(page, name)?.date?.start || null
const getMultiSelect = (page, name) => (getProp(page, name)?.multi_select || []).map(o => o.name)
function getCoverUrl(page) {
  if (!page.cover) return null
  return page.cover.type === 'external' ? page.cover.external.url : page.cover.file.url
}

function mapPage(page) {
  const coverRaw = getCoverUrl(page)
  return {
    id: page.id,
    title: getTitle(page),
    slug: getRichText(page, 'Slug'),
    excerpt: getRichText(page, 'Excerpt'),
    date: getDate(page, 'Publish date'),
    tags: getMultiSelect(page, 'Tags'),
    author: getRichText(page, 'Author'),
    members_only: getCheckbox(page, 'Members only'),
    cover: coverRaw ? imageProxyUrl(coverRaw) : null,
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Image proxy
// ────────────────────────────────────────────────────────────────────────────
async function proxyImage(notionUrl) {
  const res = await fetch(notionUrl)
  if (!res.ok) return { statusCode: res.status, body: 'Image fetch failed' }
  const buf = Buffer.from(await res.arrayBuffer())
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  return {
    statusCode: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
    body: buf.toString('base64'),
    isBase64Encoded: true,
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Handler
// ────────────────────────────────────────────────────────────────────────────
const jsonResponse = (status, body, edgeCache = false) => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': edgeCache ? 'public, max-age=300, s-maxage=600' : 'no-store',
    'Access-Control-Allow-Origin': '*',
  },
  body: JSON.stringify(body),
})

exports.handler = async (event) => {
  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    return jsonResponse(500, { error: 'Server not configured (NOTION_TOKEN or NOTION_DATABASE_ID missing)' })
  }

  const params = event.queryStringParameters || {}

  try {
    if (params.img) return await proxyImage(params.img)

    if (params.slug) {
      const cacheKey = `post:${params.slug}`
      const cached = cacheGet(cacheKey)
      if (cached) return jsonResponse(200, cached, true)

      const posts = await queryPublishedPosts()
      const page = posts.find(p => getRichText(p, 'Slug') === params.slug)
      if (!page) return jsonResponse(404, { error: 'Post not found' })

      const blocks = await getPageBlocks(page.id)
      const result = { ...mapPage(page), html: blocksToHtml(blocks) }
      cacheSet(cacheKey, result)
      return jsonResponse(200, result, true)
    }

    const cacheKey = 'list:all'
    const cached = cacheGet(cacheKey)
    if (cached) return jsonResponse(200, cached, true)

    const posts = await queryPublishedPosts()
    const result = { posts: posts.map(mapPage) }
    cacheSet(cacheKey, result)
    return jsonResponse(200, result, true)
  } catch (err) {
    console.error('blog function error', err)
    return jsonResponse(500, { error: err.message })
  }
}
